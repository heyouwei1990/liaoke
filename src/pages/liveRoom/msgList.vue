<!--聊天信息列表-->
<template>
  <div class="msg-component ">
    <div class="scroll-wrapper" ref="scroller" @scroll="msgScroll">
      <ul class="msg-flow">
        <li
          v-if="list.length>0"
          v-for="(item, index) in list"
          :key="index"
          ref="msgItem"
          @mouseleave="leave"
        >
          <!--系统消息——初始化消息-->
          <div
            v-if="index===0"
            class="system"
            style="padding-left: 0;"
          >
            <b>系统公告：{{item.content}}</b>
          </div>
          <!--end-->
          <!--系统消息——普通消息-->
          <div
            v-if="item.type==='text' && item.data.custom.length==0"
            class="system"
          >
            <time>{{item.data.receive_time}}</time>
            <b>系统消息：</b>
            <b v-html="item.data.content"></b>
          </div>
          <!--end-->
          <!--系统消息——烟花消息-->
          <div
            v-if="item.type==='text' && item.data.custom.length==3"
            class="system"
          >
            <time>{{item.data.receive_time}}</time>
            <b>系统消息：</b>
            <b v-html="item.data.content"></b>
            <a class="jump" href="javascript:void(0)" @click="$router.push({name:'LiveRoom',params:{uid:item.data.custom[2].params.id}})">{{item.data.custom[2].title}}</a>
          </div>
          <!--end-->
          <!--系统消息——烟花获奖消息-->
          <div
            v-if="item.type==='firework_data'"
            class="system"
          >
            <time>{{item.data.receive_time}}</time>
            <b @click="look(item.data.user.uid)">
              系统消息：
              <span>{{item.data.user.nickname}}</span>在房间绽放了一朵烟花，您获得了{{item.data.win_coins | formatNo}}金币奖励！
            </b>
          </div>
          <!--end-->
          <!--系统消息——新增守护消息-->
          <div
            v-if="item.type==='text' && item.data.custom.length==2"
            class="system"
            @click="look(item.data.custom[1].params.id)"
          >
            <time>{{item.data.receive_time}}</time>
            <b>系统消息：</b>
            <b v-html="item.data.content"></b>
          </div>
          <!--end-->
          <!--奖品消息-->
          <div
            v-if="item.type=='draw_log'"
            class="system"
          >
            <time>{{item.data.receive_time}}</time>
            <b>
              系统消息：
              <span @click="look(item.data[0].uid)">{{item.data[0].user_nickname}}</span>
              送
              <span @click="look(item.data[0].roomid)">{{item.data[0].to_user_nickname}}</span>
              的
              {{item.data[0].gift_name}}，喜获{{item.data[0].coin | formatNo}}
              金币
            </b>
          </div>
          <!--end-->
          <!--飘屏消息-->
          <div v-if="item.type=='bullet'" class="system">
            <time>{{item.data.receive_time}}</time>
            <b v-if="item.data.user.id==0">
              <span>{{item.data.user.nickname}}：</span>
              <span v-html="item.data.msg.content"></span>
            </b>
            <div v-else>
              <img class="level-mark" :src="item.data.user.wealth_level_img" alt="level">
              <img v-if="item.data.user.vip_img" class="vip-mark" :src="item.data.user.vip_img" alt="level">
              <img v-if="item.data.user.ward_img" class="ward-mark" :src="item.data.user.ward_img" alt="level">
              <span class="girl-mark" v-if="item.data.user.gender && item.data.user.gender==2"></span>
              <span class="nickname" @click="look(item.data.user.id)">{{item.data.user.nickname}}：</span>
              <span class="msg-text" v-html="item.data.msg.content"></span>
            </div>
          </div>
          <!--end-->
          <!--聊天消息-->
          <div v-if="item.type==='room_text' && !item.data.to_user">
            <time>{{item.data.receive_time}}</time>
            <img v-if="item.data.user.id != anchor.id" class="level-mark" :src="item.data.user.wealth_level_img" alt="level">
            <img v-else class="level-mark" :src="item.data.user.live_level_img" alt="level">
            <img v-if="item.data.user.vip_img" class="vip-mark" :src="item.data.user.vip_img" alt="level">
            <img v-if="item.data.user.ward_img" class="ward-mark" :src="item.data.user.ward_img" alt="level">
            <span class="girl-mark" v-if="item.data.user.gender && item.data.user.gender==2"></span>
            <b class="nickname" @click="look(item.data.user.id)">{{item.data.user.nickname}}:</b>
            <span class="msg-text" v-html="item.data.content"></span>
          </div>
          <div v-if="item.type==='room_text' && item.data.to_user">
            <time>{{item.data.receive_time}}</time>
            <img v-if="item.data.user.id != anchor.id" class="level-mark" :src="item.data.user.wealth_level_img" alt="level">
            <img v-else class="level-mark" :src="item.data.user.live_level_img" alt="level">
            <img v-if="item.data.user.vip_img" class="vip-mark" :src="item.data.user.vip_img" alt="level">
            <img v-if="item.data.user.ward_img" class="ward-mark" :src="item.data.user.ward_img" alt="level">
            <span class="girl-mark" v-if="item.data.user.gender && item.data.user.gender==2"></span>
            <b class="nickname" @click="look(item.data.user.id)">{{item.data.user.nickname}}</b>
            <span class="label">对</span>
            <img class="level-mark" :src="item.data.to_user.wealth_level_img" alt="level">
            <img v-if="item.data.to_user.vip_img" class="vip-mark" :src="item.data.to_user.vip_img" alt="level">
            <img v-if="item.data.to_user.ward_img" class="ward-mark" :src="item.data.to_user.ward_img" alt="level">
            <b class="nickname" @click="look(item.data.to_user.uid)">{{item.data.to_user.nickname}}</b>
            <span class="label">说：</span>
            <span class="msg-text" v-html="item.data.content"></span>
          </div>
          <!--end-->
          <!--分享了主播-->
          <div v-if="item.type==='room_shared'">
            <time>{{item.data.receive_time}}</time>
            <img class="level-mark" :src="item.data.user.wealth_level_img" alt="level">
            <img v-if="item.data.user.vip_img" class="vip-mark" :src="item.data.user.vip_img" alt="level">
            <img v-if="item.data.user.ward_img" class="ward-mark" :src="item.data.user.ward_img" alt="level">
            <span class="girl-mark" v-if="item.data.user.gender && item.data.user.gender==2"></span>
            <b class="nickname" @click="look(item.data.user.id)">{{item.data.user.nickname}}:</b>
            <b class="followed">分享了本直播间</b>
          </div>
          <!--end-->
          <!--关注了主播-->
          <div v-if="item.type==='user_fav'">
            <time>{{item.data.receive_time}}</time>
            <img class="level-mark" :src="item.data.user.wealth_level_img" alt="level">
            <img v-if="item.data.user.vip_img" class="vip-mark" :src="item.data.user.vip_img" alt="level">
            <img v-if="item.data.user.ward_img" class="ward-mark" :src="item.data.user.ward_img" alt="level">
            <span class="girl-mark" v-if="item.data.user.gender && item.data.user.gender==2"></span>
            <b class="nickname" @click="look(item.data.user.id)">{{item.data.user.nickname}}:</b>
            <b class="followed">关注了主播</b>
          </div>
          <!--end-->
          <!--||'room_set_shut_up'||'room_unset_shut_up'||'user_kick'||'room_set_admin'||'room_unset_admin'-->
          <div
            v-if="item.type==='room_set_shut_up'
          || item.type==='room_unset_shut_up'
          || item.type==='room_kick'
          || item.type==='room_unset_admin'
          || item.type==='room_set_admin'"
            class="system"
          >
            <time>{{item.data.receive_time}}</time>
            <img class="level-mark" :src="item.data.user.wealth_level_img" alt="level">
            <img v-if="item.data.user.vip_img" class="vip-mark" :src="item.data.user.vip_img" alt="level">
            <img v-if="item.data.user.ward_img" class="ward-mark" :src="item.data.user.ward_img" alt="level">
            <span class="girl-mark" v-if="item.data.user.gender && item.data.user.gender==2"></span>
            <b class="nickname" @click="look(item.data.user.id)">{{item.data.user.nickname}}:</b>
            <b>{{item.data.text}}</b>
            <!--<span class="nickname" @click="look(item.data.user.id)">{{item.data.user.nickname}}</span> {<b>{item.data.text}}</b>-->
          </div>
          <!--礼物消息-->
          <div v-if="item.type==='gift_log'">
            <time>{{item.data.receive_time}}</time>
            <img class="level-mark" v-if="item.data[0].gift_log.wealth_level_img" :src="item.data[0].gift_log.wealth_level_img" alt="">
            <img class="vip-mark" v-if="item.data[0].gift_log.vip_img" :src="item.data[0].gift_log.vip_img" alt="">
            <img class="ward-mark" v-if="item.data[0].gift_log.ward_img" :src="item.data[0].gift_log.ward_img" alt="">
            <!--<span class="girl-mark" v-if="item.data.user.gender && item.data.user.gender==2"></span>-->
            <b class="nickname" @click="look(item.data[0].coin_log.uid)">{{item.data[0].gift_log.user_nickname}}:</b>
            <b class="followed">
              送给
              <span class="nickname" v-if="item.data[0].gift_log.to_uid != anchor.id">{{item.data[0].gift_log.to_nickname}}</span>
              <span v-else>主播</span>
              {{item.data[0].gift_log.name}} ×{{item.data[0].gift_log.number}}
            </b>
          </div>
          <!--end-->
          <!--入场-->
          <div v-if="item.type==='room_in'">
            <time>{{item.data.receive_time}}</time>
            <img class="level-mark" :src="item.data.user.wealth_level_img" alt="level">
            <img v-if="item.data.user.vip_img" class="vip-mark" :src="item.data.user.vip_img" alt="level">
            <img v-if="item.data.user.ward_img" class="ward-mark" :src="item.data.user.ward_img" alt="level">
            <span class="girl-mark" v-if="item.data.user.gender && item.data.user.gender==2"></span>
            <b class="nickname" @click="look(item.data.user.id)">{{item.data.user.nickname}}</b>
            <b class="in" v-if="(item.data.user.ward_data && item.data.user.ward_data.level > 0) || item.data.user.wealth_level >= 25">闪亮登场！</b>
            <b class="in" v-else>来捧场了！</b>
          </div>
          <!--end-->
        </li>
      </ul>
    </div>
    <div class="unread-tip" v-if="unread>0" @click="lookLast">{{unread}}条未读消息</div>
  </div>
