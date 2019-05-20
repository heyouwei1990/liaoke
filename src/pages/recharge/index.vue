<template>
  <div class="component-recharge">
    <div class="main clearfix">
      <div class="content-sec">
        <div class="title-sec">
          <h2 class="title">充值金币</h2>
          <span class="account">我的账户金币：
            <i class="amount">{{ hostUser?hostUser.coins:0 | formatNo}}</i>
          </span>
        </div>
        <ul class="recharge-list">
          <li v-show="coinList.length>0" class="recharge-item" v-for="(item,index) in coinList" :key="index">
            <input v-model="coinChecked" type="radio" name="coin" :value="item">
            <div :class="['coins-dl',{active:coinChecked==index}]">
              <div class="coins-dt">
                <i class="icon-coin"></i>
                <span class="coin-num">{{item.coin | formatNo}}金币</span>
              </div>
              <dd class="coins-dd price">¥{{item.rmb | formatNo}}</dd>
            </div>
            <div class="tip" v-if="item.intro">({{item.intro}})</div>
          </li>
        </ul>
        <!-- <hr> -->
        <h3 class="pay-hd">选择支付方式</h3>
        <ul class="pay-type">
          <li v-for="(item,index) in paymentList" :key="index">
            <input v-model="payMode" type="radio" name="mode" :value="item.key">
            <div class="pay-mode">
              <i :class="item.icon"></i>
              <span>{{item.label}}</span>
            </div>
          </li>
        </ul>
        <hr>
        <div class="payment">
          <span class="label">实付金额：</span>
          <i class="total-price">{{total.rmb | formatNo}}元</i>
          <span class="total-coins">（{{total.coins | formatNo}}金币）</span>
        </div>
        <div class="btn-pay" @click="pay">确认支付</div>
      </div>
      <div class="aside-sec">
        <div class="sec">
          <h5>1元=1000金币</h5>
          <p>金币是您在本平台内消费使用的虚拟货币形式，您可以通过以下方式获得：</p>
          <ul class="use">
            <li>充值金币</li>
            <li>充值VIP</li>
            <li>分享直播间</li>
            <li>直播间送礼</li>
          </ul>
        </div>
        <div class="sec">
          <h5>您可以用金币进行:</h5>
          <ul class="use">
            <li>直播间送货礼物</li>
            <li>速配聊天</li>
            <li>私聊</li>
            <li>购买守护</li>
            <li>消费升级等级</li>
          </ul>
        </div>
        <div class="sec">
          <h5>在线客服:
            <router-link :to="{name:'CustomService'}" target="_blank" class="qq-server" ></router-link>
          </h5>
          <p>聊客平台客服24小时全天在线 <br> 有任何问题请咨询客服</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      coinList: [],
      coinChecked: null,
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
      codeImg: "",
      total: { rmb: 0, icons: 0 } //总价和金币数
    };
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
  watch: {
    coinChecked(v) {
      let extra = v.intro.replace(/\D+/g, "");
      extra = extra === "" ? 0 : parseInt(extra);
      this.total.rmb = v.rmb;
      this.total.coins = parseInt(v.coin) + extra;
    },
    hostUser(v) {
      if (v) {
        this.dataInit();
      }
    }
  },
  mounted() {
    this.dataInit();
  },
  methods: {
    dataInit() {
      let uid = this.hostUser?Number(this.hostUser.uid):null;
      let _url = window.location.href;
      this.$get("/pay", {
        uid: uid,
        referer: _url,
        format: "json"
      }).then(r => {
        this.coinList = r.coin_list.list;
        this.coinChecked = this.coinList[0];
      });
    },
    pay() {
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      let uid = Number(this.hostUser.uid);
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
      this.$get("/pay/qr", {
        uid: Number(this.hostUser.uid),
        rmb: Number(this.coinChecked.rmb),
        server: this.payMode
      }).then(r => {
        let _data = {};
        _data["label"] = text;
        _data["price"] = Number(this.total.rmb).toFixed(2);
        _data["url"] = r.url;
        console.log(r)
        this.$store.commit("setPayment", _data);
        this.$store.commit("set_payDialog", true);
      });
    }
  }
};
</script>

