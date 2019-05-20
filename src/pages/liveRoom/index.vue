<!--直播间主页面-->
<template>
  <div class="content-room">

    <!-- 连麦列表 -->
    <div :id="list.id" v-if="list.type" v-for="list in talkUserObj" :key="list.id"></div>
    <!-- <mqtt v-if="mqttType" :topicArr="topc" @onmessageArrived="onMessageArrived"></mqtt> -->
    <div class="main main-view">
      <div class="bullet-screen">
        <transition-group name="bullet" tag="ul" @before-enter="bulletBeforeEnter" @enter="bulletEnter">
          <li v-if="bulletList.length>0" class="bullet" v-for="(item,index) in bulletList" :key="item.new_key">
            <img class="avatar" :src="item.user.avatar" alt="">
            <span class="nickname">{{item.user.nickname}}：</span>
            <span class="msg-nowrap" v-html="item.msg.content"></span>
          </li>
        </transition-group>
      </div>
      <div class="view-l video-area" ref="view_l">
        <div id="liveMedia_wrapper">
          <a class="download" href='http://www.adobe.com/go/getflashplayer' target="_blank">
            <img src='http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif' alt='Get Adobe Flash player' />
          </a>
        </div>
        <!-- 连麦 -->
        <div class="talkUserBox" v-if="talkUser.length">
          <div class="taItem" v-if="showtalkUser" v-for="(item,talkUserIndex) in talkUser" :key="talkUserIndex" @click="toUserIndex(item.uid)" @mouseenter="showMenu(item.uid)" @mouseleave="isShowMenu=false">
            <img :src="item.avatar" alt="" class="avatar">
            <img :src="item.vip_img" class="vip_img" v-if="item.vip_img" alt="">
            <img :src="item.wardI" class="ward_img" v-if="item.wardI" alt="">
            <span class="voice-wave"></span>
          </div>
          <!-- showtalkUser -->
          <div class="bthBox" @click="showtalkUser=!showtalkUser">
            {{showtalkUser==false?'连麦':'收起'}}
            <img :class="showtalkUser==false?'imgR':''" src="https://lib.liaoke.tv/lib/pc/static/img/lianmai.png" alt="">
            <!-- https://lib.liaoke.tv/lib/pc/static/img/lianmai.png -->
          </div>
        </div>

        <!--  -->
        <div class="focus-wrap">
          <dl class="anthor-dl" v-if="anchorInfo">
            <dt @click="toUserIndex(anchorInfo.id)"><img :src="anchorInfo.avatar" alt=""></dt>
            <dd>
              <div class="nickname">
                <img :src="anchorInfo.live_level_img" alt="" class="level-mark">
                <span class="nickname">{{anchorInfo.nickname}}</span>
              </div>
              <div class="integral">积分: {{anchorInfo.income | formatNo}}</div>
            </dd>
          </dl>
          <button class="btn-focus" v-if="anchorInfo && anchorInfo.is_fav===0" @click="focus(anchorInfo.id)">关注</button>
        </div>
        <div class="bullet-gift" v-if="runningMsg" @click="toUserIndex(runningMsg.custom[1].params.id)">
          <div class="bullet-info">
            <span class="nickname">{{runningMsg.custom[0].title}}</span>
            <span class="label">送给</span>
            <span class="nickname">{{runningMsg.custom[1].title}}</span>
            <span class="gift-name">{{runningMsg.content}}</span>
            <img class="gift-mark" :src="runningMsg.custom[2].params.url" alt="">
          </div>
        </div>
        <gift-show :list="giftShowList" @leftOut="giftOut" @lookInfo="showInfo"></gift-show>
        <prize-show :list="prizeShowList" @leftOut="prizeOut" @lookInfo="showInfo"></prize-show>
        <!--<div class="bottom"></div>-->
        <room-in :list="roomInList" @runOut="roomInOut" @lookInfo="showInfo"></room-in>
        <!-- 大哈利动画 -->
        <transition name="prize-pop" @enter="popEnter">
          <!-- :class="{small:prizeBroadcast.roomid!=roomId}" -->
          <div v-if="prizeBroadcast" :key="prizeBroadcast.id" class="prize-Popup">
            <div class="bg-light"></div>
            <div class="prize-img"></div>
            <div class="tip-info">
              <div class="nickname">{{prizeBroadcast.user_nickname}}</div>
              <div class="text">喜获{{prizeBroadcast.win_coin}}金币</div>
            </div>
            <audio v-if="prizeBroadcast.roomid==roomId" id="prizeAudio" autoplay src="https://asset.liaoke.tv/assets/gift/haliluya.mp3"></audio>
          </div>
        </transition>

        <!-- 小哈利 -->
        <transition name="prize-pop" @enter="popEnterMin">
          <!-- :class="{small:prizeBroadcastMin.roomid!=roomId}" -->
          <div v-if="prizeBroadcastMin" :key="prizeBroadcastMin.id" class="prize-Popup small">
            <div class="bg-light"></div>
            <div class="prize-img"></div>
            <div class="tip-info">
              <div class="nickname">{{prizeBroadcastMin.user_nickname}}</div>
              <div class="text">喜获{{prizeBroadcastMin.win_coin}}金币</div>
            </div>
            <!-- <audio v-if="prizeBroadcastMin.roomid==roomId" id="prizeAudio" autoplay src="https://asset.liaoke.tv/assets/gift/haliluya.mp3"></audio> -->
          </div>
        </transition>

      </div>
      <div class="view-m msg-area">
        <tab-hd class="top-tab" :tabItem="msgTab" @tabSuccess="tabShowMsg"></tab-hd>
        <div class="jrmx_box" @click="showMx">今日明细</div>
        <div class="msg-view">
          <div class="highlight-msg" id="speakMsg" v-if="speaker" @click="$router.push({name:'LiveRoom',params:{uid:speaker.user.in_room}})">
            <div class="left clearfix" ref="speakLeft">
              <i class="icon icon-speaker"></i>
              <img class="avatar" :src="speaker.user.avatar" alt="avatar">
              <div class="nickname">
                <span>{{speaker.user.nickname}}</span>
                <i>：</i>
              </div>
            </div>
            <div class="msg-text" ref="speakText">
              <span v-html="speaker.msg.content"></span>
            </div>
          </div>
          <msg-list v-if="msgBd===0" :anchor="anchorInfo" :list="allMsgList" :list-type="msgBd" @lookInfo="showMenu" @leave="isShowMenu=false"></msg-list>
          <msg-list v-if="msgBd===1" :anchor="anchorInfo" :list="roomMsgList" :list-type="msgBd" @lookInfo="showMenu" @leave="isShowMenu=false"></msg-list>
          <msg-list v-if="msgBd===2" :anchor="anchorInfo" :list="talkMsgList" :list-type="msgBd" @lookInfo="showMenu" @leave="isShowMenu=false"></msg-list>
        </div>
        <div class="ctrl-area">
          <msg-pop @fly="fly" @speak="speak" :msgpopdata="msgpopdata" :showType="msgpopType" @setshowType='msgpopType=0' @inputFace="inputFace"></msg-pop>
          <div class="input-area">
            <input v-model="message" ref="msgInput" type="text" @keydown.enter="sendMsg" placeholder="说点什么吧">
            <button class="btn-submit" @click="sendMsg">发送</button>
          </div>
          <!-- anioutleft  aniinleft prizeTipsClass -->
          <!-- @enter="prizeTipEnter" -->
          <transition-group tag="ul" class="prize-tip" :class="prizeTipsClass?'aniinleft':'anioutleft'">
            <li v-for="(item,index) in prizeTips" :key="item.id" v-if="prizeTips.length>0">
              <img src="https://lib.liaoke.tv/lib/pc/static/img/room/prize-tip.png" alt="">
              <span>金币×
                <i class="coins">{{ item.coins | formatNo }}</i>
              </span>
            </li>
          </transition-group>
          <gift-area @chooseGift="checkGift" :changeGift='ischangeGift' @setbtnText="setsendbtnTextType" :roomId="roomId" @swipeTab="swipeTabhd">
            <div class="coins">
              <i class="icon icon-coin"></i>
              <span>{{ toLocal(!hostUser?0:hostUser.coins) }}</span>
              <a class="btn-recharge" href="javascript:void(0)" @click="goRecharge">充值</a>
            </div>
          </gift-area>
          <div class="gift-ctrl clearfix" v-if="showSendBar">
            <div class="left">
              <span class="label">送给:</span>
              <div class="select-wrap" @click.stop="toggleSelect">
                <span class="nickname" v-if="giftTo">{{ giftTo.nickname }}</span>
                <ul class="select-ul" v-show="selectShow">
                  <li v-if="toPersonList.length>0" :class="{selected:toPersonIndex===index,living:item.uid==roomId}" v-for="(item, index) in toPersonList" :key="index" @click="selectPerson(item,index)">
                    {{item.nickname}}
                  </li>
                </ul>
                <!--<select-el v-show="selectShow" :options="toPersonList" :selected="toPersonIndex" @change="selectPerson"></select-el>-->
              </div>
            </div>
            <div class="right">
              <span class="label">数量</span>
              <div class="amount">
                <gift-amount :options="amountList" :minVal="amount" @onchange="change"></gift-amount>
              </div>
              <button class="btn-send" @click="sendGift">赠送</button>
            </div>
          </div>
        </div>
      </div>
      <div class="view-r">
        <div class="about-anchor">
          <tab-hd :tabItem="aboutAnchorTab" @tabSuccess="tabAbout"></tab-hd>
          <div class="fans-wrap" v-if="tabBody==0" @mouseover="fansFlag=true" @mouseleave="fansFlag=false">
            <fans :list="fansList"></fans>
            <div v-if="fansList.length==0" class="no-data">
              <span class="tip">暂无粉丝贡献~<br>给主播送个礼物吧~</span>
            </div>
          </div>
          <div class="scroll-wrapper" v-if="tabBody==1" @scroll="minderScroll">
            <anchor-manager :list="anchorMinderList" :isAppend="true" @append="wardAnchor"></anchor-manager>
            <div class="loading-wave" v-if="minderLoading">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div v-if="anchorMinderList.length==0 && !minderLoading" class="no-data">
              <span class="tip">主播这么辛苦,还没有守护~</span>
              <button class="btn" @click="wardAnchor">立即开通守护</button>
            </div>
          </div>
          <div class="scroll-wrapper" v-if="tabBody==2" @scroll="managerScroll">
            <anchor-manager :list="anchorManagerList"></anchor-manager>
            <div class="loading-wave" v-if="managerLoading">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div v-if="anchorManagerList.length==0 && !managerLoading" class="no-data">
              <span class="tip">暂无管理员~</span>
            </div>
          </div>
        </div>
        <div class="visitor-wrapper">
          <div class="head">
            <span class="left">在线: {{onlineVisit}}人</span>
            <span class="right">累计观看: {{totalVisit}} 人</span>
          </div>
          <div class="scroll-wrapper" ref="anchor" @scroll="onlineScroll">
            <ul class="visitor-list">
              <li v-for="(item, index) in onlineList" :key="index" v-if="onlineList.length>0 && item.uid!=roomId">
                <dl class="visitor-dl" @mouseenter="showMenu(item.id)" @mouseleave="isShowMenu=false">
                  <dt>
                    <img class="avatar" :src="item.avatar" alt="">
                  </dt>
                  <dd>
                    <img class="level-mark" :src="item.wealth_level_img" alt="">
                    <img v-if="item.vip_img" class="vip-mark" :src="item.vip_img" alt="">
                    <img v-if="item.ward_img" class="ward-mark" :src="item.ward_img" alt="">
                    <span class="nickname">{{item.nickname}}</span>
                    <!--<img class="level-mark" :src="item.live_level_img" alt="">-->
                  </dd>
                </dl>
              </li>
            </ul>
            <div class="loading-wave" v-if="onlineLoading">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
      <div class="flash-area" id="flashArea">
        <div class="flash-item" v-if="flashList.length>0" v-for="(item,index) in flashList" :key="index" :id="item.id" :style="item.css">

        </div>
      </div>
    </div>
    <div class="recommended-wrap">
      <div class="main">
        <h3 class="sec-hd">推荐主播</h3>
        <ul class="anchor-list clearfix" v-if="anchorList.length>0">
          <li v-for="(item, index) in anchorList" :key="index" @click="replacePage(item.uid)">
            <anchor-item :info="item"></anchor-item>
          </li>
        </ul>
      </div>
    </div>
    <!--<a-dialog class="info-dialog" :isShow="isShowInfo" @closeDialog="closeInfo">
    <info-detail :info="userInfo" :anchor="anchorInfo" @sendTo="giveGiftTo" @speakTo="talkTo" @changeData="infoChanged"></info-detail>
    </a-dialog>-->
    <!-- 今日明细 -->
    <!-- :isShow="" @closeDialog="" -->
    <a-dialog :isShow="isshowMx" @closeDialog="closeMx">
      <div class="mx_box">
        <div class="mx_title">
          <img src="https://lib.liaoke.tv/lib/pc/static/img/icon_jinrimingxi.png" alt=""> 今日明细
        </div>
        <div class="mx_item">
          <div>
            今日获得:
            <span>{{mxData.coins}}</span>
          </div>
          <div>
            今日充值:
            <span>{{mxData.money}}</span>
          </div>
          <div>
            今日送出:
            <span>{{mxData.out_}}</span>
          </div>
        </div>
        <!-- <div class="mx_foot">
          查看明细
        </div> -->
      </div>
    </a-dialog>
    <div class="popup-menu" :style="menuPos" v-if="isShowMenu" id="menu" @mouseover="isShowMenu=true" @mouseout="isShowMenu=false">
      <i class="icon-arrow"></i>
      <div class="loading-wave" v-if="menuLoading">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="menu-top" v-if="userInfo">
        <span class="nickname">{{userInfo.nickname}}</span>
        <span class="nickname">：</span>
      </div>
      <hr v-if="hostUser && userInfo && userInfo.uid!=hostUser.uid || !hostUser">
      <ul class="menu-list" v-if="userInfo">
        <li @click="menuSend" v-if="hostUser && userInfo.uid!=hostUser.uid || !hostUser">
          <i class="icon-gift"></i>赠送礼物
        </li>
        <li @click="menuFav" :class="{focused:userInfo.is_fav==1}" v-if="hostUser && userInfo.uid!=hostUser.uid || !hostUser">
          <i class="icon-love"></i>
          <span v-if="userInfo.is_fav==0">关注</span>
          <span v-if="userInfo.is_fav==1">取消关注</span>
        </li>
        <li @click="menuTalk" v-if="hostUser && userInfo.uid!=hostUser.uid || !hostUser">
          <i class="icon-talk"></i>@Ta
        </li>
        <li @click="menuForbid" v-if="hostUser && anchorInfo.user.is_admin!=0 && userInfo.uid!=hostUser.uid">
          <i class="icon-forbid"></i>
          <span v-if="userInfo.shut_up_status==0">禁言</span>
          <span v-else>取消禁言</span>
        </li>
        <li @click="menuKick" v-if="hostUser && anchorInfo.user.is_admin!=0 && userInfo.uid!=hostUser.uid">
          <i class="icon-kick"></i>踢出房间
        </li>
        <li @click="menuSet" v-if="hostUser && anchorInfo.user.uid==roomId && userInfo.uid!=hostUser.uid">
          <i class="icon-setAdmin"></i>
          <span v-if="userInfo.is_admin==0">设为管理员</span>
          <span v-else>解除管理员</span>
        </li>
        <!--<li>
          <i class="icon-microphone"></i>连麦
        </li>-->
        <li @click="toUserIndex(userInfo.uid)">
          <i class="icon-userInfo"></i>个人资料
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import AnchorItem from "@/components/anchorItem";
import TabHd from "@/components/tab";
import Fans from "./fans";
import AnchorManager from "@/components/anchorManager";
import GiftAmount from "./giftAmount";
import GiftArea from "./giftArea";
import MsgPop from "./msgPopup";
import RoomIn from "./roomIn";
import Mqtt from "@/components/mqtt";
import MsgList from "./msgList";
import GiftShow from "./giftShow";
import PrizeShow from "./prizeShow";
import swfobject from "@/util/swfobject_2016_2";
import { SOURCE_H5, SOURCE_LOCAL } from "@/util/constant";
import { mapState } from "vuex";
import {
  pathJudge,
  defaultAvatar,
  levelMark,
  closest,
  randomFrom,
  replaceEmmoji,
  audioPlay,
  extend,
  scrollDirection
} from "@/util/tools";
import ADialog from "@/components/dialog";
import InfoDetail from "./infoDetail";

