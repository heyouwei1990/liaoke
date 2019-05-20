<template>
  <div v-if="list.length>0" class="manager-list">
    <div v-if="isAppend" class="manager-li">
      <div class="btn-add" @click="add"></div>
      <span class="add-text">守护Ta</span>
    </div>
    <router-link
      class="manager-li"
      :to="{name:'Zone',params:{uid:item.uid}}"
      target="_blank"
      v-for="(item, index) in list"
      :key="index"
    >
      <dl class="manager-item">
        <dt>
          <img class="avatar" v-lazy="item.avatar" alt="">
          <i class="icon-ward" :style="{backgroundImage:'url('+item.ward_img+')'}"></i>
        </dt>
        <dd class="nickname">{{item.nickname}}</dd>
      </dl>
    </router-link>
  </div>
</template>

<script>
  export default {
    props:{
      list:{
        type:Array,
        default:[]
      },
      isAppend:{
        type:Boolean,
        default:false
      }
    },
    methods:{
      add(){
        this.$emit('append');
      }
    }
  }
</script>

<style lang="scss">
  .manager-list{
    overflow: hidden;
    width: 288px;
    margin: 0 auto;
    padding-top: 15px;
    .manager-li{
      float: left;
      width: 25%;
      height: 64px;
      margin-bottom: 8px;
    }
    .manager-item{
      height: 64px;
      text-align: center;
      .add-text{
        font-size: 12px;
        color: #999;
        line-height: 22px;
      }
      dt{
        width: 40px;
        height: 40px;
        margin: 0 auto;
        position: relative;
      }
      .avatar{
        display: block;
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
      .nickname{
        max-width: 4em;
        font-size: 12px;
        color: #fff;
        line-height: 22px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0 auto;
      }
      .icon-ward{
        position: absolute;
        right: -5px;
        bottom: 0px;
        z-index: 2;
        width: 20px;
        height: 20px;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
      }
    }
    .btn-add{
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin: 0 auto;
      border: 1px dashed #fff;
      position: relative;
      &:before,&:after{
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 2;
        transform: translate(-50%, -50%);
        background-color: #fff;
      }
      &:before{
        width: 14px;
        height: 1px;
      }
      &:after{
        width: 1px;
        height: 14px;
      }
    }
  }
</style>
