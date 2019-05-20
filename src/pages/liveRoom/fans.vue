<!--粉丝排行榜列表-->
<template>
  <div class="scroller">
    <ul class="fans-list">
      <li v-if="list.length>0" class="list-item" v-for="(item, index) in list" :key="index">
        <router-link class="link" :to="{name:'Zone',params:{uid:item.uid}}" target="_blank">
          <span class="rank-num">{{index+1}}</span>
          <img class="avatar" :src="item.avatar" alt="">
          <div class="middle">
            <div class="nickname">
              <img class="level-mark" :src="item.wealth_level_img" alt="">
              <img v-if="item.ward_data && item.ward_data.level>0" class="ward-mark" :src="item.ward_img" alt="">
              <img v-if="item.vip_data && item.vip_data.level>0" class="vip-mark" :src="item.vip_img" alt="">
              <span>{{item.nickname}}</span>
            </div>
            <span class="coins">{{toLocal(item.score)}}</span>
          </div>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: []
    }
  },
  methods: {
    toLocal(nut) {
      return Number(nut).toLocaleString();
    }
  }
};
</script>

<style lang="scss">
.fans-list {
  padding-left: 15px;
  padding-top: 20px;
  .list-item {
    cursor: pointer;
    width: 280px;
    margin-bottom: 20px;
    overflow: hidden;
    .link {
      display: block;
      overflow: hidden;
    }
    .rank-num {
      width: 25px;
      height: 20px;
      text-align: center;
      display: inline-block;
      vertical-align: middle;
      font-size: 12px;
      color: #fff;
      line-height: 20px;
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
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-left: 10px;
    }
    .middle {
      display: inline-block;
      vertical-align: middle;
      width: 160px;
      margin-left: 12px;
    }
    .nickname {
      font-size: 14px;
      color: #fff;
      line-height: 20px;
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
      /*margin-left: 3px;*/
    }
    .ward_mark,
    .vip-mark {
      margin-left: 3px;
    }
    .coins {
      font-size: 12px;
      color: #f0d388;
      line-height: 18px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
