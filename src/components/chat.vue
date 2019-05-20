<template>
  <div class="chat-component">
    <audio id="audio"></audio>
    <ul class="talker-list scroller">
      <li v-if="chatList.length>0" v-for="(item,index) in chatList" :key="index" :style="{backgroundColor:msgListId==item.uid?'#eee':''}">
        <div class="item-dl">
          <div class="item-dt" @click="goZone(item.uid)">
            <img class="avatar" :src="item.avatar" alt="">
            <span class="msg-num" v-if="item.unreads>0">
              {{item.unreads
              <99?item.unreads:99}}</span>
          </div>
          <div class="item-dd" @click="getMsgList(1,item.uid,item.chat_list_id,index)">
            <div class="nickname">{{item.nickname}}</div>
            <!-- <p class="last-msg">{{item.last_msg.content}}</p> -->
            <p class="last-msg" v-if="item.last_msg.content" v-html="item.last_msg.content"></p>
          </div>
        </div>
      </li>
      <!-- <li v-if="!chatList.length" style="font-size:14px;color:#999">
        暂无数据！
      </li> -->
    </ul>
    <div class="chat-right">
      <div class="target">
        <div v-if="targetUser">
          <span class="nickname">{{targetUser.nickname}}</span>
          <!--<span class="sex-mark" :class="{'man':info.gender==1,'woman':info.gender==2}">-->
          <span class="sex-mark" :class="{mam:targetUser.gender==1,woman:targetUser.gender!=1}">
            <i class="icon-sex"></i>
            <i class="age">{{targetUser.age}}</i>
          </span>
          <img :src="targetUser.live_level_img" alt="" class="level-mark">
          <img :src="targetUser.wealth_level_img" alt="" class="level-mark">
        </div>
      </div>
      <div class="chat-area scroller" id="scroller">
        <ul class="msg-list">
          <li v-for="(item,index) in msgList" :key="index" v-if="hostUser">
            <p class="interval" v-if="item.time">{{item.time}}</p>
            <div :class="{'msg-l':item.uid!=hostUser.uid,'msg-r':item.uid==hostUser.uid}">
              <div class="avatar-wrap" @click="goZone(item.uid)">
                <img :src="item.avatar" alt="" class="avatar">
              </div>
              <p class="msg-desc" v-if="item.data.data_type=='text'" v-html="item.data.content">
              </p>
              <p class="msg-desc" v-if="item.data.data_type=='chat'">{{item.data.content}}</p>

              <!-- <p class="msg-desc" v-if="item.data.data_type=='custom'">{{item.data.content}}
                <span class="look" @click="lookActivity(item)">{{item.data.custom[0].title}}</span>
              </p>
              <div class="img-wrap can-click" v-if="item.data.data_type=='private_video'" @click="lookVideo(item)">
                <img :src="item.data.cover" alt="">
                <i class="icon-play"></i>
              </div>
              <div class="img-wrap can-click" v-if="item.data.data_type=='private_photo'" @click="lookPhoto(item)">
                <img :src="item.data.cover" alt="">
                <i class="icon-lock"></i>
              </div>
              <div class="img-wrap" v-if="item.data.data_type=='gif_face'">
                <img :src="item.data.file_name" alt="">
              </div>
              <div class="img-wrap can-click" v-if="item.data.data_type=='picture'" @click="lookPhoto(item)">
                <img :src="item.data.file_name" alt="">
              </div> -->
              <p class="msg-desc" v-if="item.data.data_type=='custom'">{{item.data.content}}
                <span class="look" @click="lookActivity(item)">{{item.data.custom[0].title}}</span>
              </p>
              <div class="img-wrap can-click" v-if="item.data.data_type=='private_video'" @click="lookVideo(item)">
                <img :src="item.data.cover" alt="">
                <i class="icon-play"></i>
              </div>
              <div class="img-wrap can-click" v-if="item.data.data_type=='private_photo'" :id="'photo'+item.data.id" @click="lookPhoto(item)">
                <img :src="item.data.cover" alt="">
                <i class="icon-lock"></i>
              </div>
              <div class="img-wrap" v-if="item.data.data_type=='gif_face'">
                <img :src="item.data.file_name" alt="">
              </div>

              <!-- <p class="msg-desc audioBox" v-if="item.data.data_type=='audio'" @click="playaudio(item.data.url)">
                <img src="https://lib.liaoke.tv/lib/pc/static/img/audio.png" alt=""> {{item.data.duration}}“
                <span class="yuan"></span>  圆点暂时隐藏
              </p> -->

              <div class="img-wrap can-click" v-if="item.data.data_type=='picture'" :id="'photo'+item.data.id" @click="lookPhoto(item)">
                <img :src="item.data.file_name" alt="">
              </div>

              <div class="can-click  giftboX sj_ " :style="{float:hostUser.uid!=item.to_uid?'right':'left'}" v-if="item.data.data_type=='gift'">
                <div :class="hostUser.uid==item.to_uid?'left_sj':'right_sj'"></div>
                <div :style="{float:hostUser.uid!=item.to_uid?'right':'left'}">
                  <img :src="item.data.file_name" alt="">
                </div>
                <div :style="{float:hostUser.uid==item.to_uid?'right':'left'}">
                  <div class="n_1">{{item.data.name}}</div>
                  <div class="n_2">x{{item.data.number}}</div>
                  <div class="n_3">{{item.data.showD}}</div>
                </div>
              </div>
            </div>
          </li>
          <!--<li class="msg-m">5月27日  14:22</li>
          <li class="">

          </li>-->
        </ul>
      </div>
      <div class="write-area">
        <div class="clearfix">
          <div class="btn" id="talkFace" @click="showEmoji">
            <i class="icon-face"></i>
          </div>
          <!--<div class="btn" @click="">
            <i class="icon-add"></i>
          </div>-->
        </div>
        <!-- placeholder="单次最多发送100个字符" -->
        <textarea class="textarea" ref="textarea" v-model="message" @keyup.enter="submit"></textarea>
        <button class="btn-submit" :disabled="disabledSubmit" @click="submit">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  pathJudge,
  defaultAvatar,
  levelMark,
  replaceEmmoji,
  setStore,
  getStore,
  removeStore,
  msgTime
} from "@/util/tools";
import Emoji from "@/components/emoji";
import Bus from "@/util/bus";
import { mapState } from "vuex";
import { Checkbox } from "element-ui";