</template>

<script>
  export default {
    data(){
      return{
        unread:0,
      }
    },
    props:{
      list:{
        type:Array,
        default:[]
      },
      listType:{
        type:[String,Number],
        default:0
      },
      anchor:{
        type:Object,
        default:()=>{
          return{}
        }
      }
    },
    watch:{
      list(v){
        this.$nextTick(()=>{
          let st=Math.floor(this.$refs.scroller.scrollTop);
          let sh=this.$refs.scroller.scrollHeight;
          let oh=this.$refs.scroller.offsetHeight;
          let addH=0;
          if(this.$refs.msgItem[v.length-1]){
            addH=this.$refs.msgItem[v.length-1].offsetHeight
          }
          // console.log(sh-oh,st+addH+100)
          if(sh-oh>st+addH+100){
            this.unread++;
          }else{
            this.unread=0;
            this.$refs.scroller.scrollTop=this.$refs.scroller.scrollHeight;
          }
        })
      },
      listType(v){
        this.$nextTick(()=>{
          this.lookLast();
        })
      }
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
      setTimeout(this.lookLast,1000);
    },
    methods:{
      // 查看信息弹框
      look(data){
        this.$emit('lookInfo',data);
      },
      // 鼠标离开关闭弹框
      leave(){
        this.$emit('leave')
      },
      // 查看最新消息
      lookLast(){
        this.unread=0;
        this.$refs.scroller.scrollTop = this.$refs.scroller.scrollHeight;
      },
      msgScroll(){
        let st=Math.ceil(this.$refs.scroller.scrollTop);
        let sh=this.$refs.scroller.scrollHeight;
        let oh=this.$refs.scroller.offsetHeight;
        if(sh-oh<st+30){
          this.unread=0;
        }
      }
    }
  }
