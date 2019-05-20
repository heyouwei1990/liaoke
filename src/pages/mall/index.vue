<template>
  <div class="content-mall">
    <div class="main">
      <Tabhd :tabItem="tabLink" :selected="tabActive" @tabSuccess="tabScroll"></Tabhd>
      <!-- <h2 class="sec-hd">礼包</h2> -->
      <div class="clearfix">
        <div class="gird-5" v-if="bagList.length>0" v-for="(item,index) in bagList" :key="index">
          <img class="icon" v-lazy="item.filename" alt="">
          <div class="name">{{item.name}}</div>
          <div class="price">{{item.price}}金币</div>
          <div class="desc">{{item.intro}}</div>
          <div class="btn linear-btn" @click="buyBag(item.id)">
            <span>购买</span>
          </div>
        </div>
      </div>
      <!-- <hr> -->
      <h2 class="sec-hd">升级VIP</h2>
      <div class="clearfix">
        <dl class="gird-intro gird-3">
          <dt>有关VIP:</dt>
          <dd>
            <ul class="desc-ul">
              <li>VIP是具有凌驾于普通用户之上的高等头衔,其“钻石VIP”赋予在聊客平台中最高的荣耀,尊贵的头衔标志以及享受最高的特权待遇.</li>
            </ul>
          </dd>
        </dl>
        <dl class="gird-intro gird-3">
          <dt>VIP特权:</dt>
          <dd>
            <ul class="desc-ul">
              <li>免费私聊</li>
              <li>免费看私照</li>
              <li>排名靠前</li>
              <li>尊贵标识</li>
              <li>直播间防踢
                <span class="tip">(仅限钻石VIP)</span>
              </li>
            </ul>
          </dd>
        </dl>
        <dl class="gird-intro gird-3">
          <dt>VIP道具:</dt>
          <dd>
            <ul class="desc-ul">
              <li>飞屏道具</li>
              <li>喇叭道具</li>
              <li>领取金币</li>
              <li>领取钻石</li>
            </ul>
          </dd>
        </dl>
      </div>
      <div class="clearfix">
        <div class="gird-3 goods-li" v-if="vipList.length>0" v-for="(item,index) in vipList" :key="index">
          <dl class="goods-dl vip-dl">
            <dt>
              <img class="vip-img" :src="item.icon" alt="">
              <div :class="['goods-name',{red:item.level==1,blue:item.level==2,purple:item.level==3}]">{{item.name}}</div>
            </dt>
            <dd>
              <div class="title">每天可享受</div>
              <ul class="desc-ul">
                <li>金币<mark>*{{item.day.coins | formatNo}}</mark>&nbsp;(价值{{item.day.coins_rmb | formatNo}}元)</li>
                <li>钻石<mark>*{{item.day.diamond | formatNo}}</mark>&nbsp;(价值{{item.day.diamond_rmb | formatNo}}元)</li>
                <li>房间飘屏<mark>*{{item.day.room_bullet | formatNo}}</mark>&nbsp;(价值{{item.day.room_bullet_rmb | formatNo}}元)</li>
                <li>全站飘屏<mark>*{{item.day.broadcast_bullet | formatNo}}</mark>&nbsp;(价值{{item.day.broadcast_bullet_rmb | formatNo}}元)</li>
                <li>全站喇叭<mark>*{{item.day.speaker}}</mark>&nbsp;(价值{{item.day.speaker_rmb | formatNo}}元)</li>
                <li>免费看私照<mark>{{item.day.free_photo}}张</mark></li>
              </ul>
            </dd>
          </dl>
          <ul class="check-list">
            <!--<li class="on">1个月</li>-->
            <li v-for="(mItem,mIndex) in item.duration" :key="mIndex" :class="{on:item.checked===mItem}" @click="changeTime(mItem,item)">{{mItem}}个月</li>
          </ul>
          <div class="bottom">
            <div class="price"><b>{{item.price*item.checked | formatNo}}</b>元</div>
            <div class="btn linear-btn" @click="buyVip(item)">
              <span v-if="hostUser && hostUser.vip_data && hostUser.vip_data.level==(index+1)">立即续费</span>
              <span v-else>立即开通</span>
            </div>
          </div>
        </div>
      </div>
      <hr>
      <h2 class="sec-hd">守护</h2>
      <div class="clearfix">
        <div class="gird-3 goods-li" v-for="(item,index) in wardGoods" :key="index">
          <dl class="goods-dl ward-dl">
            <dt><img class="ward-img" :src="item.icon" alt=""></dt>
            <dd>
              <div :class="['goods-name',{blue:item.level==1,gold:item.level==2,purple:item.level==3}]">{{item.name}}</div>
              <ul class="desc-ul">
                <li>进场炫酷特效屌炸天</li>
                <li>装x必备炫酷专属图标</li>
                <li>排名靠前贴心陪伴</li>
              </ul>
            </dd>
          </dl>
          <ul class="check-list">
            <li v-for="(mItem,mIndex) in item.duration" :key="mIndex" :class="{on:item.checked===mItem}" @click="changeTime(mItem,item)">{{mItem}}个月</li>
          </ul>
          <div class="bottom">
            <div class="price">
              <b>{{item.price*item.checked | formatNo}}</b>金币</div>
            <div class="btn linear-btn" @click="buyWard(item)">
              <span>开通守护</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <a-dialog class="pay-mode-dialog" :isShow="showPay" @closeDialog="closePay">
      <div class="pay-mode-wrap">
        <div class="title" v-if="payData">实付金额：
          <span>{{payData.price}}元</span>
        </div>
        <ul class="pay-type">
          <li v-for="(item,index) in paymentList" :key="index">
            <input v-model="payMode" type="radio" name="mode" :value="item.key">
            <div class="pay-mode">
              <i :class="item.icon"></i>
              <span>{{item.label}}</span>
            </div>
          </li>
        </ul>
        <div class="btn-next" @click="callQrcode">下一步</div>
      </div>
    </a-dialog>
    <a-dialog class="choose-dialog" :isShow="showWard" @closeDialog="closeWard">
      <div class="ward-step1" v-show="!wardId">
        <h3 class="title">选择守护对象</h3>
        <tabhd :tabItem="wardTab" @tabSuccess="wardListChange"></tabhd>
        <div class="scroller" @scroll="loadMore">
          <ul class="user-list" v-if="favList.length>0">
            <li v-for="(item,index) in favList" :key="index">
              <div class="avatar-wrap">
                <img class="avatar" v-lazy="item.avatar" alt="">
              </div>
              <div class="middle">
                <div class="top">
                  <span class="nickname">{{item.nickname}}</span>
                  <span class="sex-mark" :class="{'man':item.gender==1,'woman':item.gender==2}">
                  <i class="icon-sex"></i>
                  <i class="age">{{item.age}}</i>
                </span>
                </div>
                <p class="desc">{{item.sign}}</p>
              </div>
              <button class="btn-text" @click="getWardUser(item)">守护Ta</button>
            </li>
          </ul>
          <div class="loading-wave" v-if="loading">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="no-data" v-if="favList.length==0  && !loading">
            <span v-if="tabWardActive==0">没有关注过任何人~</span>
            <span v-if="tabWardActive==1 ">没有粉丝 ~</span>
          </div>
        </div>
      </div>
      <div class="ward-step2" v-show="wardId">
        <div class="ward-user" v-if="wardTo">
          <img :src="wardTo.avatar" alt="" class="avatar">
          <div class="ward-to">
            <span>守护对象：</span>
            <span class="nickname">{{wardTo.nickname}}</span>
          </div>
          <span class="btn-change" @click="changeWardUser">选择守护对象</span>
        </div>
        <div class="buy-ward" v-if="payData">
          <div class="wardBox">
            <div class="ward-img-wrap">
              <img class="ward-img" :src="payData.icon" alt="">
            </div>
            <ul class="ward-detail">
              <li>已&nbsp;选&nbsp;择：
                <!-- <span class="wardN">白银守护</span> -->
                <span class="wardN" :class="[{blue:payData.level==1,gold:payData.level==2,purple:payData.level==3}]">{{payData.name}}</span>
              </li>
              <li>时&emsp;&emsp;长：{{shouhu_y}}个月</li>
              <li>所需金币：
                <span class="wardCont">{{shouhu_cont|formatNo}}</span>
              </li>
            </ul>
          </div>
          <button class="btn-ward" @click="payWard">开通守护</button>
          <!-- <img class="ward-img" :src="payData.icon" alt="">
          <div :class="['ward-name',{blue:payData.level==1,gold:payData.level==2,purple:payData.level==3}]">{{payData.name}}</div>
          <button class="btn-ward" @click="payWard">开通守护</button> -->

        </div>
      </div>
    </a-dialog>
    <a-dialog class="pay-result-dialog" :isShow="showResult" @closeDialog="showResult=false">
      <div class="pay-result">
        <i class="icon-success"></i>
        <div class="tip-msg">开通成功</div>
        <button class="btn-ensure" @click="showResult=false">确认</button>
      </div>
    </a-dialog>
  </div>
