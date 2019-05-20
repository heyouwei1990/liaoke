<!--支付弹框内容-->
<template>
  <div class="pay-dialog">
    <div class="title">扫一扫付款（元）</div>
    <div class="payment">{{payment.price}}</div>
    <div class="qrcode" id="qrcode"></div>
    <div class="tip">
      打开手机{{payment.label}}<br>
      扫描二维码付款
    </div>
  </div>
</template>

<script>
  import QRCode from '@/util/qrcode'
  import { mapState } from 'vuex'
  export default {
    computed:{
      ...mapState({
        payment:state=>state.payment
      })
    },
    mounted(){
      this.dataInit();
    },
    methods:{
      dataInit(){
        var qrcode = new QRCode(document.getElementById('qrcode'), {
          // text: "i am the first qrcode",
          width: 222, //生成的二维码的宽度
          height: 222, //生成的二维码的高度
          colorDark : "#000000", // 生成的二维码的深色部分
          colorLight : "#ffffff", //生成二维码的浅色部分
          correctLevel : QRCode.CorrectLevel.H
        });
        qrcode.makeCode(this.payment.url);
      }
    }
  }
</script>

<style lang="scss">
  .pay-dialog{
    text-align: center;
    padding-top: 20px;
    width: 400px;
    .title{
      font-size: 24px;
      color: #333;
      line-height: 2;
    }
    .payment{
      font-size: 36px;
      color: #ffab00;
      line-height: 1.5;
    }
    .qrcode{
      display: block;
      width: 224px;
      height: 224px;
      border: 2px solid #ccc;
      margin: 20px auto;
      padding: 10px;
      img{
        display: block;
        width: 100%;
        height: 100%;
      }
    }
    .tip{
      font-size: 20px;
      color: #666;
      line-height: 26px;
      position: relative;
      padding-left: 56px;
      display: inline-block;
      margin-bottom: 20px;
      text-align: left;
      &:before{
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        margin-top: -20px;
        width: 40px;
        height: 40px;
        vertical-align: middle;
        background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-scan.png") no-repeat center;
        background-size: 100%;
      }
    }
  }
</style>
