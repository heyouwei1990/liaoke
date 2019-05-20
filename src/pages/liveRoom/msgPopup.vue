<!--发送飞屏、表情、喇叭-->
<template>
  <div class="msg-special">
    <ul class="ctrl-btns clearfix">
      <li :class="['ctrl-item',{active:item.active}]" @click.stop="popup(index)" v-for="(item,index) in btnArr" :key="index">
        <div class="ctrl-item">
          <i :class="item.icon"></i>
          <span>{{item.text}}</span>
        </div>
      </li>
    </ul>
    <div @click.stop v-show="btnArr[0].active" class="msg-popup face-popup">
      <div id="faceSlider" class="swiper-container">
        <div class="swiper-wrapper">
          <div v-if="faceList.length>0" class="swiper-slide" v-for="(slideItem,index) in faceList" :key="index">
            <div class="face-item" v-for="(item,idx) in slideItem" :key="idx" @click="checkFace(item.code)" v-html="item.pic">
            </div>
          </div>
        </div>
      </div>
      <div class="swiper-pagination"></div>
      <div class="btn-prev" @click="prev"></div>
      <div class="btn-next" @click="next"></div>
    </div>
    <div @click.stop v-if="btnArr[1].active" class="msg-popup fly-popup">
      <div class="title">选择飞屏类型</div>
      <hr>
      <div class="inner">
        <div class="radio-box">
          <div class="radio-item">
            <input v-model="cost" checked type="radio" name="cost" value="500">
            <label>本房间({{msgpopdata.bullet_price||500}}金币/次)</label>
          </div>
          <div class="radio-item">
            <input v-model="cost" type="radio" name="cost" value="5000">
            <label>全房间({{msgpopdata.broadcast_bullet_price||5000}}金币/次)</label>
          </div>
        </div>
        <textarea v-model="flyText" placeholder="来飞点啥…"></textarea>
        <button class="btn" @click="sendFly">发送</button>
      </div>
    </div>
    <div @click.stop v-if="btnArr[2].active" class="msg-popup suona-popup">
      <div class="title">全房间喇叭</div>
      <hr>
      <div class="inner">
        <textarea v-model="suonaText" placeholder="来广播点啥…"></textarea>
        <button class="btn" @click="sendSuona">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
import Swiper from "swiper/dist/idangerous.swiper.js";
import { sliceArray, replaceEmmoji, emojiList } from "@/util/tools";
import { mapState } from "vuex";
export default {
  data() {
    return {
      btnArr: [
        {
          icon: "icon-face",
          text: "表情",
          active: false
        },
        {
          icon: "icon-fly",
          text: "飞屏",
          active: false
        },
        {
          icon: "icon-suona",
          text: "喇叭",
          active: false
        }
      ],
      faceSlider: null,
      flyText: "", //飞屏信息
      suonaText: "", //喇叭信息
      cost: 500, //飞屏选择，默认500
      faceList: []
    };
  },
  props: {
    msgpopdata: {
      // live/in  接口返回 喇叭飘屏价格
      type: Object,
      default: {}
    },
    showType: {
      // 0 1 2  0无 1飞屏2喇叭
      type: [String, Number],
      default: 0
    }
  },
  watch: {
    showType(v) {
      console.log(v);
      switch (v) {
        case 1:
          this.popup(1);
          // 房间飘屏
          this.cost = this.msgpopdata.bullet_price;
          break;
        case 3:
          this.popup(1);
          // 全站飘屏
          this.cost = this.msgpopdata.broadcast_bullet_price;
          break;
        case 2:
          this.popup(v);
          break;

        default:
          break;
      }
      this.$emit("setshowType");
    }
  },
  computed: {
    ...mapState({
      hostUser: state => state.hostUser
    })
  },
  mounted() {
    this.dataInit();
    document.addEventListener(
      "click",
      () => {
        this.close();
      },
      false
    );
  },
  methods: {
    dataInit() {
      this.faceSlider = new Swiper("#faceSlider", {
        pagination: ".face-popup .swiper-pagination",
        paginationClickable: true,
        preventClicks: false, // 可以点击
        grabCursor: true
      });
    },
    //打开飞屏、表情、喇叭弹框
    popup(idx) {
      if (this.btnArr[idx].active == true) {
        this.close();
      } else {
        this.close();
        this.btnArr[idx].active = true;
      }
      if (idx == 0) {
        this.face();
      }
    },
    //关闭飞屏、表情、喇叭弹框
    close() {
      for (let i = 0; i < this.btnArr.length; i++) {
        this.btnArr[i].active = false;
      }
    },
    prev() {
      this.faceSlider.swipePrev();
    },
    next() {
      this.faceSlider.swipeNext();
    },
    //选择表情
    checkFace(faceCode) {
      this.$emit("inputFace", faceCode);
      this.btnArr[0].active = false;
    },
    face() {
      this.faceList = sliceArray(emojiList(), 30);
      setTimeout(() => {
        this.faceSlider.reInit();
      }, 20);
    },
    //发送飞屏
    sendFly() {
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      if (this.flyText.trim() == "") {
        return;
      }
      let type = this.cost == 500 ? "room" : "broadcast";
      this.$emit("fly", this.flyText, type);
      this.flyText = "";
      this.close();
    },
    //发送喇叭
    sendSuona() {
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      if (this.suonaText.trim() == "") {
        return;
      }
      this.$emit("speak", this.suonaText);
      this.suonaText = "";
      this.close();
    }
  }
};
</script>

