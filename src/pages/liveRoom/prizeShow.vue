<!--奖品显示动画-->
<template>
  <div class="prize-show-wrapper">
    <transition-group
      class="prize-show"
      tag="ul"
      name="prize"
      @before-enter="beforeEnter"
      @enter="enter"
    >
      <li
        v-for="(item, index) in list"
        :key="item.id"
        v-if="index<3"
        @click="look(item.uid)"
        :id="item.id"
      >
        <div class="prize-item">
          <img :src="item.user_avatar" alt="" class="avatar">
          <div class="info">
            恭喜<span class="nickname">{{item.user_nickname}}</span>
            送出“{{item.gift_name}}”喜获<i class="prize-num">{{item.win_coin }}</i>金币
          </div>
          <i class="icon-prize"></i>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script>
  export default {
    props:{
      list:{
        type:Array,
        default:[]
      }
    },
    methods:{
      beforeEnter(el){
        // console.log(1);
      },
      enter(el,done){
        let id=el.getAttribute('id');
        let item=null;
        for(let i=0;i<this.list.length;i++){
          if(id==this.list[i].id){
            item=this.list[i];
          }
        }
        let delay=item.duration;
        Velocity(el,'stop');
        Velocity(el,{
          left:"0%"
        },{
          duration:400
        });
        Velocity(el,{
          //left:"-100%",
          translateX:'-500px',
        },{
          duration:400,
          delay:delay,
          complete:()=>{
            this.$emit('leftOut',id);
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
  .prize-show-wrapper{
    .prize-show{
      position: absolute;
      left: 20px;
      bottom: 180px;
      z-index: 3;
      width: calc(100% - 40px);
      overflow-x: hidden;
      overflow-y: visible;
      >li{
        position: relative;
        left: -100%;
        margin-bottom: 6px;
        &:last-of-type{
          margin-bottom: 0;
        }
      }
      .prize-item{
        width: 260px;
        height: 40px;
        position: relative;
        background-image: linear-gradient(90deg, rgba(52,107,255,0.5) 0%, rgba(255,77,190,0) 100%);
        border-radius: 20px 0 0 20px;
        .avatar{
          width: 40px;
          height: 40px;
          border-radius: 40px;
          float: left;
        }
        .info{
          float: left;
          margin-left: 6px;
          width: 160px;
          font-size: 12px;
          color: #fff;
          line-height: 18px;
          padding-top: 2px;
          word-break: break-all;
        }
        .nickname{
          display: inline-block;
          vertical-align: middle;
          margin-top: -3px;
          max-width: 7em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .prize-num{
          color: #ff0;
          white-space: nowrap;
        }
        .icon-prize{
          float: left;
          margin-left: 8px;
          width: 40px;
          height: 40px;
          background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-prize.png") no-repeat center/contain;
        }
      }
    }
  }
</style>
