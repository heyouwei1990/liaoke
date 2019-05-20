<template>
  <div class="personal-activity" id="personalActivity">
    <div class="activity-dl" v-if="activityList.length>0" v-for="(item,index) in activityList" :key="index">
      <div class="avatar-wrap">
        <img :src="item.created_by_user.avatar" alt="" class="avatar">
      </div>
      <div class="activity-dd">
        <div class="top-line">
          <span class="nickname">{{item.created_by_user.nickname}}</span>
          <span class="sex-mark" :class="{man:item.created_by_user.gender==1,woman:item.created_by_user.gender==2}">
            <i class="icon-sex"></i>
            <i class="age">{{item.created_by_user.age}}</i>
          </span>
          <img :src="item.created_by_user.wealth_level_img" alt="" class="level-mark">
          <img :src="item.created_by_user.live_level_img" alt="" class="level-mark">
          <time class="time">{{item.created_at_text}}</time>
        </div>
        <p class="article" v-html="item.content"></p>
        <ul class="photo-list" :class="{four:item.photo_list.length==4}" v-if="item.photo_list.length>0 && item.video_list.length==0" @click="photoView(index)" :id="'photos'+index">
          <li v-if="photoIndex<9" v-for="(photo,photoIndex) in item.photo_list" :key="photoIndex">
            <img v-if="item.photo_list.length==1" class="photo" v-lazy="photo.filename" alt="">
            <img v-if="item.photo_list.length>1" @load="photoMiddle" class="photo" v-lazy="photo.filename" alt="">
          </li>
        </ul>
        <ul class="photo-list" :class="{four:item.video_list.length==4}" v-if="item.video_list.length>0" :id="'video'+index">
          <li v-if="videoIndex<9" v-for="(video,videoIndex) in item.video_list" :key="videoIndex" @click="videoView(video.url)">
            <img v-if="item.video_list.length==1" class="photo" v-lazy="video.cover" alt="">
            <i class="icon-play"></i>
          </li>
        </ul>
        <div class="clearfix">
          <div class="fans-title" v-if="item.likes.length>0">赞过的人({{item.likes.length}})</div>
          <div class="ctrl-icon">
            <i class="icon-love" :class="{active:item.like_at!=0}" @click="love(item.id)"></i>
            <i class="icon-msg" @click="showTextarea(index)"></i>
          </div>
        </div>
        <ul class="avatar-list" v-if="item.likes.length>0">
          <li v-for="(like,likeIndex) in item.likes" :key="likeIndex">
            <router-link :to="{name:'Zone',params:{uid:like.uid}}" target="_blank">
              <img class="avatar" v-lazy="like.avatar" alt="">
            </router-link>
          </li>
        </ul>
        <ul class="comment-list" v-if="item.comment_list.length>0">
          <li v-for="(comment,cIndex) in item.comment_list" :key="comment.id" v-if="cIndex<item.max_show_comment">
            <div class="inline-block">
              <!--<span class="nickname">{{comment.created_by_user.nickname}}</span>-->
              <router-link class="nickname" :to="{name:'Zone',params:{uid:comment.created_by_user.uid}}" target="_blank">{{comment.created_by_user.nickname}}</router-link>
              <span class="reply" v-if="comment.to_uid != 0">回复</span>
              <!--<span class="nickname" v-if="comment.to_uid != 0">{{comment.to_user.nickname}}</span>-->
              <span class="desc" v-html="comment.content"></span>
              <router-link class="nickname" v-if="comment.to_uid != 0" :to="{name:'Zone',params:{uid:comment.to_uid}}" target="_blank">{{comment.to_user.nickname}}</router-link>
              <div class="ctrl-msg">
                <!--<div class="ctrl-msg" v-if="hostUser && hostUser.uid==comment.created_by">-->
                <i v-if="hostUser && (userId==hostUser.uid || comment.to_uid==hostUser.uid)" @click="showTextarea(index,comment.created_by_user)" class="icon-reply"></i>
                <i v-if="hostUser && comment.created_by_user.uid==hostUser.uid" @click="deleteComment(comment.id,item.id,index)" class="icon-delete"></i>
              </div>
            </div>
          </li>
        </ul>
        <div class="btn-more" :class="{active:item.max_show_comment==item.comment_count}" v-if="item.comment_count>3" @click="item.max_show_comment==item.comment_count?item.max_show_comment=3:item.max_show_comment=item.comment_count">
          <span v-if="item.max_show_comment!=item.comment_count">查看更多评论</span>
          <span v-if="item.max_show_comment==item.comment_count">收起</span>
        </div>
        <div class="comment-area" :class="{active:textareaIndex==index}">
          <div class="input" @click.stop="showTextarea(index)">评论</div>
          <textarea class="textarea" placeholder="评论" ref="textarea" v-model="content" maxlength="100"></textarea>
          <div class="bottom">
            <div class="icon-face" @click.stop="showEmoji"></div>
            <button class="btn-submit" @click.stop="submitComment(item.id)">发送</button>
          </div>
        </div>
      </div>
    </div>
    <div class="loading-wave" v-if="loading">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="no-data" v-if="empty">Ta还没有动态</div>
    <a-dialog :isShow="showConfirm" @closeDialog="cancel">
      <div class="confirm">
        <i class="icon-info"></i>
        <div class="tip-msg">是否取消正在编辑的内容</div>
        <div class="btn-group">
          <button class="btn-ensure" @click="ensure">确认</button>
          <button class="btn-cancel" @click="cancel">取消</button>
        </div>
      </div>
    </a-dialog>
  </div>