</template>

<script>
import Tabhd from "@/components/tab";
import ADialog from "@/components/dialog";
import { mapState } from "vuex";
import {
  pathJudge,
  defaultAvatar,
  levelMark,
  scrollDirection
} from "@/util/tools";

export default {
  components: {
    Tabhd,
    ADialog
  },
  computed: {
    ...mapState({
      hostUser: state => state.hostUser
    })
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
  data() {
    return {
      tabLink: ["全部", "升级VIP", "守护"],//礼包
      tabActive: 0,
      vipList: [],
      bagList: [],
      wardList: [],
      validTime: [1, 3, 6, 12],
      showPay: false,
      payMode: "wx2",
      paymentList: [
        /*{
          key: "ali2",
          icon: "icon-alipay",
          label: "支付宝"
        },*/
        {
          key: "wx2",
          icon: "icon-wxpay",
          label: "微信支付"
        },
        {
          key: "qpay",
          icon: "icon-qq",
          label: "QQ钱包"
        }
      ],
      payData: null,
      showWard: false, //选择守护对象弹框
      wardStep: 0, //守护弹框内容
      wardTo: null, //守护对象
      wardId: null,
      wardTab: ["关注", "粉丝"],
      tabWardActive: 0,
      favList: [], //关注/粉丝列表
      pageIndex: 1,
      pageCount: 0, //总页数
      pageNum: 20, //每页20条数据
      loadFlag: true, //滚动加载开关
      loading:false,
      wardGoods: [
        {
          checked: 1,
          duration: [1, 3, 6, 12],
          icon: "https://lib.liaoke.tv/lib/pc/static/img/center/icon-ward1.png",
          level: 1,
          name: "白银守护",
          price: "100000"
        },
        {
          checked: 1,
          duration: [1, 3, 6, 12],
          icon: "https://lib.liaoke.tv/lib/pc/static/img/center/icon-ward2.png",
          level: 2,
          name: "黄金守护",
          price: "200000"
        },
        {
          checked: 1,
          duration: [1, 3, 6, 12],
          icon: "https://lib.liaoke.tv/lib/pc/static/img/center/icon-ward3.png",
          level: 3,
          name: "王者守护",
          price: "1000000"
        }
      ],
      shouhu_y: "", //守护月份
      shouhu_cont: "", //守护金额
      showResult: false //守护成功弹框
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
      let _url = window.location.href;
      let hostId = this.hostUser ? Number(this.hostUser.uid) : null;
      //获取vip
      this.$get("/pay", {
        uid: hostId,
        referer: _url,
        format: "json"
      }).then(r => {
        for (let i = 0; i < r.vip_list.length; i++) {
          r.vip_list[i]["duration"] = this.validTime;
          r.vip_list[i]["checked"] = this.validTime[0];
          r.vip_list[i]["icon"] = pathJudge(
            "assets/icon/vip/vip_" + r.vip_list[i].level + ".png"
          );
          if (r.vip_list[i].level == 1) {
            r.vip_list[i]["icon"] = pathJudge("assets/icon/vip/vip_2.png");
          }
          if (r.vip_list[i].level == 2) {
            r.vip_list[i]["icon"] = pathJudge("assets/icon/vip/vip_1.png");
          }
        }
        this.vipList = r.vip_list;
      });
      // 获取礼包
      this.$get("/h5/gift/bag").then(r => {
        if (r.http_code == 200) {
          let list = r.data;
          for (let i = 0; i < list.length; i++) {
            list[i].filename = pathJudge(list[i].filename);
          }
          this.bagList = list;
        }
      });

      //直播间跳转过来的开通守护
      if (this.$route.query.uid) {
        let uid = this.$route.query.uid;
        this.$get("/h5/user/info", {
          uid: uid
        }).then(r => {
          r.data.avatar =
            r.data.avatar != ""
              ? pathJudge(r.data.avatar)
              : defaultAvatar(r.data.avatar);
          this.wardTo = r.data;
          this.wardId = uid;
          this.wardStep = 1;
          //滚动到第四屏
          this.tabScroll(3);
        });
      }
    },
    // 切换关注和粉丝
    wardListChange(data) {
      this.pageIndex = 1;
      this.favList = [];
      this.tabWardActive = data;
      this.getList(data);
    },

    //获取关注和粉丝列表
    getList(key) {
      let url = key == 0 ? "favs" : "fans";
      this.loading=true;
      this.$get("/h5/user/" + url, {
        page: this.pageIndex
      }).then(r => {
        this.loading=false;
        if (r.http_code == 200) {
          let list = r.data.list;
          for (let i = 0; i < list.length; i++) {
            list[i] = levelMark(list[i]);
            list[i].avatar =
              list[i].avatar != ""
                ? pathJudge(list[i].avatar)
                : defaultAvatar(list[i].avatar);
            list[i].room_cover = pathJudge(list[i].room_cover);
          }

          this.pageCount = Math.ceil(r.data.count / this.pageNum);
          if (this.pageIndex > 1) {
            this.favList = this.favList.concat(list);
          } else {
            this.favList = list;
          }
          if (this.pageIndex < this.pageCount) {
            this.loadFlag = true;
            this.pageIndex++;
          } else {
            this.loadFlag = false;
          }
        }
      });
    },

    //滚动到底部加载 关注、粉丝
    loadMore(e) {
      let el = e.srcElement ? e.srcElement : e.target;
      let direct = scrollDirection(el); //获取滚动方向
      if (
        el.scrollHeight - el.scrollTop - 10 < el.offsetHeight &&
        this.loadFlag &&
        direct == "down"
      ) {
        this.getList(this.tabWardActive);
        this.loadFlag = false;
      }
    },

    //购买守护
    buyWard(data) {
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      // console.log(data);

      this.shouhu_y = data.checked; //守护月份
      this.shouhu_cont = data.checked * data.price; //守护金额

      //获取我的关注
      this.getList(0);
      this.showWard = true;
      this.payData = Object.assign({}, data);
      this.payData["price"] = data.price * data.checked;
    },

    //
    changeWardUser() {
      this.wardStep = 0;
      this.wardTo = null;
      this.wardId = null;
    },

    //守护ta
    getWardUser(data) {
      this.wardTo = data;
      this.wardId = this.wardTo.uid;
      console.log(data);
    },

    //支付守护
    payWard() {
      let uid = Number(this.wardId);
      let level = Number(this.payData.level);
      let month = Number(this.payData.checked);
      this.$post("/h5/ward/create", {
        to_uid: uid,
        created_in: "shop",
        level: level,
        number: month
      }).then(r => {
        if (r.http_code == 200) {
          this.showResult = true;
          this.wardTo = null;
          this.wardId = null;
        }
        if (r.http_code == 4002) {
          this.$store.commit("set_broke", true);
          this.wardTo = null;
          this.wardId = null;
        }
        this.showWard = false;
      });
    },

    // 关闭选择守护对象
    closeWard() {
      this.wardTo = null;
      this.wardId = null;
      this.showWard = false;
    },

    //去充值
    goRecharge() {
      this.showResult = false;
      this.$router.push("/recharge");
    },
    //购买礼包
    buyBag(pkid) {
      this.$get("/h5/gift/send", {
        gift_id: Number(pkid),
        number: 1
      }).then(r => {
        this.$store.commit("setToast", r.msg);
      });
    },

    //购买VIP
    buyVip(data) {
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      this.payData = Object.assign({}, data);
      this.payData["price"] = data.price * data.checked;
      this.showPay = true;
    },

    //关闭支付渠道弹框
    closePay() {
      this.showPay = false;
    },

    //调取支付二维码
    callQrcode() {
      //支付弹框的文字提示
      let text = "";
      switch (this.payMode) {
        case "ali2":
          text = "支付宝";
          break;
        case "wx2":
          text = "微信";
          break;
        case "qpay":
          text = "QQ钱包";
          break;
      }
      let payment = Number(this.payData.price);
      this.$get("/pay/qr", {
        uid: Number(this.hostUser.uid),
        rmb: payment,
        server: this.payMode
      }).then(r => {
        this.showPay = false;
        let _data = {};
        _data["label"] = text;
        _data["price"] = payment.toFixed(2);
        _data["url"] = r.url;
        this.$store.commit("setPayment", _data);
        this.$store.commit("set_payDialog", true);
      });
    },
    //选择有效期限
    changeTime(m, item) {
      // console.log(m);
      // console.log(item);
      item.checked = m;
    },

    //滚动页面，改变tab指向
    docScroll() {
      let scrollTop = window.scrollY;
      if (scrollTop >= document.querySelectorAll(".sec-hd")[0].offsetTop - 40) {
        this.tabActive = 1;
      }
      if (scrollTop >= document.querySelectorAll(".sec-hd")[1].offsetTop - 40) {
        this.tabActive = 2;
      }
      /*if (scrollTop >= document.querySelectorAll(".sec-hd")[2].offsetTop - window.innerHeight / 2) {
        this.tabActive = 3;
      }*/
      if (scrollTop < document.querySelectorAll(".sec-hd")[0].offsetTop - 40) {
        this.tabActive = 0;
      }
    },

    //点击tab滚动页面
    tabScroll(data) {
      let top = 0;
      switch (data) {
        case 0:
          top = 0;
          break;
        case 1:
          top = document.querySelectorAll(".sec-hd")[0].offsetTop - 40;
          break;
        case 2:
          top = document.querySelectorAll(".sec-hd")[1].offsetTop - 40;
          break;
        case 3:
          top = document.querySelectorAll(".sec-hd")[2].offsetTop - 40;
          break;
      }
      this.scrollTo(window.scrollY, top);
    },

    //滚动函数
    scrollTo(currentY, targetY) {
      // 计算需要移动的距离
      let needScrollTop = targetY - currentY;
      let _currentY = currentY;
      setTimeout(() => {
        // 一次调用滑动帧数，每次调用会不一样
        const dist = Math.ceil(needScrollTop / 10);
        _currentY += dist;
        window.scrollTo(_currentY, currentY);
        // 如果移动幅度小于十个像素，直接移动，否则递归调用，实现动画效果
        if (needScrollTop > 10 || needScrollTop < -10) {
          this.scrollTo(_currentY, targetY);
        } else {
          window.scrollTo(_currentY, targetY);
        }
      }, 1);
    }
  }
};
</script>

<style lang="scss">
.content-mall {
  background-color: #f7f7f7;
  padding-top: 40px;
  padding-bottom: 80px;
  .pay-result-dialog {
    .dialog-wrap {
      width: 410px;
    }
    .pay-result {
      .icon-success {
        display: block;
        width: 69px;
        height: 81px;
        background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-success.png");
        margin: 20px auto 0;
      }
      .icon-info {
        display: block;
        width: 69px;
        height: 81px;
        background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-info.png");
        margin: 20px auto 0;
      }
      .tip-msg {
        font-size: 18px;
        color: #333;
        line-height: 24px;
        text-align: center;
        margin-top: 20px;
      }
      .desc {
        text-align: center;
        font-size: 12px;
        color: #999;
        line-height: 20px;
        margin-top: 10px;
      }
      .btn-ensure {
        display: block;
        font-size: 14px;
        color: #fff;
        width: 130px;
        height: 40px;
        margin: 30px auto 10px;
        border-radius: 40px;
        background-color: #f362f5;
        background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      }
    }
  }
  .choose-dialog {
    .dialog-wrap {
      width: 552px;
      min-height: 500px;
    }
    .ward-step1 {
      .title {
        font-size: 20px;
        line-height: 2;
        color: #333;
        text-align: center;
        margin-bottom: 10px;
      }
      .tab-hd {
        height: 40px;
        border-bottom: 1px solid #ddd;
        padding-left: 40px;
        padding-right: 40px;
        > li {
          float: left;
          height: 40px;
          width: 50%;
          text-align: center;
          line-height: 24px;
          font-size: 16px;
          color: #999;
          &.on {
            color: #f362f5;
            span {
              &:after {
                content: "";
                position: absolute;
                left: 0;
                bottom: 0;
                width: 100%;
                height: 2px;
                background-color: #F362F5\9;
                background-image: linear-gradient(
                  90deg,
                  #f362f5 0%,
                  #a35afe 100%
                );
              }
            }
          }
          > span {
            display: inline-block;
            position: relative;
            height: 40px;
          }
        }
      }
      .no-data {
        height: 300px;
        display: table;
        width: 100%;
        text-align: center;
        font-size: 14px;
        color: #999;
        line-height: 20px;
        span {
          display: table-cell;
          vertical-align: middle;
        }
      }
      .scroller{
        height: 368px;
      }
      .user-list {
        height: 368px;
        > li {
          padding-top: 20px;
          padding-bottom: 20px;
          padding-right: 10px;
          overflow: hidden;
          position: relative;
          &:after {
            content: "";
            position: absolute;
            left: 65px;
            bottom: 0;
            width: calc(100% - 65px);
            height: 1px;
            background-color: #ddd;
          }
        }
        .avatar-wrap {
          float: left;
          width: 50px;
          height: 50px;
          margin-right: 15px;
        }
        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
        .middle {
          max-width: 300px;
          float: left;
          top {
            white-space: nowrap;
          }
        }
        .nickname {
          display: inline-block;
          vertical-align: middle;
          max-width: 7em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 18px;
          line-height: 30px;
        }
        .desc {
          font-size: 12px;
          color: #999;
          line-height: 20px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 6px;
        }
        .btn-text {
          float: right;
          background-color: transparent;
          color: #f162f5;
          height: 30px;
          font-size: 14px;
          margin-top: 8px;
        }
      }
    }
    .ward-step2 {
      text-align: center;
      .ward-user {
        padding-top: 20px;
        .avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
        }
        .ward-to {
          margin-top: 10px;
          font-size: 16px;
          color: #333;
          line-height: 24px;
          span {
            display: inline-block;
            vertical-align: middle;
          }
          .nickname {
            color: #ba77ff;
            max-width: 7em;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        .btn-change {
          font-size: 16px;
          line-height: 24px;
          color: #f362f5;
          cursor: pointer;
          display: inline-block;
          margin-top: 10px;
        }
      }
      .buy-ward {
        border-top: 1px solid #ddd;
        margin-top: 20px;
        padding-top: 30px;
        text-align: center;
        .ward-img {
          width: 74px;
          height: 76px;
        }
        .ward-name {
          font-size: 18px;
          color: #009dff;
          line-height: 30px;
          margin-top: 10px;
        }
        .btn-ward {
          width: 170px;
          height: 40px;
          border-radius: 44px;
          font-size: 14px;
          color: #fff;
          // margin-top: 30px;
          background-color: #F362F5\9;
          background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
        }
      }
      .wardBox {
        height: 135px;
      }
      .wardBox > div {
        width: 50%;
        float: left;
        // font-size: 12px;
        // color: #333333;
        // letter-spacing: 6px;
        // line-height: 12px;
      }
      .wardN {
        color: #009dff;
      }
      .wardCont {
        font-size: 12px;
        color: #ffab00;
      }
      .ward-img-wrap {
        text-align: right;
        padding: 5px 35px 0 0;
        box-sizing: border-box;
      }
      .ward-detail{
        text-align: left;
        font-size: 12px;
        color: #333333;
        li {
          margin-bottom: 10px;
        }
      }
    }
  }
  input[type="radio"] {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 3;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
  .red {
    color: #f53c80;
  }
  .blue {
    color: #1d97ff;
  }
  .purple {
    color: #a35afe;
  }
  .gold {
    color: #d49232;
  }
  .main {
    width: 1340px;
    margin: 0 auto;
    padding-left: 40px;
    padding-right: 40px;
    overflow: hidden;
    background-color: #fff;
    .tab-hd {
      height: 78px;
      margin-bottom: 20px;
      border-bottom: 1px solid #e6e6e6;
      li {
        float: left;
        margin-right: 42px;
        height: inherit;
        font-size: 18px;
        color: #999;
        line-height: 78px;
        position: relative;
        &.on {
          color: #333;
          &:after {
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 2px;
            background-color: #A35AFE\9;
            background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
          }
        }
      }
    }
    hr {
      border: 0;
      border-top: 1px solid #e6e6e6;
    }
  }
  .sec-hd {
    font-size: 24px;
    line-height: 44px;
    color: #333;
    margin-bottom: 30px;
    margin-top: 40px;
  }
  .gird-5 {
    float: left;
    width: 220px;
    height: 303px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 12px;
    text-align: center;
    padding: 20px 20px 10px;
    margin-bottom: 40px;
    position: relative;
    .icon {
      display: inline-block;
      width: 100px;
      height: 100px;
    }
    .name {
      color: #333;
      font-size: 16px;
      line-height: 24px;
      margin-top: 10px;
    }
    .price {
      color: #ffab00;
      font-size: 14px;
      line-height: 24px;
      margin-top: 4px;
    }
    .desc {
      font-size: 12px;
      color: #999;
      line-height: 20px;
      margin-top: 4px;
    }
    .btn {
      position: absolute;
      left: 50%;
      bottom: 20px;
      z-index: 2;
      margin-left: -50px;
      width: 100px;
      height: 32px;
      line-height: 30px;
    }
  }
  .gird-3 {
    width: 400px;
    float: left;
    margin-right: 30px;
    margin-bottom: 30px;
    &:nth-of-type(3n) {
      margin-right: 0;
    }
  }
  .gird-intro {
    background-color: #f7f7f7;
    border-radius: 12px;
    display: table;
    width: 400px;
    height: 160px;
    padding: 20px;
    dt {
      display: table-cell;
      vertical-align: middle;
      font-size: 16px;
      color: #333;
      line-height: 24px;
      text-align: center;
      width: 150px;
    }
    dd {
      display: table-cell;
      vertical-align: middle;
      width: 210px;
      .tip {
        color: #a35afe;
      }
    }
  }
  .desc-ul {
    > li {
      line-height: 22px;
      font-size: 12px;
      color: #999;
      margin-bottom: 2px;
      word-break: break-all;
      padding-left: 10px;
      position: relative;
      &:before {
        content: "";
        position: absolute;
        left: 0;
        top: 7px;
        width: 6px;
        height: 6px;
        background-color: #ffab00;
        border-radius: 50%;
      }
    }
  }
  .goods-li {
    padding: 30px 40px 90px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 12px;
    position: relative;
    .goods-dl {
      width: 100%;
      display: table;
      margin-bottom: 30px;
      dt,
      dd {
        display: table-cell;
        vertical-align: middle;
      }
      dt {
        padding-right: 46px;
        width: 130px;
        text-align: center;
      }
      .vip-img {
        width: 84px;
        height: 80px;
      }
      .ward-img {
        width: 100px;
        height: 104px;
      }
      .goods-name {
        font-size: 16px;
        line-height: 24px;
        margin-bottom: 6px;
        position: relative;
        display: inline-block;
      }
      .desc-ul {
        mark {
          background-color: transparent;
          color: #ffab00;
        }
      }
    }
    .vip-dl {
      min-height: 130px;
      .goods-name{
        margin-top: 10px;
      }
      .title{
        font-size: 16px;
        color: #999;
        line-height: 24px;
        margin-bottom: 10px;
      }
    }
    .ward-dl {
      min-height: 120px;
    }
    .check-list {
      overflow: hidden;
      margin-bottom: 30px;
      > li {
        cursor: pointer;
        float: left;
        min-width: 68px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        border-radius: 100px;
        margin-right: 15px;
        border: 1px solid #ccc;
        font-size: 12px;
        color: #999;
        &:last-of-type {
          margin-right: 0;
        }
        &.on {
          border-color: #f362f5;
          color: #f362f5;
        }
      }
    }
    .bottom {
      overflow: hidden;
      position: absolute;
      left: 0;
      bottom: 0;
      height: 92px;
      width: 100%;
      padding: 30px 40px;
      &:before {
        content: "";
        position: absolute;
        left: 40px;
        top: 0;
        width: 320px;
        height: 1px;
        background-color: #e6e6e6;
        margin: 0 auto;
      }
      .price {
        float: left;
        color: #999;
        font-size: 14px;
        line-height: 32px;
        b {
          font-size: 28px;
          color: #333;
          margin-right: 6px;
          vertical-align: sub;
        }
      }
      .btn {
        float: right;
        width: 100px;
        height: 32px;
        font-size: 14px;
        line-height: 30px;
      }
    }
  }
  .linear-btn {
    cursor: pointer;
    position: relative;
    font-size: 14px;
    text-align: center;
    color: #f362f5;
    border-radius: 100px;
    background-color: #F362F5\9;
    background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
    &:hover {
      color: #fff;
      span {
        background-color: transparent;
      }
    }
    span {
      position: absolute;
      left: 0px;
      top: 0px;
      z-index: 2;
      width: 100%;
      height: 100%;
      border: 1px solid transparent;
      background-color: #fff;
      border-radius: 100px;
      background-clip: content-box;
    }
  }
  .pay-mode-dialog {
    .dialog-wrap {
      padding-top: 80px;
      width: 760px;
      height: 500px;
    }
  }
  .pay-mode-wrap {
    .title {
      font-size: 22px;
      color: #333;
      line-height: 48px;
      text-align: center;
      margin-bottom: 80px;
      span {
        font-size: 34px;
        color: #ffab00;
        vertical-align: middle;
      }
    }
    .btn-next {
      cursor: pointer;
      background-color: #F362F5\9;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      border-radius: 6px;
      width: 260px;
      height: 66px;
      line-height: 66px;
      text-align: center;
      font-size: 20px;
      color: #fff;
      margin: 80px auto 0;
    }
  }
  .pay-type {
    overflow: hidden;
    > li {
      cursor: pointer;
      float: left;
      position: relative;
      width: 200px;
      height: 64px;
      overflow: hidden;
      text-align: center;
      margin-right: 40px;
      &:nth-of-type(3n) {
        margin-right: 0;
      }
      .pay-mode {
        width: 200px;
        height: 62px;
        overflow: hidden;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 10px 20px;
        line-height: 40px;
        position: relative;
      }
      input:checked + .pay-mode {
        border: 2px solid #ba77ff;
        &:after {
          content: "";
          position: absolute;
          right: 6px;
          bottom: 9px;
          width: 18px;
          height: 10px;
          border-bottom: 2px solid #fff;
          border-left: 2px solid #fff;
          transform: rotate(320deg);
        }
        &:before {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          background-color: #ba77ff;
          transform: rotate(55deg);
          right: -62px;
          bottom: -66px;
        }
      }
      i {
        display: inline-block;
        vertical-align: middle;
        width: 30px;
        height: 30px;
        margin-right: 15px;
      }
      .icon-alipay {
        background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-alipay.png")
          no-repeat center;
        background-size: 100%;
      }
      .icon-wxpay {
        background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-wxpay.png")
          no-repeat center;
        background-size: 100%;
      }
      .icon-qq {
        background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-qq.png")
          no-repeat center;
        background-size: 100%;
      }
      span {
        font-size: 22px;
        color: #333;
        vertical-align: middle;
      }
    }
  }
}
</style>
