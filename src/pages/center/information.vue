<template>
  <div class="info-conponent" v-if="info!=null">
    <div class="info-dl">
      <div class="info-dt"><img class="avatar" :src="info.avatar" alt=""></div>
      <div class="info-dd">
        <div class="block">
          <span class="nickname">{{info.nickname}}</span>
          <span class="sex-mark" :class="{'man':info.gender==1,'woman':info.gender==2}">
            <i class="icon-sex"></i>
            <i class="age">{{info.age}}</i>
          </span>
        </div>
        <span class="id-num">ID:{{info.uid}}</span>
      </div>
      <div class="right userBtnBox">
        <button class="btn-right" @click="$router.push({name:'Edit'})">编辑资料</button>
        <button class="btn-right" @click="userPage">个人主页</button>
      </div>
    </div>
    <h2 class="sec-hd">我的段位</h2>
    <ul class="grade-list">
      <li class="wealth-grade">
        <div class="grade-left">
          <span class="label">金币：</span>
          <i class="account" @click="coinBill">{{info.coins | formatNo}}</i>
          <!--<a class="btn" href="javascript:void(0)" @click="$router.push({path:'/recharge'})">充值</a>-->
          <router-link target="_blank" class="btn" :to="{path:'/recharge'}">充值</router-link>
        </div>
        <div class="grade-right">
          <span class="label">财富等级</span>
          <img :src="info.wealth_level_img" alt="" class="level-mark">
          <div class="rate-wrap">
            <div class="rate-bar">
              <div class="rate" :style="{width:(info.exp - info.wealth_level_cost_exp)/info.wealth_next_level_need_exp*100+'%'}"></div>
              <span class="rate-num">{{info.exp}}/{{info.wealth_next_level_cost_exp}}</span>
            </div>
            <p class="desc">还差{{info.wealth_next_level_need_exp}}金币就可以升级了!</p>
          </div>
        </div>
      </li>
      <li class="live-grade">
        <div class="grade-left clearfix">
          <span class="label">积分：</span>
          <i class="account" @click="moneyBill">{{info.money}}</i>
          <a class="btn" href="javascript:void(0)" @click="showWithdrawals=true">提现</a>
        </div>
        <div class="grade-right clearfix">
          <span class="label">魅力等级</span>
          <img :src="info.live_level_img" alt="" class="level-mark">
          <div class="rate-wrap">
            <div class="rate-bar">
              <div class="rate" :style="{width:(info.income-info.live_level_cost_income)/info.live_next_level_need_income*100+'%'}"></div>
              <span class="rate-num">{{info.income}}/{{info.live_next_level_cost_income}}</span>
            </div>
            <p class="desc">还差{{info.live_next_level_need_income}}积分就可以升级了!</p>
          </div>
        </div>
      </li>
    </ul>
    <h2 class="sec-hd">账号安全</h2>
    <ul class="settings">
      <li>
        <dl class="set-dl">
          <dt>
            <i class="icon-mobile"></i>
          </dt>
          <dd>
            <div class="title">绑定手机
              <span class="had" v-if="info && info.phone!=''">（已绑定）</span>
            </div>
            <span class="desc">可以使用手机号与密码进行登录</span>
          </dd>
        </dl>
        <button v-show="info && info.phone==''" class="btn-right" @click="showBind=true">立即绑定</button>
        <button v-show="info && info.phone!=''" class="btn-right" @click="showBind=true">更换手机</button>
      </li>
      <li>
        <dl class="set-dl">
          <dt>
            <i class="icon-safe"></i>
          </dt>
          <dd>
            <div class="title">实名认证</div>
            <span class="desc">可以使用手机号与密码进行登录</span>
          </dd>
        </dl>
        <button class="btn-right" v-if="!info.auth" @click="showAuth=true">立即认证</button>
        <div class="status" v-if="info.auth && info.auth.time>0">已认证</div>
        <div class="status" v-if="info.auth && info.auth.time==0 && info.auth.mark===''">审核中</div>
        <div class="right" v-if="info.auth && info.auth.mark!==''">
          <div class="failed">
            <i class="icon-warn">!</i>认证失败</div>
          <button class="btn-right" @click="showAuth=true;authStatus=true">重新认证</button>
        </div>
      </li>
    </ul>
    <a-dialog class="real-name-dialog" :isShow="showAuth" @closeDialog="closeAuth">
      <real-name :isFail="authStatus" @upload="closeAuth"></real-name>
    </a-dialog>
    <a-dialog :isShow="showBind" @closeDialog="closeBind">
      <div class="binding">
        <h3 class="title">手机绑定</h3>
        <div class="input-row">
          <label>手机号</label>
          <input v-model="phone" type="text" @input="warnMsg=''">
          <button class="btn-code" :disabled="isDisabled" @click="getCode">{{getCodeText}}</button>
        </div>
        <div class="input-row">
          <label>验证码</label>
          <input v-model="phoneCode" type="text" @input="warnMsg=''">
        </div>
        <div class="warn">{{warnMsg}}</div>
        <div class="btn-group">
          <button class="btn-cancel" @click="closeBind">取消</button>
          <button class="btn-ensure" @click="bindPhone">确定</button>
        </div>
      </div>
    </a-dialog>
    <a-dialog :isShow="showWithdrawals" @closeDialog="showWithdrawals=false">
      <div class="withdrawals-inner">
        <h3 class="title">申请提现</h3>
        <div class="label">当前可提现金额(元):</div>
        <div class="amount">{{ cashAmount | formatNo }}元</div>
        <div class="tip-msg" v-if="!isAuth">
          <i class="icon-tip">!</i>
          您还没有收款账号,请
          <span class="auth" @click="toAuth">实名认证</span>设置收款账号才能提现
        </div>
        <div class="rule-wrap">
          <h4 class="rule-title">提现规则</h4>
          <ul class="rule-list">
            <li>1100积分=1元人民币</li>
            <li>提现代扣8%税务服务费</li>
            <li>实际到账金额为可提现金额扣除税务服务费后的金额</li>
            <li>每天限提现1次,2个工作日后到</li>
          </ul>
        </div>
        <button class="btn" :disabled="!isAuth" @click="withdraw">提现</button>
        <div class="exchange" @click="toExchange">积分兑换金币</div>
      </div>
    </a-dialog>
    <a-dialog :isShow="showExchange" @closeDialog="showExchange=false">
      <div class="exchange-inner">
        <h3 class="title">积分兑换金币</h3>
        <div class="clearfix">
          <div class="my-score">我的积分：
            <i v-if="hostUser">{{hostUser.money}}</i>
          </div>
          <div class="ratio">兑换比例：{{ratio}}</div>
        </div>
        <ul class="recharge-list">
          <li v-show="coinList.length>0" class="recharge-item" v-for="(item,index) in coinList" :key="index">
            <input v-model="coinChecked" type="radio" name="coin" :value="index">
            <div :class="['coins-dl',{active:coinChecked==index}]">
              <i class="icon-checked"></i>
              <div class="coins-dt">
                <i class="icon-coin"></i>
                <span class="coin-num">{{item.coin | formatNo }}金币</span>
              </div>
              <dd class="coins-dd price">{{item.money | formatNo }}积分</dd>
            </div>
          </li>
        </ul>
        <button class="btn-exchange" @click="exchange">确认兑换</button>
      </div>
    </a-dialog>
    <a-dialog :isShow="exchangeSucc" @closeDialog="exchangeSucc=false">
      <div class="prompt-inner">
        <i class="icon-success"></i>
        <div class="tip-msg">兑换成功</div>
        <button class="btn-ensure" @click="exchangeSucc=false">确认</button>
      </div>
    </a-dialog>
    <a-dialog :isShow="withdrawalsSucc" @closeDialog="withdrawalsSucc=false">
      <div class="prompt-inner">
        <i class="icon-success"></i>
        <div class="tip-msg">申请成功</div>
        <p class="desc">提现金额:{{cashAmount | formatNo }}元，预计两个工作日后到账</p>
        <button class="btn-ensure" @click="withdrawalsSucc=false">确认</button>
      </div>
    </a-dialog>
    <a-dialog :isShow="showBill" @closeDialog="showBill=false">
      <div class="bill-inner">
        <h3 class="title" v-if="isCionBill">我的金币</h3>
        <h3 class="title" v-else>我的积分</h3>
        <div :class="['count',{coin:isCionBill,score:!isCionBill}]">{{amount | formatNo}}</div>
        <tab-hd :tabItem="billTab" @tabSuccess="tabBill"></tab-hd>
        <div class="scroller" @scroll="loadMore">
          <ul class="bill-list" v-if="isCionBill">
            <li v-if="billList.length>0" v-for="(item,index) in billList" :key="index">
              <div class="clearfix">
                <div class="desc">{{item.content}}</div>
                <div class="change coin">{{item.coins | formatNo}}</div>
              </div>
              <div class="clearfix">
                <time class="time">{{ item.created_at | formatDate }}</time>
                <span class="amount">{{item.has_coins | formatNo}}</span>
              </div>
            </li>
          </ul>
          <ul class="bill-list" v-if="!isCionBill">
            <li v-if="billList.length>0" v-for="(item,index) in billList" :key="index">
              <div class="clearfix">
                <div class="desc">{{item.content}}</div>
                <div class="change score">{{item.money | formatNo}}</div>
              </div>
              <div class="clearfix">
                <time class="time">{{ item.created_at | formatDate }}</time>
                <span class="amount">{{item.has_money | formatNo}}</span>
              </div>
            </li>
          </ul>
          <div class="loading-wave" v-if="loading">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="no-data" v-if="billList.length==0 && !loading">暂无更多数据~</div>
        </div>
      </div>
    </a-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { pathJudge, levelMark, defaultAvatar, formatTime } from "@/util/tools";
