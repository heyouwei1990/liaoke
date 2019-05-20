<template>
  <div class="ward-component">
    <tab-hd :tabItem="tabItems" @tabSuccess="tabChange"></tab-hd>
    <ul class="msg-list clearfix">
      <li v-if="wardList.length>0" v-for="(item, index) in wardList" :key="index">
        <dl class="item-dl" @click="goZone(item.uid)">
          <dt class="avatar-wrap">
            <img class="avatar" v-lazy="item.avatar" alt="">
          </dt>
          <dd>
            <div class="top">
              <span class="nickname">{{item.nickname}}</span>
              <span :class="['sex-mark',{'man':item.gender==1,'woman':item.gender==2}]">
                <i class="icon-sex"></i>
                <i class="age">{{item.age}}</i>
              </span>
              <img class="level-mark" v-lazy="item.live_level_img" alt="">
              <img class="level-mark" v-lazy="item.wealth_level_img" alt="">
            </div>
            <p class="desc">{{item.sign}}</p>
            <span class="time">剩余
              <i>{{item.ward_data.end_day}}</i> 天</span>
            <div class="ward-img" :style="{backgroundImage:'url('+item.ward_img+')'}"></div>
            <mark></mark>
          </dd>
        </dl>
      </li>
    </ul>
    <div class="loading-wave" v-if="loading">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="no-data" v-if="wardList.length==0 && !loading">暂无更多数据~</div>
  </div>
</template>

<script>
import {
  pathJudge,
  levelMark,
  defaultAvatar,
  scrollDirection
} from "@/util/tools";
import TabHd from "@/components/tab";
import { SOURCE_LOCAL } from "@/util/constant";
import { mapState } from "vuex";
export default {
  components: {
    TabHd
  },
  data() {
    return {
      wardList: [],
      tabItems: ["我守护的", "守护我的"],
      pageIndex: 1, //当前页
      pageCount: 0, //总页数
      pageNum: 20, //每页20条
      loadFlag: true, //滚动加载开关
      loading:false,
      tabIndex: 1 //1 我守护的, 0 守护我的
    };
  },
  computed: {
    ...mapState({
      hostUser: state => state.hostUser
    })
  },
  watch:{
    hostUser(v){
      if(v){
        this.tabChange(0);
      }
    }
  },
  mounted() {
    this.dataInit();
    document.addEventListener("scroll", this.docScroll);
  },
  destroyed() {
    document.removeEventListener("scroll", this.docScroll);
  },
  methods: {
    dataInit() {
      this.tabChange(0);
    },
    //去主页
    goZone(id) {
      let routerData = this.$router.resolve({
        name: "Zone",
        params: { uid: id }
      });
      window.open(routerData.href, "_blank");
    },
    //滚动加载
    docScroll(e) {
      let el = e.target ? e.target : e.srcElement;
      let direct = scrollDirection(el);
      let sy = window.scrollY;
      let w_h = window.innerHeight;
      let d_h = document.documentElement.offsetHeight;
      if (sy > d_h - w_h - 300 && this.loadFlag && direct == "down") {
        this.getList(this.tabIndex);
        this.loadFlag = false;
      }
    },
    //获取列表
    getList(key) {
      this.loading=true;
      let id = this.hostUser ? this.hostUser.uid : null;
      this.$get("/h5/ward/list", {
        type: key, //0 我守护的, 1 守护我的
        to_uid: id,
        page: this.pageIndex
      }).then(r => {
        this.loading=false;
        if (r.http_code == 200) {
          let list = r.data.list;
          for (let i = 0; i < list.length; i++) {
            list[i] = levelMark(list[i]);
            // list[i].avatar=list[i].avatar==""?pathJudge(list[i].avatar):defaultAvatar(list[i].avatar);
            list[i].avatar = list[i].avatar != "" ? pathJudge(list[i].avatar) : defaultAvatar(list[i].avatar);
            list[i].room_cover = pathJudge(list[i].room_cover);
            if(list[i].ward_data){
              list[i]["ward_img"]=`${SOURCE_LOCAL}img/center/icon-ward${list[i].ward_data.level}.png`;
            }

          }
          this.pageCount = Math.ceil(r.data.count / this.pageNum);
          if (this.pageIndex < this.pageCount) {
            // 当前页码<总页数
            this.loadFlag = true;
            this.pageIndex++;
          } else {
            this.loadFlag = false;
          }
          if (this.pageIndex > 1) {
            this.wardList = this.wardList.concat(list);
          } else {
            this.wardList = list;
          }
        }
      });
    },
    tabChange(index) {
      this.wardList=[];
      this.pageIndex = 1;
      switch (index) {
        case 0:
          this.getList(1);
          break;
        case 1:
          this.getList(0);
          break;
      }
    }
  }
};
</script>

<style lang="scss">
.ward-component {
  padding: 40px;
  .tab-hd {
    overflow: hidden;
    margin-bottom: 40px;
    > li {
      float: left;
      font-size: 20px;
      color: #999;
      line-height: 30px;
      position: relative;
      margin-right: 60px;
      &.on {
        color: #333;
        &:after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          background-color: #333;
        }
      }
    }
  }
  .msg-list {
    width: 1070px;
    li {
      float: left;
      width: 340px;
      height: 95px;
      margin-bottom: 25px;
      margin-right: 25px;
      &:nth-of-type(3n) {
        margin-right: 0;
      }
    }
    .item-dl {
      border-radius: 4px;
      height: 95px;
      width: 100%;
      padding-left: 95px;
      background-color: #fff;
      border: 1px solid #e6e6e6;
      position: relative;
      dt {
        position: absolute;
        left: -1px;
        top: -1px;
        width: 95px;
        height: 95px;
        border-radius: 4px;
        overflow: hidden;
      }
      .avatar {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
      dd {
        width: 100%;
        position: relative;
        padding: 10px 8px 10px 15px;
        min-height: 100%;
        .top {
          height: 24px;
          overflow: hidden;
        }
        .nickname {
          float: left;
          max-width: 7em;
          font-size: 14px;
          line-height: 24px;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sex-mark,
        .level-mark {
          width: 30px;
          height: 14px;
          border-radius: 14px;
          float: left;
          margin-left: 6px;
          margin-top: 4px;
        }
        .time {
          position: absolute;
          left: 15px;
          bottom: 10px;
          font-size: 12px;
          color: #999;
          line-height: 20px;
          i {
            color: #f362f5;
          }
        }
        .desc {
          font-size: 12px;
          color: #999;
          line-height: 20px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          margin-top: 6px;
          img {
            display: inline-block;
            width: 15px;
            height: 15px;
            vertical-align: middle;
            margin-top: -3px;
            margin-left: 2px;
            margin-right: 2px;
          }
        }
        mark {
          position: absolute;
          right: -8px;
          top: -1px;
          z-index: 3;
          width: 39px;
          height: 21px;
          background: url("https://lib.liaoke.tv/lib/pc/static/img/center/icon-live.png")
            no-repeat top right / contain;
        }
        .ward-img {
          position: absolute;
          right: 8px;
          bottom: 10px;
          z-index: 2;
          width: 44px;
          height: 45px;
          background-repeat: no-repeat;
          background-size: contain;
        }
      }
    }
  }
  .no-data{
    font-size: 14px;
    color: #999;
    line-height: 24px;
  }
}
</style>
