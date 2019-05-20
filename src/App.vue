<template>
  <div id="app">
    <!-- v-cloak -->
    <mqtt v-if="mqttType" :topicArr="topc" @onmessageArrived="onMessageArrived"></mqtt>
    <common-head></common-head>
    <section class="content-wrapper">
      <router-view></router-view>
    </section>
    <foot></foot>

    <a-dialog :isShow="loginDropIn" @closeDialog="closeLogin">
      <login :entry="enterance"></login>
    </a-dialog>
    <a-dialog :isShow="payDropIn" @closeDialog="closePayment">
      <pay-dialog></pay-dialog>
    </a-dialog>
    <div class="toast-wrap" v-if="toast.isShow">
      <div class="inner">{{ toast.msg }}</div>
    </div>
    <div class="fixed-right">
      <div class="fixed-item">
        <i class="icon-scan"></i>
        <span class="label">下载APP</span>
        <div class="qr-code">
          <!-- <img src="https://lib.liaoke.tv/lib/pc/static/img/qrcode.jpg" alt=""> -->
          <div id="qrcode_dl"></div>
          <div class="desc">扫一扫下载聊客APP</div>
        </div>
      </div>
      <!--<div class="fixed-item" @click="takeBroadcast">
        <i class="icon-record"></i>
        <span class="label">开播</span>
      </div>-->
    </div>
    <a-dialog :isShow="showBroadcast" @closeDialog="showBroadcast=false">
      <broadcast @close="showBroadcast=false"></broadcast>
    </a-dialog>
    <emoji v-if="isShowEmoji" :style="emojiPosition"></emoji>
    <div class="loading-wrap" v-if="loading">
      <div class="loading-inner">
        <i class="icon-loading"></i>
        <span>请稍候…</span>
      </div>
    </div>
    <a-dialog class="broke-dialog" :isShow="isBroke" @closeDialog="closeBroke">
      <div class="inner">
        <i class="icon-info"></i>
        <div class="tip-msg">余额不足</div>
        <div class="desc">当前余额不足，赶快去充值吧~</div>
        <div class="btn-group">
          <a class="btn-ensure" href="javascript:void(0)" @click="toRecharge">确认</a>
        </div>
      </div>
    </a-dialog>
    <div class="activity-page" v-if="activityUrl">
      <div class="iframe-wrap">
        <i class="icon-close" @click="closeAct"></i>
        <iframe :src="activityUrl" frameborder="0"></iframe>
      </div>
    </div>
    <a-dialog class="chat-dialog" :isShow="isShowChat" @closeDialog="closeChat">
      <chat></chat>
    </a-dialog>
    <div class="video-wrap" v-if="videoUrl">
      <div class="icon-close" @click="closeVideo"></div>
      <video id="video" controls autoplay loop>
        <source :src="videoUrl" type="video/mp4">
      </video>
    </div>
    <div class="choose-gender-wrapper">
      <transition name="drop">
        <div class="inner" v-if="isShowSex">
          <h3 class="title">选择性别</h3>
          <div class="sumary">将根据性别为您推荐内容</div>
          <div class="check-row">
            <div class="radio-box left">
              <input type="radio" name="sex" v-model="gender" value="2">
              <label>我是女生</label>
            </div>
            <div class="radio-box right">
              <input type="radio" name="sex" v-model="gender" value="1">
              <label>我是男生</label>
            </div>
          </div>
          <p class="tip-warn">*选择性别后无法更改，请选择真实性别</p>
        </div>
      </transition>
      <div class="mask" v-if="isShowSex"></div>
    </div>
  </div>
</template>

<script>
import CommonHead from "@/components/header";
import Foot from "@/components/footer";
import ADialog from "@/components/dialog";
import Login from "@/components/login";
import PayDialog from "@/components/payDialog";
import { mapState } from "vuex";
import Broadcast from "@/components/broadcast";
import Emoji from "@/components/emoji";
import Mqtt from "@/components/mqtt";
import QRCode from "@/util/qrcode";
import Chat from "@/components/chat";
import { removeStore } from "@/util/tools";

