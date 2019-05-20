<!--页头-->
<template>
  <div class="header">
    <div class="header-main clearfix">
      <div class="logo" @click="toIndex"></div>
      <div class="header-nav" v-if="hdNav.length>0">
        <router-link
          class="head-nav-item"
          v-for="(item, index) in hdNav"
          :key="index"
          exact
          :target="$route.name=='LiveRoom'&& item.name!='Index'?'_blank':''"
          active-class="active"
          :to="item.path"
          @click.native="flushCom(item)"
        >{{item.text}}</router-link>
        <!--<div
          v-for="(item, index) in hdNav"
          :key="index"
          class="head-nav-item"
          :class="{active:pageName==item.name}"
          @click="flushCom(item)"
        >
          {{item.text}}
        </div>-->
      </div>
      <div class="search-wrapper">
        <div class="input-box">
          <input :class="{tal:searchKey!=''}" type="text" maxlength="16" v-model="searchKey" placeholder="输入ID/昵称搜索" @click.stop @focus="getHistory" @keydown="keyIn" @keyup="keyUp" @keyup.enter="search">
          <i class="icon-search" v-if="searchKey!=''" @click.stop="search"></i>
        </div>
        <div class="search-history" v-if="showHistory">
          <div class="title">
            <h4>历史搜索</h4>
            <button class="btn-clear" @click.stop="clearHistory">清空</button>
          </div>
          <ul class="history-list scroller">
            <li v-if="historyList.length>0" v-for="(item,index) in historyList" :key="index" @click.stop="tapHistoryItm(item)">
              <i class="icon-history"></i>
              <div class="desc">{{item}}</div>
              <i class="icon-clear" @click.stop="deleteHistory(index)"></i>
            </li>
          </ul>
        </div>
        <div class="search-result" v-if="showResult">
          <ul class="result-list scroller" v-if="resultList.length>0" @scroll.stop="searchScroll">
            <li v-for="(item,index) in resultList" :key="index" >
              <router-link
                class="list-item"
                :to="{name:'Zone',params:{uid:item.uid}}"
                target="_blank"
              >
                <img class="avatar" :src="item.avatar" alt="">
                <span class="nickname">{{item.nickname}}</span>
                <img :src="item.live_level_img" alt="" class="level-mark">
              </router-link>
            </li>
          </ul>
          <div class="no-result" v-if="resultList.length==0 && !loading">
            没有搜索到您需要的内容~
          </div>
        </div>

      </div>
      <div class="icon-bradge">
        <i class="icon-time"></i>
        <span class="label">历史</span>
        <div class="visitHistory">
          <div class="no-data" v-if="visitHistory.length==0">
            您还没有浏览记录~
          </div>
          <ul class="list scroller" v-if="visitHistory.length>0">
            <li
              v-for="(item, index) in visitHistory"
              :key="index"
              class="list-item"
              @click="toRoom(item.id)"
            >
                <div class="avatar-wrap">
                  <img class="avatar" :src="item.avatar" alt="">
                </div>
                <span class="nickname">{{item.nickname}}</span>
                <span class="living" v-if="item.in_room!=0"><i class="icon"></i>直播中…</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="icon-bradge" @click="lookMgs">
        <i class="icon-message"></i>
        <span class="label">消息 <span :style="{opacity:hostUser?'1':'0','color':'#ff2c55'}">
          ({{$store.state.msgCon}})
          <!-- display:hostUser?'block':'none', -->
          </span></span>
      </div>
      <router-link tag="a" to="/center" target="_blank" v-if="hostUser!=null" class="user">
        <span class="username">{{hostUser.nickname}}</span>
        <img class="avatar" :src="hostUser.avatar" alt="avatar">
      </router-link>
      <div v-else class="user-entry">
        <a href="javascript:void(0)" @click="goLogin()">登录</a>
        <i>|</i>
        <a href="javascript:void(0)" @click="goLogin()">注册</a>
      </div>
      <div v-if="hostUser!=null" class="btn-exit" @click="exit">退出</div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import {
  getStore,
  setStore,
  removeStore,
  pathJudge,
  levelMark,
  defaultAvatar,
  scrollDirection
} from "@/util/tools";