export default {
  components: {
    Emoji,
    "el-checkbox": Checkbox
  },
  data() {
    return {
      chatList: [],
      lastTime: null,
      targetUser: null,
      msgList: [],
      msgListId: "", //  右侧打开的 用户id  更新左侧背景显示
      isShowEmoji: false,
      message: "",
      disabledSubmit: true,
      viewer: null, //照片查看器
      chatBg: 0, //#eee
      ignoreVideo: false
    };
  },
  watch: {
    message(v) {
      if (v != "") {
        this.message = v.slice(0, 100); //100  个字符限制
        //  console.log(v)
        this.disabledSubmit = false;
      } else {
        this.disabledSubmit = true;
      }
    },
    msgList(v) {
      this.$nextTick(() => {
        var el = document.getElementById("scroller");
        // el.scrollTo(0, div.scrollHeight + 100);
        el.scrollTop = el.scrollHeight;
      });
    },
    mqtt_d(v) {
      if (v.type == "text") {
        for (let index = 0; index < this.chatList.length; index++) {
          if (this.chatList[index].uid == v.uid) {
            var obj = this.chatList[index];
            obj.unreads = Number(obj.unreads) + 1;
            obj.last_msg.content = v.data.content;
            if (this.chatBg == index) {
              this.chatBg += 1;
              this.chatList[index].unreads = 0;
              this.chatList[index].last_msg.content = v.data.content;
              // this.chatList[index].last_msg.content = "哪路错了";
            }
            this.chatList.splice(index, 1);
            this.chatList.unshift(obj);

            if (this.msgList[this.chatBg].uid == v.uid) {
              var arr = [];
              arr.push(v);
              this.unreads(this.msgChange(arr)[0].uid); //主动push  单用户已读
              this.$store.commit("setmsgCont"); //获取所有未读消息
            }

            if (this.chatList[0].uid == this.msgListId) {
              this.chatList[0].unreads = 0;
            }
            this.addchatdetail(1, this.targetUser.uid);
          } else {
            //
            this.getChatList_mqtt(); //不在列表  刷新列表  获取最新
            break;
          }
        }
      }
    },
  },
  computed: {
    ...mapState({
      hostUser: state => state.hostUser,
      mqtt_d: state => state.mqtt_d,
      talkTo: state => state.talkTo,
    })
  },
  mounted() {
    // this.dataInit();
    this.receiveEmoji();
    this.getChatList(() => {
      // console.log(this.chatList);
      if(this.talkTo){
        this.receiveTarget();
        return;
      }
      this.getMsgList(
        1,
        this.chatList[0].uid,
        this.chatList[0].chat_list_id,
        0
      );
    });
    document.addEventListener("click", this.docClick, false);
  },
  destroyed() {
    document.removeEventListener("click", this.docClick, false);
  },
  methods: {
    //播放音频
    playaudio(src) {
      var audio = document.getElementById("audio");
      audio.setAttribute("src", src);
      // "http://www.w3school.com.cn/i/horse.ogg"
      if (audio !== null) {
        //检测播放是否已暂停.audio.paused 在播放器播放时返回false.
        if (audio.paused) {
          audio.currentTime = 0;
          audio.play(); //audio.play();// 这个就是播放
        } else {
          audio.pause(); // 这个就是暂停
        }
      }
    },
    //打开个人主页
    goZone(id) {
      let routerData = this.$router.resolve({
        name: "Zone",
        params: { uid: id }
      });
      window.open(routerData.href, "_blank");
    },

    dataInit() {
      this.getChatList();
    },
    // 获取聊天对象列表
    getChatList(cb) {
      if (this.chatList.length != 0) {
        this.lastTime = this.chatList[0].last_time;
      }
      this.$get("/h5/chat/index", {
        // last_time: this.lastTime
      }).then(r => {
        // console.log(r.data);
        if (r.http_code != 200) return;
        let list = r.data.list;
        if (!list.length) return;
        for (let i = 0; i < list.length; i++) {
          list[i].avatar =
            list[i].avatar != ""
              ? pathJudge(list[i].avatar)
              : defaultAvatar(list[i].avatar);
          if (list[i].last_msg.data_type == "custom") {
            list[i].last_msg.content = list[i].last_msg.content.replace(
              "[##]",
              "点击查看>>"
            );
          }
        }
        this.chatList = list.sort((a, b) => {
          return b["last_time"] - a["last_time"];
        });
        cb && cb();
      });
    },
    // 获取聊天对象列表
    getChatList_mqtt() {
      this.$get("/h5/chat/index", {
        // last_time: this.lastTime
      }).then(r => {
        // console.log(r.data);
        if (r.http_code != 200) return;
        let list = r.data.list;
        if (!list.length) return;
        for (let i = 0; i < list.length; i++) {
          list[i].avatar =
            list[i].avatar != ""
              ? pathJudge(list[i].avatar)
              : defaultAvatar(list[i].avatar);
          if (list[i].last_msg.data_type == "custom") {
            list[i].last_msg.content = list[i].last_msg.content.replace(
              "[##]",
              "点击查看>>"
            );
          }
        }
        this.chatList = list.sort((a, b) => {
          return b["last_time"] - a["last_time"];
        });
      });
    },
    //获取聊天对象信息
    getTargetInfo(uid) {
      this.$get("/h5/user/info", {
        uid: uid
      }).then(r => {
        levelMark(r.data);
        r.data.avatar =
          r.data.avatar != ""
            ? pathJudge(r.data.avatar)
            : defaultAvatar(r.data.avatar);
        this.targetUser = r.data;
        this.msgListId = uid;
      });
    },
    getMsgList(type, uid, textId, index) {
      //如果是客服，就跳转到客服页面
      if(uid==9999){
        this.$router.push({name:'CustomService'})
      }
      this.chatBg = index;
      //取消未读状态
      for (let i = 0; i < this.chatList.length; i++) {
        if (this.chatList[i].uid == uid) {
          this.$set(this.chatList[i], "unreads", "0");
        }
      }

      //获取聊天对象信息
      this.getTargetInfo(uid);
      //获取聊天记录
      this.addchatdetail(type, uid);
      this.unreads(uid);
    },
    // 获取聊天记录
    addchatdetail(type, uid) {
      this.$get("/h5/chat/detail", {
        all: type,
        to_uid: uid
        // chat_text_id: textId
      }).then(r => {
        // console.log(r);
        let list = r.data.list;
        this.msgList = this.msgChange(list);
        this.msgListId = uid;
      });
    },
    msgChange(list) {
      // console.log(list)
      // list=list.reverse();
      for (let i = 0; i < list.length; i++) {
        list[i].avatar =
          list[i].avatar != ""
            ? pathJudge(list[i].avatar)
            : defaultAvatar(list[i].avatar);
        // console.log(list)
        // 60*60*10  十分钟内不显示时间 60
        if (list[i + 1]) {
          //  console.log(list[i + 1].created_at_ms - list[i].created_at_ms )
          if (list[i + 1].created_at_ms - list[i].created_at_ms > 36000) {
            list[i].time = msgTime(list[i].created_at_ms);
            // console.log( list[i].time )
          } else {
            list[i].time = "";
          }
        }
        list[0].time = msgTime(list[0].created_at_ms);

        //  console.log("shijian>>>>"+msgTime(1533103359000))

        if (list[i].data.data_type == "text") {
          var replace = replaceEmmoji(list[i].data.content);
          if (list[i].data.coin_log) {
            var obj = list[i].data.coin_log[list[i].uid];
            try {
              if (!obj) return;
              // && list[i].uid == this.hostUser.uid  subtract  addjb
              var money_html = `<span class="subtract" style="display:${
                obj.money && list[i].uid == this.hostUser.uid ? "block" : "none"
              }">+${obj.money}积分</span>`;
              var coins_html = `<span class="subtract" style="display:${
                obj.coins && list[i].uid == this.hostUser.uid ? "block" : "none"
              }">${obj.coins}金币</span>`;
              replace = replace + money_html + coins_html;
            } catch (error) {
              // console.log(error);
            }
          }
          //  console.log(obj)
          // console.log(replace)

          // addjb
          list[i].data.content = replace;
        }
        if (list[i].data.data_type == "custom") {
          list[i].data.content = list[i].data.content.replace("[##]", "");
        }
        if (list[i].data.data_type == "audio") {
          list[i].data.url = pathJudge(list[i].data.url);
        }

        if (
          list[i].data.data_type == "gif_face" ||
          list[i].data.data_type == "picture"
        ) {
          list[i].data.file_name =
            pathJudge(list[i].data.file_name) ||
            pathJudge(list[i].data.filename);
        }
        if (list[i].data.data_type == "gift") {
          if (list[i].data.coin_log[this.hostUser.uid].coins) {
            list[i].data.showD =
              list[i].data.coin_log[this.hostUser.uid].coins + "金币";
          } else if (list[i].data.coin_log[this.hostUser.uid]["money"]) {
            list[i].data.showD =
              "+" + list[i].data.coin_log[this.hostUser.uid].money + "积分";
          }

          list[i].data.file_name =
            pathJudge(list[i].data.file_name) ||
            pathJudge(list[i].data.filename);
        }
      }

      //设置第一条时间戳
      // list[0].time = msgTime(list[0].created_at_ms);
      return list;
    },
    // 消息已读
    unreads(uid) {
      this.$get("/h5/chat/read-one", {
        to_uid: uid
      }).then(r => {
        // console.log(r);
        this.$store.commit("setmsgCont"); //获取未读消息
      });
    },
    //打开表情包
    showEmoji() {
      event.stopPropagation();
      let el = event.target ? event.target : event.srcElement;
      while (el.getAttribute("id") !== "talkFace") {
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
      if (this.$route.name == "LiveRoom") {
        pos["position"] = "fixed";
        pos["top"] = elTop - 180 + "px";
      }
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
        this.isShowEmoji = false;
        this.message += text;
        if (this.$refs.textarea) {
          this.$refs.textarea.focus();
        }
      });
    },

    //接收私聊对象信息
    receiveTarget() {
      if(this.talkTo){
        let data=this.talkTo;
        let index = -1;
        for (let i = 0; i < this.chatList.length; i++) {
          if (this.chatList[i].uid == data.uid) {
            index = i;
          }
        }
        let obj=null;
        if (index == -1) {
          obj = {};
          obj["uid"] = data.uid;
          obj["avatar"] = data.avatar;
          obj["nickname"] = data.nickname;
          obj["last_msg"] = {};
          obj["last_msg"]['content'] = '';
        } else {
          obj = this.chatList[index];
          this.chatList.splice(index, 1);
        }
        this.chatList.unshift(obj);
        this.msgListId=obj.uid;
        //获取聊天对象信息
        this.getMsgList(
          1,
          this.chatList[0].uid,
          this.chatList[0].chat_list_id,
          0
        );
        // this.getTargetInfo(data.uid);
        this.$store.commit('set_talkTo','null');
      }
    },
    //提交消息
    submit() {
      if (this.message == "") return;
      var message = this.message;
      this.message = "";
      this.$get("/h5/chat/send", {
        to_uid: this.targetUser.uid,
        content: message
      }).then(r => {
        if (r.http_code == 200) {
          var list = [];
          list.push(r.data.msg);
          // console.log(this.msgChange(list)[0]);
          // this.msgList.push(this.msgChange(list)[0]);

          // this.upScroll();
          // 添加到首位
          for (let index = 0; index < this.chatList.length; index++) {
            // console.log(this.chatList[index]);
            if (this.chatList[index].uid == this.targetUser.uid) {
              var obj = this.chatList[index];
              this.chatList[index].last_msg.content = message;
              this.chatList[index].unreads = 0;
              this.chatList.splice(index, 1);
              this.chatList.unshift(obj);
            }
          }

          this.addchatdetail(1, this.targetUser.uid);
          // this.message = "";
        }
        // console.log(r);
      });
    },
    //查看评论详情
    lookActivity(data) {
      // console.log(data.data.custom[0].params.id);
      this.goZone(data.to_uid);
    },
    //查看私密视频
    lookVideo(data) {
      let vid = data.data.id;
      let tip = getStore("ignoreVideoTip");
      this.$get("/h5/video/check", {
        id: vid
      }).then(r => {
        if (r.data.pay == 1) {
          //需要支付费用
          if (tip && tip == this.hostUser.uid) {
            // 不需要弹框
            this.payVideo(vid);
          } else {
            //需要显示弹框
            this.$msgbox({
              title: "温馨提示",
              message: `<div>解锁私密视频需要2000金币</div><input class="ignore"  id="ignoreVideo" type="checkbox" checked><label for="ignoreVideo">不再提醒</label>`,
              confirmButtonText: "确定",
              dangerouslyUseHTMLString: true,
              center: true,
              callback: action => {
                if (action == "cancel") {
                  return;
                }
                if (document.getElementById("ignoreVideo").checked) {
                  setStore("ignoreVideoTip", this.hostUser.uid);
                }
                this.payVideo(vid);
              }
            });
          }
        } else {
          //不需要支付费用
          let vUrl = r.data.video.filename;
          this.$store.commit("set_videoUrl", vUrl);
        }
      });
    },
    //付费查看视频
    payVideo(videoid) {
      this.$get("/h5/video/pay", {
        id: videoid
      }).then(r => {
        if (r.http_code == 200) {
          let vUrl = pathJudge(r.data.video.filename);
          this.$store.commit("set_videoUrl", vUrl);
        }
      });
    },

    //查看照片照片
    lookPhoto(data) {
      let photoId = Number(data.data.id);
      let parent = document.getElementById("photo" + data.data.id);
      let tip = getStore("ignorePhotoTip");
      if (data.data.data_type == "private_photo") {
        //私密照片
        this.$get("/h5/photo/check", {
          id: photoId
        }).then(r => {
          if (r.data.pay == 1) {
            //需要付费
            if (tip && tip == this.hostUser.uid) {
              this.payPhoto(photoId, parent);
            } else {
              this.$msgbox({
                title: "温馨提示",
                message:
                  '<div>解锁私照需要700金币</div><input class="ignore" id="ignorePhoto" type="checkbox" checked><label for="ignorePhoto">不再提醒</label>',
                confirmButtonText: "确定",
                dangerouslyUseHTMLString: true,
                center: true,
                callback: action => {
                  if (action == "cancel") {
                    return;
                  }
                  if (document.getElementById("ignorePhoto").checked) {
                    setStore("ignorePhotoTip", this.hostUser.uid);
                  }
                  this.payPhoto(photoId, parent);
                }
              });
            }
          } else {
            // 不需要再付费
            let _url = r.data.photo.filename;
            let imgSon = parent.getElementsByTagName("img")[0];
            imgSon.setAttribute("data-original", _url);
            this.viewer && this.viewer.destroy();
            this.viewer = new Viewer(parent, {
              url: "data-original"
            });
            this.viewer.show();
          }
        });
      } else {
        // 公开照片
        this.viewer && this.viewer.destroy();
        this.viewer = new Viewer(parent);
        this.viewer.show();
      }
    },
    //付费查看照片
    payPhoto(photoId, parent) {
      this.$get("/h5/photo/pay", {
        id: photoId
      }).then(r => {
        if (r.http_code == 200) {
          let _url = pathJudge(r.data.photo.filename);
          let imgSon = parent.getElementsByTagName("img")[0];
          imgSon.setAttribute("data-original", _url);
          this.viewer && this.viewer.destroy();
          this.viewer = new Viewer(parent, {
            url: "data-original"
          });
          this.viewer.show();
        }
      });
    }
  }
};
</script>

