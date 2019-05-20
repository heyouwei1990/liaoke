<template>
  <div class="emoji-component" @click.stop>
    <div id="faceSlider" class="swiper-container">
      <div class="swiper-wrapper">
        <div
          v-if="faceList.length>0"
          class="swiper-slide"
          v-for="(slideItem,index) in faceList"
          :key="index"
        >
          <div
            class="face-item"
            v-for="(item,idx) in slideItem"
            :key="idx"
            @click="checkFace(item.code)"
            v-html="item.pic"
          >
          </div>
        </div>
      </div>
    </div>
    <div class="swiper-pagination"></div>
    <div class="btn-prev" @click="prev"></div>
    <div class="btn-next" @click="next"></div>
  </div>
</template>

<script>
  import  Swiper from 'swiper/dist/idangerous.swiper.js'
  import { sliceArray, replaceEmmoji,emojiList } from "@/util/tools";
  import Bus from '@/util/bus'
  export default {
    data(){
      return{
        faceList:[], //表情包
      }
    },
    mounted(){
      this.faceSlider = new Swiper("#faceSlider",{
        pagination: '.emoji-component .swiper-pagination',
        paginationClickable:true,
        preventClicks:false, // 可以点击
        grabCursor: true,
      });
      this.face();
    },
    methods:{
      prev(){
        this.faceSlider.swipePrev();
      },
      next(){
        this.faceSlider.swipeNext();
      },
      //选择表情
      checkFace(faceCode){
        this.$store.commit('set_showEmoji',false);
        Bus.$emit('chooseEmoji',faceCode);
      },
      face(){
        this.faceList=sliceArray(emojiList(),30);
        setTimeout(()=>{
          this.faceSlider.reInit();
        },20);
      },
    }
  }
</script>

<style lang="scss">
  .emoji-component{
    background-color: #292432;
    width: 440px;
    height: 170px;
    padding-top: 18px;
    border-radius: 4px;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99;
    &:before{
      left: 35px;
    }
    .face-item{
      cursor: pointer;
      float: left;
      width: 40px;
      height: 40px;
      background-color: #3a3843;
      &:nth-of-type(even){
        background-color: #36343f;
      }
    }
    .emojiImg{
      display: block;
      width: 32px;
      height: 32px;
      margin: 4px auto;
    }
    .swiper-container{
      height: 120px;
      width: 400px;
      margin: 0 auto;
    }
    .swiper-pagination {
      position: absolute;
      left: 0;
      z-index: 3;
      bottom: 10px;
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
      top: 60px;
      z-index: 2;
      width: 20px;
      height: 30px;
      &:before{
        content: '';
        position: absolute;
        top: 50%;
        width: 10px;
        height: 10px;
        margin-top: -7px;
        border: 2px solid transparent;
      }
    }
    .btn-prev{
      left: 0;
      &:before{
        left: 50%;
        border-bottom-color: #fff;
        border-left-color: #fff;
        transform: rotate(45deg);
      }
    }
    .btn-next{
      right: 0;
      &:before{
        right: 50%;
        border-bottom-color: #fff;
        border-right-color: #fff;
        transform: rotate(-45deg);
      }
    }
  }
</style>
