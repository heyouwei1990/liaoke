<template>
  <div class="real-name">
    <div v-show="!isFail">
      <h3 class="title">实名认证</h3>
      <div class="step-wrap">
        <div :class="['step', {active:step==0}]">
          <i class="icon-finish"></i>
          <span>基本资料填写</span>
        </div>
        <i class="icon-arrow"></i>
        <div :class="['step', {active:step==1}]">
          <i class="icon-finish"></i>
          <span>证件照验证</span>
        </div>
      </div>
      <div class="form" v-show="step==0">
        <div class="row-list">
          <div class="input-row">
            <label>身份证姓名：</label>
            <input v-model="fullname" type="text" placeholder="请输入您的身份证姓名">
          </div>
          <div class="input-row">
            <label>身份证号码：</label>
            <input v-model="idCard" l type="text" placeholder="请输入您的身份证号码">
          </div>
          <div class="input-row">
            <label>开户银行：</label>
            <select v-model="bank">
              <option value="" disabled>请选择开户银行</option>
              <option v-for="(item,index) in bankList" :key="index">{{item.text}}</option>
            </select>
          </div>
          <div class="input-row">
            <label>银行卡号:</label>
            <input v-model="bankCard" type="text" placeholder="请输入您的银行卡号">
          </div>
          <div class="input-row">
            <label>手机号码:</label>
            <input v-model="phone" type="text" placeholder="请输入预留手机号">
            <button class="btn-code" @click="getCode">获取验证码</button>
          </div>
          <div class="input-row">
            <label>验证码:</label>
            <input v-model="phoneCode" type="text" placeholder="请输入短信验证码">
          </div>
        </div>
        <div class="warn">{{warnMsg}}</div>
        <button class="btn-ensure" @click="saveInfo" :disabled="fullname=='' || idCard=='' || bank=='' || bankCard=='' || phone=='' || phoneCode==''">确认无误,点击下一步</button>
      </div>
      <div class="file-wrap" v-show="step==1">
        <ul class="file-list">
          <li v-for="(item,index) in fileImg" :key="index">
            <div class="file-box" >
              <label :id="'file'+index" @mouseover="selectStyle(index)"></label>
              <!--<input :id="'file'+index" type="file" accept="image/*" @click="setIndex(index)">-->
              <!-- <input :id="'file'+index" type="file" accept="image/*" @change="upload($event,index)"> -->
              <img class="file-img" :src="item.img" alt="">
            </div>
          </li>
        </ul>
        <p class="tip">*请保持身份证照片文字清晰可辨认，照片需白色作为背景<br>遮挡、模糊、不完整的照片将导致审核不通过<br>（实名信息仅作为官方审核用途，不对外公开）</p>
        <div class="btn-group">
          <button class="btn-back" @click="step=0">上一步</button>
          <button class="btn-submit" @click="submit">提交</button>
        </div>
      </div>
    </div>
    <div v-show="isFail" class="fail">
      <div class="had-auth">已认证</div>
      <div class="info-wrap clearfix">
        <ul class="info-list">
          <li>
            <span class="label">身份证姓名：</span>
            <span class="val">大魔王</span>
          </li>
          <li>
            <span class="label">银行卡号:</span>
            <span class="val">6219876653746748458</span>
          </li>
          <li>
            <span class="label">身份证号码：</span>
            <span class="val">3267779848009326</span>
          </li>
          <li>
            <span class="label">手机号码:</span>
            <span class="val">13948273346</span>
          </li>
          <li>
            <span class="label">开户银行：</span>
            <span class="val">中国工商银行</span>
          </li>
          <li>
            <span class="label">验证码:</span>
            <span class="val">274834</span>
          </li>
        </ul>
        <button class="btn-revise" @click="isFail=false;step=0">修改资料</button>
      </div>
      <div class="fail-tip">
        <i class="icon-warn">!</i>
        认证失败,请重新上传!
      </div>
      <ul class="file-list">
        <li v-for="(item,index) in fileImg" :key="index">
          <div class="file-box" >
            <label :id="'file'+index" @mouseover="selectStyle(index)"></label>
            <!--<a :id="item.id" href="javascript:void(0);" class='btn' :style="{width:'100%',height:'100%',display:item.type?'block':'none',position:'absolute',zIndex:'100'}">
            </a>-->
            <img class="file-img" :src="item.img" alt="">
          </div>
        </li>
      </ul>
      <div class="btn-group">
        <button class="btn-anew" @click="submit">重新上传</button>
      </div>
    </div>
  </div>
</template>

<script>
import md5 from "js-md5";
import { setStore, getStore, removeStore,  uploader} from "@/util/tools";