import ADialog from "@/components/dialog";
import RealName from "./realName";
import md5 from "js-md5";
import TabHd from "@/components/tab";

export default {
  components: {
    ADialog,
    RealName,
    TabHd
  },
  data() {
    return {
      info: null,
      showAuth: false, //实名认证弹框
      authStatus: false, //未认证，认证失败
      showBind: false, //绑定手机弹框
      showWithdrawals: false, //提现弹框
      phone: "",
      phoneCode: "",
      warnMsg: "",
      getCodeText: "获取验证码",
      isDisabled: false, //获取验证码按钮禁用
      isAuth: false, //已认证
      score: 0, //积分,
      exchangeSucc: false, //兑换成功弹框
      withdrawalsSucc: false, //兑换成功弹框
      showExchange: false, //兑换弹框
      coinChecked: 0, //选择兑换
      ratio: 0, //兑换比例
      coinList: [], //兑换列表
      showBill: false, //显示清单
      billList: [], //清单列表
      amount: 0, //账户余额
      isCionBill: true, // true 金币, false 积分
      billType: "", //全部、收入、支出
      pageIndex: 1,
      pageNum: 20, //每页20条
      loadFlag: true, //允许加载
      loading: false, //允许加载
      billTab: ["全部", "支出", "收入"] //清单tab,
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
    },
    formatDate(value) {
      return formatTime(value);
    }
  },
  computed: {
    ...mapState({
      hostUser: state => state.hostUser
    }),
    //计算可提现金额
    cashAmount() {
      return (this.score - this.score % 1100) / 1100;
    }
  },
  mounted() {
    this.dataInit();
  },
  methods: {
    userPage() {
      let routerData = this.$router.resolve({
        name: "Zone",
        params: { uid: this.hostUser.uid }
      });
      window.open(routerData.href, "_blank");
    },
    dataInit() {
      this.$get("/h5/user/profile").then(r => {
        if (r.http_code == 200) {
          r.data = levelMark(r.data);
          this.phone=r.data.phone||'';
          r.data.avatar =
            r.data.avatar != ""
              ? pathJudge(r.data.avatar)
              : defaultAvatar(r.data.avatar);
          this.info = r.data;
          this.score = this.info.money;
          if (
            this.info.auth &&
            this.info.auth.bank_state == 1 &&
            this.info.auth.time > 0 &&
            this.info.auth.mark != ""
          ) {
            this.isAuth = true;
          } else {
            this.isAuth = false;
          }
          // console.log(this.info)
        }
      });
    },

    closeAuth() {
      this.warnMsg = "";
      this.phone = "";
      this.phoneCode = "";
      this.showAuth = false;
      this.dataInit();
    },

    closeBind() {
      this.warnMsg = "";
      this.phone = "";
      this.phoneCode = "";
      this.showBind = false;
    },

    //获取验证码
    getCode() {
      if (!this.testPhone()) {
        return;
      }
      let count = 60;
      this.getCodeText = `${count--}s后重新获取`;
      this.isDisabled = true; //计时器开启时按钮不可点击
      let timer = setInterval(() => {
        if (count < 0) {
          count = 0;
          this.getCodeText = "重新获取验证码";
          this.isDisabled = false;
          window.clearInterval(timer);
        } else {
          let str = `${count--}s后重新获取`;
          this.getCodeText = str;
        }
      }, 1000);
      let time = new Date().getTime();
      let sign = md5("sms!e_e" + this.phone + time);

      this.$get("/h5/public/sms", {
        phone: this.phone,
        type: "bind",
        time: time,
        sign: sign
      }).then(r => {
        this.warnMsg = r.msg;
      });
    },

    //绑定手机号
    bindPhone() {
      if (!this.testPhone()) {
        return;
      }
      if (this.phoneCode.trim() == "") {
        this.warnMsg = "请输入验证码";
        return;
      }
      this.$get("/h5/user/bind", {
        phone: this.phone,
        code: this.phoneCode,
        change: this.info.phone == "" ? 0 : 1
      }).then(r => {
        this.$store.commit("setToast", r.msg);
        if (r.http_code == 200) {
          this.dataInit();
          this.closeBind();
        }
      });
    },

    //验证手机号
    testPhone() {
      let result = true;
      if (this.phone.trim() == "") {
        this.warnMsg = "请输入手机号";
        result = false;
      } else if (!/^1[345678][0-9]{9}$/.test(this.phone.trim())) {
        this.warnMsg = "手机号格式错误";
        result = false;
      }
      return result;
    },

    //提现
    withdraw() {
      this.$get("/h5/wealth/draw").then(r => {
        if (r.http_code == 200) {
          this.withdrawalsSucc = true;
        }
      });
    },

    //去认证
    toAuth() {
      this.showWithdrawals = false;
      this.showAuth = true;
    },

    //打开兑换弹框
    toExchange() {
      this.$get("/h5/wealth/exchange-config").then(r => {
        if (r.http_code == 200) {
          this.ratio = r.data.ratio;
          this.coinList = r.data.list;
          this.showWithdrawals = false;
          this.showExchange = true;
        }
      });
    },

    // 兑换
    exchange() {
      let money = Number(this.coinList[this.coinChecked].money);
      this.$get("/h5/wealth/exchange", {
        money: money
      }).then(r => {
        if (r.http_code == 200) {
          this.hostUser.money -= this.coinList[this.coinChecked].money;
          this.hostUser.coins += this.coinList[this.coinChecked].coin;
          this.$store.commit("setUser", this.hostUser);
          this.showExchange = false;
          this.exchangeSucc = true;
        }
      });
    },

    //tab清单
    tabBill(data) {
      this.billList = []; //清空列表
      this.index = 1;
      this.pageIndex=1;
      switch (data) {
        case 0:
          this.billType = "all";
          break;
        case 1:
          this.billType = "out";
          break;
        case 2:
          this.billType = "in";
          break;
      }
      this.getBill(this.billType);
    },

    //查看金币清单
    coinBill() {
      this.isCionBill = true;
      this.showBill = true;
      this.tabBill(0);
    },

    //查看积分清单
    moneyBill() {
      this.isCionBill = false;
      this.showBill = true;
      this.tabBill(0);
    },

    //获取清单
    getBill(listType) {
      let url = "";
      if (this.isCionBill) {
        url = "/h5/user/coin-log"; //金币
      } else {
        url = "/h5/user/money-log"; //积分
      }
      this.loading = true;
      this.$get(url, {
        flow: listType,
        page: this.pageIndex
      }).then(r => {
        this.loading = false;
        if (r.http_code == 200) {
          // console.log(r);
          let list = r.data.list;
          for (let i = 0; i < list.length; i++) {
            if (list[i].custom_text.custom.length > 0) {
              let str = list[i].custom_text.text;
              str = str.replace("[##]", list[i].custom_text.custom[0].title);
              if (list[i].custom_text.custom.length > 1) {
                str = str.replace("[##]", list[i].custom_text.custom[1].title);
              }
              list[i]["content"] = str;
            } else {
              list[i]["content"] = list[i].custom_text.text;
            }
          }

          this.amount = r.data.coins ? r.data.coins : r.data.money;
          if (this.pageIndex > 1) {
            this.billList = this.billList.concat(list);
          } else {
            this.billList = list;
          }
          if (list.length == this.pageNum) {
            this.loadFlag = true;
          } else {
            this.loadFlag = false;
          }
        }
      });
    },

    //加载更多
    loadMore(e) {
      let el = e.srcElement ? e.srcElement : e.target;
      if (
        el.scrollHeight - el.scrollTop - 10 < el.offsetHeight &&
        this.loadFlag
      ) {
        this.pageIndex++;
        this.getBill(this.billType);
        this.loadFlag = false;
      }
    }
  }
};
</script>

