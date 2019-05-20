<!--礼物显示动画-->
<template>
  <div class="gift-show-wrapper">
    <transition-group class="gift-show" tag="ul" name="gift" @before-enter="beforeEnter" @enter="enter">
      <li v-for="(item, index) in list" :key="item.id" v-if="index<3" :id="item.id" @click="look(item.created_by)">
        <div class="gift-item">
          <img :src="item.user_avatar" alt="" class="avatar">
          <div class="info">
            <div class="nickname">{{item.user_nickname}}</div>
            <div class="to">
              <span class="label">送给</span>
              <span class="nickname">{{ item.to_uid==item.roomid?'主播':item.to_nickname}}</span>
            </div>
          </div>
          <img class="icon-gift" :src="item.filename" alt="">
          <!--<b class="gift-amount">×{{item.combo_number}}</b>-->
          <transition name="zoomIn" @enter="zoomIn">
            <b class="gift-amount" :class="firstClass" :key="item.combo_number">×{{item.combo_number}}</b>
          </transition>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      firstClass: "first" //解决数字第一次没有动画的问题
    };
  },
  props: {
    list: {
      type: Array,
      default: []
    }
  },
  watch: {
    list(v) {
      // console.log(v);
    }
  },
  mounted() {},
  methods: {
    beforeEnter(el) {
      // console.log(1);
    },
    enter(el, done) {
      Velocity(el, "stop");
      Velocity(
        el,
        {
          left: "0%"
        },
        {
          duration: 400,
          complete: () => {
            this.firstClass = ""; //进入后清除class
            this.leftOut(el);
            done();
          }
        }
      );
    },
    zoomIn(el, done) {
      // console.log(2);
      let parents = el.parentNode;
      while (parents.tagName != "LI") {
        parents = parents.parentNode;
      }
      this.leftOut(parents);
    },
    leftOut(el) {
      let data = el.getAttribute("id");
      if (el["timer"]) {
        clearTimeout(el["timer"]);
      }
      el["timer"] = setTimeout(() => {
        Velocity(
          el,
          {
            left: "-100%"
          },
          {
            duration: 400,
            complete: () => {
              this.$emit("leftOut", data);
              clearTimeout(el["timer"]);
            }
          }
        );
      }, 3000);
    },
    look(data) {
      this.$emit("lookInfo", data);
    }
  }
};
</script>

<style lang="scss">
.gift-show-wrapper {
  .gift-show {
    position: absolute;
    left: 20px;
    /*top: 100px;*/
    bottom: 350px;
    z-index: 3;
    height: 160px;
    pointer-events: none;
    width: calc(100% - 40px);
    overflow-x: hidden;
    overflow-y: visible;
    > li {
      padding-top: 8px;
      position: relative;
      left: -100%;
      overflow: hidden;
    }
    .gift-item {
      width: 240px;
      height: 44px;
      border-radius: 44px;
      position: relative;
      background: rgba(241, 98, 245, 0.5);
      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 44px;
        float: left;
      }
      .info {
        float: left;
        margin-left: 6px;
        width: 112px;
        height: 44px;
        overflow: hidden;
      }
      .nickname {
        max-width: 100%;
        font-size: 16px;
        color: #fff;
        line-height: 24px;
        height: 24px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .to {
        max-width: 100%;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 20px;
        .label {
          vertical-align: middle;
        }
        .nickname {
          display: inline-block;
          vertical-align: middle;
          font-size: 12px;
          line-height: 20px;
          height: auto;
          margin-left: 4px;
          max-width: 84px;
        }
      }
      .icon-gift {
        position: absolute;
        left: 166px;
        top: -10px;
        width: 50px;
        height: 50px;
      }
      .gift-amount {
        position: absolute;
        left: 216px;
        top: 0;
        font-weight: bold;
        color: #ff0;
        font-size: 28px;
        line-height: 44px;
        white-space: nowrap;
        font-style: italic;
        font-family: "Arial-BoldItalicMT", "Arial";
        letter-spacing: 0;
        text-shadow: 0 1px 0 rgba(0, 0, 0, 0.15);
        &.first {
          animation: zoomIn 0.3s ease-out 0.3s forwards;
        }
      }
      .zoomIn-enter-active {
        animation: zoomIn 0.3s ease-out forwards;
      }
    }
  }
  @keyframes zoomIn {
    0% {
      transform: scale(2);
    }
    80% {
      transform: scale(0.8);
    }
    100% {
      transform: scale(1);
    }
  }
}
</style>