export default {
  data() {
    return {
      loginState: false,
      searchKey: "",
      showHistory: false,
      showResult: false,
      resultList: [], //搜索结果列表
      pageIndex:1,//搜索结果第一页
      loading:false,
      historyList: [], //历史搜索记录
      visitHistory: [], //历史访问记录
      hdNav: [
        {
          text: "首页",
          path: "/site1",
          name:'Index'
        },
        {
          text: "排行榜",
          path: "/ranking",
          name:'Ranking'
        },
        {
          text: "充值",
          path: "/recharge",
          name:'Recharge'
        },
        {
          text: "商城",
          path: "/mall",
          name:'Mall'
        }
      ],
      pageName:'',
    };
  },
  computed: {
    ...mapState({
      hostUser: state => state.hostUser
    })
  },
  mounted() {
    document.addEventListener(
      "click",
      () => {
        this.showResult = false;
        this.showHistory = false;
      },
      false
    );
    this.getVisitHistory();
    this.pageName=this.$route.name;
  },
  methods: {
    //logo点击
    toIndex() {
      if (this.$route.name == "Index") {
        this.$router.go(0);
      } else {
        this.$router.push({name:'Index'});
      }
    },

    // 当前路由刷新
    flushCom(data) {
      //如果是当前页面，则刷新本页
      if(this.pageName==data.name){
        this.$router.go();
      }
      this.pageName=data.name;
      // 房间里点击首页以外的导航，打开新页面
      /*if(this.$route.name=='LiveRoom' && data.name!='Index'){
        let routerData = this.$router.resolve({
          name: data.name,
        });
        window.open(routerData.href, "_blank");
      }else{
        this.$router.push({name:data.name});
      }*/
    },

    //获取历史搜索记录
    getHistory() {
      if (
        getStore("searchHistory") == null ||
        getStore("searchHistory").trim() == ""
      ) {
        this.historyList = [];
      } else {
        this.historyList = getStore("searchHistory").split("^^");
      }
      if (this.searchKey == "" && this.historyList.length > 0) {
        this.showHistory = true;
      }
    },

    // 删除历史记录
    deleteHistory(idx) {
      this.historyList.splice(idx, 1);
      let history = this.historyList.join("^^");
      setStore("searchHistory", history); //存储搜索记录
      if (this.historyList.length == 0) {
        this.$store.commit("setToast", "已清空搜索记录");
        this.showHistory = false;
      }
    },

    // 清空历史记录
    clearHistory() {
      this.historyList = [];
      removeStore("searchHistory");
      this.$store.commit("setToast", "已清空搜索记录");
      this.showHistory = false;
    },

    //点击历史记录添加到搜索框
    tapHistoryItm(data) {
      this.searchKey = data;
      this.showHistory = false;
      this.search();
    },

    //搜索框清空时关闭搜索结果
    keyUp() {
      if (this.searchKey.trim() == "") {
        this.showResult = false;
      }
      if (this.searchKey.trim() == "" && this.historyList.length > 0) {
        this.showHistory = true;
      } else {
        this.showHistory = false;
      }
    },
    keyIn() {
      if (this.searchKey.trim() == "" && this.historyList.length > 0) {
        this.showHistory = true;
      } else {
        this.showHistory = false;
      }
      // this.showHistory=this.searchKey==''?true:false;
    },

    //搜索
    search() {
      if (this.searchKey.trim() == "") {
        return;
      }
      // console.log(getStore('searchHistory'))
      //获取历史记录
      this.historyList = getStore("searchHistory") == null ? [] : getStore("searchHistory").split("^^");
      // 只存10条
      if (this.historyList.length > 10) {
        this.historyList.pop();
      }
      this.historyList.unshift(this.searchKey.trim());
      this.historyList = this.historyList.filter((ele, i, arr) => {
        return arr.indexOf(ele) === i;
      });
      //把历史记录拼接成字符串存储
      let history = this.historyList.join("^^");
      setStore("searchHistory", history); //存储搜索记录
      this.resultList=[];
      this.pageIndex=1;
      this.getSearchResult();
    },

    //获取搜索结果列表
    getSearchResult(){
      this.loading=true;
      this.$get("/h5/user/find", {
        search: this.searchKey,
        page:this.pageIndex
      }).then(r => {
        this.loading=false;
        if (r.http_code == 200) {
          let list = r.data;
          for (let i = 0; i < list.length; i++) {
            list[i] = levelMark(list[i]);
            list[i].avatar = list[i].avatar != "" ? pathJudge(list[i].avatar) : defaultAvatar(list[i].avatar);
          }
          // this.resultList = list;
          if (this.resultList.length!=0) {
            this.resultList = this.resultList.concat(list);
          } else {
            this.resultList = list;
          }
          if (list.length!=0) {
            this.pageIndex++;
          }
        }
        this.showResult = true;
      });
    },

    //搜索结果滚动添加
    searchScroll(e) {
      let el = e.srcElement ? e.srcElement : e.target;
      let direct = scrollDirection(el); //获取滚动方向
      if (
        el.scrollHeight - el.scrollTop - 10 < el.offsetHeight &&
        !this.loading &&
        direct == "down"
      ) {
        this.getSearchResult();
      }
    },
    // 历史访问记录
    getVisitHistory() {
      this.$get("/h5/live/history").then(r => {
        let list = r.data;
        for (let i = 0; i < list.length; i++) {
          list[i] = levelMark(list[i]);
          list[i].avatar =
            list[i].avatar != ""
              ? pathJudge(list[i].avatar)
              : defaultAvatar(list[i].avatar);
        }
        this.visitHistory = list;
      });
    },

    //弹出登录框
    goLogin() {
      this.$store.commit("set_loginDialog", true);
    },
    //退出登录
    exit() {
      this.$get("/h5/public/logout").then(r => {
        if (r.http_code == 200) {
          this.$router.push({name:'Index'});
        }
      });
      this.$store.commit("setUser", "null");
    },

    //查看消息
    lookMgs() {
      if(!this.hostUser){
         this.$store.commit("set_loginDialog", true);
         return;
      }
      let url = window.location.href;
      if (url.indexOf("liveRoom") === -1) {
        this.$router.push("/center/message");
      } else {
        this.$store.commit("set_chatState", true);
      }
    },

    //去直播间
    toRoom(id){
      let routerData=this.$router.resolve({name:'LiveRoom',params:{uid:id}});
      window.open(routerData.href,'_target');
    },
  }
};
</script>

