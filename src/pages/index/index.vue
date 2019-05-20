<!--首页主体-->
<template>
  <div class="content-index clearfix">
    <section class="section1">
      <div class="main">
        <div class="first-video">
          <img v-if="living" @click="toRoom(living.id)" :src="living.room_cover" alt="" class="live-face">
          <button v-if="living" class="btn-in" @click="toRoom(living.id)">进入直播间</button>
          <div class="bottom">
            <div class="volume-wrap">
              <i class="icon-volume"></i>
              <div class="range">
                <div class="range-bar"></div>
                <div class="range-dot"></div>
              </div>
            </div>
            <div class="visitor" v-if="living">{{living.online_count}}人在看</div>
          </div>
          <div class="qr-code" v-if="showQrcode">
            <i class="icon-close" @click="showQrcode=false"></i>
            <!--<img class="qr-code-img" src="https://lib.liaoke.tv/lib/pc/static/img/qrcode.jpg" alt="">-->
            <div id="qrcode_download"></div>
            <span>扫一扫下载APP</span>
          </div>
        </div>
        <ul class="list" v-if="recommendList.length>0">
          <li v-if="index>0" v-for="(item, index) in recommendList" :key="index">
            <router-link :to="{name:'LiveRoom',params:{uid:item.id}}" target="_blank">
              <anchor :info="item"></anchor>
            </router-link>
          </li>
        </ul>
        <div class="login-wrap">
          <div v-if="!hostUser">
            <button class="btn-login" @click="showLoginDialog">快速登录</button>
            <div class="line-cross">
              <span>其他登录方式</span>
            </div>
            <ul class="other-way">
              <li @click="qqLogin">
                <i class="icon-qq"></i>
              </li>
              <li @click="wxLogin">
                <i class="icon-wx"></i>
              </li>
              <li @click="showLoginDialog">
                <i class="icon-phone"></i>
              </li>
            </ul>
          </div>
          <div class="host-info" v-if="hostUser">
            <router-link class="host-user" :to="{name:'Zone',params:{uid:hostUser.uid}}">
              <img class="avatar" :src="hostUser.avatar" alt="">
              <div class="nickname">
                <span>{{hostUser.nickname}}</span>
                <img class="level-mark" :src="hostUser.live_level_img" alt="">
                <img class="level-mark" :src="hostUser.wealth_level_img" alt="">
              </div>
            </router-link>
            <div class="progress">
              <span class="rate-num">{{hostUser.exp}}/{{hostUser.wealth_next_level_cost_exp}}</span>
              <div class="range-bar">
                <div class="rate" :style="{width:(hostUser.exp - hostUser.wealth_level_cost_exp)/hostUser.wealth_next_level_need_exp*100+'%'}"></div>
              </div>
              <p class="tip">还差{{hostUser.wealth_next_level_need_exp}}金币就可以升级了</p>
            </div>
            <div class="bottom">
              <div class="left">金币：
                <i class="coins">{{toLocal(hostUser.coins)||''}}</i>
              </div>
              <router-link to="/recharge" target="_blank" class="btn-recharge">充值</router-link>
            </div>
          </div>
          <div class="slider">
            <slider :list="imgList" :hasBtn="false">

            </slider>
          </div>
        </div>
      </div>
    </section>
    <section class="section2 clearfix">
      <div class="main clearfix">
        <div class="tab-hd-wrap">
          <h3 class="sec-hd">
            <i class="icon-tv"></i>热门直播</h3>
          <tab-hd :tabItem="hotTabHd" @tabSuccess="hotTab"></tab-hd>
        </div>
        <div class="live-hot-wrap">
          <ul class="live-hot clearfix" v-if="hotAnchorList.length>0" ref="hotList">
            <li v-for="(item, index) in hotAnchorList" :key="index">
              <router-link :to="{name:'LiveRoom',params:{uid:item.id}}" target="_blank">
                <anchor-item :info="item"></anchor-item>
              </router-link>
            </li>
          </ul>
          <div class="loading-wave" v-if="hotLoading">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="no-data" v-if="hotEmpty">暂无数据</div>
          <!--<pagination v-if="pageCount>1" :page-count="pageCount" :click-handler="pageChange" :prev-text="'<'" :next-text="'>'"></pagination>-->
        </div>

        <aside class="aside">
          <aside-rank :title="'富豪排行榜'" :userStatus="2" :list="magnateList" :loading="wealthLoading" :empty="wealthEmpty" @changeRank="changeMagnateList" class="magnate-list"></aside-rank>
          <hr>
          <aside-rank :title="'主播排行榜'" :userStatus="1" :list="anchorList" :loading="liveLoading" :empty="liveEmpty" @changeRank="changeAnchorList" class="anchor-list"></aside-rank>
        </aside>
      </div>
    </section>
  </div>
