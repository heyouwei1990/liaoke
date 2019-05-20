<!--礼物、包裹、活动-->
<template>
  <div class="gift-area">
    <div class="tab-wrap clearfix">
      <tab-hd :tabItem="sliderTab" @tabSuccess="tab"></tab-hd>
      <slot></slot>
    </div>
    <div class="gift-slider">
      <div id="gift-slider" class="swiper-container">
        <div class="swiper-wrapper">
          <div class="swiper-slide" v-if="slideList.length>0" v-for="(slideItem, index) in slideList" :key="index">
            <ul class="gift-list clearfix">
              <li v-if="tabItem===0" :class="['gift-item',{active:giftChecked.id==item.id}]" v-for="(item, index) in slideItem" :key="item.id" @click="checkGift(item)">
                <img class="icons" :src="item.icon" alt="gift">
                <div class="name" v-if="item.name">{{item.name}}</div>
                <div class="price">{{item.price | formatNo}}金币</div>
                <div class="mark-wrap">
                  <i class="mark-star" v-if="item.star>0">周星</i>
                  <i class="mark-lucky" v-if="item.luck>0">幸运</i>
                </div>
              </li>
              <!-- ,{active:giftChecked.id==mItem.item.id} -->
              <li v-if="tabItem===1 && slideItem.length>0 && mItem.item" :class="['gift-item','bagstyle',{active:bagIndex==idx}]" v-for="(mItem, idx) in slideItem" :key="mItem.id" @click="checkGift(mItem.item,idx)">
                <img class="icons" :src="mItem.item.filename" alt="gift">
                <div class="name" v-if="mItem.item.name">{{mItem.item.name}}</div>
                <div class="name" v-if="mItem.number">x{{mItem.number}}</div>
              </li>
              <!-- <li v-if="tabItem===1" :class="['gift-item',{active:giftChecked.id==item.id}]" v-for="(item, index) in slideItem" :key="item.id" @click="checkGift(item)">
                 <img class="icons" :src="mItem.item.filename" alt="gift">
                <div class="name" v-if="mItem.item.name">{{mItem.item.name}}</div>
                <div class="name" v-if="mItem.number">x{{mItem.number}}</div>
              </li> -->

              <li v-if="tabItem===2" class="gift-item" v-for="(item, index) in slideItem" :key="item.id" @click="open(item.url)">
                <img class="icons" :src="item.icon" alt="gift">
                <div class="name">{{item.title}}</div>
                <!--<div class="mark-wrap">
                  <i class="mark-star" v-if="item.star>0">周星</i>
                  <i class="mark-lucky" v-if="item.luck>0">幸运</i>
                </div>-->
              </li>
            </ul>
          </div>
          <div class="empty" v-if="tabItem===1 && slideList.length==0">
            <i class="icon-empty"></i>
            <span class="desc">包裹是空的~</span>
          </div>
        </div>
      </div>
      <div class="swiper-pagination"></div>
      <div class="btn-prev" :class="{disabled:disabledLeft}" @click="prev"></div>
      <div class="btn-next" :class="{disabled:disabledRight}" @click="next"></div>
    </div>
    <!--<div v-if="currentGift" :style="tipPos" class="gift-tip">
      <dl class="gift-dl">
        <dt><img class="icon" :src="currentGift.icon" alt=""></dt>
        <dd>
          <div class="gift-name">{{currentGift.name}}</div>
          <div class="price">{{currentGift.price}}金币</div>
          <div class="intro">{{currentGift.intro}}</div>
        </dd>
      </dl>
    </div>-->
  </div>

</template>

<script>
import Swiper from "swiper/dist/idangerous.swiper.js";
import TabHd from "@/components/tab";
import { pathJudge, sliceArray } from "@/util/tools";
import { mapState } from "vuex";

