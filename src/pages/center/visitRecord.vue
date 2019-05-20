<template>
  <div class="record-component">
    <tab-hd :tabItem="tabItems" @tabSuccess="tabChange"></tab-hd>
    <ul class="msg-list clearfix">
      <li v-if="recordList.length>0" v-for="(item, index) in recordList" :key="index">
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
            <span class="time">{{item.view_at_text}}</span>
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
    <div class="no-data" v-if="recordList.length==0 && !loading">暂无更多数据~</div>
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
import Pagination from "@/components/pagination";
export default {
  components: {
    TabHd,
    Pagination
  },
  data() {
    return {
      recordList: [],
      tabItems: ["谁看过我", "我看过谁"],
      pageIndex: 1, //当前页
      pageCount: 0, //总页数
      pageNum: 20, //每页20条
      loadFlag: true, //滚动加载开关
      loading:false,
      tabIndex: 0 //0 谁看过我, 1 我看过谁
    };
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
    getList(key) {
      let idx = key == 0 ? "viewed" : "view";
      this.loading=true;
      this.$get("/h5/user/view-list", {
        type: idx, //viewed 谁看过我, view 我看过谁
        page: this.pageIndex
      }).then(r => {
        this.loading=false;
        if (r.http_code == 200) {
          let list = r.data.list;
          for (let i = 0; i < list.length; i++) {
            list[i] = levelMark(list[i]);
            // list[i].avatar=list[i].avatar==""?pathJudge(list[i].avatar):defaultAvatar(list[i].avatar);
            list[i].avatar =
              list[i].avatar != ""
                ? pathJudge(list[i].avatar)
                : defaultAvatar(list[i].avatar);
            list[i].room_cover = pathJudge(list[i].room_cover);
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
            this.recordList = this.recordList.concat(list);
          } else {
            this.recordList = list;
          }
        }
      });
    },
    tabChange(index) {
      this.recordList = [];
      this.pageIndex = 1;
      this.getList(index);
      this.tabIndex = index;
      /*switch (this.showList) {
          case 0:
            this.getList('viewed');
            this.tabIndex='viewed';
            break;
          case 1:
            this.getList('view');
            this.tabIndex='view';
            break;
        }*/
    }
    /*pageChange(data){
        this.pageIndex=data;
        switch (this.showList) {
          case 0:
            this.getList('viewed');
            break;
          case 1:
            this.getList('view');
            break;
        }
      }*/
  }
};
</script>

<style lang="scss">
.record-component {
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
      height: 95px;
      width: 100%;
      padding-left: 95px;
      background-color: #fff;
      border: 1px solid #e6e6e6;
      border-radius: 4px;
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
      }
    }
  }
}
</style>
