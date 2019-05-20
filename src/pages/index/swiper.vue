<!--轮播图-->
<template>
  <div class="swiper">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <div class="swiper-slide" v-for="(item,index) in list" :key="index">
          <img v-lazy="item.content" alt="">
        </div>
      </div>
    </div>
    <div class="swiper-pagination"></div>
    <div v-if="hasBtn" class="btn-prev" @click="prev"></div>
    <div v-if="hasBtn" class="btn-next" @click="next"></div>
  </div>
</template>

<script>
  import Swiper from 'swiper/dist/idangerous.swiper.js'

  export default {
    data(){
      return{
        slider:{}
      }
    },
    props:{
      list:{
        type:Array,
        default:()=>{
          return [];
        }
      },
      hasBtn:{
        type:Boolean,
        default:true
      }
    },
    watch:{
      list(v){
        if(v.length>0){
          this.$nextTick(()=>{
            this.slider=new Swiper('.swiper-container',{
              //loop: true,
              pagination: '.swiper-pagination',
              paginationClickable :true,
              preventClicks:false, // 可以点击
              grabCursor: true,
            })
          })
        }
      }
    },
    mounted(){

    },
    methods:{
      prev(){
        this.slider.swipePrev();
      },
      next(){
        this.slider.swipeNext();
      }
    }
  }
</script>

<style lang="scss">
  .swiper{
    position: relative;
    height: inherit;
    .swiper-container{
      height: inherit;
    }
    .swiper-pagination {
      position: absolute;
      left: 0;
      z-index: 3;
      bottom: 0px;
      width: 100%;
      text-align: center;
    }
    .swiper-pagination-switch {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 8px;
      background: #fff;
      margin: 0 5px;
      opacity: 0.5;
      cursor: pointer;
    }
    .swiper-active-switch {
      opacity: 1;
    }
    .btn-prev,.btn-next{
      cursor: pointer;
      position: absolute;
      top: 50%;
      z-index: 2;
      width: 20px;
      height: 30px;
      margin-top: -15px;
      &:before{
        content: '';
        position: absolute;
        top: 50%;
        width: 12px;
        height: 12px;
        margin-top: -7px;
        border: 2px solid transparent;
      }
    }
    .btn-prev{
      left: 0;
      &:before{
        left: 50%;
        margin-left: -3px;
        border-bottom-color: #fff;
        border-left-color: #fff;
        transform: rotate(45deg);
      }
    }
    .btn-next{
      right: 0;
      &:before{
        right: 50%;
        margin-right: -3px;
        border-bottom-color: #fff;
        border-right-color: #fff;
        transform: rotate(-45deg);
      }
    }
  }

</style>