export default {
  components: {
    TabHd
  },
  data() {
    return {
      giftSlider: {},
      sliderTab: ["礼物", "包裹", "活动"],
      slideList: [],
      giftChecked: {},
      currentGift: null,
      tipPos: {},
      tabItem: 0,
      disabledLeft: false,
      disabledRight: false,
      bagIndex: 0 //bag 包裹index
    };
  },
  filters: {
    formatNo(value) {
      if (!value) {
        return 0;
      }
      var intPart = Number(value).toFixed(0); //获取整数部分
      var intPartFormat = intPart
        .toString()
        .replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"); //将整数部分逢三一断
      return intPartFormat;
    }
  },
  props: {
    roomId: {
      type: [String, Number],
      default: ""
    },
    // 是否更新包裹
    changeGift: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      hostUser: state => state.hostUser
    })
  },
  watch: {
    // 是否更新包裹
    changeGift() {
      console.log("是否更新包裹");
      this.getPack("emit");
    },
    giftChecked(v) {
      if (v && v.id) {
        v["tabItem"] = this.tabItem;
        this.$emit("chooseGift", v);
      }
    }
  },
  mounted() {
    this.dataInit();
  },
  methods: {
    dataInit() {
      this.giftSlider = new Swiper("#gift-slider", {
        pagination: ".gift-slider .swiper-pagination",
        paginationClickable: true,
        preventClicks: false, // 可以点击
        grabCursor: true,
        onInit: () => {
          this.addDisabled();
        },
        onSlideChangeEnd: () => {
          this.addDisabled();
        }
      });
      this.tab(this.tabItem);
    },
    prev() {
      this.giftSlider.swipePrev();
    },
    next() {
      this.giftSlider.swipeNext();
    },
    addDisabled() {
      if (this.giftSlider.slides.length != 0) {
        if (this.giftSlider.slides[0].isActive()) {
          this.disabledLeft = true;
        } else {
          this.disabledLeft = false;
        }
        if (
          this.giftSlider.slides[this.giftSlider.slides.length - 1].isActive()
        ) {
          this.disabledRight = true;
        } else {
          this.disabledRight = false;
        }
      } else {
        this.disabledLeft = true;
        this.disabledRight = true;
      }
    },
    tab(index) {
      switch (index) {
        case 0:
          this.getGift();
          break;
        case 1:
          this.getPack();
          break;
        case 2:
          this.getActivity();
          break;
      }
      this.tabItem = index;
      this.$emit("swipeTab", index);
    },
    //礼物列表
    getGift() {
      this.$get("/h5/gift/index", {
        type: 0
      }).then(r => {
        this.handle(r.data);
      });
    },
    //包裹列表
    getPack(type) {
      this.$get("/h5/gift/bag-item-list").then(r => {
        // this.handle(r.data);
        if (r.http_code == 200) {
          let list = r.data;
          for (let i = 0; i < list.length; i++) {
            list[i].item.filename = pathJudge(list[i].item.filename);
            list[i].item.openId = list[i].id;
          }

          if (type == "emit") {
            if (list.length == 0) {
              this.giftChecked = null;
            }
          } else {
            if (list.length > 0) {
              this.giftChecked = list[0].item;
              // console.log(this.giftChecked);
            }
            setTimeout(() => {
              this.giftSlider.reInit();
              this.giftSlider.swipeTo(0);
            }, 20);
          }
          if (Number(this.bagIndex) > list.length) {
            this.bagIndex = 0;
          }

          this.slideList = sliceArray(list, 8);
        }

        // console.log(this.slideList)
      });
    },
    //活动列表
    getActivity() {
      this.$get("/h5/live/act-list", {
        room_id: this.roomId
      }).then(r => {
        this.handle(r.data);
      });
    },

    handle(list) {
      for (let i = 0; i < list.length; i++) {
        list[i].icon = pathJudge(list[i].icon);
      }
      if (this.tabItem == 0 && list.length > 0) {
        this.giftChecked = list[0];
      }
      this.slideList = sliceArray(list, 8);
      setTimeout(() => {
        this.giftSlider.reInit();
        this.giftSlider.swipeTo(0);
      }, 20);
    },
    //接收选中的礼物
    checkGift(data, index) {
      console.log(data);
      data["tabItem"] = this.tabItem;
      this.giftChecked = data;

      this.bagIndex = index;
      this.$emit("setbtnText", data.pack);
    },
    //打开活动页面
    open(url) {
      if (this.hostUser) {
        this.$store.commit("set_activityUrl", url);
      } else {
        this.$store.commit("set_loginDialog", true);
      }
    }

    //礼物tip
    /*hover(data){
        this.currentGift=data;
        this.tipPos={};
        let top=0,left=0;
        //IE10以下不支持event.currentTarget
        if(event.currentTarget){
          left=event.currentTarget.getBoundingClientRect().left + event.currentTarget.clientWidth + 10-0;
          top=event.currentTarget.getBoundingClientRect().top + event.currentTarget.clientHeight - 66;
        }else{
          let w=document.getElementById('gift-slider').querySelector('.gift-item').clientWidth;
          let h=document.getElementById('gift-slider').querySelector('.gift-item').clientHeight;
          left=event.clientX-event.x+w+10-0;
          top=event.clientY-event.y+h-66;
        }
        this.tipPos["left"]=left+'px';
        this.tipPos["top"]=top+'px';
      },*/
  }
};
</script>