<style lang="scss">
.component-recharge {
  background-color: #f7f7f7;
  padding: 40px 0 80px;
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
  .main {
    width: 1340px;
    margin: 0 auto;
    padding: 40px;
    background-color: #fff;
  }
  .content-sec {
    float: left;
    width: 940px;
    hr {
      border: 0;
      border-top: 1px solid #e6e6e6;
      margin-bottom: 43px;
    }
  }
  .title-sec {
    margin-bottom: 40px;
    .title {
      display: inline-block;
      margin-right: 40px;
      font-size: 20px;
      color: #333;
      line-height: 2;
    }
    .account {
      font-size: 14px;
      color: #666;
      line-height: 1.5;
      .amount {
        color: #f162f5;
      }
    }
  }
  .recharge-list {
    overflow: hidden;
    margin-bottom: 50px;
    > li {
      font-size: 16px;
      float: left;
      // width: 260px;
      width: 170px;
      // height: 154px;
      height: 70px;
      margin-right: 20px;
      // margin-bottom: 20px;
      margin-bottom: 30px;
      position: relative;
      &:nth-of-type(5n) {
        margin-right: 0;
      }
      input:checked + .coins-dl {
        border: 2px solid #ba77ff;
        &:after {
          content: "";
          position: absolute;
          right: 4px;
          bottom: 6px;
          width: 14px;
          height: 6px;
          border-bottom: 2px solid #fff;
          border-left: 2px solid #fff;
          transform: rotate(-40deg);
        }
        &:before {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          background-color: #ba77ff;
          transform: rotate(55deg);
          right: -70px;
          bottom: -70px;
        }
      }
    }
    .coins-dl {
      cursor: pointer;
      width: 100%;
      height: 70px;
      border: 1px solid #cccccc;
      border-radius: 8px;
      padding: 10px 0 10px 20px;
      position: relative;
      overflow: hidden;
      /*text-align: center;*/
    }
    .coins-dt {
      white-space: nowrap;
      position: relative;
      padding-left: 26px;
      .icon-coin {
        position: absolute;
        left: 0px;
        top: 2px;
        width: 20px;
        height: 20px;
        /*display: inline-block;
        vertical-align: middle;
        margin-right: 5px;*/
        background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-coin.png")
          no-repeat center;
        background-size: contain;
      }
      .coin-num {
        font-size: 16px;
        color: #333;
        line-height: 24px;
      }
    }
    .price {
      color: #999;
      line-height: 1.5;
      padding-left: 26px;
    }
    .tip {
      font-size: 14px;
      color: #f162f5;
      line-height: 1.5;
      text-align: center;
    }
  }
  .pay-hd {
    font-size: 20px;
    line-height: 2;
    color: #333;
    margin-bottom: 30px;
  }
  .pay-type {
    overflow: hidden;
    > li {
      cursor: pointer;
      float: left;
      position: relative;
      width: 146px;
      //  width: 170px;
      height: 58px;
      overflow: hidden;
      text-align: center;
      margin-right: 20px;
      margin-bottom: 50px;
      &:nth-of-type(3n) {
        margin-right: 0;
      }
      .pay-mode {
        width: 146px;
        height: 58px;
        overflow: hidden;
        border: 1px solid #ccc;
        border-radius: 8px;
        // padding: 18px 20px;
        position: relative;
        line-height: 56px;
      }
      input:checked + .pay-mode {
        border: 2px solid #ba77ff;
        &:after {
          content: "";
          position: absolute;
          right: 4px;
          bottom: 6px;
          width: 14px;
          height: 6px;
          border-bottom: 2px solid #fff;
          border-left: 2px solid #fff;
          transform: rotate(-40deg);
        }
        &:before {
          content: "";
          position: absolute;
          width: 95px;
          height: 95px;
          background-color: #ba77ff;
          -webkit-transform: rotate(55deg);
          transform: rotate(55deg);
          right: -66px;
          bottom: -66px;
        }
      }
      i {
        display: inline-block;
        vertical-align: middle;
        width: 26px;
        height: 26px;
        margin-right: 10px;
        margin-top: -3px;
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
        font-size: 16px;
        color: #333;
      }
    }
  }
  .payment {
    margin-bottom: 30px;
    // line-height: 60px;
    .label {
      font-size: 20px;
      color: #333;
    }
    .total-price {
      font-size: 24px;
      color: #ffab00;
    }
    .total-coins {
      font-size: 14px;
      color: #666;
    }
  }
  .btn-pay {
    cursor: pointer;
    display: block;
    width: 96px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    font-size: 14px;
    color: #fff;
    background-color: #F362F5\9;
    background-image: linear-gradient(-90deg, #f362f5 0%, #a35afe 100%);
    border-radius: 6px;
    margin-top: 30px;
    margin-bottom: 80px;
  }
  .aside-sec {
    float: right;
    width: 290px;
    min-height: 549px;
    margin-top: 80px;
    border: 1px solid #ccc;
    border-radius: 8px;
    padding: 40px 30px;
    box-sizing: border-box;
    .sec {
      margin-bottom: 40px;
    }
    h5 {
      font-size: 18px;
      color: #333;
      line-height: 2;
      margin-bottom: 15px;
    }
    p {
      font-size: 14px;
      color: #666;
      line-height: 20px;
    }
    .qq-server {
      display: inline-block;
      vertical-align: middle;
      width: 75px;
      height: 24px;
      margin-top: -3px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-server.png")
        no-repeat center;
      background-size: 100%;
    }
    .use {
      li {
        position: relative;
        font-size: 14px;
        color: #666;
        line-height: 20px;
        margin-bottom: 6px;
        padding-left: 24px;
        &:before {
          content: "";
          position: absolute;
          left: 3px;
          top: 2px;
          width: 6px;
          height: 10px;
          border-bottom: 2px solid #ccc;
          border-right: 2px solid #ccc;
          transform: rotate(45deg);
        }
      }
    }
  }
}
</style>