<style lang="scss">
.msg-special {
  /*position: relative;*/
  .ctrl-btns {
    > li {
      float: left;
      cursor: pointer;
      height: 40px;
      line-height: 40px;
      padding-left: 12px;
      padding-right: 12px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
  .ctrl-item {
    i {
      display: inline-block;
      vertical-align: middle;
      width: 13px;
      height: 13px;
    }
    span {
      vertical-align: middle;
    }
    .icon-face {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-face.png")
        no-repeat center / contain;
    }
    .icon-fly {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-fly.png")
        no-repeat center / contain;
    }
    .icon-suona {
      background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-suona.png")
        no-repeat center / contain;
    }
    &.active,
    &:hover {
      color: #f162f5;
      .icon-face {
        background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-face-active.png")
          no-repeat center / contain;
      }
      .icon-fly {
        background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-fly-active.png")
          no-repeat center / contain;
      }
      .icon-suona {
        background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-suona-active.png")
          no-repeat center / contain;
      }
    }
  }
  .msg-popup {
    position: absolute;
    left: 0px;
    bottom: 100%;
    z-index: 99;
    margin-bottom: 10px;
    background-color: #3d3747;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    width: 320px;
    padding: 10px 15px;
    &.fly-popup {
      &:before {
        left: 100px;
      }
    }
    &.suona-popup {
      &:before {
        left: 165px;
      }
    }
    &:before {
      content: "";
      position: absolute;
      bottom: -20px;
      width: 0;
      height: 0;
      border: 10px solid transparent;
      border-top: 10px solid #3d3747;
    }
    .title {
      text-align: center;
      font-size: 12px;
      color: #fff;
      line-height: 22px;
      margin-bottom: 10px;
      &:before,
      &:after {
        content: "";
        display: inline-block;
        vertical-align: middle;
        width: 1em;
        height: 1px;
        background-color: #fff;
        margin: -3px 3px 0;
      }
    }
    hr {
      display: block;
      border: 0;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      margin-bottom: 10px;
    }
    .radio-box {
      overflow: hidden;
      margin-bottom: 10px;
    }
    .radio-item {
      float: left;
      margin-right: 20px;
      position: relative;
      &:last-of-type {
        margin-right: 0;
      }
      input {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 2;
        opacity: 0;
        cursor: pointer;
      }
      label {
        font-size: 12px;
        color: #fff;
        line-height: 22px;
        padding-left: 20px;
        position: relative;
        &:before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          width: 14px;
          height: 14px;
          box-sizing: border-box;
          transform: translate(0, -50%);
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.5);
          padding: 2px;
        }
      }
      input:checked + label:before {
        background-clip: content-box;
        background-color: #f362f5;
      }
    }
    textarea {
      display: block;
      width: 100%;
      height: 92px;
      padding: 6px 10px;
      background-color: #312c3a;
      border-radius: 8px;
      border: 0;
      font-size: 12px;
      color: #fff;
      line-height: 1.5;
    }
    .btn {
      width: 66px;
      height: 26px;
      background-color: #a35afe;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      border-radius: 100px;
      font-size: 12px;
      color: #fff;
      display: block;
      margin: 10px auto 0;
    }
  }
  .face-popup {
    width: 448px;
    height: 170px;
    padding-top: 18px;
    &:before {
      left: 35px;
    }
    .face-item {
      cursor: pointer;
      float: left;
      width: 40px;
      height: 40px;
      background-color: #3a3843;
      &:nth-of-type(even) {
        background-color: #36343f;
      }
    }
    .emojiImg {
      display: block;
      width: 32px;
      height: 32px;
      margin: 4px auto;
    }
    .swiper-container {
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
    .btn-prev,
    .btn-next {
      cursor: pointer;
      position: absolute;
      top: 60px;
      z-index: 2;
      width: 20px;
      height: 30px;
      &:before {
        content: "";
        position: absolute;
        top: 50%;
        width: 10px;
        height: 10px;
        margin-top: -7px;
        border: 2px solid transparent;
      }
    }
    .btn-prev {
      left: 0;
      &:before {
        left: 50%;
        border-bottom-color: #fff;
        border-left-color: #fff;
        transform: rotate(45deg);
      }
    }
    .btn-next {
      right: 0;
      &:before {
        right: 50%;
        border-bottom-color: #fff;
        border-right-color: #fff;
        transform: rotate(-45deg);
      }
    }
  }
}
</style>