<style lang="scss">
.bagstyle.active {
  border: 1px solid #f162f5;
  background-color: #292432;
}
.gift-area {
  .gift-tip {
    position: fixed;
    z-index: 99;
    width: 154px;
    min-height: 66px;
    background-color: #292432;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    padding: 10px;
    &:before {
      content: "";
      position: absolute;
      left: -15px;
      top: 25px;
      z-index: 2;
      border: 8px solid transparent;
      border-right: 8px solid #292432;
    }
    .gift-dl {
      display: table;
      width: 100%;
      overflow: hidden;
      > dt {
        float: left;
        width: 24px;
        height: 24px;
      }
      > dd {
        float: left;
        width: 98px;
        margin-left: 10px;
        overflow: hidden;
      }
      .icon {
        display: block;
        width: 100%;
        height: 100%;
      }
      .gift-name {
        font-size: 12px;
        color: #fff;
        line-height: 22px;
      }
      .price {
        font-size: 12px;
        color: #f0d388;
        line-height: 20px;
      }
      .intro {
        opacity: 0.5;
        font-size: 12px;
        line-height: 1.5;
        color: #fff;
      }
    }
  }
  .tab-hd {
    float: left;
    overflow: hidden;
    > li {
      float: left;
      height: 40px;
      margin-right: 30px;
      font-size: 14px;
      line-height: 24px;
      color: rgba(255, 255, 255, 0.5);
      border-bottom: 1px solid transparent;
      &.on {
        color: #fff;
        border-bottom: 1px solid #ba77ff;
      }
    }
  }
  .gift-slider {
    position: relative;
    height: 190px;
    max-width: 448px;
    margin: 0 auto;
  }
  .gift-item {
    cursor: pointer;
    float: left;
    width: 84px;
    height: 82px;
    border-radius: 6px;
    margin-bottom: 10px;
    margin-right: 17px;
    overflow: hidden;
    text-align: center;
    position: relative;
    border: 1px solid transparent;
    &:nth-of-type(4n) {
      margin-right: 0;
    }
    &:hover {
      background-color: #292432;
    }
    &.active {
      border: 1px solid #f162f5;
      background-color: #292432;
    }
    .icons {
      display: block;
      width: 40px;
      height: 40px;
      /*margin: 10px auto 6px;*/
      margin: 6px auto 0px;
    }
    .name {
      font-size: 12px;
      color: #fff;
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .price {
      font-size: 10px;
      color: #f0d388;
      line-height: 1.4;
    }
    .mark-wrap {
      position: absolute;
      right: 5px;
      top: 5px;
      [class^="mark-"] {
        display: block;
        width: 32px;
        height: 16px;
        line-height: 16px;
        border-radius: 16px;
        margin-bottom: 2px;
        font-size: 12px;
        color: #fff;
        text-align: center;
      }
      .mark-star {
        color: #333;
        background-color: #f8e71c;
      }
      .mark-lucky {
        background-color: #A35AFE\9;
        background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      }
    }
  }
  .swiper-container {
    height: 174px;
    width: 388px;
    margin: 0 auto;
  }
  .swiper-pagination {
    position: absolute;
    left: 0;
    z-index: 3;
    bottom: 0px;
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
    top: 50%;
    z-index: 2;
    width: 20px;
    height: 30px;
    margin-top: -15px;
    &:before {
      content: "";
      position: absolute;
      top: 50%;
      width: 12px;
      height: 12px;
      margin-top: -7px;
      border: 2px solid transparent;
    }
  }
  .btn-prev {
    left: 0;
    &:before {
      left: 50%;
      margin-left: -3px;
      border-bottom-color: #fff;
      border-left-color: #fff;
      transform: rotate(45deg);
    }
  }
  .btn-next {
    right: 0;
    &:before {
      right: 50%;
      margin-right: -3px;
      border-bottom-color: #fff;
      border-right-color: #fff;
      transform: rotate(-45deg);
    }
  }
  .disabled {
    opacity: 0.3;
    cursor: default;
  }
  .empty {
    width: 388px;
    height: 184px;
    text-align: center;
    padding-top: 60px;
    .icon-empty {
      display: block;
      width: 40px;
      height: 40px;
      margin: 0px auto 10px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-empty.png")
        no-repeat center / contain;
    }
    .desc {
      font-size: 12px;
      color: #fff;
      line-height: 1.5;
      opacity: 0.5;
    }
  }
}
</style>
