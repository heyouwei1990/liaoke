<template>
  <div class="service-component">
    <div class="target">
      <div class="server">聊客客服</div>
      <span class="work-time">{{workTime}}</span>
    </div>
    <div class="chat-area scroller" id="scroller">
      <div class="bar not-online" v-if="status==2">{{tipMsg}}</div>
      <div class="bar waiting" v-if="status==1">{{tipMsg}}</div>
      <ul class="msg-list">
        <li
          v-for="(item,index) in msgList"
          :key="index"
        >
          <div class="msg-time" v-if="item.time">{{item.time}}</div>
          <div :class="{'msg-l':item.uid!=hostUser.uid,'msg-r':item.uid==hostUser.uid}">
            <div class="avatar-wrap">
              <img :src="item.avatar" alt="" class="avatar">
            </div>
            <p class="msg-desc" v-if="item.data.data_type=='text'" v-html="item.data.content"></p>
            <div class="img-wrap" v-if="item.data.data_type=='picture'" @click="lookPicture(item)">
              <img :src="item.data.filename" alt="">
            </div>
          </div>
        </li>
        <!--<li class="msg-r">
          <div class="avatar-wrap">
            <img src="https://lib.liaoke.tv/lib/pc/static/img/preload.png" alt="" class="avatar">
          </div>
          <p class="msg-desc">你赶紧想想办法你赶紧想想办法你赶紧想想办法你赶紧想想办法</p>
        </li>-->
      </ul>
    </div>
    <div class="write-area">
      <div class="clearfix">
        <div class="btn btn-face" id="serverTalkFace" @click="showEmoji">
          <i class="icon-face"></i>
        </div>
      </div>
      <textarea class="textarea" ref="textarea" v-model="message"></textarea>
      <button class="btn-submit" @click="submit">发送</button>
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  import { pathJudge, defaultAvatar, replaceEmmoji, msgTime } from "@/util/tools";
  import Bus from "@/util/bus";
  export default {
    data(){
      return{
        workTime:'工作时间: 09:00-02:00', //工作时间
        status:0, //0、聊天中，1、等待，2、客服下班
        timer:null,
        duration:3000,
        tipMsg:'',
        message:'',
        serverUid:9999,
        msgList: [],
        viewer:null,
      }
    },
    computed:{
      ...mapState({
        hostUser: state => state.hostUser,
        mqtt_d: state => state.mqtt_d,
      })
    },
    watch:{
      mqtt_d(v){
        if(v && v.uid==this.serverUid){
          this.msgList.push(v);
        }
      },
      msgList(v) {
        if(v.length>0){
          let list=v;
          for(let i=0;i<list.length;i++){
            list[i].avatar=pathJudge(list[i].avatar);
            if(list[i].data.data_type=='text'){
              list[i].data.content=replaceEmmoji(list[i].data.content);
            }
            if(list[i].data.data_type=='picture'){
              list[i].data.filename=pathJudge(list[i].data.filename);
            }
            if (list[i + 1]) {
              //超过半小时就显示时间
              if (list[i + 1].created_at_ms - list[i].created_at_ms > 1800000) {
                list[i+1]['time'] = msgTime(list[i+1].created_at_ms);
              } else {
                list[i+1]['time'] = "";
              }
              // console.log( msgTime(list[i].created_at_ms) )
            }
            list[0]['time'] = msgTime(list[0].created_at_ms);
          }
        }
        this.$nextTick(() => {
          var el = document.getElementById("scroller");
          // el.scrollTo(0, div.scrollHeight + 100);
          el.scrollTop = el.scrollHeight;
        });
      },
    },
    mounted(){
      this.receiveEmoji();
      this.getSever();
      this.getMsgList();
      document.addEventListener("click", this.docClick, false);
    },
    destroyed(){
      document.removeEventListener("click", this.docClick, false);
    },
    methods:{
      getSever(){
        this.$get('/h5/staff/index').then(r=>{
          if(r.http_code==200){
            this.status=r.data.status;
            this.duration=r.data.reply;
            this.tipMsg=r.data.msg;
            this.workTime=r.data.work_time;
            if(this.status!=0){
              this.timer=setTimeout(()=>{
                this.getSever();
              },this.duration)
            }else{
              clearInterval(this.timer);
            }
          }
        })
      },

      //获取聊天记录
      getMsgList(){
        this.$get("/h5/chat/detail", {
          all: 1,
          to_uid: this.serverUid
          // chat_text_id: textId
        }).then(r => {
          if(r.http_code==200){
            this.msgList=r.data.list;
          }
        });
      },

      //打开表情包
      showEmoji() {
        event.stopPropagation();
        let el = event.target ? event.target : event.srcElement;
        while (el.getAttribute("id") !== "serverTalkFace") {
          el = el.parentNode;
        }
        if (this.isShowEmoji) {
          this.isShowEmoji = false;
          this.$store.commit("set_showEmoji", false);
        } else {
          this.isShowEmoji = true;
          this.$store.commit("set_showEmoji", true);
        }
        //表情包定位
        let iconHeight = el.offsetHeight + 10;
        let scrollTop = document.documentElement.scrollTop;
        let elLeft = 0;
        let elTop = 0;
        if (el.getBoundingClientRect()) {
          elLeft = el.getBoundingClientRect().left;
          elTop = el.getBoundingClientRect().top;
        } else {
          elLeft = el.x - el.offsetX;
          elTop = el.y - el.offsetY;
        }
        let abTop = elTop - 180 + scrollTop;
        /*if (window.innerHeight - elTop - 180 < 0) {
          // elTop = elTop + iconHeight + scrollTop;
          elTop = elTop - 180 + scrollTop;
        }*/
        let pos = {};
        pos["top"] = abTop + "px";
        pos["left"] = elLeft + "px";
        pos["z-index"] = "999";
        this.$store.commit("set_emojiPosition", pos);
      },

      //document点击
      docClick() {
        //关闭表情包
        this.$store.commit("set_showEmoji", false);
      },

      //接收选中的表情
      receiveEmoji() {
        Bus.$on("chooseEmoji", text => {
          this.message += text;
          if (this.$refs.textarea) {
            this.$refs.textarea.focus();
          }
        });
      },


      //提交消息
      submit() {
        if (this.message == "") return;
        var message = this.message;
        this.message = "";
        this.$get("/h5/chat/send", {
          to_uid: this.serverUid,
          content: message
        }).then(r => {
          if (r.http_code == 200) {
            this.msgList.push(r.data.msg);
          }
        });
      },

      //查看图片
      lookPicture(data){
        let el=event.target?event.target:event.srcElement;
        this.viewer && this.viewer.destroy();
        this.viewer = new Viewer(el);
        this.viewer.show();
      }
    }
  }