var talk_0 = null,
  talk_1 = null,
  talk_2 = null,
  talk_3 = null,
  talk_4 = null,
  talk_5 = null,
  talk_6 = null,
  talk_7 = null;
export default {
  components: {
    AnchorItem,
    TabHd,
    Fans,
    AnchorManager,
    GiftAmount,
    GiftArea,
    MsgPop,
    Mqtt,
    RoomIn,
    MsgList,
    GiftShow,
    PrizeShow,
    ADialog,
    InfoDetail
  },
  data() {
    return {
      // 今日明细
      mxData: {
        coins: "0",
        money: "0",
        out_: "0"
      },
      sendbtnTextType: 1, //赠送按钮文字显示 1 赠送 0打开
      msgpopdata: {}, //传递   弹幕喇叭价格
      msgpopType: "0", //012 0 无 1显示飞屏 2显示喇叭
      isshowMx: false, //查看明细
      speaker: null, //喇叭信息
      bulletList: [], //弹幕列表
      bulletTopList: [], //弹幕高度列表
      allMsgList: [], //全部消息列表
      roomMsgList: [], //房间消息列表
      talkMsgList: [], //聊天消息列表
      msgBd: 0, //当前显示消息列表——0：全部，1：房间，2：聊天
      giftShowList: [], //礼物展示列表
      prizeShowList: [], //奖品展示列表
      prizeTips: [], //中奖数量
      prizeTipsClass: false,
      prizeBroadcast: null, //中奖广播——哈利路亚
      prizeBroadcastArr: [], //中奖哈利数组  异步队列
      isPrizeBroadcast: false, //当前是否在播放哈利
      prizeBroadcastMin: null, //中奖广播——哈利路亚  小哈利
      prizeBroadcastMinArr: [], //中奖哈利数组  异步队列
      isprizeBroadcastMin: false, //当前是否在播放哈利

      roomId: null,
      roomInList: [], //高级来访者列表
      message: "", //输入框信息
      fansList: [], //粉丝榜
      fansFlag: false, //粉丝排行榜推送开关
      anchorMinderList: [], //守护人列表
      minderPage: 1, //管理员默认显示第一页
      minderLoading: false, //正在加载
      anchorManagerList: [], //管理员列表
      managerPage: 1, //管理员默认显示第一页
      managerLoading: false, //正在加载
      aboutAnchorTab: ["粉丝榜", "守护 (0)", "管理 (0)"],
      msgTab: ["全部", "房间", "聊天"],
      onlineList: [], //在线列表
      totalVisit: "", //累计观看人数
      onlineVisit: "", //在线人数
      onlineLoading: false, //在线人数加载
      onlinePage: 1,
      loadFlag: false, //在线用户滚动加载开关
      anchorList: [], //推荐主播列表
      mqttType: false, //mqtt状态
      topc: ["liaoke2/room/broadcast", "liaoke2/room/7271117"],
      showSendBar: true, //礼物下面的赠送按钮
      toPersonList: [], //礼物赠送对象
      toPersonIndex: 0, //礼物赠送对象的Index
      giftTo: null, //礼物送给…
      selectShow: false, //筛选框是否显示
      amount: 1, //赠送礼物数量
      selectedGift: null, //选中的礼物
      ischangeGift: false, //是否更新礼物列表  包裹礼物
      allAmount: [
        {
          icon: require("../../../static/img/room/icon-amount1.png"),
          text: "一心一意(1)",
          value: 1,
          selected: true
        },
        {
          icon: require("../../../static/img/room/icon-amount10.png"),
          text: "十全十美(10)",
          value: 10,
          selected: false
        },
        {
          icon: require("../../../static/img/room/icon-amount99.png"),
          text: "爱心(99)",
          value: 99,
          selected: false
        },
        {
          icon: require("../../../static/img/room/icon-amount520.png"),
          text: "我爱你(520)",
          value: 520,
          selected: false
        },
        {
          icon: require("../../../static/img/room/icon-amount999.png"),
          text: "比翼双飞(999)",
          value: 999,
          selected: false
        }
      ],
      amountList: [],
      tabBody: 0, //默认显示粉丝榜
      userInfo: null, //弹框个人资料
      isShowInfo: false, //资料弹框是否显示
      toUid: null, //@某某的ID
      toNickname: "", //@某某的ID
      runningMsg: null, //顶部跑道消息
      anchorInfo: null, //主播信息
      haliluyaTimer: null, //大哈利计时器对象
      haliluyaTimerMin: null, //小哈利计时器对象
      isShowMenu: false, //用户操作菜单
      menuLoading: false, //菜单加载中
      menuPos: {},
      heartTimer: null, //房间心跳定时器
      flashList: [], //flash动画队列
      // isflashPlay:false,
      flashAni: [], //待执行的动画
      isflashAni: false, //是否在执行
      // 连麦用户
      talkUser: [], //
      talkUserArr: [], //连麦列表
      talkUserObj: [
        {
          id: "talk_0",
          type: true
        },
        {
          id: "talk_1",
          type: true
        },
        {
          id: "talk_2",
          type: true
        },
        {
          id: "talk_3",
          type: true
        },
        {
          id: "talk_4",
          type: true
        },
        {
          id: "talk_5",
          type: true
        },
        {
          id: "talk_6",
          type: true
        },
        {
          id: "talk_7",
          type: true
        }
      ],
      showtalkUser: true //
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
  computed: {
    ...mapState({
      hostUser: state => state.hostUser,
      mqtt_d: state => state.mqtt_d
    })
  },
  watch: {
    $route(to, from) {
      if (to.name === from.name && to.params.uid !== from.params.uid) {
        this.$router.go();
      }
    },
    allMsgList(v) {
      if (v.length > 100) {
        v.splice(1, 1);
      }
    },
    roomMsgList(v) {
      if (v.length > 100) {
        v.splice(1, 1);
      }
    },
    talkMsgList(v) {
      if (v.length > 100) {
        v.splice(1, 1);
      }
    },
    fansFlag(v) {
      if (v) {
        this.getFansRank();
      }
    },
    hostUser(v) {
      clearInterval(this.heartTimer);
      if (v) {
        this.heartTimer = setInterval(this.heart, 5000);
      }
    },
    mqtt_d(v) {
      this.onMessageArrived(v);
    },
    //  flash 动画队列监听
    flashAni(v) {
      if (v && !this.isflashAni) {
        // console.log("flashAni>>>>");
        this.flashAni[0]();
        this.flashAni.splice(0, 1);
      }
    },
    // 哈利路亚动画队列
    prizeBroadcastArr(v) {
      // console.log(v)

      if (v && !this.isPrizeBroadcast) {
        var aniobj = this.prizeBroadcastArr[0];
        this.isPrizeBroadcast = true;
        this.prizeBroadcast = aniobj;
        this.prizeBroadcastArr.splice(0, 1);
      }
    },

    // 哈利路亚动画队列 小哈；i
    prizeBroadcastMinArr(v) {
      if (v && !this.isprizeBroadcastMin) {
        var aniobj = this.prizeBroadcastMinArr[0];
        this.prizeBroadcastMin = aniobj;
        this.prizeBroadcastMinArr.splice(0, 1);
        this.isprizeBroadcastMin = true;
      }
    },
    // 连麦列表
    talkUserArr(v, old) {
      // 下麦的  删除重接
      // if (old.length > v.length) {
      //   for (let old_index = 0; old_index < old.length; old_index++) {
      //     var f = document.getElementById(["talk_" + index]);
      //     var childs = f.childNodes;
      //     for (var i = childs.length - 1; i >= 0; i--) {
      //       f.removeChild(childs[i]);
      //     }
      //   }
      // }

      // for (let index_o = 0; index_o < 8; index_o++) {
      //   this.talkUserObj[index_o].type = false;
      //   if (index_o < v.length) {
      //     this.talkUserObj[index_o].type = true;
      //   }
      // }
      // var length_ = old.length - v.length;
      // if (length_ > 0) {
      //   for (let old_index = 0; v.length < old_index < 7; old_index++) {
      //     this.talkUserObj[old_index].type=false;
      //     // var f = document.getElementById(["talk_" + index]);
      //     // var childs = f.childNodes;
      //     // if (childs.length) {
      //     //   for (var i = childs.length - 1; i >= 0; i--) {
      //     //     f.removeChild(childs[i]);
      //     //   }
      //     // }
      //   }
      // }
      var length_ = old.length - v.length;
      for (let old_index = 0; old_index < 7; old_index++) {
        if (length_ > 0) {
          this.talkUserObj[old_index].type = false;
        } else {
          this.talkUserObj[old_index].type = true;
        }
      }

      try {
        // 新连麦的
        for (let index = 0; index < v.length; index++) {
          // var f = document.getElementById(["talk_" + index]);
          // var childs = f.childNodes;
          // for (var i = childs.length - 1; i >= 0; i--) {
          //   f.removeChild(childs[i]);
          // }
          // console.log("http://zhibo.liaoke.tv/live/" + v[index] + ".flv");
          // console.log("http://zhibo.liaoke.tv/live/" + v[index] + ".m3u8");
          window["talk_" + index] = new TcPlayer("talk_" + index, {
            flv: "http://zhibo.liaoke.tv/live/" + v[index] + ".flv", //'https://5496.liveplay.myqcloud.com/live/rrc3e7sz4n.flv',
            m3u8: "http://zhibo.liaoke.tv/live/" + v[index] + ".m3u8", //'https://zhibo.qingshu520.com/live/e4crypkyxsvqwmq7.m3u8',
            autoplay: true, //iOS下safari浏览器是不开放这个能力的
            // coverpic: "http://www.test.com/myimage.jpg",
            width: "500",
            height: "500",
            mp4: true,
            coverpic:
              '{"style": "cover", "src":"https://asset.qingshu520.com/user/7271117/png_31_9a3596ae2f223f140bcf9ac828cbddde"}',
            autoplay: true, //true
            live: true,
            volume: 0.4,
            flash: true,
            wording: {
              2032: "请求视频失败，请检查网络",
              2048: "请求m3u8文件失败，可能是网络错误或者跨域问题"
            },
            listener: function(r) {
              if(window["talk_" + index].playing()){
                document.querySelectorAll('.taItem')[index].setAttribute('class','taItem active');
              }else{
                document.querySelectorAll('.taItem')[index].setAttribute('class','taItem');
              }
            }
          });

        }
      } catch (error) {}
    },
    // talkUserObj
    talkUser(v, old) {
      // var arr = [];

      for (let index_o = 0; index_o < 8; index_o++) {
        this.talkUserObj[index_o].type = false;
        if (index_o < v.length) {
          this.talkUserObj[index_o].type = true;
        }
      }
      for (let m_index = 0; m_index < v.length; m_index++) {
        if (this.talkUserArr.length) {
          if (v[m_index].stream_id != this.talkUserArr[m_index]) {
            // this.talkUserArr.push(v[m_index].stream_id);
            this.talkUserArr[m_index] = v[m_index].stream_id;
            // arr.push(v[m_index].stream_id);
          }
        } else {
          // arr.push(v[m_index].stream_id);
          this.talkUserArr.push(v[m_index].stream_id);
        }
      }
      // this.talkUserArr = arr;

      //  v.stream_id
    },

    // 中奖   中奖消息显示中奖
    prizeShowList(v) {
      // console.log(v)
      var show_ = false;
      // this.hostUser && this.hostUser.uid == prize.uid
      for (let index = 0; index < v.length; index++) {
        // console.log(v.uid)
        if (this.hostUser && this.hostUser.uid == v[index].uid) {
          if (v[index].uid == this.prizeTips[0].uid) {
            show_ = true;
            // break;
          } else {
            show_ = false;
          }
        }
      }
      this.prizeTipsClass = show_;
    }
  },
  mounted() {
    this.dataInit();
    if (this.hostUser) {
      clearInterval(this.heartTimer);
      this.heartTimer = setInterval(this.heart, 5000);
    }
    document.addEventListener("click", this.docClick, false);
  },
  destroyed() {
    clearInterval(this.heartTimer);
    this.heartTimer = null;
    document.title = "聊客直播";
    document.removeEventListener("click", this.docClick, false);
  },
  methods: {
    judgeSign(num) {
      //0  是正数  1是负数
      var reg = new RegExp("^-?[0-9]*.?[0-9]*$");
      if (reg.test(num)) {
        var absVal = Math.abs(num);
        return num == absVal ? 0 : 1;
      }
    },
    /**
     *
     */
    DateChange(str) {
      var strTime = "";
      var date = new Date(str);
      var Y = date.getFullYear(),
        // M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1),
        M =
          date.getMonth() + 1 < 10 ? date.getMonth() + 1 : date.getMonth() + 1,
        D = date.getDate(),
        h = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();
      // console.log(Y + M + D + h + m + s)
      //  年 月 日 时 分 秒

      //今天的时间
      var day2 = new Date();
      var day2_m = day2.getMonth() + 1;
      var day2_d = day2.getDate();
      if (M == day2_m && D == day2_d) {
        //今天
        // strTime += h + ':' + m;
        return true;
      } else {
        //之前
        // strTime += M + '月' + D + '日';
        return false;
      }
    },
    // 进入明细
    showMx() {
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      this.isshowMx = true;
      this.$get("/h5/user/coin-log", {
        flow: "all" //all 全部 in 收入 out 支出
      }).then(r => {
        // console.log(r);
        if (r.http_code == 200) {
          var list = r.data.list;
          var count_ = 0;
          var out_ = 0;
          for (let index = 0; index < list.length; index++) {
            var bumber_ = Number(list[index].coins);
            // console.log(bumber_)
            // console.log(this.DateChange(list[index].created_at))
            // if (this.DateChange(list[index].created_at)) {
            if (this.judgeSign(bumber_) == 0) {
              //正数  获得
              count_ += bumber_;
            } else {
              out_ += Math.abs(bumber_);
            }
            // }
          }
          this.mxData.out_ = out_;
          this.mxData.coins = count_;
        }
      });
      this.$get("/h5/user/money-log", {
        flow: "all" //all 全部 in 收入 out 支出
      }).then(r => {
        // console.log(r);
        if (r.http_code == 200) {
          this.mxData.money = r.data.money;
        }
      });
    },

    setsendbtnTextType(type) {
      this.sendbtnTextType = type || 1;
    },
    // 关闭明细
    closeMx() {
      this.isshowMx = false;
    },
    toLocal(nut) {
      return Number(nut).toLocaleString();
    },
    dataInit() {
      this.roomId = Number(this.$route.params.uid);
      this.roomInit();
      this.getAnchorList();
      this.getUserList(); //在线游客

      //设置视频区域宽度
      let v_h = this.$refs.view_l.offsetHeight;
      let v_w = Math.floor(v_h * 360 / 640);
      this.$refs.view_l.style.width = v_w + "px";
      if (v_w < 540) {
        document.querySelector(".view-m").style.width = 448 + 540 - v_w + "px";
      }

      //获取守护、管理列表，修改tab数字
      this.getWardList();
      this.getManagerList();
      this.tabAbout(0);
      //礼物送给主播——登录后
    },

    //获取视频
    livePlay() {
      let uid = this.hostUser ? this.hostUser.uid : 0;
      let rid = this.anchorInfo.room_stream_id;
      let v_h = this.$refs.view_l.offsetHeight;
      let v_w = this.$refs.view_l.offsetWidth;
      let url = `${SOURCE_LOCAL}flash/BaiTuLive.swf?uid=${uid}&live_uid=${
        this.roomId
      }&rid=${rid}&cdn=0&video_config=0`;
      swfobject.embedSWF(
        url,
        "liveMedia_wrapper",
        v_w,
        v_h,
        "10.1",
        "./expressInstall.swf",
        {},
        {
          allowFullScreen: false,
          wmode: "opaque",
          allowScriptAccess: "always",
          sameDomain: "always"
        },
        { id: "live", name: "live", wmode: "Opaque", bgcolor: "#333333" }
      );
      // autostart
      // function(v) {
      //         console.log(v)
      //          console.log(v.ref)
      //          v.ref.setAttribute('name','Play')
      //          v.ref.setAttribute('value','1')
      //               // v.ref.play();

      //         }
    },

    //切换到活动轮播，关闭送礼
    swipeTabhd(data) {
      if (data == 2) {
        this.showSendBar = false;
      } else {
        this.showSendBar = true;
      }
    },

    //自己进入房间动画
    meRoonIn(user) {
      if (user) {
        this.$nextTick(() => {
          let inData = {};
          inData["type"] = "room_in";
          inData["room_id"] = this.roomId.toString();
          inData["data"] = {};
          inData["data"]["user"] = user;
          inData["data"]["user"]["id"] = user.uid;
          this.handleRoomIn(inData);
        });
      }
    },

    //全局点击
    docClick() {
      this.isShowFly = false;
      this.isShowSuona = false;
      this.selectShow = false;
      this.ctrlVisitor = null;
    },

    //房间心跳
    heart() {
      this.$get("/h5/live/heart", {
        room_id: this.roomId,
        created_in_action: ""
      }).then(r => {
        // console.log(r);
      });
    },

    //刷新用户金币信息
    refreshInfo() {
      this.$get("/h5/user/profile").then(r => {
        var obj_ = extend(this.hostUser, r.data);
        this.$store.commit("setUser", obj_);
      });
    },

    //tab消息列表
    tabShowMsg(data) {
      this.msgBd = Number(data);
    },

    //获取排行榜
    getFansRank() {
      this.$get("/h5/rank/index", {
        room_id: this.roomId,
        format: "json"
      }).then(r => {
        //进入房间显示粉丝排行榜
        if (r.http_code == 200) {
          let fansRank = {};
          fansRank["list"] = r.data.list.splice(0, 50);
          this.handleFans(fansRank);
        }
      });
    },

    //进入房间
    roomInit() {
      this.$get("/h5/live/in", {
        room_id: this.roomId
      }).then(r => {
        if (r.http_code == 200) {
          // console.log(r.data);

          levelMark(r.data);
          this.msgpopdata = r.data;
          r.data.avatar =
            r.data.avatar != ""
              ? pathJudge(r.data.avatar)
              : defaultAvatar(r.data.gender);
          this.anchorInfo = r.data; //获取房间主播信息
          document.title = this.anchorInfo.nickname + "的直播间_聊客直播 "; //修改title

          //初始化聊天窗口的警告消息
          this.allMsgList.push(this.anchorInfo.room_ann);
          this.roomMsgList.push(this.anchorInfo.room_ann);

          //五条历史消息
          let fiveMsg = r.data.room_msg_history;
          for (let i = 0; i < fiveMsg.length; i++) {
            fiveMsg[i].data.user["id"] = fiveMsg[i].data.user.uid;
            this.handleMsgList(fiveMsg[i]);
          }
          if(this.hostUser){
            this.meRoonIn(this.hostUser);
          }


          //进入房间显示粉丝排行榜
          // let fansRank = {};
          // fansRank["list"] = this.anchorInfo.room_rank_list;
          // this.handleFans(fansRank);
          this.fansFlag = !this.fansFlag; //进入房间显示粉丝排行榜

          //喇叭消息
          if (r.data.room_speaker) {
            this.handleSpeaker(r.data.room_speaker, r.data.room_speaker_end_in);
          }

          // 跑道
          let info = this.anchorInfo.room_road.data;
          info.custom[2].params.url = pathJudge(info.custom[2].params.url);
          let idx = info.content.lastIndexOf("]") + 1;
          info.content = info.content.substring(idx); //截取礼物名称
          this.runningMsg = info;

          this.setmqtt(r.data.room_chat_topic);

          //设置播放视频
          /*if (version.videoPlay) {
                this.anchorInfo.room_background = pathJudge(
                  this.anchorInfo.room_background
                );
                var room_background = {
                  style: "stretch",
                  src: this.anchorInfo.room_background
                };
                VIDEO.init({
                  rtmp: this.anchorInfo.live_rtmp_url || "rtmp://zhibo.qingshu520.com/live/e4crypkyxsvqwmq7",
                  flv: this.anchorInfo.live_play_url || "https://5496.liveplay.myqcloud.com/live/rrc3e7sz4n.flv",
                  m3u8: this.anchorInfo.live_hls_url || "https://zhibo.qingshu520.com/live/e4crypkyxsvqwmq7.m3u8",
                  coverpic: room_background
                });
              }*/
          this.livePlay();
        } else {
          this.$router.push({ name: "Index" });
          this.$store.commit("setToast", r.msg);
        }
      });
      this.$get("/h5/user/info", {
        uid: this.roomId,
        room_id: this.roomId
      }).then(r => {
        this.giftTo = r.data; //默认赠送礼物的对象是主播
        this.toPersonList.push(r.data); //添加进选框里
      });
    },
    //接收房间聊天信息
    onMessageArrived(data) {
      // console.log(data)
      // console.log(data.type);
      //礼物消息
      if (data.type == "gift_log") {
        this.handleGift(data);
      }
      // 连麦
      if (data.type == "room_talk_user_list") {
        // console.log(data);
        this.room_talk_user_list(data);
      }

      //烟花消息
      if (data.type == "firework_data" && data.room_id == this.roomId) {
        this.refreshInfo();
        let win = false;
        let uid = this.hostUser ? this.hostUser.uid : 0;
        for (let i = 0; i < data.data.common_uid.length; i++) {
          if (uid == data.data.common_uid[i]) {
            win = true;
            data.data["win_coins"] = data.data.common_coin;
          }
        }
        for (let i = 0; i < data.data.special.length; i++) {
          if (uid == data.data.special[i].uid) {
            win = true;
            data.data["win_coins"] = data.data.special[i].coins;
          }
        }
        if (win) {
          this.allMsgList.push(data);
          this.roomMsgList.push(data);
        }
      }
      //游客进入消息
      if (data.type == "room_in") {
        this.handleRoomIn(data);
      }
      //粉丝排行榜
      if (data.type == "room_rank_top") {
        if (!this.fansFlag) {
          this.handleFans(data);
        }
      }
      //在线游客
      if (data.type == "room_user_list") {
        if (!this.onlineLoading) {
          this.handleUserList(data);
        }
      }
      //奖品消息
      if (data.type == "draw_log") {
        this.handlePrize(data);
      }
      //弹幕消息
      if (data.type == "bullet") {
        let bulletLi = data.data;
        bulletLi.user.avatar =
          bulletLi.user.avatar != ""
            ? pathJudge(bulletLi.user.avatar)
            : defaultAvatar(bulletLi.user.gender);
        bulletLi.user = levelMark(bulletLi.user);
        bulletLi["new_key"] = new Date().getTime(); //创建一个key值
        bulletLi.msg.content = replaceEmmoji(bulletLi.msg.content);
        this.bulletList.push(bulletLi);
        this.handleMsgList(data);
      }
      //跑道消息
      if (data.type == "room_road") {
        let info = data.data;
        info.custom[2].params.url = pathJudge(info.custom[2].params.url);
        let idx = info.content.lastIndexOf("]") + 1;
        info.content = info.content.substring(idx); //截取礼物名称
        this.runningMsg = data.data;
      }
      //喇叭消息
      if (data.type == "room_speaker") {
        // console.log(data);
        this.handleSpeaker(data);
      }
      //系统消息等
      if (
        data.type == "text" ||
        data.type == "room_text" ||
        data.type == "user_fav" ||
        data.type == "room_set_shut_up" ||
        data.type == "room_unset_shut_up" ||
        data.type == "room_kick" ||
        data.type == "room_unset_admin" ||
        data.type == "room_set_admin" ||
        data.type == "room_shared"
      ) {
        this.handleMsgList(data);
        // console.log(data)
      }
      //直播结束
      if (data.type == "room_end_live") {
        this.$router.push({ name: "Index" });
        // alert("直播已结束了");
        this.$store.commit("setToast", "直播已结束了");
      }
    },

    // 连麦用户
    room_talk_user_list(r) {
      // console.log(r);
      var talk_user = r.data.talk_user;
      var seatarr = r.data.seat_list_data;

      for (let index = 0; index < talk_user.length; index++) {
        talk_user[index].avatar =
          talk_user[index].avatar != ""
            ? pathJudge(talk_user[index].avatar)
            : defaultAvatar(talk_user[index].avatar);
        talk_user[index] = levelMark(talk_user[index]);
        var arr = [
          "",
          "https://lib.liaoke.tv/lib/pc/static/img/yuyin_lanquan.png",
          "https://lib.liaoke.tv/lib/pc/static/img/yuyin_huangquan.png",
          "https://lib.liaoke.tv/lib/pc/static/img/yuyin_ziquan.png"
        ];
        talk_user[index].wardI = arr[talk_user[index].ward_data.level];

        for (let index_s = 0; index_s < seatarr.length; index_s++) {
          if (talk_user[index].uid == seatarr[index_s].uid) {
            talk_user[index].stream_id = seatarr[index_s].stream_id;
          }
        }
      }

      this.talkUser = talk_user;
      // console.log(talk_user);
    },

    //喇叭消息
    handleSpeaker(obj, time) {
      let speakerLi = obj.data;
      speakerLi.user.avatar =
        speakerLi.user.avatar != ""
          ? pathJudge(speakerLi.user.avatar)
          : defaultAvatar(speakerLi.user.gender);
      speakerLi.user = levelMark(speakerLi.user);
      speakerLi.msg.content = replaceEmmoji(speakerLi.msg.content);
      this.speaker = speakerLi;
      this.$nextTick(() => {
        let wrap_w = document.getElementById("speakMsg").offsetWidth;
        let name_w = Math.floor(this.$refs.speakLeft.offsetWidth);
        this.$refs.speakText.style.width = wrap_w - name_w - 10 + "px";
      });
      let duration = time > 0 ? time * 1000 : 60000;
      setTimeout(() => {
        this.speaker = null;
      }, duration);
    },

    //奖品入场
    handlePrize(obj) {
      let prize = obj.data[0];
      prize.user_avatar =
        prize.user_avatar != ""
          ? pathJudge(prize.user_avatar)
          : defaultAvatar(prize.user_avatar);
      prize.gift_filename = pathJudge(prize.gift_filename);

      if (prize.roomid == this.roomId) {
        //本房间
        if (prize.draw_effect == "full_screen") {
          this.prizeBroadcastArr.push(prize);
        } else if (prize.draw_effect == "long_time_award_banner") {
          prize["duration"] = 5000;
          this.prizeShowList.push(prize);
        } else if (prize.draw_effect == "small_full_screen") {
          this.prizeBroadcastArr.push(prize);
        } else {
          prize["duration"] = 3000;
          this.prizeShowList.push(prize);
        }
      } else {
        //其他房间
        if (prize.all_draw_effect == "full_screen") {
          this.prizeBroadcastArr.push(prize);
        } else if (prize.all_draw_effect == "long_time_award_banner") {
          prize["duration"] = 5000;
          this.prizeShowList.push(prize);
        } else if (prize.all_draw_effect == "small_full_screen") {
          this.prizeBroadcastArr.push(prize);
        } else {
          prize["duration"] = 3000;
          this.prizeShowList.push(prize);
        }
      }
      if (prize.roomid == this.roomId) {
        //推送奖品消息到消息列表
        this.msgReceiveTime(obj);
        this.allMsgList.push(obj);
        this.roomMsgList.push(obj);
      }
      //显示我的中奖数量
      if (this.hostUser && this.hostUser.uid == prize.uid) {
        // console.log(prize)
        let item = {};
        item["coins"] = prize.coin;
        item["uid"] = prize.uid;
        item["id"] = new Date().getTime();
        // this.prizeTips.push(item);
        // console.log(item)
        this.prizeTips[0] = item;
      }
    },

    //礼物入场处理
    handleGift(obj) {
      if (obj.data[0].coin_log.to_uid == this.roomId) {
        //如果送礼对象是主播，修改主播收入；
        this.anchorInfo.income = obj.data[0].coin_log.to_uid_income;
      }

      let same = -1; //默认

      let gift = obj.data[0].gift_log;
      gift.to_user_avatar =
        gift.to_user_avatar != ""
          ? pathJudge(gift.to_user_avatar)
          : defaultAvatar(gift.to_user_avatar);
      gift.user_avatar =
        gift.user_avatar != ""
          ? pathJudge(gift.user_avatar)
          : defaultAvatar(gift.user_avatar);
      gift.filename = pathJudge(gift.filename);

      if (gift.user_live_level >= 0) {
        let live_level_path =
          "assets/icon/level/zhibo_level_" + gift.user_live_level + ".png";
        gift["live_level_img"] = pathJudge(live_level_path); //主播等级
      }
      if (gift.user_wealth_level >= 0) {
        let wealth_level_path =
          "assets/icon/level/caifu_level_" + gift.user_wealth_level + ".png";
        gift["wealth_level_img"] = pathJudge(wealth_level_path); //富豪等级
      }
      if (gift.user_vip_data) {
        let vip_src = ""; //服务器icon 传反了
        if (gift.user_vip_data.level != "0") {
          if (Number(gift.user_vip_data.level) == 1) {
            vip_src = SOURCE_H5 + "assets/icon/vip/vip_2.png";
          } else if (Number(gift.user_vip_data.level) == 2) {
            vip_src = SOURCE_H5 + "assets/icon/vip/vip_1.png";
          } else if (Number(gift.user_vip_data.level) == 3) {
            vip_src = SOURCE_H5 + "assets/icon/vip/vip_3.png";
          }
          gift["vip_img"] = vip_src; //VIP等级
        }
      }
      if (gift.user_ward_data) {
        let ward_src = "";
        if (gift.user_ward_data.level > 0) {
          ward_src = `${SOURCE_LOCAL}img/center/icon-ward${
            gift.user_ward_data.level
          }.png`;
          gift["ward_img"] = ward_src; //守护等级
        }
      }
      if (this.giftShowList.length == 0) {
        this.giftShowList.push(gift);
      } else {
        //如果列表中有同一人赠送的同一礼物，则改变礼物数量，否则，直接添加数据
        for (let i = 0; i < this.giftShowList.length; i++) {
          if (
            gift.created_by == this.giftShowList[i].created_by &&
            gift.gift_id == this.giftShowList[i].gift_id
          ) {
            same = i;
          }
        }
        if (same == -1) {
          this.giftShowList.push(gift);
        } else {
          this.giftShowList[same].combo_number = gift.combo_number;
        }
      }
      //推送礼物消息到消息列表
      this.msgReceiveTime(obj);
      this.allMsgList.push(obj);

      if (obj.room_id == this.roomId) {
        this.roomMsgList.push(obj);
      }
      let flashName = "";
      //播放礼物flash
      let giftId = parseInt(obj.data[0].gift_log.gift_id);
      if (obj.room_id == this.roomId) {
        /*if(giftId==2 || giftId==83){
              flashName='gift_100073';
              this.playFlash(flashName, 10000, 1340, 700);
            }*/
        // console.log(giftId)
        // giftId=87;
        switch (giftId) {
          case 78:
            flashName = "gift_100060";
            // this.playFlash(flashName, 10000, 1340, 780);
            // 做我女朋友
            this.flashAni.push(() => {
              this.playFlash(flashName, 25000, 1340, 780);
            });

            break;
          case 51:
            flashName = "gift_100061";
            // this.playFlash(flashName, 10000, 1340, 780);
            // 私人人飞机
            this.flashAni.push(() => {
              this.playFlash(flashName, 25000, 1340, 780);
            });
            break;
          case 55:
            flashName = "gift_100063";
            // this.playFlash(flashName, 10000, 1340, 780);
            // 浪漫山庄
            this.flashAni.push(() => {
              this.playFlash(flashName, 17000, 1340, 780);
            });
            break;
          case 56:
            flashName = "gift_100066";
            // this.playFlash(flashName, 10000, 1340, 780);
            // 乡村小家
            this.flashAni.push(() => {
              this.playFlash(flashName, 20000, 1340, 780);
            });
            break;
          case 52:
            flashName = "gift_100067";
            // this.playFlash(flashName, 10000, 1340, 780);
            // 豪华游轮
            this.flashAni.push(() => {
              this.playFlash(flashName, 21000, 1340, 780);
            });
            break;
          case 74:
            flashName = "gift_100069";
            // this.playFlash(flashName, 10000, 1340, 780);
            // 私奔到月球
            this.flashAni.push(() => {
              this.playFlash(flashName, 31000, 1340, 780);
            });
            break;
          case 62:
            flashName = "gift_100071";
            // this.playFlash(flashName, 10000, 1340, 780);
            // 烟花
            this.flashAni.push(() => {
              this.playFlash(flashName, 9000, 1340, 780);
            });
            break;
          case 67:
            flashName = "gift_100072";
            // this.playFlash(flashName, 10000, 1340, 780);
            // 生日蛋糕
            this.flashAni.push(() => {
              this.playFlash(flashName, 25000, 1340, 780);
            });
            break;
          // case 87:
          case 85:
            flashName = "gift_100073";
            // this.playFlash(flashName, 10000, 1340, 780);
            // 浪漫告白
            this.flashAni.push(() => {
              this.playFlash(flashName, 43000, 1340, 780);
            });
            break;
        }
      }
    },

    //游客入场处理
    handleRoomIn(obj) {
      let newVisitor = levelMark(obj.data.user);
      newVisitor.avatar =
        newVisitor.avatar != ""
          ? pathJudge(newVisitor.avatar)
          : defaultAvatar(newVisitor.gender);
      newVisitor["new_key"] = new Date().getTime(); //创建一个key值
      if (newVisitor.ward_data && newVisitor.ward_data.level > 0) {
        newVisitor["ward_round"] =
          SOURCE_H5 +
          "assets/api/room/ward/in_level_" +
          newVisitor.ward_data.level +
          ".png";
      }
      levelMark(newVisitor);
      // console.log(newVisitor);
      // wealth_level
      // if (
      //   (newVisitor.ward_data && newVisitor.ward_data.level > 0) ||
      //   newVisitor.room_show_in > 0
      // ) {
      //   this.roomInList.push(newVisitor);
      // }
      if (newVisitor.ward_data && newVisitor.ward_data.level > 0) {
        // console.log(newVisitor);
        this.roomInList.push(newVisitor);
      } else {
        // （只有当财富等级大于等于25级的时候才显示
        if (Number(newVisitor.wealth_level) >= 25) {
          // console.log(newVisitor);
          this.roomInList.push(newVisitor);
        }
      }

      this.handleMsgList(obj);
    },

    //处理粉丝贡献榜
    handleFans(obj) {
      let list = obj.list;
      for (let i = 0; i < list.length; i++) {
        list[i].avatar =
          list[i].avatar != ""
            ? pathJudge(list[i].avatar)
            : defaultAvatar(list[i].gender);
        list[i] = levelMark(list[i]);
      }
      this.fansList = list;
    },

    //处理在线用户列表
    handleUserList(obj) {
      let list = obj.data;
      for (let i = 0; i < list.length; i++) {
        list[i].avatar =
          list[i].avatar != ""
            ? pathJudge(list[i].avatar)
            : defaultAvatar(list[i].gender);
        list[i] = levelMark(list[i]);
      }
      this.onlineList.splice(0, 20);
      let online = list.concat(this.onlineList);
      //去重
      for (var i = 0; i < online.length; i++) {
        for (var j = i + 1; j < online.length; j++) {
          if (online[i].uid == online[j].uid) {
            online.splice(j, 1);
          }
        }
      }
      this.onlineList = online;
      this.totalVisit = obj.view_count;
      this.onlineVisit = obj.count;
    },

    //接收消息时间
    msgReceiveTime(obj) {
      //处理消息时间
      if (obj.data) {
        if (!obj.data.created_at) {
          obj.data["created_at"] = new Date().getTime();
        } else {
          obj.data["created_at"] = obj.data.created_at * 1000;
        }
        let _hour = new Date(obj.data.created_at).getHours();
        let _min = new Date(obj.data.created_at).getMinutes();
        _hour = _hour < 10 ? "0" + _hour : _hour;
        _min = _min < 10 ? "0" + _min : _min;

        obj.data["receive_time"] = _hour + ":" + _min;
      }
    },

    //处理全部消息列表
    handleMsgList(obj) {
      this.msgReceiveTime(obj);
      let html = "";
      //系统消息
      if (obj.type == "text") {
        let system = obj.data;
        if (system.custom.length == 3) {
          system.content = system.content.replace(
            "[##]",
            " <span class='nickname'>" + system.custom[0].title + "</span> "
          );
          system.content = system.content.replace(
            "[##]",
            " <span class='nickname'>" + system.custom[1].title + "</span> "
          );
          system.content = system.content.replace("[##]", "");
        }
        if (system.custom.length == 2) {
          system.content = system.content.replace(
            "[##]",
            " <span class='nickname'>" + system.custom[0].title + "</span> "
          );
          system.content = system.content.replace(
            "[##]",
            " <span class='nickname'>" + system.custom[1].title + "</span> "
          );
        }
        obj.data = system;
        if (obj.data.custom.length > 0) {
          obj.data.custom[1].params.id == this.roomId;
          this.roomMsgList.push(obj);
        }
        this.allMsgList.push(obj);
      }
      if (obj.type == "bullet") {
        this.allMsgList.push(obj);
        if (this.roomId == obj.room_id) {
          this.roomMsgList.push(obj);
        }
      }
      //聊天消息
      if (obj.type == "room_text") {
        //to_user 数组和对象
        if (obj.data.to_user && obj.data.to_user instanceof Array) {
          if (obj.data.to_user.length > 0) {
            obj.data.to_user = obj.data.to_user[0];
          } else {
            obj.data.to_user = null;
          }
        }
        // if(obj.data.to_user && obj.data.to_user instanceof Array){
        //   console.log(1)
        // }else{
        //   console.log(2)
        // }
        obj.data.user = levelMark(obj.data.user);
        obj.data.content = replaceEmmoji(obj.data.content);
        if (obj.data.to_user) {
          obj.data.to_user = levelMark(obj.data.to_user);
          obj.data.content = obj.data.content.replace(
            "@" + obj.data.to_user.nickname,
            ""
          );
        }
        this.allMsgList.push(obj);
        if (this.roomId == obj.room_id) {
          this.roomMsgList.push(obj);
        }
        this.talkMsgList.push(obj);
      }
      //关注了主播
      if (
        obj.type == "user_fav" ||
        obj.type == "room_shared" ||
        obj.type == "room_in" ||
        obj.type == "room_set_admin" ||
        obj.type == "room_unset_admin" ||
        obj.type == "room_set_shut_up" ||
        obj.type == "room_unset_shut_up" ||
        obj.type == "room_kick"
      ) {
        obj.data.user = levelMark(obj.data.user);
        // console.log(obj);
        // console.log(this.hostUser);
        this.allMsgList.push(obj);
        if (this.roomId == obj.room_id) {
          this.roomMsgList.push(obj);
        }
      }
      if (obj.type == "room_set_admin") {
        // console.log(this.anchorInfo)
        this.anchorInfo.user.is_admin = 1;
      }
      if (obj.type == "room_unset_admin") {
        this.anchorInfo.user.is_admin = 0;
      }

      // anchorInfo.user.is_admin

      if (obj.type == "room_kick") {
        if (this.hostUser && this.hostUser.uid == obj.data.user.uid) {
          this.$store.commit("setToast", "您被踢出房间！");
          this.$router.push({ name: "Index" });
        }
      }
    },

    // flash动画
    playFlash(flash_name, time, width, height, auto_show) {
      // console.log(
      //   "flash动画》》》》》" + flash_name + time + width + height + auto_show
      // );
      this.isflashAni = true;
      width = 1340;
      let flash_path = SOURCE_LOCAL + "flash/" + flash_name + ".swf";
      if (auto_show === false) return;
      var random_number = parseInt(Math.random() * 10000000);
      let item = {};
      item["id"] = "play_flash_" + random_number;
      item["url"] = flash_path;
      this.flashList.push(item);

      this.$nextTick(() => {
        swfobject.embedSWF(
          flash_path,
          item.id,
          width,
          height,
          "10",
          "",
          {},
          {
            allowFullScreen: true,
            wmode: "transparent",
            allowScriptAccess: "always"
          },
          {
            id: item.id,
            name: item.id
          },
          function() {
            // console.log(new Date());
          }
        );

        // console.log(swfobject)
        var flash_play_timeout = setTimeout(() => {
          // for (let i = 0; i < this.flashList.length; i++) {
          //   if (this.flashList[i].id === item.id) {
          //     this.flashList.splice(i, 1);
          //   }
          // }
          // console.log("end>" + new Date());
          let el = document.getElementById(item.id);
          el.parentNode.removeChild(el);
          clearTimeout(flash_play_timeout);

          // 查询队列是否还有要执行的
          if (this.flashAni.length) {
            // console.log(this.flashAni);
            this.flashAni[0]();
            this.flashAni.splice(0, 1);
            // console.log("查询队列是否还有要执行的>>>>>>");
          } else {
            // console.log("oooooooooooo>>>>>>");
            this.isflashAni = false;
          }
          //  console.log(this.flashAni)
          // alert(flash_name+">>>>>>>>>"+time)
        }, time);
      });
    },

    setmqtt(topic) {
      this.mqttType = false;
      this.topc = topic;
      if (this.$store.state.chat_server == null) {
        this.$store.commit("setchat_server", this.msgpopdata.chat_server || {});
        this.$store.commit("mqttInit");
      }
      setTimeout(() => {
        // this.mqttType = true;

        // console.log(topic)
        for (let index = 0; index < topic.length; index++) {
          // this.$store.commit("settopc", topic[index]);
          // this.$store.state.mqtt.subscribe(topic[index], { qos: 0 });
          try{
            this.$store.commit("settopc", topic[index]);
            this.$store.state.mqtt.subscribe(topic[index], { qos: 0 });
          }catch (e) {

          }


          console.log("订阅》》》" + topic[index]);
          // console.log("topc>>>>" + topic[index]);
        }

        console.log(this.$store.state.mqtt);
      }, 100);
    },

    //获取在线游客
    getUserList() {
      this.onlineLoading = true;
      this.$get("/h5/live/user-list", {
        room_id: this.roomId,
        page: this.onlinePage
      }).then(r => {
        if (r.http_code == 200) {
          let list = r.data.data;
          for (let i = 0; i < list.length; i++) {
            list[i].avatar =
              list[i].avatar != ""
                ? pathJudge(list[i].avatar)
                : defaultAvatar(list[i].gender);
            list[i] = levelMark(list[i]);
          }
          this.totalVisit = r.data.view_count;
          this.onlineVisit = r.data.count;

          if (this.onlinePage > 1) {
            this.onlineList = this.onlineList.concat(list);
          } else {
            this.onlineList = list;
          }
          if (this.onlinePage < Math.ceil(this.onlineVisit / 20)) {
            this.loadFlag = true;
            this.onlinePage++;
          } else {
            this.loadFlag = false;
          }
          this.onlineLoading = false;
        }
      });
    },

    //在线人数滚动加载
    onlineScroll(e) {
      e.stopPropagation();
      let el = e.target ? e.target : e.srcElement;
      let direct = scrollDirection(el); //获取滚动方向
      if (
        el.scrollHeight - el.scrollTop - 10 < el.offsetHeight &&
        this.loadFlag &&
        direct == "down"
      ) {
        this.getUserList();
        this.loadFlag = false;
      }
    },

    //打开select
    toggleSelect() {
      this.selectShow = !this.selectShow;
      for (let i = 0; i < this.toPersonList.length; i++) {
        if (this.toPersonList[i].uid == this.giftTo.uid) {
          this.toPersonIndex = i;
        }
      }
    },

    //选择赠送对象
    selectPerson(data) {
      this.giftTo = data;
    },

    //接收礼物数量
    change(data) {
      this.amount = data;
    },

    //选中礼物
    checkGift(data) {
      this.selectedGift = data;
      this.amountList = [];
      for (let i = 0; i < data.send_number.length; i++) {
        for (let j = 0; j < this.allAmount.length; j++) {
          if (data.send_number[i] === this.allAmount[j].value) {
            this.amountList[i] = this.allAmount[j];
            this.amountList[i].selected = false;
          }
        }
      }
      this.amount = this.amountList[0].value;
      this.amountList[0].selected = true;
    },

    // 打开包裹
    openBag(id) {
      this.$get("/h5/gift/bag-open", {
        bag_id: id || "",
        number: 1
      }).then(r => {
        if (r.http_code == 200) {
          // 更新包裹
          this.ischangeGift = !this.ischangeGift;
        }
      });
    },
    //赠送礼物
    sendGift() {
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      if (!this.selectedGift) return; //包裹为空返回
      // console.log(this.selectedGift)
      var number = 1;
      var created_from = "";
      if (this.selectedGift.tabItem && this.selectedGift.tabItem == 1) {
        // 包裹
        number = 1;
        created_from = "bag";
      } else {
        number = Number(this.amount);
        created_from = "";
      }

      // 包裹礼物判断  64砖石礼包   68喇叭  65房间飘屏  66全站飘屏
      if (this.selectedGift.tabItem && this.selectedGift.tabItem == 1) {
        switch (this.selectedGift.id) {
          case "64":
            // 更新包裹
            // this.ischangeGift = !this.ischangeGift;
            this.openBag(this.selectedGift.openId || 0);
            return;
            break;
          case "68":
            //012 0 无 1显示飞屏 2显示喇叭  3全站飘屏
            this.msgpopType = 2;
            return;
          case "65":
            this.msgpopType = 1;
            return;
          case "66":
            this.msgpopType = 3;
            return;
            break;
          default:
            break;
        }
      }
      this.$get("/h5/gift/send", {
        gift_id: Number(this.selectedGift.id),
        number: number,
        to_uid: Number(this.giftTo.uid),
        room_id: this.roomId,
        created_in: "room",
        created_from: created_from,
        created_in_id: this.roomId
      }).then(r => {
        if (r.http_code == 200) {
          // this.hostUser.coins = r.data.coin_log.has_coins;
          var _coins = r.data.coin_log.has_coins;
          this.$store.commit("setUser", { coins: _coins });

          if (this.selectedGift.tabItem && this.selectedGift.tabItem == 1) {
            this.ischangeGift = !this.ischangeGift;
          }
        }
        // this.$store.commit('setToast',r.msg);
      });
    },

    //获取推荐主播列表
    getAnchorList() {
      this.$get("/h5/live/index", {
        type: "collect"
      }).then(r => {
        if (r.http_code == 200) {
          for (let i = 0; i < r.data.length; i++) {
            r.data[i].avatar =
              r.data[i].avatar != ""
                ? pathJudge(r.data[i].avatar)
                : defaultAvatar(r.data[i].gender);
            r.data[i].room_cover = pathJudge(r.data[i].room_cover);
          }
          this.anchorList = r.data;
        }
      });
    },

    //本页面内跳转——换主播
    replacePage(pkid) {
      this.$router.replace({ name: "LiveRoom", params: { uid: pkid } });
      this.$router.go(0);
    },

    //飞屏
    fly(msg, range) {
      this.$get("/h5/live/bullet", {
        room_id: this.roomId,
        type: range,
        content: msg
      }).then(r => {
        if (r.http_code == 200) {
          // this.hostUser.coins = r.data.has_coins;
          var Coins_ = r.data.has_coins;
          this.$store.commit("setUser", { coins: Coins_ });

          this.ischangeGift = !this.ischangeGift; //走包裹 时更新包裹数据
        }
      });
    },

    //喇叭
    speak(msg) {
      this.$get("/h5/live/speaker", {
        room_id: this.roomId,
        content: msg
      }).then(r => {
        if (r.http_code == 200) {
          // this.hostUser.coins = r.data.has_coins;
          var _coins = r.data.has_coins;
          this.$store.commit("setUser", { coins: _coins });

          this.ischangeGift = !this.ischangeGift; //走包裹 时更新包裹数据
        }
      });
    },

    //表情
    inputFace(data) {
      this.message += data;
    },

    //发送消息
    sendMsg() {
      if (this.message.trim() == "") {
        return;
      }
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      if (!this.message.match(this.toNickname.trim())) {
        this.toUid = null;
      }
      let msg = this.message;
      this.message = "";
      this.$get("/h5/live/send", {
        room_id: this.roomId,
        content: msg,
        to_uid: this.toUid
      }).then(r => {
        if (r.http_code == 200) {
          this.toUid = null;
          this.toNickname = "";
        }
      });
    },

    // 去充值
    goRecharge() {
      if (this.hostUser) {
        let routerData = this.$router.resolve({ name: "Recharge" });
        window.open(routerData.href);
      } else {
        this.$store.commit("set_loginDialog", true);
      }
    },

    //切换粉丝、守护、管理
    tabAbout(data) {
      this.tabBody = data;
      switch (this.tabBody) {
        case 0:
          break;
        case 1:
          this.anchorMinderList = [];
          this.minderPage = 1;
          this.getWardList();
          break;
        case 2:
          this.anchorManagerList = [];
          this.managerPage = 1;
          this.getManagerList();
          break;
      }
    },

    //守护列表
    getWardList() {
      this.minderLoading = true;
      this.$get("/h5/ward/list", {
        type: 0,
        to_uid: this.roomId,
        page: this.minderPage
      }).then(r => {
        this.minderLoading = false;
        if (r.http_code == 200) {
          let list = r.data.list;
          for (let i = 0; i < list.length; i++) {
            levelMark(list[i]);
            list[i].avatar =
              list[i].avatar != ""
                ? pathJudge(list[i].avatar)
                : defaultAvatar(list[i].gender);
          }
          if (this.minderPage > 1) {
            this.anchorMinderList = this.anchorMinderList.concat(list);
          } else {
            this.anchorMinderList = list;
          }
          if (this.minderPage <= Math.ceil(r.data.count / 20)) {
            this.minderPage++;
          }
          this.$set(this.aboutAnchorTab, 1, "守护 (" + r.data.count + ")");
        }
      });
    },

    //守护滚动添加
    minderScroll(e) {
      let el = e.srcElement ? e.srcElement : e.target;
      let direct = scrollDirection(el); //获取滚动方向
      if (
        el.scrollHeight - el.scrollTop - 10 < el.offsetHeight &&
        !this.minderLoading &&
        direct == "down"
      ) {
        this.getWardList();
      }
    },

    //管理列表
    getManagerList() {
      this.managerLoading = true;
      this.$get("/h5/live/admin", {
        room_id: this.roomId,
        page: this.managerPage
      }).then(r => {
        this.managerLoading = false;
        if (r.http_code == 200) {
          let list = r.data.list;
          for (let i = 0; i < list.length; i++) {
            levelMark(list[i]);
            list[i].avatar =
              list[i].avatar != ""
                ? pathJudge(list[i].avatar)
                : defaultAvatar(list[i].gender);
          }
          if (this.managerPage > 1) {
            this.anchorManagerList = this.anchorManagerList.concat(list);
          } else {
            this.anchorManagerList = list;
          }
          if (this.managerPage <= Math.ceil(r.data.count / 100)) {
            this.managerPage++;
          }
          this.$set(this.aboutAnchorTab, 2, "管理 (" + r.data.count + ")");
        }
      });
    },

    //管理员滚动添加
    managerScroll(e) {
      let el = e.srcElement ? e.srcElement : e.target;
      let direct = scrollDirection(el); //获取滚动方向
      if (
        el.scrollHeight - el.scrollTop - 10 < el.offsetHeight &&
        !this.managerLoading &&
        direct == "down"
      ) {
        this.getManagerList();
      }
    },

    //开通守护
    wardAnchor() {
      if (this.hostUser) {
        /*this.$router.push({
            path: "/mall",
            query: { uid: this.anchorInfo.id }
          });*/
        let routerData = this.$router.resolve({
          name: "Mall",
          query: { uid: this.anchorInfo.id }
        });
        window.open(routerData.href);
      } else {
        this.$store.commit("set_loginDialog", true);
      }
    },

    //查看个人资料
    showInfo(pkid) {
      if (!this.anchorInfo.user) {
        return;
      }
      this.$get("/h5/user/info", {
        uid: Number(pkid),
        room_id: this.roomId
      }).then(r => {
        if (r.http_code == 200) {
          r.data.avatar =
            r.data.avatar != ""
              ? pathJudge(r.data.avatar)
              : defaultAvatar(r.data.gender);
          r.data = levelMark(r.data);
          this.isShowInfo = true;
          this.userInfo = r.data;
        }
      });
    },
    showMenu(pkid) {
      // let el=event.target?event.target:event.srcElement;
      let t = 0,
        l = 0;
      //IE10以下不支持event.currentTarget
      if (event.currentTarget) {
        l = event.currentTarget.getBoundingClientRect().left - 200;
        t = event.currentTarget.getBoundingClientRect().top - 15;
      } else {
        l = event.clientX - event.x - 200;
        t = event.clientY - event.y - 15;
      }

      this.menuPos["left"] = l + "px";
      this.menuPos["top"] = t + "px";
      if (event.type == "click") {
        this.menuPos["left"] = event.clientX - 200 + "px";
        this.menuPos["top"] = event.clientY + "px";
      }
      this.isShowMenu = true;
      this.userInfo = null;
      this.menuLoading = true;
      this.$get("/h5/user/info", {
        uid: Number(pkid),
        room_id: this.roomId
      }).then(r => {
        this.menuLoading = false;
        if (r.http_code == 200) {
          r.data.avatar =
            r.data.avatar != ""
              ? pathJudge(r.data.avatar)
              : defaultAvatar(r.data.gender);
          r.data = levelMark(r.data);
          this.userInfo = r.data;
          //菜单出现后，如果底部超出视窗，修改top
          this.$nextTick(() => {
            let menu = document.getElementById("menu");
            if (menu && t + menu.offsetHeight > window.innerHeight) {
              t = window.innerHeight - menu.offsetHeight - 6;
              this.menuPos["top"] = t + "px";
            }
          });
        }
      });
    },

    //赠送礼物
    menuSend() {
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      let data = this.userInfo;
      if (this.hostUser.uid === data.uid) {
        this.$store.commit("setToast", "不能送礼物给自己");
        return;
      }
      // 如果赠送对象数组里已经有此人，则不需要追加
      let index = "";
      for (let i = 0; i < this.toPersonList.length; i++) {
        if (this.toPersonList[i].uid === data.uid) {
          index = i;
        }
      }
      if (index === "") {
        this.toPersonList.push(data);
      }
      this.giftTo = data;
      this.isShowMenu = false;
    },

    //关注
    menuFav() {
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      let data = this.userInfo;
      //如果关注过，就取消关注
      if (data.is_fav == 1) {
        this.cancelFav(data);
        return;
      }
      // 关注
      if (this.hostUser.uid === data.uid) {
        this.$store.commit("setToast", "不能关注自己");
        return;
      }
      this.$get("/h5/user/follow", {
        to_uid: Number(data.uid),
        created_in: Number(data.in_room)
      }).then(r => {
        if (r.http_code == 200) {
          this.$store.commit("setToast", "您成功关注了" + data.nickname);
          this.userInfo.is_fav = 1;
          if (this.userInfo.uid == this.anchorInfo.id) {
            this.anchorInfo.is_fav = 1;
          }
        }
      });
    },

    //取消关注
    cancelFav(data) {
      this.$get("h5/user/cancel-follow", {
        to_uid: Number(data.uid),
        created_in: Number(data.in_room)
      }).then(r => {
        if (r.http_code == 200) {
          this.$store.commit("setToast", "您取消关注了" + data.nickname);
          this.userInfo.is_fav = 0;
          // this.$set(this.userInfo,'is_fav',0);
          if (this.userInfo.uid == this.anchorInfo.id) {
            this.anchorInfo.is_fav = 0;
          }
        }
      });
    },

    //@某某
    menuTalk() {
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      let data = this.userInfo;
      if (this.hostUser.uid === data.uid) {
        this.$store.commit("setToast", "不能 @ 自己");
        return;
      }
      this.toUid = data.uid;
      this.toNickname = "@" + data.nickname + " ";
      this.message += "@" + data.nickname + " ";
      this.$refs.msgInput.focus();
      this.isShowMenu = false;
    },

    //禁言/解除禁言
    menuForbid() {
      if (!this.hostUser) {
        this.$store.commit("set_loginDialog", true);
        return;
      }
      let data = this.userInfo;
      if (this.hostUser.uid === data.uid) {
        this.$store.commit("setToast", "不能禁言自己");
        return;
      }
      let duration = this.userInfo.shut_up_status != 0 ? 0 : 1800;
      this.$get("/h5/live/shut-up", {
        room_id: Number(data.in_room),
        to_uid: Number(data.uid),
        shut_up_time: duration
      }).then(r => {
        if (r.http_code == 200) {
          let index = -1;
          for (let i = 0; i < this.onlineList.length; i++) {
            if (this.onlineList[i].uid == this.userInfo.uid) {
              if (data.shut_up_status != 0) {
                this.onlineList[i].shut_up_status = 0;
                this.userInfo.shut_up_status = 0;
              } else {
                this.onlineList[i].shut_up_status = this.userInfo.uid;
                this.userInfo.shut_up_status = this.userInfo.uid;
              }
            }
          }
          this.$store.commit("setToast", r.msg);
        }
      });
    },

    //踢粉丝出房间
    menuKick() {
      let data = this.userInfo;
      if (this.hostUser.uid === data.uid) {
        this.$store.commit("setToast", "不能踢出自己");
        return;
      }
      this.$get("/h5/live/kick", {
        room_id: Number(data.in_room),
        to_uid: Number(data.uid),
        kick_time: 1800000
      }).then(r => {
        if (r.http_code == 200) {
          this.$store.commit("setToast", r.msg);
        }
      });
    },

    //设置粉丝为管理员
    menuSet() {
      let data = this.userInfo;
      this.$get("/h5/live/set-admin", {
        room_id: Number(data.in_room),
        to_uid: Number(data.uid)
      }).then(r => {
        if (r.http_code == 200) {
          if (data.is_admin == 1) {
            this.userInfo.is_admin = 0;
            this.$store.commit(
              "setToast",
              "取消" + data.nickname + "为房间管理员"
            );
          } else {
            this.userInfo.is_admin = 1;
            this.$store.commit(
              "setToast",
              "成功设置" + data.nickname + "为房间管理员"
            );
          }
        }
      });
    },

    //查看个人主页
    toUserIndex(id) {
      let routerData = this.$router.resolve({
        name: "Zone",
        params: { uid: id }
      });
      window.open(routerData.href, "_blank");
    },

    //关注主播
    focus(pkid) {
      if (this.hostUser) {
        this.$get("/h5/user/follow", {
          to_uid: Number(pkid),
          created_in: this.roomId
        }).then(r => {
          if (r.http_code == 200) {
            this.$store.commit("setToast", r.msg);
            this.anchorInfo.is_fav = 1;
            let obj = {};
            obj["type"] = "user_fav";
            obj["room_id"] = this.roomId;
            obj["data"] = {};
            obj["data"]["user"] = levelMark(this.hostUser);
            this.handleMsgList(obj);
          }
        });
      } else {
        this.$store.commit("set_loginDialog", true);
      }
    },

    /*//个人资料修改后的资料
        infoChanged(data) {
          this.userInfo = data;
          if (this.anchorInfo.id === data.uid) {
            this.anchorInfo.is_fav = data.is_fav;
          }
        },

        //关闭个人资料
        closeInfo() {
          this.isShowInfo = false;
        },

        //赠送礼物给粉丝
        giveGiftTo(data) {
          this.toPersonList.push(data);
          this.giftTo = data;
          this.isShowInfo = false;
        },

        //@某某
        talkTo(data) {
          this.toUid = data.uid;
          this.message += "@" + data.nickname;
          this.isShowInfo = false;
        },*/

    //游客进入房间动画结束时删除
    roomInOut() {
      this.roomInList.splice(0, 1);
    },

    //礼物入场动画结束时删除
    giftOut(data) {
      for (let i = 0; i < this.giftShowList.length; i++) {
        if (this.giftShowList[i].id == data) {
          this.giftShowList.splice(i, 1);
          break;
        }
      }
    },

    //奖品消息出场动画触发
    prizeOut(pkid) {
      let index = -1;
      for (let i = 0; i < this.prizeShowList.length; i++) {
        if (pkid == this.prizeShowList[i].id) {
          index = i;
        }
      }
      this.prizeShowList.splice(index, 1);
    },

    //哈利路亚  大哈利
    popEnter(el, done) {
      // this.isPrizeBroadcast = true;
      Velocity(el, "stop");
      Velocity(
        el,
        {
          scale: 1,
          opacity: 1
        },
        {
          duration: 400
        }
      );

      if (this.haliluyaTimer) {
        clearTimeout(this.haliluyaTimer);
        audioPlay("prizeAudio");
      }
      this.haliluyaTimer = setTimeout(() => {
        Velocity(
          el,
          {
            scale: 0.5,
            opacity: 0
          },
          {
            duration: 400,
            complete: () => {
              clearTimeout(this.haliluyaTimer);
              this.prizeBroadcast = null;
              // 查询队列是否还有要执行的
              if (this.prizeBroadcastArr.length) {
                var aniobj = this.prizeBroadcastArr[0];
                this.prizeBroadcast = aniobj;
                this.prizeBroadcastArr.splice(0, 1);
                // console.log("查询队列是否还有要执行的>>>>>>");
              } else {
                // console.log("oooooooooooo>>>>>>");
                this.isPrizeBroadcast = false;
              }
            }
          }
        );
      }, 9000);
    },
    //哈利路亚  小哈利
    popEnterMin(el, done) {
      // this.isPrizeBroadcast = true;
      Velocity(el, "stop");
      Velocity(
        el,
        {
          scale: 1,
          opacity: 1
        },
        {
          duration: 400
        }
      );

      if (this.haliluyaTimerMin) {
        clearTimeout(this.haliluyaTimerMin);
        // audioPlay("prizeAudio");
      }
      this.haliluyaTimerMin = setTimeout(() => {
        Velocity(
          el,
          {
            scale: 0.5,
            opacity: 0
          },
          {
            duration: 400,
            complete: () => {
              clearTimeout(this.haliluyaTimerMin);
              this.prizeBroadcastMin = null;
              // 查询队列是否还有要执行的
              if (this.prizeBroadcastMinArr.length) {
                var aniobj = this.prizeBroadcastMinArr[0];
                this.prizeBroadcastMin = aniobj;
                this.prizeBroadcastMinArr.splice(0, 1);
                // console.log("查询队列是否还有要执行的>>>>>>");
              } else {
                // console.log("oooooooooooo>>>>>>");
                this.isprizeBroadcastMin = false;
              }
            }
          }
        );
      }, 9000);
    },

    //
    setBulletTop() {
      let list = this.bulletTopList;
      let num = Math.floor(Math.random() * 10);
      if (list.length == 10) {
        list.splice(0, 1);
      }
      if (list.length > 0) {
        var index = -1;
        for (var i = 0; i < list.length; i++) {
          if (num == list[i]) {
            index = i;
            break;
          }
        }
        if (index == -1) {
          list.push(num);
        } else {
          this.setBulletTop();
        }
      } else {
        list.push(num);
      }
    },
    //弹幕进入之前
    bulletBeforeEnter(el) {
      let top = 0;
      this.setBulletTop();
      top = this.bulletTopList[this.bulletTopList.length - 1];
      el.style.top = top * 40 + "px";
    },
    //弹幕进入
    bulletEnter(el, done) {
      Velocity(el, "stop");
      Velocity(
        el,
        {
          left: "0%"
        },
        {
          duration: 400
        }
      );
      Velocity(
        el,
        {
          translateX: "-100%"
        },
        {
          duration: 400,
          delay: 8000,
          complete: () => {
            this.bulletList.splice(0, 1);
            done();
          }
        }
      );
    },

    //恭喜您中奖啦
    prizeTipEnter(el, done) {
      Velocity(el, "stop");
      Velocity(
        el,
        {
          left: 10
        },
        {
          duration: 400
        }
      );
      Velocity(
        el,
        {
          left: "-100%"
        },
        {
          duration: 400,
          delay: 3000,
          complete: () => {
            this.prizeTips.splice(0, 1);
            // if(this.prizeShowList.length>0){
            //     this.prizeTipEnter(el)
            // }
          }
        }
      );
    }
  }
};
</script>

<style lang="scss">

.aniinleft {
  left: 10px;
  // height: 40px;
  transition: left 0.4s;
  -moz-transition: left 0.4s; /* Firefox 4 */
  -webkit-transition: left 0.4s; /* Safari 和 Chrome */
  -o-transition: left 0.4s; /* Opera */
}
.anioutleft {
  left: -100%;
  // height: 40px;
  transition: left 0.4s;
  -moz-transition: left 0.4s; /* Firefox 4 */
  -webkit-transition: left 0.4s; /* Safari 和 Chrome */
  -o-transition: left 0.4s; /* Opera */
}
#talk_0,
#talk_1,
#talk_2,
#talk_3,
#talk_4,
#talk_5,
#talk_6,
#talk_7 {
  position: absolute;
  opacity: 0;
}
.mx_box {
  width: 358px;
  height: 251px;
  padding: 0 4px 0;
  box-sizing: border-box;

  .mx_title {
    font-size: 18px;
    color: #333333;
    line-height: 66px;
    height: 66px;

    img {
      width: 20px;
      height: 20px;
      margin-right: 1px;
      vertical-align: sub;
    }
  }
  .mx_item {
    height: 138px;
    padding: 2% 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    div {
      height: 31%;
      line-height: 46px;
      font-size: 12px;
      color: #333333;
      span {
        font-size: 12px;
        color: #ffab00;
      }
    }
  }
  .mx_foot {
    height: 47px;
    line-height: 47px;
    font-size: 12px;
    color: #f162f5;
    text-decoration: underline;
  }
}

// 今日明细
.jrmx_box {
  height: 40px;
  cursor: pointer;
  font-size: 12px;
  color: #f162f5;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 3;
  line-height: 40px;
  padding-right: 12px;
}

// 连麦
.talkUserBox {
  position: absolute;
  right: 20px;
  bottom: 70px;
  z-index: 99;
  cursor: pointer;
  .bthBox {
    font-size: 14px;
    color: #ffffff;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.5);
    text-align: center;
    margin: 10px 0 0;
    img {
      width: 5px;
      vertical-align: middle;
    }
  }
  .imgR {
    transform: rotate(180deg);
    -ms-transform: rotate(180deg); /* IE 9 */
    -moz-transform: rotate(180deg); /* Firefox */
    -webkit-transform: rotate(180deg); /* Safari 和 Chrome */
    -o-transform: rotate(180deg); /* Opera */
  }
  .taItem {
    width: 42px;
    height: 42px;
    position: relative;
    margin: 10px 0 0;
    img {
      width: 100%;
      position: absolute;
    }
    .avatar {
      width: 42px;
      height: 42px;
      border: 1px solid rgba(255,255,255,0.8);
      padding: 1px;
      top: 0px;
      left: 0px;
      border-radius: 50%;
      z-index: 1;
    }
    .vip_img {
      z-index: 2;
      width: 15px;
      right: 0;
      bottom: 0;
    }
    .ward_img {
      z-index: 1;
      width: 45px;
      height: 45px;
      left: -2px;
      top: -1px;
      // width: 15px;
    }
    .voice-wave{
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background-color: #f362f5;
      opacity: 0.5;
      position: absolute;
      left: 2px;
      top: 2px  ;
      z-index: 0;
    }
    &.active{
      .voice-wave{
        animation: zoomInOut 2s ease-out infinite;
      }
    }
  }
}

.content-room {
  // width: 1340px;
  // background: #fff;
  .popup-menu {
    position: fixed;
    z-index: 99;
    width: 200px;
    background-color: #3d3747;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    /*.icon-arrow{
          position: absolute;
          left: 100%;
          top: 0;
          z-index: 2;
          width: 10px;
          height: 100%;
          &:before{
            content: '';
            position: absolute;
            left: -1px;
            top: 30px;
            width: 0px;
            height: 0px;
            border: 10px solid transparent;
            border-left-color: #3D3747;
          }
        }*/
    .menu-top {
      margin-top: 6px;
      padding: 10px 20px;
    }
    .nickname {
      display: inline-block;
      vertical-align: middle;
      font-size: 16px;
      color: #fff;
      line-height: 24px;
      max-width: 7em;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    hr {
      border: 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin: 0 20px 8px;
    }
    .menu-list {
      overflow: hidden;
      > li {
        height: 28px;
        padding-left: 20px;
        padding-right: 20px;
        cursor: pointer;
        font-size: 12px;
        line-height: 28px;
        color: #fff;
        &:last-of-type {
          height: 36px;
          line-height: 36px;
          margin-top: 8px;
          &:before {
            content: "";
            display: block;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }
        }
        &:hover {
          background-color: #312c3a;
        }
        [class^="icon-"] {
          display: inline-block;
          width: 14px;
          height: 14px;
          vertical-align: middle;
          margin-top: -3px;
          margin-right: 8px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
        }
        .icon-gift {
          background-image: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-gifts.png");
        }
        .icon-love {
          background-image: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-fav.png");
        }
        .icon-talk {
          background-image: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-talk.png");
        }
        .icon-forbid {
          background-image: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-forbid.png");
        }
        .icon-kick {
          background-image: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-reject.png");
        }
        .icon-setAdmin {
          background-image: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-manager.png");
        }
        .icon-microphone {
          background-image: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-microphone.png");
        }
        .icon-userInfo {
          background-image: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-userinfo.png");
        }
      }
    }
  }
  .flash-area {
    position: absolute;
    pointer-events: none;
    left: 0;
    bottom: 0;
    width: 100%;
    /*height: 0;*/
    z-index: 3;
    overflow-y: visible;
    .flash-item {
      position: absolute;
      bottom: 0;
      z-index: 99;
      width: 100%;
      min-height: 300px;
      /*height: 780px;*/
    }
  }
  .prize-tip {
    position: absolute;
    top: 0;

    li {
      position: absolute;
      left: 0;
      top: 80px;
      z-index: 99;
      height: 40px;
      line-height: 40px;
      background-color: #312c3a;
      z-index: 99;
      white-space: nowrap;
      font-size: 14px;
      color: #fff;
    }
    img {
      width: 89px;
      height: 20px;
      vertical-align: middle;
      margin-top: -3px;
      margin-right: 4px;
    }
    .coins {
      color: #f0d388;
    }
  }
  #liveMedia_wrapper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    .vcp-player {
      height: 100%;
    }
    .download {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 99;
      width: 112px;
      height: 32px;
      margin-left: -56px;
      margin-top: -16px;
      background-color: #312c3a;
      z-index: 99;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
  }
  .info-dialog {
    .dialog-wrap {
      width: 400px;
    }
  }
  .prize-Popup {
    width: 320px;
    height: 320px;
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -160px;
    margin-top: -160px;
    z-index: 99;
    .bg-light {
      width: 300px;
      height: 300px;
      position: absolute;
      left: 50%;
      top: 50%;
      margin-top: -150px;
      margin-left: -150px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/room/light.png")
        no-repeat center;
      background-size: contain;
      animation: roll 3s linear infinite;
    }
    .prize-img {
      width: 100%;
      height: 100%;
      position: relative;
      z-index: 2;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/room/prize.png")
        no-repeat center;
      background-size: contain;
    }
    .tip-info {
      position: absolute;
      left: 0;
      top: 250px;
      width: 100%;
      text-align: center;
      z-index: 3;
      font-size: 18px;
      line-height: 24px;
      .nickname {
        display: inline-block;
        max-width: 7em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #fff;
      }
      .text {
        color: #fde008;
      }
    }
    &.small {
      width: 180px;
      height: 180px;
      left: 10px;
      top: auto;
      bottom: 100px;
      margin-left: 0px;
      margin-top: 0px;
      .bg-light {
        width: 160px;
        height: 160px;
        margin-top: -80px;
        margin-left: -80px;
      }
      .tip-info {
        top: 140px;
        width: 100%;
        font-size: 12px;
        line-height: 16px;
      }
    }
  }
  .bullet-gift {
    position: absolute;
    left: 0;
    top: 52px;
    width: 100%;
    height: 32px;
    overflow: hidden;
    z-index: 1;
    .bullet-info {
      cursor: pointer;
      min-width: 100%;
      height: inherit;
      position: absolute;
      animation: run 20s linear infinite;
      left: 0;
      top: 0;
      z-index: 99;
      font-size: 14px;
      color: #fff;
      line-height: 32px;
      // text-shadow: 1px 1px 1px #000000;
      // text-shadow: 0px 1px 1px rgba(0,0,0,0.5);
      span {
        text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.5);
      }
      .nickname {
        float: left;
        max-width: 7em;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 10px;
      }
      .label {
        float: left;
        margin-right: 10px;
      }
      .gift-name {
        float: left;
        margin-right: 10px;
        color: #ffea00;
      }
      .gift-mark {
        float: left;
        margin-top: 6px;
        width: 20px;
        height: 20px;
        margin-right: 10px;
      }
    }
  }
  .select-ul {
    min-width: 160px;
    background-color: #3d3747;
    position: absolute;
    left: 0;
    bottom: 100%;
    z-index: 999;
    margin-bottom: 10px;
    font-size: 14px;
    color: #333;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-height: 300px;
    overflow-y: auto;
    li {
      height: 30px;
      line-height: 30px;
      color: #fff;
      padding-left: 10px;
      padding-right: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &.selected {
        background-color: #312c3a;
      }
      &.living {
        color: #f362f5;
      }
    }
  }
  .bullet-screen {
    width: 100%;
    height: 0;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 99;
    /*.bullet-enter-active {
            transition: all .5s;
          }
          .bullet-enter {
            left: -100%;
          }*/
    .bullet {
      position: absolute;
      left: 100%;
      z-index: 99;
      white-space: nowrap;
      line-height: 40px;
      animation: run 10s linear forwards;
      .avatar {
        display: inline-block;
        vertical-align: middle;
        width: 34px;
        height: 34px;
        margin-right: 4px;
        border-radius: 50%;
      }
      .nickname {
        vertical-align: middle;
        color: #fff;
        font-size: 22px;
      }
      .msg-nowrap {
        vertical-align: middle;
        color: #51f0e3;
        font-size: 22px;
      }
      .emojiImg {
        display: inline-block;
        vertical-align: middle;
        margin-left: 3px;
        margin-top: -2px;
        width: 22px;
        height: 22px;
      }
    }
  }
  /*.ctrl-visitor {
        position: absolute;
        left: -200px;
        top: 0;
        z-index: 99;
        width: 200px;
        background-color: #3d3747;
        box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        padding-top: 15px;
        padding-bottom: 8px;
        &:before {
          content: "";
          position: absolute;
          right: -16px;
          top: 30px;
          z-index: 2;
          border: 10px solid transparent;
          border-left: 8px solid #3d3747;
        }
        .nickname {
          font-size: 16px;
          color: #fff;
          line-height: 24px;
          margin-bottom: 10px;
          padding-left: 20px;
          padding-right: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        hr {
          display: block;
          border: 0;
          border-top: 1px solid rgba(255, 255, 255, 0.3);
          width: 160px;
          margin: 5px auto;
        }
        .ctrl-li {
          cursor: pointer;
          padding-left: 20px;
          padding-right: 20px;
          height: 28px;
          line-height: 28px;
          font-size: 14px;
          color: #fff;
          &:hover {
            background-color: #312c3a;
          }
          i {
            display: inline-block;
            vertical-align: middle;
            width: 14px;
            height: 14px;
            margin-right: 8px;
          }
          span {
            vertical-align: middle;
          }
        }
        .icon-gift {
          background-image: url(https://lib.liaoke.tv/lib/pc/static/img/room/icon-gift.png);
        }
        .icon-fav {
          background-image: url(https://lib.liaoke.tv/lib/pc/static/img/room/icon-fav.png);
        }
        .icon-talk {
          background-image: url(https://lib.liaoke.tv/lib/pc/static/img/room/icon-talk.png);
        }
        .icon-forbid {
          background-image: url(https://lib.liaoke.tv/lib/pc/static/img/room/icon-forbid.png);
        }
        .icon-reject {
          background-image: url(https://lib.liaoke.tv/lib/pc/static/img/room/icon-reject.png);
        }
        .icon-manager {
          background-image: url(https://lib.liaoke.tv/lib/pc/static/img/room/icon-manager.png);
        }
        .icon-microphone {
          background-image: url(https://lib.liaoke.tv/lib/pc/static/img/room/icon-microphone.png);
        }
        .icon-userinfo {
          background-image: url(https://lib.liaoke.tv/lib/pc/static/img/room/icon-userinfo.png);
        }
      }*/
  .main {
    width: 1340px;
    margin-left: auto;
    margin-right: auto;
    // background: #fff;
  }
  .main-view {
    height: calc(100vh - 80px);
    min-height: 600px;
    padding-top: 20px;
    max-height: 980px;
    width: 1340px;
    overflow: hidden;
    position: relative;
    .view-l {
      float: left;
      width: 540px;
      max-width: 540px;
      height: 100%;
      background-color: #333;
      .bottom {
        position: absolute;
        left: 0;
        bottom: 0;
        z-index: 2;
        width: 100%;
        height: 60px;
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
    .view-m {
      float: left;
      position: relative;
      width: 448px;
      height: 100%;
      margin-left: 15px;
      background-color: #312c3a;
      overflow: hidden;
    }
    .view-r {
      float: right;
      width: 320px;
      height: 100%;
    }
    .video-area {
      position: relative;
      overflow: hidden;
      .focus-wrap {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 3;
        width: 100%;
        height: 52px;
        background-color: rgba(0, 0, 0, 0.3);
        padding-left: 20px;
        padding-right: 20px;
      }
      .anthor-dl {
        float: left;
        overflow: hidden;
        padding-top: 4px;
        dt {
          float: left;
          width: 44px;
          height: 44px;
          cursor: pointer;
          img {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #fff;
          }
        }
        dd {
          margin-left: 8px;
          float: left;
        }
        .nickname {
          max-width: 7em;
          font-size: 16px;
          line-height: 24px;
          color: #fff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .integral {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 20px;
        }
      }
      .btn-focus {
        float: right;
        margin-top: 12px;
        width: 52px;
        height: 28px;
        border: 0;
        font-size: 14px;
        color: #fff;
        background-color: #a35afe \9;
        background-image: linear-gradient(-90deg, #f362f5 0%, #a35afe 100%);
        border-radius: 53px;
      }
    }
    .about-anchor {
      height: 240px;
      background-color: #393345;
      margin-bottom: 15px;
      padding-bottom: 10px;
      .tab-hd {
        height: 40px;
        line-height: 40px;
        background-color: #312c3a;
        overflow: hidden;
        > li {
          cursor: pointer;
          position: relative;
          float: left;
          width: 33.3333%;
          text-align: center;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          &:before {
            content: "";
            position: absolute;
            left: 0px;
            top: 50%;
            width: 1px;
            height: 18px;
            margin-top: -9px;
            background-color: rgba(255, 255, 255, 0.3);
          }
          &.on {
            background-color: #393345;
            color: #d75bdd;
          }
          &:first-of-type:before,
          &.on:before,
          &.on + li:before {
            display: none;
          }
        }
      }
      .fans-wrap {
        height: calc(100% - 40px);
        overflow: hidden;
        position: relative;
        z-index: 3;
        background-color: #393345;
        transition: height 0.3s linear;
        &:hover {
          height: 500px;
          box-shadow: 0px 3px 5px 0 rgba(0, 0, 0, 0.5);
          .scroller {
            max-height: 500px;
          }
        }
      }
      .scroll-wrapper {
        height: calc(100% - 40px);
        overflow-y: auto;
      }
    }
    .visitor-wrapper {
      height: calc(100% - 255px);
      background-color: #393345;
      padding-bottom: 10px;
      position: relative;
      overflow: hidden;
      .head {
        overflow: hidden;
        margin: 0 15px;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.7);
      }
      .visitor-list {
        padding: 10px 0;
        overflow: hidden;
        li {
          position: relative;
        }
      }
      .visitor-dl {
        position: relative;
        overflow: hidden;
        padding: 10px 15px;
        cursor: default;
        &:hover {
          background-color: #292432;
        }
        dt {
          width: 30px;
          height: 30px;
          position: relative;
          float: left;
          .avatar {
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #fff;
          }
        }
        dd {
          line-height: 30px;
          float: left;
          margin-left: 10px;
        }
        .nickname {
          display: inline-block;
          vertical-align: middle;
          max-width: 7em;
          color: #fff;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .vip-mark {
          margin-left: 3px;
          width: 15px;
          height: 14px;
        }
        .level-mark,
        .nickname {
          margin-left: 3px;
        }
      }
      .scroll-wrapper {
        height: calc(100% - 40px);
        overflow-y: auto;
      }
    }
  }
  .msg-area {
    .top-tab {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2;
      width: 100%;
      height: 40px;
      background-color: #3d3747;
      .tab-hd {
        overflow: hidden;
        height: inherit;
        > li {
          float: left;
          height: inherit;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          width: 75px;
          text-align: center;
          line-height: 40px;
          position: relative;
          &:after {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            width: 1px;
            height: 18px;
            background-color: rgba(255, 255, 255, 0.3);
            transform: translate(-50%, -50%);
          }
          &:first-of-type:after,
          &.on:after,
          &.on + li:after {
            display: none;
          }
          &.on {
            background-color: #312c3a;
            color: #f362f5;
          }
        }
      }
    }
    .msg-view {
      position: absolute;
      left: 0;
      top: 40px;
      width: 100%;
      height: calc(100% - 40px - 375px);
      .highlight-msg {
        position: absolute;
        left: 0;
        top: 0;
        // z-index: 3;
        z-index: 2;
        width: 100%;
        height: 34px;
        line-height: 34px;
        background-color: rgba(215, 90, 254, 0.9);
        background-image: linear-gradient(90deg, #346bff 0%, #d75afe 100%);
        cursor: pointer;
        .icon-speaker {
          float: left;
          margin-top: 7px;
          width: 20px;
          height: 20px;
          margin-left: 20px;
          background-image: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-voice.gif");
          background-repeat: no-repeat;
          background-size: contain;
          background-position: center;
        }
        .avatar {
          float: left;
          margin-top: 5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          margin-left: 4px;
        }
        .nickname {
          float: left;
          margin-left: 4px;
          font-size: 12px;
          color: #fff;
          overflow: hidden;
          span {
            float: left;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 7em;
          }
          i {
            float: left;
          }
        }
        .msg-text {
          float: left;
          font-size: 12px;
          color: #fff;
          width: 280px;
          height: inherit;
          position: relative;
          overflow: hidden;
          span {
            white-space: nowrap;
            overflow: hidden;
            position: absolute;
            left: 0;
            top: 0;
            animation: run 12s linear infinite;
          }
          .emojiImg {
            display: inline-block;
            vertical-align: middle;
            width: 16px;
            height: 16px;
            margin-left: 2px;
            margin-top: -3px;
          }
        }
      }
    }
    .ctrl-area {
      width: 100%;
      height: 375px;
      position: absolute;
      left: 0;
      bottom: 0;
      z-index: 3;
      padding-left: 10px;
      padding-right: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      .input-area {
        width: 100%;
        height: 34px;
        position: relative;
        padding-right: 75px;
        input {
          width: 100%;
          height: inherit;
          border-radius: 34px;
          color: #fff;
          font-size: 12px;
          line-height: 24px;
          padding: 5px 16px;
          background-color: #292432;
          border: 0;
        }
        .btn-submit {
          position: absolute;
          right: 0;
          top: 0;
          width: 60px;
          height: 34px;
          border-radius: 34px;
          font-size: 12px;
          color: #fff;
          background-color: #3d3747;
          &:active {
            background-color: #292432;
          }
        }
      }
      .tab-wrap {
        margin-top: 15px;
        margin-bottom: 10px;
        height: 40px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        .coins {
          float: right;
          line-height: 24px;
          color: #fff;
          font-size: 14px;
          span {
            vertical-align: middle;
          }
        }
        .icon-coin {
          display: inline-block;
          vertical-align: middle;
          margin-right: 4px;
          width: 14px;
          height: 14px;
          background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-coin.png")
            no-repeat center / contain;
        }
        .btn-recharge {
          color: #f362f5;
          vertical-align: middle;
          margin-left: 10px;
        }
      }
      .gift-ctrl {
        line-height: 24px;
        margin-top: 5px;
        height: 24px;
        color: #fff;
        .left {
          height: inherit;
          .label {
            float: left;
            font-size: 14px;
            color: #fff;
          }
          .select-wrap {
            min-width: 110px;
            cursor: pointer;
            height: inherit;
            float: left;
            margin-left: 10px;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.5);
            position: relative;
            padding-right: 20px;
            &:after {
              content: "";
              position: absolute;
              right: 0px;
              top: 50%;
              margin-top: -2px;
              width: 10px;
              height: 10px;
              border-right: 1px solid rgba(255, 255, 255, 0.5);
              border-top: 1px solid rgba(255, 255, 255, 0.5);
              transform: rotate(-45deg);
            }
            .nickname {
              display: inline-block;
              vertical-align: middle;
              max-width: 7em;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
        }
        .right {
          height: inherit;
          .label {
            float: left;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
          }
          .amount {
            float: left;
            margin-left: 10px;
            width: 58px;
            height: 24px;
          }
          .btn-send {
            float: left;
            width: 54px;
            height: 24px;
            border-radius: 24px;
            margin-left: 20px;
            font-size: 12px;
            color: #fff;
            line-height: 24px;
            background-color: #f362f5;
            background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
          }
        }
      }
    }
  }
  .recommended-wrap {
    background-color: #f7f7f7;
    overflow: hidden;
    // width: 1340px;
    margin: auto;
    .sec-hd {
      font-size: 26px;
      color: #333;
      line-height: 48px;
      margin-top: 54px;
      margin-bottom: 24px;
      &:before {
        content: "";
        display: inline-block;
        width: 29px;
        height: 28px;
        vertical-align: middle;
        margin-top: -5px;
        margin-right: 20px;
        background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-recommend.png")
          no-repeat center / contain;
      }
    }
    .anchor-list {
      > li {
        float: left;
        width: 252px;
        margin-right: 20px;
        margin-bottom: 20px;
        &:nth-of-type(5n) {
          margin-right: 0;
        }
        .dt {
          width: 252px;
          height: 252px;
        }
      }
    }
  }
  .no-data {
    padding-top: 50px;
    text-align: center;
    .tip {
      display: block;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      line-height: 2;
    }
    .btn {
      width: 140px;
      height: 32px;
      border-radius: 32px;
      color: #fff;
      font-size: 14px;
      margin-top: 10px;
      background-color: #a35afe;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
    }
  }
  @keyframes run {
    0% {
      left: 100%;
      transform: translate(0, 0);
    }
    100% {
      left: 0;
      transform: translate(-100%, 0);
    }
  }
  @keyframes zoomInOut {
    0% {
      opacity: 0.8;
      transform: scale(1);
    }
    100% {
      opacity: 0.3;
      transform: scale(1.2);
    }
  }
}
</style>
