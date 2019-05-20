<!--主播item-->
<template>
  <div class="anchor-component">
    <div class="dt">
      <img class="live-face" v-lazy="info.room_cover" alt="">
      <div class="mask">
        <i class="icon-play"></i>
      </div>
    </div>
    <div class="dd">
      <div class="nickname">{{info.nickname}}</div>
      <div class="visitor">{{info.view_count>0?info.view_count:0 }}</div>
    </div>
  </div>
</template>

<script>
import {
  pathJudge,
  defaultAvatar,
  levelMark,
  replaceEmmoji
} from "@/util/tools";
export default {
  data() {
    return {
    };
  },
  mounted() {
    // this.item.room_cover = pathJudge(this.item.room_cover);
    // console.log(this.item);
  },
  props: {
    info: {
      type: Object,
      default: function() {
        return {};
      }
    }
  }
};
</script>

<style lang="scss">
.anchor-component {
  transition: all 0.2s linear;
  &:hover {
    box-shadow: 0 0px 20px rgba(0, 0, 0, 0.5);
  }
  .dt {
    width: 236px;
    height: 236px;
    position: relative;
    overflow: hidden;
    img {
      display: block;
      width: 100%;
      height: 100%;
    }
    &:hover .mask {
      opacity: 1;
      transform: scale(1);
    }
    .mask {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 9;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.3);
      transition: all 0.4s linear;
      opacity: 0;
      transform: scale(1.4);
    }
    .icon-play {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.5);
      margin-left: -20px;
      margin-top: -20px;
      &:before {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        width: 0;
        height: 0;
        border: 8px solid transparent;
        border-left: 12px solid #fff;
        margin-left: -5px;
        margin-top: -8px;
      }
    }
  }
  .dd {
    background-color: #fff;
    height: 42px;
    line-height: 42px;
    padding-left: 10px;
    padding-right: 10px;
    .nickname {
      float: left;
      width: 7em;
      font-size: 16px;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .visitor {
      float: right;
      opacity: 0.5;
      font-size: 12px;
      color: #666;
      opacity: 0.5;
      &:before {
        content: "";
        width: 12px;
        height: 12px;
        display: inline-block;
        vertical-align: middle;
        margin-top: -3px;
        background: url(https://lib.liaoke.tv/lib/pc/static/img/index/icon-visitor.png)
          no-repeat center/cover;
        margin-right: 4px;
      }
    }
  }
}
</style>