</script>

<style lang="scss">
  .msg-component{
    height: 100%;
    position: relative;
    .scroll-wrapper{
      height: 100%;
      overflow-y: auto;
    }
    .unread-tip{
      position: absolute;
      right: 0;
      bottom: 0;
      z-index: 9;
      min-width: 140px;
      height: 30px;
      line-height: 30px;
      background-color: rgba(0,0,0,0.8);
      background-image: linear-gradient(90deg, #346bff 0%, #d75afe 100%);
      font-size: 12px;
      color: #fff;
      padding-left: 20px;
      padding-right: 20px;
      cursor: pointer;
    }
    .msg-flow{
      padding: 10px 20px;
      min-height: 100%;
      .system{
        color: #FF485F;
        font-size: 14px;
        .nickname{
          vertical-align: baseline;
        }
      }
      >li{
        overflow: hidden;
        word-break: break-all;
        line-height: 24px;
        margin-bottom: 10px;
        font-size: 14px;
        >div{
          position: relative;
          padding-left: 36px;
        }
      }
      .girl-mark{
        display: inline-block;
        vertical-align:middle;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: #ff6692;
        /*background-image: linear-gradient(180deg, #ff90b0 0%, #ff6692 100%);*/
        background: #ff6692 url("https://lib.liaoke.tv/lib/pc/static/img/icon-woman.png") no-repeat center;
        background-size: 10px;
      }
      time{
        font-size: 12px;
        color: #fff;
        position: absolute;
        left: 0;
        top: 0;
        line-height: 24px;
        opacity: 0.4;
      }
      .level-mark{
        margin-right: 4px;
      }
      .jump{
        color: #fff;
      }
      .vip-mark{
        width: 15px;
        height: 14px;
      }
      .nickname{
        color: #F0D388;
        vertical-align: middle;
        cursor: pointer;
      }
      .label{
        vertical-align: middle;
        color: rgba(255,255,255,0.5);
      }
      .in{
        color: rgba(255,255,255,0.5);
        vertical-align: middle;
        /*color: #F0D388;*/
      }
      .followed{
        color: #F162F5;
        vertical-align: middle;
        .nickname{
          vertical-align: baseline;
        }
      }
      .msg-text{
        color: #fff;
        vertical-align: middle;
      }
      .emojiImg{
        display: inline-block;
        vertical-align: middle;
        width: 30px;
        height: 30px;
        margin-left: 2px;
        margin-top: -3px;
      }
    }
  }
</style>