<style lang="scss">
.userBtnBox{
  button{
  margin-left: 15px;

  }
}
.info-conponent {
  padding: 40px;
  .real-name-dialog {
    .dialog-wrap {
      width: 820px;
    }
  }
  .binding {
    .title {
      font-size: 20px;
      color: #333;
      line-height: 1.5;
      margin-bottom: 40px;
    }
    .input-row {
      height: 40px;
      margin-top: 30px;
    }
    label {
      float: left;
      width: 4em;
      font-size: 14px;
      margin-right: 4px;
      color: #333;
      line-height: 40px;
    }
    input {
      float: left;
      width: 222px;
      height: 40px;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
      padding: 7px 8px;
      line-height: 24px;
      border: 1px solid #ccc;
    }
    .btn-code {
      float: left;
      min-width: 100px;
      height: 40px;
      border-radius: 4px;
      font-size: 14px;
      color: #fff;
      margin-left: 10px;
      background-color: #F362F5\9;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      &:disabled {
        cursor: auto;
        background: #ccc !important;
      }
    }
    .btn-group {
      text-align: right;
      margin-top: 30px;
      button {
        width: 64px;
        height: 34px;
        border-radius: 4px;
        font-size: 14px;
        margin-left: 10px;
      }
    }
    .btn-cancel {
      color: #333;
      background-color: transparent;
    }
    .btn-ensure {
      color: #fff;
      background: #cd5ef9;
    }
    .warn {
      font-size: 12px;
      color: #f00;
      height: 20px;
      line-height: 20px;
      padding-left: 60px;
      margin-top: 6px;
    }
  }
  .btn-right {
    width: 96px;
    height: 30px;
    border-radius: 4px;
    color: #f362f5;
    font-size: 14px;
    border: 1px solid #f362f5;
    background-color: #fff;
  }
  .info-dl {
    margin-bottom: 20px;
    overflow: hidden;
    .info-dt {
      float: left;
      width: 88px;
      height: 88px;
    }
    .avatar {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 8px;
    }
    .info-dd {
      float: left;
      padding-top: 16px;
      margin-left: 16px;
      max-width: 500px;
      .block {
        line-height: 30px;
      }
    }
    .nickname {
      color: #333;
      font-size: 20px;
      vertical-align: middle;
    }
    .level-mark {
      display: inline-block;
      vertical-align: middle;
      width: 40px;
      height: 20px;
      margin-left: 10px;
    }
    .id-num {
      display: block;
      font-size: 12px;
      color: #999;
      line-height: 20px;
      margin-top: 4px;
    }
    .right {
      margin-top: 29px;
    }
  }
  .sec-hd {
    font-size: 20px;
    color: #333;
    line-height: 2;
    font-weight: bold;
    margin-top: 30px;
    margin-bottom: 30px;
  }
  .grade-list {
    > li {
      overflow: hidden;
      margin-bottom: 25px;
      &.wealth-grade {
        .account {
          color: #ffab00;
        }
        .btn,
        .rate {
          background-color: #FEB954\9;
          background-image: linear-gradient(90deg, #feb954 0%, #f99302 100%);
        }
      }
      &.live-grade {
        .account {
          color: #f162f5;
        }
        .rate,
        .btn {
          background-color: #F362F5\9;
          background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
        }
      }
    }
    .grade-left {
      float: left;
      width: 280px;
      margin-right: 30px;
      line-height: 20px;
      .label {
        font-size: 12px;
        color: #999;
      }
      .account {
        font-size: 12px;
        text-decoration: underline;
        cursor: pointer;
      }
      .btn {
        display: inline-block;
        min-width: 40px;
        height: 20px;
        padding-left: 8px;
        padding-right: 8px;
        line-height: 20px;
        text-align: center;
        font-size: 12px;
        color: #fff;
        border-radius: 20px;
        margin-left: 10px;
      }
    }
    .grade-right {
      overflow: hidden;
      .label {
        float: left;
        font-size: 14px;
        color: #333;
        line-height: 24px;
      }
      .level-mark {
        width: 25px;
        height: 12px;
        float: left;
        margin-top: 6px;
        margin-left: 8px;
      }
      .rate-wrap {
        float: left;
        margin-left: 20px;
        margin-top: 6px;
        text-align: center;
      }
      .rate-bar {
        width: 200px;
        height: 12px;
        position: relative;
        background-color: #ccc;
        border-radius: 7px;
        overflow: hidden;
      }
      .rate {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        //transform: translate(-100%);
        border-radius: 7px;
        transition: all 0.3s ease-in 0.4s;
      }
      .rate-num {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        font-size: 12px;
        line-height: 1;
        color: #fff;
      }
      .desc {
        display: block;
        font-size: 12px;
        color: #999;
        line-height: 20px;
        margin-top: 4px;
      }
    }
  }
  .settings {
    > li {
      overflow: hidden;
      margin-bottom: 40px;
      .btn-right {
        float: right;
        margin-top: 7px;
      }
      .failed {
        float: left;
        margin-top: 7px;
        line-height: 30px;
        margin-right: 10px;
        font-size: 14px;
        color: #333;
      }
      .icon-warn {
        display: inline-block;
        vertical-align: middle;
        margin-top: -2px;
        width: 16px;
        height: 16px;
        background: #f00;
        border-radius: 50%;
        text-align: center;
        line-height: 15px;
        color: #fff;
        margin-right: 10px;
      }
      .status {
        float: right;
        width: 96px;
        text-align: center;
        font-size: 14px;
        color: #999;
        line-height: 30px;
        margin-top: 7px;
      }
    }
    .set-dl {
      float: left;
      max-width: 80%;
      overflow: hidden;
      dt {
        float: left;
        width: 32px;
        height: 32px;
        margin-top: 6px;
        margin-right: 20px;
        i {
          display: block;
          height: inherit;
        }
      }
      .icon-mobile {
        background: url("https://lib.liaoke.tv/lib/pc/static/img/center/icon-mobile.png")
          no-repeat center / contain;
      }
      .icon-safe {
        background: url("https://lib.liaoke.tv/lib/pc/static/img/center/icon-safe.png")
          no-repeat center / contain;
      }
      dd {
        float: left;
      }
      .title {
        font-size: 14px;
        color: #333;
        line-height: 24px;
        .had {
          padding-left: 10px;
          color: #999;
          font-size: 12px;
        }
      }
      .desc {
        font-size: 12px;
        color: #999;
        line-height: 20px;
      }
    }
  }
  .exchange-inner {
    min-width: 580px;
    .title {
      font-size: 18px;
      color: #333;
      text-align: center;
      line-height: 40px;
      margin-bottom: 30px;
    }
    .my-score {
      font-size: 14px;
      color: #666;
      line-height: 24px;
      float: left;
      i {
        color: #f162f5;
      }
    }
    .ratio {
      float: right;
      font-size: 14px;
      color: #999;
      line-height: 24px;
    }
    .btn-exchange {
      display: block;
      width: 130px;
      height: 40px;
      border-radius: 40px;
      color: #fff;
      font-size: 14px;
      background-color: #F362F5\9;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      margin: 15px auto 20px;
    }
  }
  .recharge-list {
    overflow: hidden;
    margin-top: 10px;
    > li {
      float: left;
      width: 180px;
      height: 70px;
      margin-right: 20px;
      margin-bottom: 20px;
      position: relative;
      &:nth-of-type(3n) {
        margin-right: 0;
      }
      input:checked + .coins-dl {
        &:before {
          border: 2px solid #ba77ff;
        }
        .icon-checked {
          &:after {
            content: "";
            position: absolute;
            right: 6px;
            bottom: 6px;
            width: 14px;
            height: 7px;
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
            right: -66px;
            bottom: -70px;
          }
        }
      }
    }
    .coins-dl {
      cursor: pointer;
      width: 100%;
      height: 70px;
      border-radius: 4px;
      padding: 10px 20px;
      position: relative;
      overflow: hidden;
      &:before {
        content: "";
        box-sizing: border-box;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        width: 100%;
        height: 100%;
        border: 1px solid #cccccc;
        border-radius: 4px;
      }
    }
    .coins-dt {
      position: relative;
      padding-left: 26px;
      .icon-coin {
        width: 18px;
        height: 18px;
        position: absolute;
        left: 0;
        top: 3px;
        background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-coin.png")
          no-repeat center;
        background-size: contain;
      }
      .coin-num {
        white-space: nowrap;
        font-size: 16px;
        color: #333;
        line-height: 24px;
      }
    }
    .price {
      font-size: 14px;
      color: #999;
      line-height: 1.5;
      margin-top: 6px;
      padding-left: 26px;
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
  }
  .prompt-inner {
    width: 338px;
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
      margin-top: 30px;
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
      margin: 30px auto 20px;
      border-radius: 40px;
      background-color: #f362f5;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
    }
  }
  .withdrawals-inner {
    width: 568px;
    text-align: center;
    .title {
      line-height: 40px;
      font-size: 18px;
      color: #333;
      margin-bottom: 30px;
    }
    .label {
      font-size: 12px;
      color: #999;
      line-height: 20px;
      margin-bottom: 15px;
    }
    .amount {
      font-size: 26px;
      color: #333;
      line-height: 40px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .tip-msg {
      font-size: 12px;
      color: #999;
      line-height: 20px;
      margin-bottom: 15px;
      .icon-tip {
        display: inline-block;
        vertical-align: middle;
        margin-top: -3px;
        margin-right: 10px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #fb6062;
        color: #fff;
        line-height: 16px;
        font-size: 12px;
        text-align: center;
      }
      .auth {
        color: #f264f6;
        text-decoration: underline;
        cursor: pointer;
      }
    }
    .rule-wrap {
      padding: 15px 30px;
      background-color: #f9f9f9;
    }
    .rule-title {
      font-size: 14px;
      color: #333;
      line-height: 24px;
      text-align: left;
      margin-bottom: 10px;
    }
    .rule-list {
      text-align: left;
      > li {
        font-size: 12px;
        color: #999;
        line-height: 20px;
        position: relative;
        margin-bottom: 6px;
        padding-left: 15px;
        &:before {
          content: "";
          position: absolute;
          left: 0;
          top: 7px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #999;
        }
      }
    }
    .btn {
      display: block;
      width: 100px;
      height: 34px;
      border-radius: 100px;
      color: #fff;
      font-size: 12px;
      background-color: #F362F5\9;
      background-image: linear-gradient(-135deg, #f362f5 0%, #a35afe 100%);
      margin: 24px auto 10px;
      &:disabled {
        background-color: #ccc;
        background-image: none;
        cursor: not-allowed;
      }
    }
    .exchange {
      cursor: pointer;
      display: inline-block;
      font-size: 12px;
      color: #666;
    }
  }
  .bill-inner {
    width: 488px;
    .title {
      font-size: 18px;
      color: #333;
      text-align: center;
      line-height: 40px;
      margin-bottom: 10px;
    }
    .count {
      font-size: 26px;
      line-height: 40px;
      font-weight: bold;
      text-align: center;
    }
    .tab-hd {
      border-bottom: 1px solid #ddd;
      height: 44px;
      > li {
        float: left;
        width: 33.3333%;
        height: 44px;
        font-size: 14px;
        text-align: center;
        span {
          display: inline-block;
          position: relative;
          height: 44px;
          line-height: 42px;
        }
        &.on {
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
      }
    }
    .scroller {
      height: 332px;
    }
    .no-data {
      text-align: center;
      font-size: 14px;
      color: #999;
      margin-top: 20px;
    }
    .bill-list {
      > li {
        border-bottom: 1px solid #ddd;
        padding: 10px 0;
        .desc {
          float: left;
          font-size: 14px;
          color: #666;
          line-height: 24px;
          max-width: 360px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .change {
          float: right;
          font-size: 14px;
          line-height: 24px;
        }
        .time {
          float: left;
          font-size: 12px;
          line-height: 20px;
          color: #999;
        }
        .amount {
          float: right;
          font-size: 12px;
          line-height: 20px;
          color: #999;
        }
      }
    }
    .coin {
      color: #ffab00;
    }
    .score {
      color: #f162f5;
    }
  }
}
</style>