export default {
  components: {
    CommonHead,
    Foot,
    ADialog,
    Login,
    PayDialog,
    Broadcast,
    Emoji,
    Mqtt,
    Chat
  },
  data() {
    return {
      loginDropIn: false, //弹框显示状态，false为不显示
      enterance: true, //登录入口，true为登录，false为注册
      payDropIn: false,
      showBroadcast: false, //开播弹框
      mqttType: false, //mqtt状态
      topc: [], //liaoke2/room/broadcast
      gender: ""
    };
  },
  computed: {
    ...mapState({
      loginDialogState: state => state.isShowLoginDialog,
      payDialogState: state => state.isShowPayDialog,
      toast: state => state.toast,
      isShowEmoji: state => state.isShowEmoji,
      emojiPosition: state => state.emojiPosition,
      loading: state => state.loading,
      hostUser: state => state.hostUser,
      isBroke: state => state.isBroke,
      videoUrl: state => state.videoUrl,
      activityUrl: state => state.activityUrl,
      mqtt_d: state => state.mqtt_d,
      isShowChat: state => state.isShowChat,
      isShowSex: state => state.isShowSex
    })
  },
  watch: {
    loginDialogState(v) {
      this.loginDropIn = v;
      //如果登录者退出登录、会显示视频、私照花费提示弹框
      if (!this.hostUser) {
        removeStore("ignoreVideoTip");
        removeStore("ignorePhotoTip");
      }
    },
    gender(v) {
      if (v) {
        this.$store.commit("set_isShowSex", false);
      }
    },
    payDialogState(v) {
      this.payDropIn = v;
    },
    $route(to, from) {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    },
    hostUser(v) {
      if (v) {
        // console.log(v);
        setTimeout(() => {
          try{
            if (this.$store.state.chat_server == null) {
              this.$store.commit("setchat_server", v.chat_server || {});
              this.$store.commit("mqttInit");
            }
            this.$store.commit("settopc", `liaoke2/user/${v.uid}`);
            this.$store.state.mqtt.subscribe(`liaoke2/user/${v.uid}`, { qos: 0 });
          }catch (e) {

          }
          // console.log("订阅》》》" + `liaoke2/user/${v.uid}`);
        }, 100);
      }
      //如果登录者退出登录、会显示视频、私照花费提示弹框
      if (!v) {
        removeStore("ignoreVideoTip");
        removeStore("ignorePhotoTip");
      }
    },
    mqtt_d(v) {
      if (v.type == "text") {
        this.$store.commit("setmsgCont"); //获取所有未读消息
      }
    }
  },
  created() {
    this.getInfo();
    // this.$store.commit("mqttInit");
  },
  mounted() {
    // this.receiveTalkMsg();
    // this.getInfo();
    this.qrcodeInit();
    this.$store.commit("setmsgCont"); //获取所有未读消息
  },

  methods: {
    qrcodeInit() {
      var qrcode = new QRCode(document.getElementById("qrcode_dl"), {
        // text: "i am the first qrcode",
        width: 120, //生成的二维码的宽度
        height: 120, //生成的二维码的高度
        colorDark: "#000000", // 生成的二维码的深色部分
        colorLight: "#ffffff", //生成二维码的浅色部分
        correctLevel: QRCode.CorrectLevel.H
      });
      qrcode.makeCode(
        "http://a.app.qq.com/o/simple.jsp?pkgname=com.qingshu520.chat"
      );
    },

    //关闭消息窗口
    closeChat() {
      this.$store.commit("set_chatState", false);
    },

    //获取登陆者信息
    getInfo() {
      this.$get("/h5/user/profile").then(r => {
        if (r.http_code == 200) {
          let obj = r.data;
          this.$store.commit("setUser", obj);
          this.$store.commit("set_loginState", true);
          this.$store.commit("set_loginDialog", false);
        }
      });
    },
    //接收聊天消息
    receiveTalkMsg() {
      if (this.hostUser) {
        let str = `liaoke/user/${this.hostUser.uid}`;
        this.topc.push(str);
        this.setmqtt(this.topc);
      }
    },
    //关闭登录弹框
    closeLogin() {
      this.$store.commit("set_loginDialog", false);
    },
    // 关闭支付弹框
    closePayment() {
      this.$store.commit("set_payDialog", false);
    },
    //设置mqtt
    setmqtt(topic) {
      this.mqttType = false;
      this.topc = topic;
      setTimeout(() => {
        this.mqttType = true;
      }, 1000);
    },
    onMessageArrived(data) {
      // console.log(data);
    },
    //关闭余额不足弹框
    closeBroke() {
      this.$store.commit("set_broke", false);
    },
    // 去充值
    toRecharge() {
      this.closeBroke();
      let routerData = this.$router.resolve({ name: "Recharge" });
      window.open(routerData.href, "_blank");
      // this.$router.push('/recharge');
    },
    closeAct() {
      this.$store.commit("set_activityUrl", "");
    },
    // 去开播
    takeBroadcast() {
      if (this.hostUser) {
        this.showBroadcast = true;
      } else {
        this.$store.commit("set_loginDialog", true);
      }
    },
    closeVideo() {
      let video = document.getElementById("video");
      video.pause();
      this.$store.commit("set_videoUrl", "");
    }
  }
};
</script>

