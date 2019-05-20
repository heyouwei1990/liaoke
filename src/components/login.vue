<!--登录弹框内容-->
<template>
  <div class="login-form">
    <h3 class="dialog-title">快速登录</h3>
    <div class="other-way">
      <a href="javascript:void(0)" class="third" @click="qqLogin">
        <i class="icon-qq"></i>
        <span class="label">QQ登录</span>
      </a>
      <a href="javascript:void(0)" class="third" @click="wxLogin">
        <i class="icon-wx"></i>
        <span class="label">微信登录</span>
      </a>
    </div>
    <hr>
    <div class="form">
      <div class="login-row get-code">
        <i class="icon-phone"></i>
        <input v-model.trim="phone" maxlength="11" type="text" @keyup="clear" placeholder="请输入手机号码">
        <button class="btn" :disabled="isDisabled" @click="getCode">{{getCodeText}}</button>
      </div>
      <div class="login-row get-img">
        <i class="icon-abc"></i>
        <input v-model.trim="imgCode" type="text" @keyup="clear" placeholder="请输入右侧字母">
        <img class="img-code" :src="imgCodeUrl" @click="getImgCode(1)" />
      </div>
      <div class="login-row">
        <i class="icon-safe"></i>
        <input v-model.trim="phoneCode" type="text" @keyup="clear" placeholder="请输入验证码">
      </div>
      <div class="warn" v-if="warnMsg!=''">{{warnMsg}}</div>
      <button class="btn-submit" @click="login">登录</button>
    </div>
  </div>
</template>

<script>
import md5 from "js-md5";
import { baseUrl } from "@/util/common";
import { pathJudge, defaultAvatar, setStore } from "@/util/tools";
import version from "@/util/version";
export default {
  data() {
    return {
      isLoginEntry: this.entry, //是否为登录
      phone: "",
      imgCode: "",
      phoneCode: "",
      warnMsg: "",
      getCodeText: "获取验证码",
      imgCodeUrl: "",
      isDisabled: false //disabled
    };
  },
  props: {
    entry: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    this.getImgCode();
  },
  methods: {
    //清空提示信息
    clear() {
      this.warnMsg = "";
    },
    //获取图片验证码
    getImgCode(ref) {
      let that = this;
      if (ref) {
        //有参数表示刷新
        this.$get("/site/captcha", {
          refresh: ref
        }).then(r => {
          that.imgCodeUrl = baseUrl + r.url;
        });
      } else {
        //没有参数表示初始化图片
        that.imgCodeUrl = baseUrl + "/site/captcha";
      }
    },
    //获取手机验证码
    getCode() {
      if (!this.testPhone()) {
        return;
      }
      let count = 60;
      this.getCodeText = `${count--}s后重新获取`;
      this.isDisabled = true; //计时器开启时按钮不可点击
      let timer = setInterval(() => {
        if (count < 0) {
          count = 0;
          this.getCodeText = "重新获取验证码";
          this.isDisabled = false;
          window.clearInterval(timer);
        } else {
          let str = `${count--}s后重新获取`;
          this.getCodeText = str;
        }
      }, 1000);
      let time = new Date().getTime();
      let sign = md5("sms!e_e" + this.phone + time);
      let that = this;

      this.$get("/h5/public/sms", {
        phone: this.phone,
        type: "login",
        time: time,
        sign: sign
      }).then(r => {
        that.warnMsg = r.msg;
      });
    },
    //登录
    login() {
      var str = "";
      var nStr = String(this.phone);
      for (let i = 0; i < nStr.length; i++) {
        if (i <= 2) {
          str += nStr[i];
        }
      }
      if (str == "233") {
      } else {
        if (!this.testPhone()) {
          return;
        }
      }
      if (this.imgCode == "") {
        this.warnMsg = "请输入图片验证码";
        return;
      }
      if (this.phoneCode == "") {
        this.warnMsg = "请输入手机验证码";
        return;
      }
      this.$get("/h5/public/pc-login", {
        phone: this.phone,
        code: this.phoneCode,
        img_code: this.imgCode
      }).then(r => {
        if (r.http_code == 200) {
          this.warnMsg = r.msg;
          this.phoneCode = "";
          this.phone = "";
          this.imgCode = "";
          this.$router.go(0);
        } else if (r.http_code == 4000) {
          this.imgCode='';
          this.getImgCode(1);
        } else {
          this.$store.commit("setToast", r.msg);
        }
      });
    },
    getUserInfo() {
      this.$get("/h5/user/profile").then(r => {
        let obj = r.data;
        this.$store.commit("setUser", obj);
        this.$store.commit("set_loginState", true);
        this.$store.commit("set_loginDialog", false);
      });
    },
    //验证手机号
    testPhone() {
      let result = true;
      if (this.phone == "") {
        this.warnMsg = "请输入手机号";
        result = false;
      }
      if (
        !/^1[345678]\d{9}$/.test(this.phone) &&
        !/^233\d{8}$/.test(this.phone)
      ) {
        this.warnMsg = "手机号格式错误";
        result = false;
      }
      return result;
    },

    //微信登录
    wxLogin() {
      let url = encodeURIComponent(window.location.href);
      var wxUrl = `${version.apiHost}/h5/public/wx-qr?referer=${url}`;
      window.location.href = wxUrl;
      // http://localhost:8088/api/h5/public/wx-qr?referer=http%3A%2F%2Flocalhost%3A8088%2F%23%2Franking
    },
    //qq登录
    qqLogin() {
      let url = encodeURIComponent(window.location.href);
      var qqUrl = `${version.apiHost}/user/login-qq?referer=${url}`;
      window.location.href = qqUrl;
    }
  }
};
</script>

