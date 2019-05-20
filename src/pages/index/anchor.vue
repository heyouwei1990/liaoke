<!--首页首屏推荐主播列表-->
<template>
    <div class="anchor-item">
      <img class="avatar" v-lazy="item.room_cover" alt="">
      <div class="mask">
        <div class="line1">
          <img class="level-mark" v-lazy="item.live_level_img" alt="">
          <span class="nickname">{{item.nickname}}</span>
        </div>
        <div class="line2">{{item.province}}{{item.city}}</div>
        <div class="line3">{{item.online_count}}人在线</div>
        <div class="line4">{{item.live_start_at_text}}</div>
      </div>
    </div>
</template>

<script>
  export default {
    data(){
      return{
        item:this.info
      }
    },
    props:{
      info:{
        type:Object,
        default:function(){
          return{}
        }
      }
    }
  }
</script>

<style lang="scss">
  .anchor-item{
    width: 212px;
    height: 212px;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    .avatar{
      display: block;
      width: 100%;
      height: 100%;
    }
    &:hover .mask{
      top: 0;
    }
    .mask{
      position: absolute;
      left: 0;
      top: 100%;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      color: #fff;
      font-size: 14px;
      line-height: 36px;
      padding: 34px 16px;
      transition: all 0.2s linear;
    }
    .line1{
      white-space: nowrap;
    }
    .level-mark{
      margin-right: 3px;
    }
    .nickname{
      display: inline-block;
      vertical-align: middle;
      max-width: 7em;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
</style>
