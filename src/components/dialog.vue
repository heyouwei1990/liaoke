<!--空弹框-->
<template>
  <div class="dialog-component">
    <transition name="drop">
      <div class="dialog-wrap" v-if="isShow">
        <i class="icon-close" @click="closeMyself"></i>
        <slot></slot>
      </div>
    </transition>
    <div v-if="isShow" class="mask" @click="closeMyself"></div>
  </div>
</template>

<script>
  export default {
    props:{
      isShow:{
        type:Boolean,
        default:false
      }
    },
    methods:{
      closeMyself(){
        this.$emit("closeDialog");
        //this.$store.commit("set_loginDialog",false);
      }
    },
  }
</script>

<style lang="scss">
  .dialog-component{
    position: relative;
    z-index: 99;
    .dialog-wrap{
      position: fixed;
      left: 50%;
      top: 50%;
      z-index: 99;
      transform: translate(-50%, -50%);
      border-radius: 8px;
      background-color: #fff;
      padding: 20px 36px;
      /*width: 472px;*/
      .icon-close{
        cursor: pointer;
        position: absolute;
        right: 20px;
        top: 20px;
        z-index: 10;
        width: 20px;
        height: 20px;
        background: url("https://lib.liaoke.tv/lib/pc/static/img/login/icon-close.png") no-repeat center /cover;
        transition: all 0.2s;
        &:hover{
          transform: rotate(180deg);
        }
      }
      /*.dialog-title{
        font-size: 22px;
        line-height: 2;
        color: #333;
        text-align: center;
        margin-bottom: 20px;
        &:before,&:after{
          content: '';
          display: inline-block;
          vertical-align: middle;
          margin-top: -3px;
          width: 1em;
          height: 1px;
          background-color: #666;
        }
        &:before{
          margin-right: 6px;
        }
        &:after{
          margin-left: 6px;
        }
      }
      .login-row{
        position: relative;
        height: 44px;
        margin-bottom: 20px;
        input{
          position: relative;
          z-index: 2;
          background-color: transparent;
          width: 100%;
          height: inherit;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          color: #333;
          line-height: 30px;
          padding: 6px 20px 6px 100px;
        }
        label{
          height: inherit;
          font-size: 16px;
          color: #ccc;
          line-height: 44px;
          position: absolute;
          left: 20px;
          top: 0;
        }
        .get-code{
          position: absolute;
          right: 20px;
          height: calc(100% - 2px);
          top: 1px;
          z-index: 3;
          line-height: 44px;
          white-space: nowrap;
          font-size: 16px;
          color: #333;
          cursor: pointer;
          background-color: #fff;
          width: 100px;
          text-align: right;
        }
      }
      .btn-submit{
        display: block;
        width: 100%;
        height: 44px;
        background-color: #A35AFE\9;
        background-image: linear-gradient(90deg, #F362F5 0%, #A35AFE 100%);
        border-radius: 4px;
        border: 0;
        font-size: 18px;
        color: #fff;
      }
      .bottom{
        line-height: 40px;
        margin-top: 20px;
        .other-way{
          float: left;
          white-space: nowrap;
          .label{
            font-size: 16px;
            color: #999;
            vertical-align: middle;
          }
          a[class^="icon-"]{
            cursor: pointer;
            display: inline-block;
            vertical-align: middle;
            margin-left: 20px;
            height: 40px;
            width: 40px;
            background-color: #f4f;
          }
        }
        .btn-change{
          cursor: pointer;
          font-size: 16px;
          color: #333;
          float: right;
        }
      }*/
    }
    .mask{
      width: 100%;
      height: 100%;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 98;
      background-color: rgba(0,0,0,.4);
    }
  }

</style>