<style lang="scss">
.login-form {
  width: 430px;
  .dialog-title {
    font-size: 22px;
    line-height: 2;
    color: #333;
    text-align: center;
    margin-bottom: 30px;
    &:before,
    &:after {
      content: "";
      display: inline-block;
      vertical-align: middle;
      margin-top: -3px;
      width: 1em;
      height: 1px;
      background-color: #666;
    }
    &:before {
      margin-right: 6px;
    }
    &:after {
      margin-left: 6px;
    }
  }
  .other-way {
    text-align: center;
    white-space: nowrap;
    .third {
      display: inline-block;
      vertical-align: middle;
      margin-right: 122px;
      &:last-child {
        margin-right: 0;
      }
    }
    [class^="icon-"] {
      cursor: pointer;
      display: inline-block;
      vertical-align: middle;
      height: 70px;
      width: 70px;
    }
    .icon-qq {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/login/icon-qq.png")
        no-repeat center / cover;
    }
    .icon-wx {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/login/icon-wx.png")
        no-repeat center / cover;
    }
    .label {
      display: block;
      white-space: nowrap;
      font-size: 14px;
      color: #666;
      line-height: 1.5;
      margin-top: 6px;
    }
  }
  hr {
    border: 0;
    border-top: 1px solid #f2f2f2;
    margin-top: 20px;
    margin-bottom: 24px;
  }
  .login-row {
    position: relative;
    height: 44px;
    margin-bottom: 20px;
    input {
      background-color: transparent;
      width: 100%;
      height: inherit;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      color: #333;
      line-height: 30px;
      padding: 6px 20px 6px 54px;
    }
    &.get-code input {
      padding-right: 110px;
    }
    &.get-img input {
      width: 222px;
    }
    .img-code {
      cursor: pointer;
      width: 160px;
      height: inherit;
      border: 0;
      outline: none;
      position: absolute;
      right: 0;
      top: 0;
      border-radius: 4px;
      background-color: #ccc;
    }
    [class^="icon-"] {
      position: absolute;
      left: 12px;
      top: 50%;
      z-index: 2;
      width: 26px;
      height: 26px;
      margin-top: -13px;
    }
    .icon-phone {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/login/icon-mobile.png")
        no-repeat center / cover;
    }
    .icon-abc {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/login/icon-abc.png")
        no-repeat center / cover;
    }
    .icon-safe {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/login/icon-safe.png")
        no-repeat center / cover;
    }
    &.get-code .btn {
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
      border: 0;
    }
  }
  .warn {
    font-size: 12px;
    color: #f00;
    line-height: 20px;
    margin-bottom: 10px;
    text-align: center;
  }
  .btn-submit {
    display: block;
    width: 100%;
    height: 44px;
    background-color: #A35AFE\9;
    background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
    border-radius: 4px;
    border: 0;
    font-size: 18px;
    color: #fff;
    margin-bottom: 20px;
  }
}
</style>