export default {
  data() {
    return {
      step: 0, //认证步骤
      fullname: "", //姓名
      idCard: "", //身份证号
      bank: "", //开户银行
      bankCard: "", //银行卡号
      phone: "", //手机号
      phoneCode: "", //手机验证码
      bankList: [], //银行列表
      warnMsg: "", //提示信息
      //上传提示图
      fileImgIndex: 0,//正在上上传的索引
      fileImg: [
        {
          type: false,
          img: require("../../../static/img/center/file-idcard1.png")
        },
        {
          type: false,
          img: require("../../../static/img/center/file-idcard2.png")
        },
        {
          type: false,
          img: require("../../../static/img/center/file-icbc.png")
        }
      ],
      fileObj: null,//上传实例对象
      isUp: false,//是否在上传？  停止hover
      showImg: [], //待上传的图片
      infoId: "" //提交实名信息成功得到id
    };
  },
  props:{
    isFail: {
      type:Boolean,
      default:false
    } //是否已提交认证
  },
  mounted() {
    this.dataInit();
  },
  methods: {
    dataInit() {
      // this.infoId = !getStore("realNameId") ? "" : getStore("realNameId");
      this.step = this.infoId == "" ? 0 : 1;
      this.$get("/h5/system/bank-list").then(r => {
        this.bankList = r.data;
      });
    },

    //上传图片
    selectStyle(i) {
      let el=event.target?event.target:event.srcElement;
      let fileId=el.getAttribute('id');
      if (this.isUp) return;
      for (let index = 0; index < this.fileImg.length; index++) {
        this.fileImg[index].type = false;
      }
      if(this.fileObj){
        this.fileObj.destroy();
      }
      this.fileImg[i].type = true;
      this.fileObj = uploader(
        fileId,
        'card',
        () => {
          this.isUp = true;
        },
        name => {
          this.isUp = false;
          this.fileImg[this.fileImgIndex].img = name;
          this.showImg[this.fileImgIndex]=name;
        }
      );
      this.fileObj.init();
      this.fileImgIndex = i;
    },

    //获取验证码
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

      this.$get("/h5/public/sms", {
        phone: this.phone,
        type: "bind",
        time: time,
        sign: sign
      }).then(r => {
        this.warnMsg = r.msg;
      });
    },
    //验证手机号
    testPhone() {
      let result = true;
      if (this.phone.trim() == "") {
        this.warnMsg = "请输入手机号";
        result = false;
      } else if (!/^1[345678][0-9]{9}$/.test(this.phone.trim())) {
        this.warnMsg = "手机号格式错误";
        result = false;
      }
      return result;
    },
    //保存信息
    saveInfo() {
      console.log(this.bank)
      this.warnMsg = "";
      if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(this.idCard)) {
        this.warnMsg = "请检查身份证号码";
        return;
      }
      if (!/^([1-9]{1})(\d{15}|\d{18})$/.test(this.bankCard)) {
        this.warnMsg = "请检查银行卡号码";
        return;
      }
      if (!/\d/.test(this.phoneCode)) {
        this.warnMsg = "请检查验证码";
        return;
      }
      if (!this.testPhone()) {
        return;
      }
      this.$get("/h5/user/auth-basic", {
        code: this.phoneCode,
        card_id: this.idCard,
        card_name: this.fullname,
        bank_id: this.bankCard,
        bank_name: this.bank,
        bank_phone: this.phone
      }).then(r => {
        // console.log(r);
        if (r.http_code == 200) {
          this.step = 1;
          this.infoId = r.data.id;
          setStore("realNameId", this.infoId);
        }
      });
    },

    //提交图片
    submit() {
      if(!this.showImg[0]){
        this.$store.commit('setToast','请上传身份证正面图片');
        return;
      }
      if(!this.showImg[1]){
        this.$store.commit('setToast','请上传身份证反面图片');
        return;
      }
      if(!this.showImg[2]){
        this.$store.commit('setToast','请上传工商银行卡正面图片');
        return;
      }
      this.$get('/h5/user/auth-pic',{
        id:this.infoId,
        card_front:this.showImg[0],
        card_back:this.showImg[1],
        bank_pic:this.showImg[2],
      }).then((r)=>{
        if(r.http_code==200){
          this.$emit('upload',r.data.id);
          this.showImg=[];
        }
      })
    },
  }
};
</script>

