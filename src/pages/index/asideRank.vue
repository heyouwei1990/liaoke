<!--首页侧栏排行列表-->
<template>
  <div class="ranking">
    <div class="aside-hd-wrap">
      <h3 class="aside-hd">{{title}}</h3>
      <div class="aside-tab">
        <div :class="['tab-item',{'on':tabActive==index}]" v-for="(item, index) in types" :key="index" @click="tab(index)">{{item.text}}</div>
        <router-link to='/ranking' target="_blank" tag="a">
          <i class="arrow"></i>
        </router-link>
      </div>
    </div>
    <ul class="list" v-if="list.length>0">
      <li class="list-item magnate-li" v-for="(item, index) in list" :key="index">
        <span class="rank-num">{{item.rank_number}}</span>
        <router-link :to="{name:'Zone',params:{uid:item.uid}}" target="_blank">
          <img class="avatar" v-lazy="item.avatar" alt="">
        </router-link>
        <div class="middle">
          <div class="nickname">
            <span>{{item.nickname}}</span>
            <img v-if="userStatus==1" class="level-mark" :src="item.live_level_img" alt="">
            <img v-else class="level-mark" :src="item.wealth_level_img" alt="">
          </div>
          <!--<span class="coins">{{item.coins}}</span>-->
          <div class="coins" v-if="userStatus==1 && (tabActive==1 || tabActive==2)">{{item.money | formatNo }}</div>
          <div class="coins" v-if="userStatus!=1 || (userStatus==1 && tabActive==0)">{{item.prize_text}}</div>
        </div>
      </li>
    </ul>
    <div v-if="empty" class="no-data">
      暂无更多数据！
    </div>
    <div class="loading-wave" v-if="loading">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ""
    },
    list: {
      type: Array,
      default: []
    },
    selected: {
      type: [Number, String],
      default: 0
    },
    userStatus: {
      type: [Number, String],
      default: 1 //主播 1 或者富豪 2, 默认主播
    },
    loading:{
      type:Boolean,
      default:false
    },
    empty:{
      type:Boolean,
      default:false
    },
  },
  data() {
    return {
      tabActive: this.selected,
      types: [
        {
          id: "1",
          text: "风云"
        },
        {
          id: "2",
          text: "日"
        },
        {
          id: "3",
          text: "月"
        }
      ]
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
  mounted(){
    if(this.userStatus==1){
      this.$set(this.types[0],'text','星光');
    }
  },
  methods: {
    tab(idx) {
      this.tabActive = idx;
      this.$emit("changeRank", idx);
    }
  },

};
</script>

<style lang="scss">
.ranking {
  // min-height: 712px;
  height: 712px;
  .aside-hd-wrap {
    margin-top: 16px;
    height: 32px;
    line-height: 32px;
    margin-bottom: 20px;
  }
  .aside-hd {
    float: left;
    font-size: 20px;
    color: #333;
    line-height: 32px;
    &:before {
      content: "";
      display: inline-block;
      vertical-align: middle;
      margin-top: -3px;
      width: 2px;
      height: 20px;
      margin-right: 8px;
      background-color: #A35AFE\9;
      background-image: linear-gradient(-180deg, #f362f5 0%, #a35afe 100%);
    }
  }
  .aside-tab {
    float: right;
    overflow: hidden;
    .arrow {
      cursor: pointer;
      display: block;
      float: right;
      width: 12px;
      height: 12px;
      border-top: 1px solid #999;
      border-right: 1px solid #999;
      transform: rotate(45deg);
      margin-top: 10px;
      margin-right: 10px;
    }
    .tab-item {
      float: left;
      cursor: pointer;
      margin-right: 12px;
      font-size: 16px;
      color: #999;
      position: relative;
      &.on {
        color: #333;
      }
      &.on:after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 2px;
        background-color: #a35afe;
        background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      }
    }
  }

  .list-item {
    cursor: pointer;
    width: 280px;
    margin-bottom: 20px;
    overflow: hidden;
    .rank-num {
      width: 25px;
      height: 20px;
      text-align: center;
      display: inline-block;
      vertical-align: middle;
    }
    &:nth-of-type(1) .rank-num {
      text-indent: -200px;
      background: url(https://lib.liaoke.tv/lib/pc/static/img/index/icon-crown1.png)
        no-repeat center/cover;
    }
    &:nth-of-type(2) .rank-num {
      text-indent: -200px;
      background: url(https://lib.liaoke.tv/lib/pc/static/img/index/icon-crown2.png)
        no-repeat center/cover;
    }
    &:nth-of-type(3) .rank-num {
      text-indent: -200px;
      background: url(https://lib.liaoke.tv/lib/pc/static/img/index/icon-crown3.png)
        no-repeat center/cover;
    }
    .avatar {
      display: inline-block;
      vertical-align: middle;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-left: 10px;
    }
    .middle {
      display: inline-block;
      vertical-align: middle;
      width: 160px;
      margin-left: 24px;
    }
    .nickname {
      font-size: 14px;
      color: #333;
      line-height: 22px;
      > span {
        display: inline-block;
        vertical-align: middle;
        max-width: 7em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    .level-mark {
      margin-left: 3px;
    }
    .coins {
      font-size: 12px;
      color: #ffab00;
      line-height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .no-data{
    text-align: center;
    line-height: 24px;
    color: #999;
    font-size: 14px;
    padding: 20px;
  }
}
</style>