</template>

<script>
import Anchor from "./anchor";
import AnchorItem from "@/components/anchorItem";
import AsideRank from "./asideRank";
import TabHd from "@/components/tab";
import Slider from "./swiper";
import version from "@/util/version";
import Pagination from "@/components/pagination";
import { mapState } from "vuex";
import {
  pathJudge,
  defaultAvatar,
  levelMark,
  scrollDirection
} from "@/util/tools";
export default {
  components: {
    AsideRank,
    Anchor,
    AnchorItem,
    TabHd,
    Slider,
    Pagination
  },
  data() {
    return {
      //轮播图
      imgList: [],
      living: {},
      hotTabHd: [
        {
          text: "热门"
        },
        {
          text: "新人"
        },
        {
          text: "型男"
        },
        {
          text: "推荐"
        }
      ],
      recommendList: [], //推荐主播
      hotAnchorList: [], //热门主播
      hotActive: 0, //0 热门，1 新人， 2 型男， 3 推荐
      pageIndex: 1, //当前页
      pageCount: 1, //总页数
      pageNum: 50, //每页50条
      loadFlag: false, //瀑布流加载开关
      magnateList: [], //富豪榜
      anchorList: [], //主播榜
      showQrcode: true, //显示二维码
      wealthLoading: false, //富豪榜加载
      wealthEmpty: false, //富豪榜为空
      liveLoading: false, //主播榜加载
      liveEmpty: false, //主播榜为空
      hotLoading: false, //主播榜加载
      hotEmpty: false //主播榜为空
    };
  },
  computed: {
    ...mapState({
      hostUser: state => state.hostUser
    })
  },
  mounted() {
    this.dataInit();
    this.qrcodeInit();
    document.addEventListener("scroll", this.docScroll);
  },
  destroyed() {
    document.removeEventListener("scroll", this.docScroll);
  },
  methods: {
    toLocal(nut) {
      return Number(nut).toLocaleString();
    },

    //二维码生成
    qrcodeInit() {
      var qrcode = new QRCode(document.getElementById("qrcode_download"), {
        // text: "i am the first qrcode",
        width: 80, //生成的二维码的宽度
        height: 80, //生成的二维码的高度
        colorDark: "#000000", // 生成的二维码的深色部分
        colorLight: "#ffffff", //生成二维码的浅色部分
        correctLevel: QRCode.CorrectLevel.H
      });
      qrcode.makeCode(
        "http://a.app.qq.com/o/simple.jsp?pkgname=com.qingshu520.chat"
      );
    },
    //初始化页面
    dataInit() {
      this.getHotAnchorList("");
      this.changeMagnateList(0);
      this.changeAnchorList(0);
      this.getRecommendList();
      this.getAd();
    },

    //显示登录弹框
    showLoginDialog() {
      this.$store.commit("set_loginDialog", true);
    },

    //轮播广告
    getAd(){
      this.$get('/h5/system/banners').then(r=>{
        if(r.http_code==200){
          let list=r.data;
          for(let i=0;i<list.length;i++){
            list[i].content=pathJudge(list[i].content);
          }
          this.imgList=list;
        }
      })
    },

    //去直播间
    toRoom(id) {
      let routerData = this.$router.resolve({
        name: "LiveRoom",
        params: { uid: id }
      });
      window.open(routerData.href, "_target");
    },
    //获取推荐主播
    getRecommendList() {
      this.$get("/h5/live/recommend", {}).then(r => {
        let list = r.data;
        for (let i = 0; i < list.length; i++) {
          list[i].avatar =
            list[i].avatar != ""
              ? pathJudge(list[i].avatar)
              : defaultAvatar(list[i].gender);
          list[i].room_cover = pathJudge(list[i].room_cover);
          list[i] = levelMark(list[i]);
        }
        // this.living = r.data[0];
        this.recommendList = list.slice(0, 7);
        this.living = this.recommendList[0];
        // console.log(this.recommendList)
      });
    },

    //获取热门直播
    getHotAnchorList(key) {
      // this.hotAnchorList = [];
      // console.log(key);
      this.hotLoading = true;
      this.hotEmpty = false;
      this.$get("/h5/live/index", {
        type: key,
        page: this.pageIndex
      }).then(r => {
        this.hotLoading = false;
        if (r.http_code == 200) {
          let list = r.data;
          for (let i = 0; i < list.length; i++) {
            // 热门推荐去重
            for (let index = 0; index < this.recommendList.length; index++) {
              if (list[i].uid == this.recommendList[index].uid) {
                // console.log('热门推荐去重>id>>:::'+list[i].uid)
                list.splice(i, 1);
              }
            }
             // 获取数据去重
          for (let index_ = 0; index_ < this.hotAnchorList.length; index_++) {
               if (list[i].uid == this.hotAnchorList[index_].uid) {
                  // console.log('获取数据去重>id>>:::'+list[i].uid)
                list.splice(i, 1);
              }
          }
            list[i].avatar =
              list[i].avatar != ""
                ? pathJudge(list[i].avatar)
                : defaultAvatar(list[i].gender);
            list[i].room_cover = pathJudge(list[i].room_cover);
            //list[i].avatar=pathJudge(list[i].avatar);
          }

          if (this.pageIndex > 1) {
            // this.hotAnchorList = this.hotAnchorList.concat(...list);
            this.hotAnchorList = this.hotAnchorList.concat(list);
          } else {
            this.hotAnchorList = list;
          }
          if (this.hotAnchorList.length == 0) {
            this.hotEmpty = true;
          }
          if (list.length > 0) {
            this.pageIndex++;
          }
        }
      });
    },

    // 滚动到底部加载
    docScroll(e) {
      let el = e.target ? e.target : e.srcElement;
      let diret = scrollDirection(el);
      let sy = window.scrollY;
      let w_h = window.innerHeight;
      let d_h = document.documentElement.offsetHeight;
      if (sy > d_h - w_h - 600 && !this.hotLoading && diret == "down") {
        this.getHotAnchorList(this.hotActive);
      }
    },

    //热门直播tab切换
    hotTab(pkid) {
      this.pageIndex = 1;
      this.hotAnchorList = [];
      let tabKey = "";
      switch (pkid) {
        case 0:
          tabKey = ""; //热门
          break;
        case 1:
          tabKey = "new"; //最新
          break;
        case 2:
          tabKey = "boy"; //型男
          break;
        case 3:
          tabKey = "collect"; //推荐
          break;
      }
      this.getHotAnchorList(tabKey);
      this.hotActive = tabKey;
    },

    // 获取排行列表
    getRankList(key, target) {
      this.$get(`/h5/rank/${key}`, {
        type: target,
        format: "json"
      }).then(r => {
        let list = r.data.list;
        for (let i = 0; i < list.length; i++) {
          list[i].avatar =
            list[i].avatar != ""
              ? pathJudge(list[i].avatar)
              : defaultAvatar(list[i].gender);
          list[i] = levelMark(list[i]);
        }
        if (target == "user" || target == "exp") {
          //富豪排行
          this.magnateList = list.slice(0, 10);
          this.wealthLoading = false;
          if (this.magnateList.length == 0) {
            this.wealthEmpty = true;
          } else {
            this.wealthEmpty = false;
          }
        } else {
          //主播排行
          this.anchorList = list.slice(0, 10);
          this.liveLoading = false;
          if (this.anchorList.length == 0) {
            this.liveEmpty = true;
          } else {
            this.liveEmpty = false;
          }
        }
      });
    },

    // 富豪榜切换
    changeMagnateList(index) {
      this.magnateList = [];
      this.wealthLoading = true;
      switch (index) {
        case 0:
          this.getRankList("cost", "exp");
          break;
        case 1:
          this.getRankList("day", "user");
          break;
        case 2:
          this.getRankList("month", "user");
          break;
      }
    },

    // 主播排行切换
    changeAnchorList(index) {
      this.anchorList = [];
      this.liveLoading = true;
      switch (index) {
        case 0:
          this.getRankList("cost", "income");
          break;
        case 1:
          this.getRankList("day", "girl");
          break;
        case 2:
          this.getRankList("month", "girl");
          break;
      }
    },

    //微信登录
    wxLogin() {
      let url = window.location.href;
      var wxUrl = `${version.apiHost}/h5/public/wx-qr?referer=${url}`;
      window.location.href = wxUrl;
    },

    //qq登录
    qqLogin() {
      let url = window.location.href;
      var qqUrl = `${version.apiHost}/user/login-qq?referer=${url}`;
      window.location.href = qqUrl;
    }
  }
};
</script>

