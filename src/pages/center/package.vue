<template>
  <div class="packbag-component">
    <h2 class="sec-hd">VIP专属</h2>
    <ul class="packbag-list">
      <li>
        <div class="packbag-item">
          <img class="icon" src="https://asset.liaoke.tv/assets/icon/vip/vip_3.png" alt="">
          <div class="packbag-name">VIP专属礼包</div>
          <p class="desc">领取可获得专属VIP礼包</p>
          <div class="btn linear-btn" @click="buy">
            <span>点击领取</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    data(){
      return{

      }
    },
    methods:{
      buy(){
        this.$get('/h5/gift/vip-reward').then((r)=>{
          if(r.http_code==200){

          }else{
            // console.log(r)
          }
        })
      }
    }
  }
</script>

<style lang="scss">
  .packbag-component{
    padding: 40px;
    .sec-hd{
      font-size: 20px;
      color: #333;
      line-height: 2;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .packbag-list{
      overflow: hidden;
      >li{
        float: left;
        margin-right: 25px;
        margin-bottom: 25px;
        &:nth-of-type(5n){
          margin-right: 0;
        }
      }
    }
    .packbag-item{
      width: 190px;
      height: 190px;
      border: 1px solid #ddd;
      border-radius: 4px;
      text-align: center;
      padding: 24px 20px 20px;
      .icon{
        width: 40px;
        height: 38px;
        margin-bottom: 10px;
      }
      .packbag-name{
        font-size: 16px;
        color: #333;
        line-height: 24px;
      }
      .desc{
        font-size: 12px;
        color: #999;
        line-height: 20px;
        margin-top: 4px;
      }
      .btn{
        width: 100px;
        height: 32px;
        line-height: 30px;
        margin: 12px auto 0;
      }
    }

    .linear-btn{
      cursor: pointer;
      position: relative;
      font-size: 12px;
      text-align: center;
      color: #F362F5;
      border-radius: 100px;
      background-color: #F362F5\9;
      background-image: linear-gradient(90deg, #F362F5 0%, #A35AFE 100%);
      &:hover{
        color: #fff;
        span{
          background-color: transparent;
        }
      }
      span{
        position: absolute;
        left: 0px;
        top: 0px;
        z-index: 2;
        width: 100%;
        height: 100%;
        border: 1px solid transparent;
        background-color: #fff;
        border-radius: 100px;
        background-clip: content-box;
      }
    }
  }
</style>