<style lang="scss">
.header {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 9;
  width: 100%;
  min-width: 1340px;
  right: 0;
  margin: auto;
  background-color: #292432;
  height: 60px;
  box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.4);
  .header-main {
    width: 1340px;
    height: 100%;
    margin: 0 auto;
  }
  .btn-exit {
    float: right;
    color: #999;
    font-size: 14px;
    line-height: 60px;
    margin-right: 10px;
    cursor: pointer;
  }
  .logo {
    cursor: pointer;
    float: left;
    width: 104px;
    height: 40px;
    margin-top: 10px;
    background: url(https://lib.liaoke.tv/lib/pc/static/img/header/logo.png)
      no-repeat center;
    background-size: 104px 40px;
  }
  .header-nav {
    float: left;
    overflow: hidden;
    margin-left: 50px;
    .head-nav-item {
      float: left;
      cursor: pointer;
      margin: 0 26px;
      height: 60px;
      text-align: center;
      position: relative;
      color: rgba(255, 255, 255, 0.5);
      font-size: 16px;
      line-height: 60px;
      &:after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 2px;
      }
      &.active {
        color: #fff;
      }
      &.active:after {
        background-color: #F362F5\9;
        background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      }
    }
  }
  .search-wrapper {
    float: left;
    width: 300px;
    height: 28px;
    margin-top: 16px;
    margin-left: 40px;
    margin-right: 60px;
    position: relative;
    .input-box {
      position: relative;
    }
    input {
      width: 100%;
      height: 28px;
      border-radius: 28px;
      background-color: #3d3747;
      font-size: 12px;
      color: #fff;
      padding: 2px 20px;
      line-height: 30px;
      border: 0;
      text-align: center;
      &:focus {
        text-align: left;
        padding-right: 50px;
      }
      &.tal {
        text-align: left;
      }
    }
    .icon-search {
      cursor: pointer;
      position: absolute;
      right: 10px;
      top: 50%;
      z-index: 2;
      width: 20px;
      height: 20px;
      margin-top: -10px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/header/icon-search.png")
        no-repeat center / contain;
    }
  }
  .search-history {
    width: 270px;
    height: 326px;
    overflow: hidden;
    position: absolute;
    left: 15px;
    top: 30px;
    z-index: 99;
    background: #3d3747;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding-top: 10px;
    .title {
      height: 40px;
      line-height: 40px;
      overflow: hidden;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-left: 20px;
      margin-right: 20px;
      h4 {
        float: left;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.8);
      }
      .btn-clear {
        background-color: transparent;
        font-size: 12px;
        line-height: inherit;
        color: rgba(255, 255, 255, 0.8);
        float: right;
      }
    }
  }
  .history-list {
    height: 276px;
    overflow-y: auto;
    > li {
      overflow: hidden;
      padding: 7px 20px;
      color: rgba(255, 255, 255, 0.5);
      line-height: 24px;
      font-size: 12px;
      .desc {
        float: left;
        max-width: 162px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .icon-history {
      float: left;
      width: 20px;
      height: 20px;
      margin-top: 2px;
      margin-right: 10px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/header/icon-history.png")
        no-repeat center / contain;
    }
    .icon-clear {
      float: right;
      width: 20px;
      height: 20px;
      margin-top: 2px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/header/icon-clear.png")
        no-repeat center / contain;
    }
  }
  .no-result {
    padding: 0 20px;
    line-height: 70px;
    font-size: 14px;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
  }
  .search-result {
    width: 270px;
    position: absolute;
    left: 15px;
    top: 30px;
    z-index: 99;
    background: #3d3747;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    padding-top: 15px;
    padding-bottom: 15px;
    .result-list {
      height: 300px;
      overflow-y: auto;
      .list-item{
        display: block;
        height: 60px;
        padding: 10px 20px;
        white-space: nowrap;
        &:hover {
          background-color: #292432;
        }
      }
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 15px;
        vertical-align: middle;
      }
      .nickname {
        display: inline-block;
        vertical-align: middle;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 7em;
        font-size: 16px;
        color: rgba(255, 255, 255, 0.5);
        line-height: 24px;
      }
      .level-mark {
        margin-left: 15px;
        width: 32px;
        height: 14px;
        vertical-align: middle;
      }
    }
  }
  .icon-bradge {
    position: relative;
    float: left;
    margin-left: 40px;
    line-height: 60px;
    opacity: 0.5;
    cursor: pointer;
    &:hover {
      opacity: 1;
      .visitHistory {
        display: block;
      }
    }
    i {
      display: inline-block;
      vertical-align: middle;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
    .icon-download {
      background: url(https://lib.liaoke.tv/lib/pc/static/img/header/icon-download.png)
        no-repeat center/cover;
    }
    .icon-time {
      background: url(https://lib.liaoke.tv/lib/pc/static/img/header/icon-clock.png)
        no-repeat center/cover;
    }
    .icon-message {
      background: url(https://lib.liaoke.tv/lib/pc/static/img/header/icon-msg.png)
        no-repeat center/cover;
    }
    .label {
      vertical-align: middle;
      font-size: 14px;
      color: #fff;
    }
  }
  .user {
    float: right;
    margin-top: 10px;
    .username {
      display: inline-block;
      height: 40px;
      vertical-align: middle;
      color: #fff;
      font-size: 14px;
      line-height: 40px;
      max-width: 7em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .avatar {
      display: inline-block;
      width: 32px;
      height: 32px;
      vertical-align: middle;
      border-radius: 50%;
      margin-left: 12px;
    }
  }
  .user-entry {
    float: right;
    padding: 10px 0;
    line-height: 40px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    i {
      padding-left: 4px;
      padding-right: 4px;
    }
    a:hover {
      color: rgba(255, 255, 255, 1);
    }
  }
  .visitHistory {
    display: none;
    width: 270px;
    min-height: 100px;
    padding: 14px 0;
    background: #3d3747;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    position: absolute;
    left: 50%;
    top: 90%;
    z-index: 99;
    transform: translate(-50%);
    &:before {
      content: "";
      position: absolute;
      left: 50%;
      top: -15px;
      z-index: 2;
      width: 0;
      height: 0;
      border: 10px solid transparent;
      border-bottom: 6px solid #3d3747;
    }
    .no-data {
      padding: 40px 20px;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      line-height: 24px;
      text-align: center;
    }
    .list {
      max-height: 320px;
      overflow-y: auto;
      overflow-x: hidden;
      .list-item {
        width: 120%;
        display: block;
        overflow: hidden;
        padding: 10px 20px;
        &:hover {
          background-color: #292432;
        }
      }
      .avatar-wrap {
        float: left;
        width: 40px;
        height: 40px;
        margin-right: 10px;
      }
      .avatar {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
      .nickname {
        float: left;
        max-width: 7em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        color: #fff;
        line-height: 40px;
        margin-right: 10px;
      }
      .living {
        float: left;
        font-size: 12px;
        color: #f362f5;
        line-height: 40px;
        .icon {
          display: inline-block;
          vertical-align: middle;
          margin-top: -3px;
          position: relative;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          margin-right: 8px;
          background-color: #F362F5\9;
          background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
          &:before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: #F362F5\9;
            background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
            opacity: 0.5;
            border-radius: 50%;
            transform: scale(2);
          }
        }
      }
    }
  }
}
</style>