</template>

<script>
import { mapState } from "vuex";
import {
  pathJudge,
  defaultAvatar,
  levelMark,
  sliceArray,
  replaceEmmoji,
  scrollDirection
} from "@/util/tools";
import ADialog from "@/components/dialog";
import Bus from "@/util/bus";

export default {
  components: {
    ADialog
  },
  data() {
    return {
      activityList: [],
      userId: "",
      textareaIndex: null, //展开评论
      commentTo: null,
      showConfirm: false, //提示框
      viewer: null, //照片查看器,
      content: "",
      pageIndex: 1,
      loading: false,
      empty: false
    };
  },
  computed: {
    ...mapState({
      hostUser: state => state.hostUser,
      isShowEmoji: state => state.isShowEmoji,
      isShowChat: state => state.isShowChat
    })
  },

  mounted() {
    this.$nextTick(() => {
      this.userId = Number(this.$route.params.uid);
      this.getList();
      document.addEventListener("click", this.closeSome);
      Bus.$on("chooseEmoji", text => {
        if (!this.isShowChat) {
          this.content += text;
          if (this.$refs.textarea[this.textareaIndex]) {
            this.$refs.textarea[this.textareaIndex].focus();
          }
        }
      });
      document.addEventListener("scroll", this.scrollAdd);
    });
  },
  destroyed() {
    document.removeEventListener("click", this.closeSome);
    document.removeEventListener("scroll", this.scrollAdd);
  },
  methods: {
    getList() {
      // console.log(this.hostUser);
      var to_uid = "";
      var utl_ = "/h5/dynamic/list";
      // console.log(this.userId)
        if (this.$store.state.hostUser&&this.$store.state.hostUser.uid == this.userId) {
          utl_ = "/h5/dynamic/index";
        } else {
          to_uid = this.userId;
        }


      this.loading = true;
      this.empty = false;
      this.$get(utl_, {
        to_uid: to_uid,
        page: this.pageIndex
      }).then(r => {
        this.loading = false;
        if (r.http_code == 200) {
          let list = r.data;
          for (let i = 0; i < list.length; i++) {
            list[i].created_by_user = levelMark(list[i].created_by_user);
            list[i].created_by_user.avatar =
              list[i].created_by_user.avatar != ""
                ? pathJudge(list[i].created_by_user.avatar)
                : defaultAvatar(list[i].created_by_user.avatar);
            for (let j = 0; j < list[i].photo_list.length; j++) {
              list[i].photo_list[j].filename = pathJudge(
                list[i].photo_list[j].filename
              );
            }
            for (let j = 0; j < list[i].video_list.length; j++) {
              list[i].video_list[j].cover = pathJudge(list[i].video_list[j].cover);
              list[i].video_list[j].url = pathJudge(list[i].video_list[j].url);
            }
            for (let k = 0; k < list[i].likes.length; k++) {
              list[i].likes[k].avatar =
                list[i].likes[k].avatar != ""
                  ? pathJudge(list[i].likes[k].avatar)
                  : defaultAvatar(list[i].likes[k].avatar);
            }
            for (let l = 0; l < list[i].comment_list.length; l++) {
              list[i].comment_list[l].content = replaceEmmoji(
                list[i].comment_list[l].content
              );
            }
            list[i].content = replaceEmmoji(list[i].content);
            list[i]["max_show_comment"] = 3; //最多显示3条评论
            // list[i]['text_val']=''; //输入框变量
          }
          // this.activityList=list;

          if (this.activityList.length != 0) {
            this.activityList = this.activityList.concat(list);
          } else {
            this.activityList = list;
          }
          if (list.length != 0) {
            this.pageIndex++;
          }
          if (this.activityList.length == 0) {
            this.empty = true;
          }
          // console.log(list);
        }
      });
    },

    //动态滚动添加
    scrollAdd(e) {
      let el = e.srcElement ? e.srcElement : e.target;
      let diret = scrollDirection(el);
      let sy = window.scrollY;
      let w_h = window.innerHeight;
      let d_h = document.documentElement.offsetHeight;
      if (sy > d_h - w_h - 600 && !this.loading && diret == "down") {
        this.getList();
      }
    },

    //展开输入区
    showTextarea(index, toUser) {
      if (this.content == "") {
        this.commentTo = null;
        this.content = "";
        this.textareaIndex = index;
        if (toUser) {
          this.commentTo = Number(toUser.uid);
        }
        setTimeout(() => {
          this.$refs.textarea[index].focus();
        }, 20);
      } else {
        this.showConfirm = true;
      }
    },

    //document点击
    closeSome() {
      if (this.content != "") {
        this.showConfirm = true;
      }
      //关闭表情包
      this.$store.commit("set_showEmoji", false);
    },

    //取消正在编辑内容
    ensure() {
      this.content = "";
      this.textareaIndex = null;
      this.showConfirm = false;
    },
    //不取消正在编辑内容
    cancel() {
      event.stopPropagation();
      this.showConfirm = false;
      if (this.textareaIndex != null) {
        this.$refs.textarea[this.textareaIndex].focus();
      }
    },
    //查看照片
    photoView(i) {
      this.viewer && this.viewer.destroy();
      this.viewer = new Viewer(document.getElementById("photos" + i));
      this.viewer.show();
    },

    //查看视频
    videoView(url) {
      this.$store.commit('set_videoUrl',url);
    },

    //打开表情包
    showEmoji() {
      let el = event.target ? event.target : event.srcElement;
      if (this.isShowEmoji) {
        this.$store.commit("set_showEmoji", false);
      } else {
        this.$store.commit("set_showEmoji", true);
      }

      //表情包定位
      let iconHeight = document.querySelector(".icon-face").offsetHeight + 10;
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
      if (window.innerHeight - elTop - 180 > 0) {
        elTop = elTop + iconHeight + scrollTop;
      } else {
        elTop = elTop - 180 + scrollTop;
      }
      let pos = {};
      pos["top"] = elTop + "px";
      pos["left"] = elLeft + "px";
      this.$store.commit("set_emojiPosition", pos);
    },

    //提交评论
    submitComment(id) {
      this.$store.commit("set_showEmoji", false);
      this.$get("/h5/comment/send", {
        id: id,
        content: this.content,
        to_uid: this.commentTo
      }).then(r => {
        if (r.http_code == 200) {
          let index = this.textareaIndex;
          this.activityList[index].comment_list.unshift(r.data);
          let list = this.activityList[index].comment_list;
          for (let i = 0; i < list.length; i++) {
            list[i].content = replaceEmmoji(list[i].content);
          }
          this.$set(this.activityList[index], "comment_list", list);
          this.$set(this.activityList[index], "comment_count", list.length);
          this.content = "";
          this.textareaIndex = null;
        }
      });
    },

    //删除评论
    deleteComment(uid, pkid, index) {
      this.$get("/h5/comment/delete", {
        id: Number(uid),
        dynamic_id: pkid
      }).then(r => {
        if (r.http_code == 200) {
          // this.dataInit();
          let list = this.activityList[index].comment_list;
          for (let i = 0; i < list.length; i++) {
            if (list[i].id == uid) {
              list.splice(i, 1);
            }
          }
          this.$set(this.activityList[index], "comment_list", list);
          this.$set(this.activityList[index], "comment_count", list.length);
        }
      });
    },

    //点赞评论、取消点赞
    love(id) {
      this.$get("/h5/dynamic/like", {
        id: id
      }).then(r => {
        let idx = "";
        for (let i = 0; i < this.activityList.length; i++) {
          if (this.activityList[i].id === id) {
            idx = i;
          }
        }
        let list = r.data.likes;
        for (let j = 0; j < list.length; j++) {
          list[j].avatar =
            list[j].avatar != ""
              ? pathJudge(list[j].avatar)
              : defaultAvatar(list[j].avatar);
        }
        this.$set(this.activityList[idx], "like_at", r.data.like_at);
        this.$set(this.activityList[idx], "like_count", r.data.like_count);
        this.$set(this.activityList[idx], "likes", list);
      });
    },

    //照片居中
    photoMiddle(e) {
      let el = e.target ? e.target : e.srcElement;
      let _w = el.naturalWidth;
      let _h = el.naturalHeight;
      if (_w > _h) {
        el.style.height = "100%";
        el.style.width = "auto";
      }
      if (_w < _h) {
        el.style.height = "auto";
        el.style.width = "100%";
      }
      if (_w == _h) {
        el.style.width = "100%";
        el.style.height = "100%";
      }
    }
  }
};
</script>