<style lang="scss">
@import "./style/base";
@import "./style/viewer";
#app {
  background-color: #292432;
  min-width: 1340px;
}
#qrcode_dl {
  width: 120px;
  height: 120px;
  margin: 0 auto 6px;
}

.drop-enter-active {
  transition: all 0.5s ease;
}
.drop-leave-active {
  transition: all 0.3s ease;
}
.drop-enter {
  top: -100% !important;
  //transform: translateY(-500px);
}
.drop-leave-active {
  top: -100% !important;
  //transform: translateY(-500px);
}
.choose-gender-wrapper {
  .mask {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 98;
    background-color: rgba(0, 0, 0, 0.5);
  }
  .inner {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 999;
    transform: translate(-50%, -50%);
    background-color: #ffffff;
    border-radius: 4px;
    width: 440px;
    padding: 20px 40px;
    text-align: center;
  }
  .title {
    font-size: 20px;
    color: #333;
    line-height: 2;
    margin-bottom: 10px;
    &:before,
    &:after {
      content: "";
      display: inline-block;
      vertical-align: middle;
      margin-top: -3px;
      width: 1em;
      height: 2px;
      background-color: #333;
      margin-left: 10px;
      margin-right: 10px;
    }
  }
  .sumary {
    font-size: 14px;
    color: #999;
    line-height: 24px;
  }
  .check-row {
    overflow: hidden;
    width: 300px;
    margin: 20px auto;
  }
  .radio-box {
    position: relative;
    input {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      opacity: 0;
      cursor: pointer;
    }
    label {
      display: block;
      min-width: 120px;
      padding-top: 130px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/header/girl.png")
        no-repeat center top;
      background-size: contain;
      font-size: 14px;
      color: #333;
      line-height: 24px;
    }
    &:last-of-type {
      label {
        background: url("https://lib.liaoke.tv/lib/pc/static/img/header/boy.png")
          no-repeat center top;
        background-size: contain;
      }
    }
    input:checked + label {
      opacity: 0.5;
    }
  }
  .tip-warn {
    font-size: 14px;
    color: #ba77ff;
    line-height: 24px;
    margin-bottom: 10px;
    margin-top: 30px;
  }
}