<style lang="scss">
.real-name {
  .title {
    font-size: 22px;
    color: #000;
    line-height: 40px;
    margin-bottom: 30px;
    text-align: center;
  }
  .step-wrap {
    text-align: center;
    white-space: nowrap;
    line-height: 30px;
    margin-bottom: 30px;
    .step {
      display: inline-block;
      vertical-align: middle;
      font-size: 20px;
      color: #999;
      &.active {
        color: #333;
      }
    }
    .icon-finish {
      width: 28px;
      height: 28px;
      display: inline-block;
      vertical-align: middle;
      margin-top: -3px;
      margin-right: 15px;
      border: 1px solid #999;
      border-radius: 50%;
      position: relative;
      &:before {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        width: 11px;
        height: 6px;
        margin-left: -6px;
        margin-top: -5px;
        border-bottom: 2px solid #999;
        border-left: 2px solid #999;
        transform: rotate(-45deg);
      }
    }
    .active .icon-finish {
      border-color: #cd5ef9;
      color: #333;
      &:before {
        border-bottom: 2px solid #cd5ef9;
        border-left: 2px solid #cd5ef9;
      }
    }
    .icon-arrow {
      display: inline-block;
      vertical-align: middle;
      width: 26px;
      height: 14px;
      margin-left: 40px;
      margin-right: 40px;
      background: url("/static/img/center/icon-arrow.png") no-repeat center /
        contain;
    }
  }
  .form {
    .input-row {
      float: left;
      width: 360px;
      margin-bottom: 30px;
      position: relative;
      white-space: nowrap;
      overflow: hidden;
      &:nth-of-type(even) {
        float: right;
      }
      &:nth-of-type(5) {
        input {
          width: 150px;
        }
      }
      label {
        float: left;
        width: 90px;
        line-height: 40px;
        overflow: hidden;
        white-space: nowrap;
        font-size: 14px;
        color: #333;
      }
      input {
        float: left;
        width: 260px;
        height: 40px;
        padding: 7px 8px;
        line-height: 24px;
        font-size: 14px;
        color: #333;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      select {
        float: left;
        width: 260px;
        height: 40px;
        font-size: 14px;
        padding: 7px 8px;
        color: #333;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      .btn-code {
        float: left;
        width: 100px;
        height: 40px;
        color: #fff;
        font-size: 14px;
        border-radius: 4px;
        background-color: #f362f5;
        background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
        vertical-align: middle;
        margin-left: 10px;
      }
    }
    .row-list {
      overflow: hidden;
    }
    .warn {
      text-align: center;
      font-size: 12px;
      line-height: 20px;
      color: #f00;
    }
    .btn-ensure {
      display: block;
      width: 260px;
      height: 40px;
      border-radius: 4px;
      font-size: 16px;
      color: #fff;
      background-color: #f362f5;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      margin: 10px auto 20px;
    }
  }

  :disabled {
    background: #ccc !important;
  }
  .file-wrap {
    .tip {
      text-align: center;
      color: #ccc;
      font-size: 12px;
      line-height: 18px;
      margin-top: 20px;
    }
  }
  .file-list {
    overflow: hidden;
    > li {
      float: left;
      margin-right: 20px;
      &:last-of-type {
        margin-right: 0;
      }
    }
  }
  .file-box {
    width: 236px;
    height: 180px;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    label {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2;
      width: 100%;
      height: 100%;
      cursor: pointer;
      background-color: rgba(0, 0, 0, 0.01);
      opacity: 0;
    }
  }
  .file-img {
    width: 100%;
    height: 100%;
  }
  .btn-group {
    margin-top: 30px;
    margin-bottom: 10px;
    text-align: center;
    button {
      width: 140px;
      height: 40px;
      border-radius: 4px;
      font-size: 16px;
      color: #fff;
      background-color: #f362f5;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
    }
  }
  input[type="file"] {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    clip: rect(0, 0, 0, 0);
  }
  .had-auth {
    text-align: center;
    font-size: 18px;
    color: #999;
    line-height: 40px;
    margin-bottom: 12px;
    &:before,
    &:after {
      content: "";
      display: inline-block;
      vertical-align: middle;
      margin: -3px 15px 0;
      width: 62px;
      height: 1px;
      background-color: #999;
    }
  }
  .info-wrap {
    border-bottom: 1px solid #e6e6e6;
    margin-bottom: 20px;
  }
  .info-list {
    overflow: hidden;
    float: left;
    margin-bottom: 12px;
    width: 540px;
    > li {
      float: left;
      width: 260px;
      margin-right: 20px;
      line-height: 30px;
      font-size: 14px;
      color: #333;
      &:nth-of-type(even) {
        margin-right: 0;
      }
      .label {
        display: inline-block;
        vertical-align: middle;
        width: 6em;
      }
      .val {
        display: inline-block;
        vertical-align: middle;
      }
    }
  }
  .btn-revise {
    float: right;
    width: 100px;
    height: 40px;
    border-radius: 4px;
    border: 1px solid #cd5ef9;
    background-color: #fff;
    color: #cd5ef9;
  }
  .fail-tip {
    font-size: 14px;
    color: #333;
    line-height: 20px;
    text-align: center;
    margin-bottom: 20px;
    .icon-warn {
      display: inline-block;
      vertical-align: middle;
      margin-top: -2px;
      width: 16px;
      height: 16px;
      background: #f00;
      border-radius: 50%;
      text-align: center;
      line-height: 16px;
      color: #fff;
      margin-right: 10px;
    }
  }
}
</style>