<style lang="scss">
.personal-activity {
  .activity-dl {
    overflow: hidden;
    padding: 30px;
    background-color: #fff;
    border-radius: 4px;
    margin-bottom: 5px;
  }
  .avatar {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
  .nickname {
    display: inline-block;
    max-width: 7em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .avatar-wrap {
    width: 60px;
    height: 60px;
    float: left;
    margin-right: 20px;
  }
  .activity-dd {
    float: left;
    width: 770px;
  }
  .top-line {
    overflow: hidden;
    margin-bottom: 18px;
    .nickname {
      float: left;
      font-size: 16px;
      color: #185499;
      line-height: 24px;
      cursor: pointer;
    }
    .sex-mark,
    .level-mark {
      float: left;
      width: 30px;
      height: 14px;
      margin-left: 5px;
      margin-top: 5px;
    }
    .time {
      float: right;
      font-size: 12px;
      color: #999;
      line-height: 24px;
    }
  }
  .article {
    font-size: 14px;
    color: #333;
    line-height: 20px;
    margin-bottom: 20px;
  }
  .emojiImg {
    display: inline-block;
    width: 20px;
    height: 20px;
    vertical-align: middle;
    margin: -3px 2px 0;
  }
  .photo-list {
    overflow: hidden;
    width: 470px;
    margin-bottom: 20px;
    > li {
      float: left;
      overflow: hidden;
      width: 150px;
      height: 150px;
      margin-right: 5px;
      margin-bottom: 5px;
      position: relative;
      cursor: pointer;
      .icon-play{
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 2;
        margin-left: -30px;
        margin-top: -30px;
        width: 60px;
        height: 60px;
        background-color: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,1);
        border-radius: 50%;
        &:before{
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: 0;
          height: 0;
          border: 10px solid transparent;
          border-left:14px solid rgba(255,255,255,1);
          margin-left: -4px;
          margin-top: -10px;
        }
      }
      &:only-child {
        width: auto;
        height: auto;
        margin: 0;
        .photo {
          width: auto;
          height: auto;
          max-width: 460px;
          max-height: 460px;
          min-width: 150px;
          min-height: 150px;
          position: static;
          transform: translate(0, 0);
        }
      }
    }
    &.four {
      width: 620px;
    }
    .photo {
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .fans-title {
    float: left;
    color: #999;
    font-size: 12px;
    line-height: 2;
  }
  .avatar-list {
    margin-top: 10px;
    overflow: hidden;
    > li {
      float: left;
      width: 40px;
      height: 40px;
      margin-right: 15px;
      margin-bottom: 10px;
    }
  }
  .ctrl-icon {
    float: right;
    i {
      float: left;
      cursor: pointer;
      width: 24px;
      height: 24px;
      margin-left: 30px;
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }
    .icon-love {
      background-image: url("https://lib.liaoke.tv/lib/pc/static/img/zone/icon-love.png");
      &.active {
        background-image: url("https://lib.liaoke.tv/lib/pc/static/img/zone/icon-loved.png");
      }
    }
    .icon-msg {
      background-image: url("https://lib.liaoke.tv/lib/pc/static/img/zone/icon-msg.png");
    }
  }
  .comment-list {
    margin-top: 20px;
    > li {
      line-height: 20px;
      margin-bottom: 6px;
    }
    .inline-block {
      display: inline-block;
    }
    .nickname {
      vertical-align: middle;
      font-size: 12px;
      color: #185499;
      cursor: pointer;
    }
    .desc {
      vertical-align: middle;
      font-size: 12px;
      color: #333;
      line-height: 20px;
    }
    .reply {
      vertical-align: middle;
      font-size: 12px;
      color: #999;
      line-height: 20px;
    }
    .inline-block:hover {
      .ctrl-msg {
        i {
          display: block;
        }
      }
    }
    .ctrl-msg {
      vertical-align: middle;
      overflow: hidden;
      display: inline-block;
      i {
        float: left;
        cursor: pointer;
        width: 16px;
        height: 16px;
        margin-left: 10px;
        background-repeat: no-repeat;
        background-size: contain;
        display: none;
      }
      .icon-reply {
        background-image: url("https://lib.liaoke.tv/lib/pc/static/img/zone/icon-msg.png");
      }
      .icon-delete {
        background-image: url("https://lib.liaoke.tv/lib/pc/static/img/zone/icon-delete.png");
      }
    }
  }
  .btn-more {
    font-size: 12px;
    color: #185499;
    line-height: 20px;
    position: relative;
    padding-right: 20px;
    display: inline-block;
    cursor: pointer;
    &:after {
      content: "";
      position: absolute;
      right: 0;
      top: 4px;
      width: 8px;
      height: 8px;
      border-right: 1px solid #185499;
      border-bottom: 1px solid #185499;
      transform: rotate(45deg);
      transition: all 0.3s linear;
      transform-origin: 6px 6px;
    }
    &.active:after {
      transform: rotate(225deg);
    }
  }
  .comment-area {
    margin-top: 20px;
    height: 30px;
    overflow: hidden;
    &.active {
      height: 144px;
      .input {
        display: none;
      }
      .textarea {
        display: block;
      }
    }
    .input {
      width: 100%;
      height: 30px;
      font-size: 14px;
      color: #333;
      line-height: 22px;
      padding: 4px 8px;
      color: #b2b2b2;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .textarea {
      display: none;
      width: 100%;
      height: 100px;
      padding: 4px 8px;
      font-size: 12px;
      color: #333;
      line-height: 22px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: "Microsoft YaHei";
    }
    .bottom {
      overflow: hidden;
      margin-top: 12px;
    }
    .icon-face {
      float: left;
      width: 24px;
      height: 24px;
      cursor: pointer;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/center/icon-face.png")
        no-repeat center / contain;
      margin-top: 4px;
    }
    .btn-submit {
      float: right;
      width: 60px;
      height: 32px;
      border-radius: 100px;
      color: #fff;
      font-size: 14px;
      background-color: #f362f5;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
    }
  }

  .confirm {
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
      margin-top: 20px;
    }
    .btn-group {
      margin: 30px auto 10px;
      text-align: center;
      button {
        font-size: 14px;
        width: 100px;
        height: 40px;
        border-radius: 40px;
        margin-right: 10px;
        &:last-of-type {
          margin-right: 0;
        }
      }
    }
    .btn-cancel {
      border: 1px solid #f362f5;
      background-color: transparent;
      color: #f362f5;
    }
    .btn-ensure {
      color: #fff;
      background-color: #f362f5;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
    }
  }
  .no-data {
    text-align: center;
    font-size: 14px;
    color: #999;
    line-height: 24px;
    padding: 30px;
    background-color: #fff;
    border-radius: 4px;
  }
}
</style>
