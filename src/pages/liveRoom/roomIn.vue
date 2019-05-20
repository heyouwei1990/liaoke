<!--守护和高级访客入场动画-->
<template>
  <div class="visitor-entry">
    <transition-group
      tag="ul"
      @before-enter="beforeEnter"
      @enter="enter"
      name="room-in"
      :css="false"
    >
      <li
        v-if="list.length>0"
        class="visitor "
        v-for="(item,index) in list"
        :key="item.new_key"
        @click="look(item.id)"
      >
        <!--animate active slide-in-right-out-left-->
        <div class="avatar-wrap">
          <img class="avatar" :src="item.avatar" alt="">
          <img v-if="item.ward_img" class="ward-level" :src="item.ward_round" alt="">
        </div>
        <div class="bar" :class="item.ward_data?'ward'+item.ward_data.level:''">
          <img class="level-mark" :src="item.wealth_level_img" alt="">
          <div class="nickname">{{item.nickname}}</div>
          <span>进入了房间</span>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script>
  import {randomFrom} from '@/util/tools'
  export default {
    data(){
      return{
        arr:[0,1,2,3]
      }
    },
    props:{
      list:{
        type:Array,
        default:[]
      }
    },
    mounted () {
      // console.log(this.list)
    },
    methods:{
      beforeEnter(el){
        let top=0;
        /*if(this.list.length>4){
          top = randomFrom(20, 200);
          el.style.bottom = top + "px";
        }else{

        }*/
        let key=this.arr.shift(0)
        top=key*40+20;
        el.style.bottom = top + "px";
        this.arr.push(key);
      },
      enter(el,done){
        // console.log("进入中");
        Velocity(el,'stop');
        Velocity(el,{
          left:"0%"
        },{
          duration:400
        });
        Velocity(el,{
          translateX:"-100%"
        },{
          duration:400,
          delay:2000,
          complete:()=>{
            this.$emit('runOut');
          }
        });

      },
      look(data){
        this.$emit('lookInfo',data);
      }
    }
  }
</script>

<style lang="scss">
  .visitor-entry{
    position: absolute;
    left: 0;
    bottom: 0px;
    z-index: 9;
    width: 100%;
    /*height: 300px;*/
    ul{
      overflow-x: hidden;
      overflow-y: visible;
    }
    .visitor{
      width: 100%;
      height: 40px;
      padding-left: 74px;
      position: absolute;
      left: 100%;
      /*transition: all 4s linear;*/
    }
    .avatar-wrap{
      position: absolute;
      left: 10px;
      top: 0;
      z-index: 2;
      width: 74px;
      height: 50px;
    }
    .avatar{
      display: block;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid #fff;
      margin: 4px auto 0;
    }
    .ward-level{
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 8px;
      z-index: 2;
    }
    .bar{
      margin-left: 6px;
      float: left;
      width: 312px;
      height: 40px;
      line-height: 40px;
      font-size: 14px;
      color: #fff;
      padding-left: 14px;
      &.ward0{
        background: url("https://lib.liaoke.tv/lib/pc/static/img/room/bg-bar1.png") no-repeat left center;
        background-size: 100%;
      }
      &.ward1{
        background: url("https://lib.liaoke.tv/lib/pc/static/img/room/bg-bar2.png") no-repeat left center;
        background-size: 100%;
      }
      &.ward2{
        background: url("https://lib.liaoke.tv/lib/pc/static/img/room/bg-bar3.png") no-repeat left center;
        background-size: 100%;
      }
      &.ward3{
        background: url("https://lib.liaoke.tv/lib/pc/static/img/room/bg-bar4.png") no-repeat left center;
        background-size: 100%;
      }
      span{
        vertical-align: middle;
      }
    }
    .level-mark{
      margin-right: 6px;
    }
    .nickname{
      display: inline-block;
      vertical-align: middle;
      max-width: 8em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* animate */
    .animate {
      animation-duration: 8s;
      animation-fill-mode: both;
    }
    .animate.infinite {
      animation-iteration-count: infinite;
    }
    .animate.hinge {
      animation-duration: 2s;
    }
  }
  @keyframes slide-in-right-out-left {
    0% {
      transform: translate3d(200%, 0, 0);
      visibility: visible;
    }
    15% {
      transform: translate3d(0, 0, 0);
    }
    85% {
      transform: translate3d(0, 0, 0);
    }
    100% {
      transform: translate3d(-200%, 0, 0);
    }
  }
  .active.slide-in-right-out-left {
    animation-name: slide-in-right-out-left;
    animation-duration: 4s;
  }
</style>