</script>

<style lang="scss">
.service-component{
  position: relative;
  padding-top: 80px;
  padding-bottom: 160px;
  width: 800px;
  min-height: 600px;
  height: 600px;
  border-right:1px solid #ddd;
  .target{
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 80px;
    border-bottom: 1px solid #ddd;
    padding: 25px 40px;
    line-height: 30px;
  }
  .server{
    float: left;
    font-size: 16px;
    color: #333;
    &:before{
      content: '';
      display: inline-block;
      vertical-align: middle;
      margin-top: -3px;
      margin-right: 10px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #ff4147;
    }
  }
  .work-time{
    color: #999;
    font-size: 12px;
    margin-left: 30px;
    float: left;
  }
  .bar{
    position: absolute;
    left: 50%;
    top: 110px;
    z-index: 9;
    transform: translate(-50%);
    display: block;
    width: 250px;
    height: 30px;
    padding-top: 5px;
    padding-bottom: 5px;
    font-size: 12px;
    color: #fff;
    line-height: 20px;
    text-align: center;
    border-radius: 4px;
  }
  .not-online{
    background-color: #ccc\9;
    background-image: linear-gradient(90deg, #909090 0%, #c3c3c3 100%);
    box-shadow: 2px 2px 10px rgba(100,100,100,.5);
  }
  .waiting{
    background-color: #F362F5\9;
    background-image: linear-gradient(90deg, #F362F5 0%, #A35AFE 100%);
    box-shadow: 2px 2px 10px rgba(243,98,245,.5);
  }
  .chat-area{
    height: 100%;
    border-bottom: 1px solid #ddd;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .msg-list {
    padding: 20px 40px;
    > li {
      overflow: hidden;
      margin-bottom: 30px;
    }
    .interval {
      display: block;
      text-align: center;
      font-size: 12px;
      color: #999;
      line-height: 2;
      margin-bottom: 30px;
    }
    .avatar-wrap {
      width: 40px;
      height: 40px;
      position: absolute;
      top: 0;
      .avatar {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
    }
    .msg-desc {
      margin-top: 20px;
      min-height: 40px;
      padding: 8px 20px;
      font-size: 14px;
      color: #333;
      line-height: 24px;
      position: relative;
      max-width: 540px;
      word-break: break-all;
      border-radius: 4px;
    }
    .img-wrap {
      overflow: hidden;
      position: relative;
      max-width: 100px;
      max-height: 200px;
      cursor: pointer;
      img {
        border-radius: 10px;
        display: block;
        max-width: 100%;
        max-height: 100%;
      }
    }
    .can-click {
      cursor: pointer;
    }
    .msg-l,
    .msg-r {
      overflow: hidden;
      position: relative;
    }
    .msg-l {
      padding-left: 60px;
      .avatar-wrap {
        left: 0;
      }
      .img-wrap {
        float: left;
      }
      .msg-desc {
        float: left;
        background-color: #eee;
        &:before {
          content: "";
          position: absolute;
          left: -8px;
          top: 10px;
          z-index: 2;
          width: 9px;
          height: 18px;
          background: url("https://lib.liaoke.tv/lib/pc/static/img/center/msg-left.png")
          no-repeat top right / contain;
        }
      }
    }
    .msg-r {
      padding-right: 60px;
      .avatar-wrap {
        right: 0;
      }
      .img-wrap {
        float: right;
      }
      .msg-desc {
        float: right;
        background-color: #ddf2fc;
        &:before {
          content: "";
          position: absolute;
          right: -8px;
          top: 10px;
          z-index: 2;
          width: 9px;
          height: 18px;
          background: url("https://lib.liaoke.tv/lib/pc/static/img/center/msg-right.png")
          no-repeat top left / contain;
        }
      }
    }
    .msg-time {
      text-align: center;
      font-size: 12px;
      color: #999;
      line-height: 24px;
    }
    .emojiImg {
      width: 24px;
      height: 24px;
      display: inline-block;
      vertical-align: middle;
      margin-top: -3px;
      margin-left: 2px;
      margin-right: 2px;
    }
  }
  .write-area{
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 160px;
    padding: 10px 20px;
    .btn-face{
      float: left;
      cursor: pointer;
      margin-left: 20px;
    }
    .icon-face{
      display: inline-block;
      vertical-align: middle;
      width: 16px;
      height: 16px;
      margin-right: 8px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/center/icon-face.png") no-repeat center /cover;
    }
    .label{
      vertical-align: middle;
      font-size: 12px;
      color: #666;
      line-height: 20px;
    }
    .textarea{
      width: 100%;
      height: 70px;
      background-color: #fff;
      overflow-y: auto;
      overflow-x: hidden;
      word-break: break-all;
      margin-top: 4px;
      border: 0;
      padding: 6px 10px;
      font-size: 14px;
      font-family: inherit;
      color: #333;
      line-height: 20px;
      outline: 0;
    }
    .btn-submit{
      position: absolute;
      right: 30px;
      bottom: 15px;
      min-width: 60px;
      height: 28px;
      color: #fff;
      font-size: 12px;
      border-radius: 40px;
      background-color: #F362F5\9;
      background-image: linear-gradient(90deg, #F362F5 0%, #A35AFE 100%);
      &:disabled{
        background-color: #ccc;
        background-image: none;
      }
    }
  }
}
</style>