<style lang="scss">
.ignore {
  width: 0px;
  height: 0px;
  opacity: 0;
  & + label {
    display: inline-block;
    margin-top: 20px;
    position: relative;
    cursor: pointer;
    font-size: 12px;
    color: #333;
    line-height: 20px;
    padding-left: 20px;
    &:before {
      content: "";
      position: absolute;
      left: 0;
      top: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: #ccc;
      //background: url("/static/img/center/icon-check.png") no-repeat center / contain;
    }
    &:after {
      content: "";
      position: absolute;
      left: 3px;
      top: 6px;
      width: 8px;
      height: 5px;
      box-sizing: border-box;
      border-left: 2px solid #fff;
      border-bottom: 2px solid #fff;
      transform: rotate(-45deg);
    }
  }
  &:checked + label {
    &:before {
      background-color: #f362f5\9;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      //background: url("/static/img/center/icon-checked.png") no-repeat center /contain;
    }
  }
}
.ab-c {
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
.audioBox {
  padding-left: 38px !important;
  font-size: 12px !important;
  color: #666666 !important;
  img {
    // padding-top: 7px;
    width: 18px;
    height: 18px;
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    left: 10px;
  }
  .yuan {
    width: 8px;
    height: 8px;
    border-radius: 4px;
    position: absolute;
    background: #ff2c55;
    right: -18px;
    top: 0;
    bottom: 0;
    margin: auto;
  }
}
.left_sj {
  width: 0;
  height: 0;
  border-width: 10px 10px 10px 0;
  border-style: solid;
  border-color: transparent #4c4657 transparent transparent;
  position: absolute;
  top: -15px;
  left: -3px;
  transform: rotate(154deg);
  -ms-transform: rotate(154deg);
  -moz-transform: rotate(154deg);
  -webkit-transform: rotate(154deg);
  -o-transform: rotate(154deg);
  bottom: 0;
  margin: auto;
}
.right_sj {
  width: 0;
  height: 0;
  border-width: 10px 10px 10px 0;
  border-style: solid;
  border-color: transparent #4c4657 transparent transparent;
  position: absolute;
  top: -15px;
  right: -3px;
  transform: rotate(27deg);
  -ms-transform: rotate(27deg);
  -moz-transform: rotate(27deg);
  -webkit-transform: rotate(27deg);
  -o-transform: rotate(27deg);
  bottom: 0;
  margin: auto;
}
.giftboX {
  min-width: 148px;
  height: 64px;
  background: #4c4657;
  position: relative;
  // border-radius: 5px 5px 5px 5px 0 0 0;
  border-radius: 5px;
  padding: 8px 10px;
  box-sizing: border-box;
  color: #fff;
  font-size: 15px;
  // float: right;
  img {
    width: 40px;
    margin-right: 5px;
  }
  .right_ {
    float: right;
  }
  .n_1 {
    font-size: 12px;
    color: #ffffff;
  }
  .n_2 {
    font-size: 12px;
    color: #f0d388;
  }
  .n_3 {
    font-size: 10px;
    color: #ff4d81;
  }
}
// 减去金币
.subtract {
  position: absolute;
  left: -55px;
  top: 0;
  height: 44px;
  line-height: 40px;
  font-size: 12px;
  color: rgb(153, 153, 153);
}
.addjb {
  position: absolute;
  right: -60px;
  top: 0;
  height: 44px;
  line-height: 40px;
}
.chat-component {
  overflow: hidden;
  position: relative;
  min-height: 480px;
  padding-left: 260px;
  .nickname {
    max-width: 7em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 14px;
    color: #333;
    line-height: 24px;
  }
  .talker-list {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    width: 260px;
    height: 100%;
    padding-top: 12px;
    padding-bottom: 12px;
    background-color: #fff;
    overflow-y: auto;
    > li {
      padding: 10px 20px 10px 30px;
      cursor: default;
      &.active,
      &:hover {
        background-color: #eee;
      }
    }
    .item-dl {
      /*overflow: hidden;*/
      position: relative;
      height: 50px;
      padding-left: 65px;
    }
    .item-dt {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 2;
      width: 50px;
      height: 50px;
      .avatar {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
      .msg-num {
        position: absolute;
        right: 0;
        top: -2px;
        transform: translate(50%);
        min-width: 16px;
        height: 16px;
        border-radius: 20px;
        text-align: center;
        padding-left: 2px;
        padding-right: 2px;
        background-color: #f00;
        font-size: 12px;
        color: #fff;
        line-height: 16px;
      }
    }
    .item-dd {
      float: left;
      width: 100%;
    }
    .nickname {
      /*margin-top: 6px;*/
    }
    .last-msg {
      font-size: 12px;
      color: #999;
      line-height: 20px;
      margin-top: 4px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      img {
        display: inline-block;
        vertical-align: middle;
        margin-top: -3px;
        width: 14px;
        height: 14px;
      }
    }
  }

  .chat-right {
    width: 100%;
    height: 100%;
    border-left: 1px solid #ddd;
    position: relative;
    padding-top: 80px;
    padding-bottom: 160px;
    .target {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 80px;
      border-bottom: 1px solid #ddd;
      padding: 25px 40px;
      line-height: 30px;
      .nickname {
        font-size: 16px;
        line-height: 30px;
        vertical-align: middle;
      }
      .level-mark {
        width: 30px;
        height: 14px;
      }
    }
  }
  .chat-area {
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
    .icon-lock {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 2;
      width: 20px;
      height: 20px;
      transform: translate(-50%, -50%);
      background: url("https://lib.liaoke.tv/lib/pc/static/img/zone/icon-lock.png")
        no-repeat center / contain;
    }
    .icon-play {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 2;
      width: 24px;
      height: 24px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.4)
        url("https://lib.liaoke.tv/lib/pc/static/img/zone/icon-play.png")
        no-repeat center;
      background-size: 50%;
    }
    .look {
      color: #ffab00;
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
    .msg-m {
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
  .write-area {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 160px;
    padding: 10px 20px;
    .btn {
      float: left;
      cursor: pointer;
      margin-left: 20px;
    }
    .icon-face {
      display: inline-block;
      vertical-align: middle;
      width: 16px;
      height: 16px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/center/icon-face.png")
        no-repeat center / cover;
    }
    .icon-add {
      display: inline-block;
      vertical-align: middle;
      width: 16px;
      height: 16px;
      background: url("/static/img/center/icon-add.png") no-repeat center /
        cover;
    }
    .label {
      vertical-align: middle;
      font-size: 12px;
      color: #666;
      line-height: 20px;
    }
    .textarea {
      width: 100%;
      height: 70px;
      background-color: #fff;
      /*overflow-y: auto;
      overflow-x: hidden;
      word-break: break-all;*/
      border: 0;
      margin-top: 4px;
      padding: 6px 10px;
      font-size: 12px;
      color: #333;
      line-height: 20px;
      outline: 0;
    }
    .btn-submit {
      position: absolute;
      right: 30px;
      bottom: 15px;
      min-width: 60px;
      height: 28px;
      color: #fff;
      font-size: 12px;
      border-radius: 40px;
      background-color: #F362F5\9;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      &:disabled {
        background-color: #ccc;
        background-image: none;
      }
    }
  }
}
</style>