.chat-dialog {
  .dialog-wrap {
    padding: 0;
    overflow: hidden;
  }
  .chat-component {
    width: 900px;
    height: 500px;
  }
}
.video-wrap {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: rgba(0, 0, 0, 0.8);
  .icon-close {
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 2;
    width: 40px;
    height: 40px;
    cursor: pointer;
    background: url("https://lib.liaoke.tv/lib/pc/static/img/index/icon-close.png")
      no-repeat center / contain;
  }
  video {
    width: 100%;
    height: 100%;
  }
}
.activity-page {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 99;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  .iframe-wrap {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 90vh;
    padding: 50px 30px 50px 50px;
    background-color: #fff;
    .icon-close {
      width: 20px;
      height: 20px;
      position: absolute;
      right: 15px;
      top: 15px;
      z-index: 2;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/login/icon-close.png")
        no-repeat center / contain;
    }
    iframe {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}

.broke-dialog {
  .inner {
    width: 360px;
    min-height: 240px;
    .icon-info {
      display: block;
      width: 69px;
      height: 81px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-info.png");
      margin: 20px auto 0;
    }
    .tip-msg {
      font-size: 18px;
      color: #333;
      line-height: 24px;
      text-align: center;
      margin-top: 20px;
    }
    .desc {
      text-align: center;
      font-size: 12px;
      color: #999;
      line-height: 20px;
      margin-top: 10px;
    }
    .btn-group {
      text-align: center;
      margin: 30px auto 10px;
    }
    .btn-ensure {
      display: inline-block;
      font-size: 14px;
      color: #fff;
      width: 130px;
      height: 40px;
      line-height: 40px;
      text-align: center;
      border-radius: 40px;
      background-color: #f362f5;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
    }
  }
}
.loading-wrap {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  .loading-inner {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 2;
    width: 120px;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 4px;
    padding: 20px;
    text-align: center;
    transform: translate(-50%, -50%);
    .icon-loading {
      display: block;
      width: 60px;
      height: 60px;
      margin: 20px auto 20px;
      border-radius: 50%;
      border: 2px solid #fff;
      border-right: 2px solid transparent;
      animation: roll 0.8s ease infinite;
    }
    span {
      display: block;
      font-size: 14px;
      color: #fff;
      line-height: 24px;
    }
  }
}
.loading-wave {
  padding-top: 20px;
  padding-bottom: 20px;
  text-align: center;
  span {
    border-radius: 50%;
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 6px;
    background-color: #a35afe;
    &:nth-of-type(1) {
      animation: wave 1.2s linear infinite alternate;
    }
    &:nth-of-type(2) {
      animation: wave 1.2s linear 0.4s infinite alternate;
      transform: scale(0.8);
    }
    &:nth-of-type(3) {
      animation: wave 1.2s linear 0.8s infinite alternate;
      transform: scale(0.5);
    }
  }
}
[v-cloak] {
  display: none !important;
}
.content-wrapper {
  min-height: calc(100vh - 148px); //footer高148px
  padding-top: 60px;
  min-width: 1340px;
  // margin: auto;
  // background: #ffffff;
}
img[lazy="loading"] {
  position: static;
  left: auto;
  top: auto;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
  max-height: 100%;
  max-width: 100%;
}
.level-mark {
  display: inline-block;
  vertical-align: middle;
  width: 24px;
  height: 12px;
}
.vip-mark {
  display: inline-block;
  vertical-align: middle;
  width: 13px;
  height: 12px;
}
.ward-mark {
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
}
.sex-mark {
  display: inline-block;
  vertical-align: middle;
  width: 30px;
  height: 14px;
  border-radius: 20px;
  position: relative;
  padding-left: 10px;
  text-align: center;
  font-size: 11px;
  color: #fff;
  line-height: 14px;
  white-space: nowrap;
  overflow: hidden;
  .icon-sex {
    position: absolute;
    left: 2px;
    top: 50%;
    width: 10px;
    height: 10px;
    margin-top: -5px;
  }
  &.man {
    background-color: #72B9FF\9;
    background-image: linear-gradient(180deg, #72b9ff 0%, #4691da 100%);
    .icon-sex {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/icon-man.png")
        no-repeat center / contain;
    }
  }
  &.woman {
    background-color: #ff90b0\9;
    background-image: linear-gradient(180deg, #ff90b0 0%, #ff6692 100%);
    .icon-sex {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/icon-woman.png")
        no-repeat center / contain;
    }
  }
}
.toast-wrap {
  position: fixed;
  top: 50%;
  left: 50%;
  box-sizing: border-box;
  max-width: 400px;
  // max-height: 480px;
  // min-width: 300px;
  // min-height: 100px;
  // line-height: 20px;
  padding: 12px 30px;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 999;
  font-size: 14px;
  color: #fff;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.7);
  overflow: hidden;
  word-break: break-all;
  display: table;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
  animation: fadeInUp 1.5s ease-out;
  .inner {
    display: table-cell;
    vertical-align: middle;
  }
}
.fixed-right {
  position: fixed;
  right: 0;
  top: 50%;
  z-index: 3;
  .fixed-item {
    position: relative;
    width: 80px;
    height: 80px;
    background-color: #3d3747;
    margin-bottom: 2px;
    padding-top: 15px;
    text-align: center;
    cursor: pointer;
    i[class^="icon-"] {
      display: block;
      width: 32px;
      height: 32px;
      margin: 0 auto;
    }
    .icon-record {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/index/icon-record.png")
        no-repeat center / contain;
    }
    .icon-scan {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/index/icon-scan.png")
        no-repeat center / contain;
    }
    .label {
      display: block;
      color: #fff;
      font-size: 14px;
      line-height: 20px;
      margin-top: 4px;
    }

    .qr-code {
      display: none;
      width: 170px;
      position: absolute;
      right: 100%;
      bottom: 0px;
      z-index: 99;
      padding: 16px 10px;
      background-color: #fff;
      box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3);
      margin-right: 15px;
      border-radius: 4px;
      text-align: center;
      &:before {
        content: "";
        position: absolute;
        right: -6px;
        bottom: 34px;
        width: 12px;
        height: 12px;
        z-index: 0;
        background-color: #fff;
        transform: rotate(-45deg);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
        /*border: 10px solid transparent;*/
        /*border-left: 12px solid #fff;*/
      }
      &:after {
        content: "";
        position: absolute;
        right: 0px;
        bottom: 28px;
        width: 12px;
        height: 22px;
        z-index: 0;
        background-color: #fff;
      }
      img {
        // display: block;
        // width: 140px;
        // height: 140px;
        margin: 0 auto 6px;
      }
      .desc {
        font-size: 14px;
        color: #a35afe;
        line-height: 24px;
      }
    }
    &:hover {
      .qr-code {
        display: block;
      }
    }
  }
}
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
@keyframes roll {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes wave {
  from {
    transform: scale(1);
    background-color: #a35afe;
  }
  to {
    transform: scale(0.5);
    background-color: #f362f5;
  }
}
</style>