<style lang="scss">
.content-index {
  padding-top: 20px;
  .main {
    width: 1340px;
    margin-right: auto;
    margin-left: auto;
  }
  .section1 {
    // height: 760px;
    height: 660px;
    .main {
      height: 440px;
      overflow: hidden;
    }
    .first-video {
      position: relative;
      width: 320px;
      height: inherit;
      float: left;
      overflow: hidden;
      .live-face {
        display: block;
        height: 100%;
        width: 100%;
      }
      .btn-in {
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 9;
        margin-left: -75px;
        margin-top: -22px;
        width: 130px;
        height: 44px;
        background-color: #F362F5\9;
        background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
        border-radius: 44px;
        line-height: 44px;
        font-size: 16px;
        color: #fff;
        text-align: center;
        border: 0;
      }
      .qr-code {
        position: absolute;
        left: 10px;
        bottom: 50px;
        z-index: 8;
        width: 112px;
        padding: 10px 10px 4px;
        background-color: #F362F5\9;
        background-image: linear-gradient(135deg, #f362f5 0%, #a35afe 100%);
        #qrcode_download {
          display: block;
          width: 90px;
          height: 90px;
          padding: 5px;
          background-color: #fff;
        }
        span {
          font-size: 12px;
          color: #fff;
          line-height: 24px;
          margin-top: 3px;
        }
        .icon-close {
          cursor: pointer;
          width: 18px;
          height: 18px;
          position: absolute;
          right: -9px;
          top: -9px;
          z-index: 2;
          background: url("https://lib.liaoke.tv/lib/pc/static/img/index/icon-close.png")
            no-repeat center;
          background-size: cover;
        }
      }
      .bottom {
        position: absolute;
        left: 0;
        bottom: 0;
        z-index: 2;
        width: 100%;
        overflow: hidden;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.5);
      }
      .volume-wrap {
        float: left;
        width: 208px;
        height: inherit;
      }
      .visitor {
        float: right;
        width: 112px;
        height: inherit;
        line-height: 40px;
        font-size: 16px;
        color: #fff;
        text-align: center;
      }
    }
    .list {
      float: left;
      overflow: hidden;
      width: 684px;
      height: inherit;
      li {
        float: left;
        width: 212px;
        height: 212px;
        overflow: hidden;
        position: relative;
        margin-left: 16px;
        margin-bottom: 16px;
        cursor: pointer;
      }
    }
    .login-wrap {
      position: relative;
      width: 320px;
      float: right;
      height: inherit;
      background-color: #312c3a;
      overflow: hidden;
      text-align: center;
      .btn-login {
        width: 260px;
        height: 44px;
        border: 0;
        font-size: 16px;
        color: #fff;
        background-color: #F362F5\9;
        background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
        border-radius: 100px;
        margin-top: 44px;
      }
      .line-cross {
        position: relative;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.5);
        line-height: 24px;
        margin-top: 12px;
        &:before,
        &:after {
          content: "";
          display: inline-block;
          vertical-align: middle;
          width: 24px;
          height: 1px;
          background-color: rgba(255, 255, 255, 0.5);
          margin: -2px 4px 0;
        }
      }
      .other-way {
        white-space: nowrap;
        margin-top: 10px;
        cursor: pointer;
        > li {
          display: inline-block;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #fff;
          margin-right: 40px;
          &:last-child {
            margin-right: 0;
          }
          [class^="icon-"] {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
          .icon-qq {
            background: url("https://lib.liaoke.tv/lib/pc/static/img/login/icon-qq.png")
              no-repeat center / cover;
          }
          .icon-wx {
            background: url("https://lib.liaoke.tv/lib/pc/static/img/login/icon-wx.png")
              no-repeat center / cover;
          }
          .icon-phone {
            background: url("https://lib.liaoke.tv/lib/pc/static/img/login/icon-phone.png")
              no-repeat center / cover;
          }
        }
      }
      .slider {
        position: absolute;
        left: 8px;
        bottom: 8px;
        z-index: 2;
        width: 304px;
        height: 212px;
        .swiper-container {
          width: 100%;
          height: 192px;
        }
        img {
          display: block;
          width: 100%;
          height: 100%;
        }
      }
    }
    .host-info {
      padding-left: 20px;
      padding-right: 20px;
      .host-user {
        display: inline-block;
      }
      .avatar {
        display: block;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        margin: 20px auto 0;
      }
      .nickname {
        text-align: center;
        font-size: 14px;
        color: #fff;
        line-height: 24px;
        margin-top: 6px;
        span {
          display: inline-block;
          vertical-align: middle;
          max-width: 7em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .level-mark {
        margin-left: 4px;
      }
      .progress {
        position: relative;
        margin-top: 10px;
        .rate-num {
          width: 100%;
          font-size: 12px;
          color: #fff;
          line-height: 1;
          position: absolute;
          left: 0;
          top: 0;
          z-index: 2;
          text-align: center;
        }
        .range-bar {
          background-color: rgba(255, 255, 255, 0.2);
          height: 12px;
          border-radius: 12px;
          overflow: hidden;
        }
        .rate {
          width: 0;
          height: 12px;
          border-radius: 12px;
          transition: all 0.4s linear 0.2s;
          background-color: #F362F5\9;
          background-image: linear-gradient(-90deg, #f362f5 0%, #a35afe 100%);
        }
        .tip {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.3);
          line-height: 2;
          text-align: left;
          margin-top: 4px;
        }
      }
      .bottom {
        margin-top: 12px;
        overflow: hidden;
        .left {
          font-size: 14px;
          color: #fff;
          line-height: 24px;
          .coins {
            color: #f0d388;
          }
        }
        .btn-recharge {
          float: right;
          width: 48px;
          height: 24px;
          line-height: 24px;
          font-size: 12px;
          color: #fff;
          border-radius: 24px;
          background-color: #F362F5\9;
          background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
        }
      }
    }
  }
  .section2 {
    background-color: #f7f7f7;
    .main {
      position: relative;
      top: -134px;
    }
    .tab-hd-wrap {
      float: left;
      width: 100%;
      overflow: hidden;
      margin-bottom: 32px;
    }
    .sec-hd {
      font-size: 26px;
      color: #fff;
      float: left;
      line-height: 32px;
    }
    .icon-tv {
      display: inline-block;
      vertical-align: middle;
      margin-top: -3px;
      margin-right: 10px;
      width: 26px;
      height: 26px;
      background: url(https://lib.liaoke.tv/lib/pc/static/img/index/icon-tv.png)
        no-repeat center/cover;
    }
    .tab-hd {
      float: left;
      overflow: hidden;
      margin-left: 40px;
      > li {
        float: left;
        width: 66px;
        height: 32px;
        color: #fff;
        font-size: 14px;
        text-align: center;
        line-height: 32px;
        border-radius: 32px;
        margin-right: 18px;
        background-color: #393345;
        &.on {
          background-color: #F362F5\9;
          background-image: linear-gradient(135deg, #f362f5 0%, #a35afe 100%);
        }
      }
    }
    .live-hot-wrap {
      width: 1000px;
      float: left;
    }
    .live-hot {
      > li {
        cursor: pointer;
        float: left;
        width: 236px;
        margin-right: 18px;
        margin-bottom: 18px;
        &:nth-of-type(4n) {
          margin-right: 0;
        }
      }
    }
    .aside {
      float: right;
      width: 320px;
      padding: 14px 20px;
      background-color: #fff;
      hr {
        border-top: 1px solid #eee;
        margin-top: 10px;
        margin-bottom: 30px;
      }
      .hd-focused {
        font-size: 18px;
        color: #fff;
        line-height: 30px;
        margin-bottom: 12px;
      }
      .anchor-list {
        .bg-cyan {
          display: none;
        }
      }
      .magnate-list {
        .bg-purple {
          display: none;
        }
      }
    }
  }
  .no-data {
    font-size: 14px;
    color: #fff;
    line-height: 24px;
    text-align: center;
    padding: 20px;
  }
}
</style>
