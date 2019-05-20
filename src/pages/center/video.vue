<template>
  <div class="video-component">
    <div class="title-line">
      <h3 class="title">我的视频</h3>
      <div class="btn-file" v-if="videoList.length>0" @mouseover="uploadPhotos">上传
        <!-- <input type="file" accept="video/mp4"> -->
      </div>
    </div>
    <ul class="video-list" v-if="videoList.length>0">
      <li v-for="(item, index) in videoList" :key="index" @click="lookVideo(item.filename)">
        <img class="face" v-lazy="item.cover_filename" @load="photoMiddle" alt="">
        <span class="duration">{{item.length | duration}}</span>
        <div class="icon-delete" @click.stop="deleteShow(item.id)"></div>
      </li>
    </ul>
    <div class="table" v-if="videoList.length==0">
      <div class="cell">
        <p>还未上传视频~ 快来上传你的视频吸引关注吧~</p>
        <div class="btn-file" @mouseover="uploadPhotos">上传
          <!-- <input type="file" accept="video/mp4"> -->
        </div>
      </div>
    </div>
    <div class="video-wrap" v-if="showVideo">
      <div class="icon-close" @click="closeVideo"></div>
      <video id="video" controls autoplay loop>
        <source :src="videoUrl" type="video/mp4">
        <embed :src="videoUrl" type="">
      </video>
    </div>

    <a-dialog :isShow="loginDropIn" @closeDialog="closedialog">
      <div class="deleteBox">
        <div class="imgBox">
          <img src="/static/img/recharge/icon-info.png" alt="">
        </div>
        <div class="title">
          确认删除这个视频吗？
        </div>
        <div class="info">
          删除后不可撤销哦~
        </div>
        <div class="btnBox">
          <div class="btnColor" @click="deleteItem">删除</div>
          <div @click="loginDropIn=false,id='',index=''">取消</div>
        </div>
      </div>
    </a-dialog>
    <!-- 获取视频时长用 -->
    <video id="upVideo" controls autoplay crossorigin="anonymous" style="position: absolute;left: -100%;top: 0;z-index: 0;">
      <source :src="uploadImg" type="video/mp4">
    </video>

  </div>
</template>

<script>
import { pathJudge, uploader } from "@/util/tools";
import ADialog from "@/components/dialog";

export default {
  data() {
    return {
      loginDropIn: false,
      id: "",
      //
      videoList: [],
      videoId: null,
      videoUrl: null,
      showVideo: false,
      uploadImg: [],
      fileObj: null,
      uploading: false
    };
  },

  components: {
    ADialog
  },
  filters: {
    duration(value) {
      let sec = (value / 1000) % 60;
      let min = (value / 1000 - sec) % 60;
      // let h=(value/1000-min*60-sec) % 60;
      sec = sec > 9 ? sec : "0" + sec;
      min = min > 9 ? min : "0" + min;
      // h=h>9?h:'0'+h;
      return min + ":" + sec;
    },
  },
  mounted() {
    this.dataInit();
  },
  methods: {
    getvideoImg() {
      var scale = 0.8; //第一帧图片与源视频的比例
      var video = document.getElementById("upVideo"); //赋值标签
      video.src = this.uploadImg[0] || "";
      video.play();
      setTimeout(() => {
        var canvas = document.createElement("canvas"); //canvas画布
        canvas.width = video.videoWidth * scale;
        canvas.height = video.videoHeight * scale;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height); //画图
        // let url=canvas.toDataURL('image/png');
        // this.downloadFile('cover.png',url);

        /*let url=canvas.toDataURL('image/png');
        var arr = url.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
          u8arr[n] = bstr.charCodeAt(n);
        }
        let file=new File([u8arr], 'cover', {type:mime});*/
        /*this.addvideo(
          this.uploadImg[0],
          this.uploadImg[1],
          Math.round(video.duration % 60)
        );*/
        video.pause();
      }, 100);
    },
    downloadFile(fileName, content) {
      let aLink = document.createElement('a');
      let blob = this.base64ToBlob(content); //new Blob([content]);

      let evt = document.createEvent("HTMLEvents");
      evt.initEvent("click", true, true);//initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
      aLink.download = fileName;
      aLink.href = URL.createObjectURL(blob);
      /*if(navigator.userAgent.indexOf("Trident") > -1){
        aLink.download = fileName;
        aLink.href = '#';
        window.navigator.msSaveBlob(blob, fileName);
      }else{
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob);
      }*/

      // aLink.dispatchEvent(evt);
      aLink.click()
    },
    //base64转blob
    base64ToBlob(code) {
      let parts = code.split(';base64,');
      let contentType = parts[0].split(':')[1];
      let raw = window.atob(parts[1]);
      let rawLength = raw.length;

      let uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], {type: contentType});
    },
    deleteShow(id) {
      this.loginDropIn = true;
      this.id = id;
      // this.deleteItem(id,index)
    },
    //关闭登录弹框
    closedialog() {
      this.loginDropIn = !this.loginDropIn;
      // console.log(this.$store)
      // this.$store.commit("set_loginDialog", false);
    },
    //上传视频
    uploadPhotos(e) {
      // return false;
      let el = event.target ? event.target : event.srcElement;
      let randomId = parseInt(Math.random() * 1000000);
      el.setAttribute("id", "btn" + randomId);
      // let fileId=el.getAttribute('id');
      if (this.uploading) return;
      if (this.fileObj) {
        this.fileObj.destroy();
      }
      this.fileObj = uploader(
        "btn" + randomId,
        "video",
        () => {
          this.uploading = true;
        },
        (name, file) => {
          this.uploading = false;

          this.uploadImg.push(name);
          for (let index = 0; index < this.uploadImg.length; index++) {
            if (
              this.uploadImg[index].indexOf("avi") != -1 ||
              this.uploadImg[index].indexOf("mp4") != -1
            ) {
              this.uploadImg[0] = this.uploadImg[index];
            } else if (
              this.uploadImg[index].indexOf("jpg") != -1 ||
              this.uploadImg[index].indexOf("gif") != -1 ||
              this.uploadImg[index].indexOf("png") != -1 ||
              this.uploadImg[index].indexOf("jpeg") != -1
            ) {
              this.uploadImg[1] = this.uploadImg[index];
            }
          }
          if (
            (this.uploadImg[0].indexOf("avi") != -1 || this.uploadImg[0].indexOf("mp4") != -1) && this.uploadImg.length >= 2
          ) {
            this.getvideoImg();
          }
        },
        "video"
      );
      this.fileObj.init();
    },
    dataInit() {
      this.$get("/h5/video/index", {}).then(r => {
        if (r.http_code == 200) {
          let list = r.data;
          for (let i = 0; i < list.length; i++) {
            list[i].cover_filename = pathJudge(list[i].cover_filename);
            list[i].filename = pathJudge(list[i].filename);
          }
          this.videoList = list;
        }
      });
    },

    //上传视频
    addvideo(video_url, video_cover, video_length) {
      var protocol=window.location.protocol;
      video_url=video_url.replace(protocol+'//chatfile.oss-cn-shanghai.aliyuncs.com/','');
      video_cover=video_cover.replace(protocol+'//chatfile.oss-cn-shanghai.aliyuncs.com/','');
      if (video_url && video_cover) {
        this.$get("/h5/video/create", {
          video_url: video_url, //视频地址
          video_cover: video_cover, //视频封面
          video_length: video_length*1000 //视频时长
        }).then(r => {
          if (r.http_code == 200) {
            this.dataInit();
          }
        });
      }
    },
    //图片居中
    photoMiddle(e) {
      let el = e.target ? e.target : e.srcElement;
      let _w = el.naturalWidth;
      let _h = el.naturalHeight;
      if (_w > _h) {
        el.style.height = "180px";
      }
      if (_w < _h) {
        el.style.width = "180px";
      }
      if (_w == _h) {
        el.style.width = "180px";
        el.style.height = "180px";
      }
    },
    //查看视频
    lookVideo(url) {
      this.videoUrl = url;
      this.showVideo = true;
    },

    //删除视频
    deleteItem() {
      this.loginDropIn = false;
      this.$get("/h5/video/delete", {
        id: this.id || ""
      }).then(r => {
        if (r.http_code == 200) {
          this.dataInit();
        }
      });
    },

    //关闭视频
    closeVideo() {
      this.videoUrl = null;
      this.showVideo = false;
      let video = document.getElementById("video");
      video.pause();
    }
  }
};
</script>

<style lang="scss">
.deleteBox {
  width: 338px;
  height: 245px;
  padding: 21px 0 0;

  .imgBox {
    text-align: center;
  }
  .title {
    font-size: 16px;
    color: #333333;
    line-height: 16px;
    text-align: center;
    margin: 24px 0 14px;
  }
  .info {
    text-align: center;
    font-size: 12px;
    color: #999999;
    line-height: 12px;
    margin: 0 0 27px;
  }
  .btnColor {
    color: #fff !important;
    background-image: linear-gradient(-90deg, #f362f5 0%, #a35afe 100%);
  }
  .btnBox {
    height: 40px;
    width: 296px;
    margin: auto;
    div {
      border: 1px solid #f362f5;
      border-radius: 20px;
      width: 130px;
      height: 100%;
      float: left;
      font-size: 14px;
      text-align: center;
      color: #f362f5;
      line-height: 40px;
      cursor: pointer;
    }
    div:nth-child(1) {
      margin-right: 18px;
    }
    div:nth-child(2) {
      margin-left: 18px;
    }
  }
}
.video-component {
  padding: 40px;
  .title-line {
    width: 940px;
    overflow: hidden;
    margin-bottom: 30px;
    .title {
      font-size: 20px;
      color: #333;
      line-height: 40px;
      font-weight: bold;
      float: left;
    }
    .btn-file {
      float: right;
      margin-top: 6px;
    }
  }
  .btn-file {
    cursor: pointer;
    position: relative;
    width: 60px;
    height: 28px;
    border-radius: 4px;
    font-size: 12px;
    color: #fff;
    text-align: center;
    line-height: 28px;
    background-color: #F362F5\9;
    background-image: linear-gradient(-90deg, #f362f5 0%, #a35afe 100%);
    input {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      opacity: 0;
    }
  }
  .video-list {
    overflow: hidden;
    > li {
      float: left;
      width: 180px;
      height: 180px;
      overflow: hidden;
      border-radius: 4px;
      position: relative;
      margin-right: 10px;
      margin-bottom: 10px;
      &:nth-of-type(5n) {
        margin-right: 0;
      }
    }
    .duration {
      position: absolute;
      right: 10px;
      top: 10px;
      z-index: 3;
      font-size: 12px;
      line-height: 16px;
      color: #fff;
    }
    .face {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      min-width: 100%;
      min-height: 100%;
    }
    .icon-delete {
      cursor: pointer;
      position: absolute;
      left: 10px;
      bottom: 10px;
      z-index: 2;
      width: 30px;
      height: 30px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/center/icon-delete.png")
        no-repeat center;
      background-size: contain;
    }
  }
  .table {
    display: table;
    text-align: center;
    height: 300px;
    width: 940px;
    .cell {
      display: table-cell;
      vertical-align: middle;
    }
    p {
      color: #999;
      line-height: 24px;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .btn-file {
      display: inline-block;
    }
  }
  .video-wrap {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
    background-color: rgba(0, 0, 0, 0.8);
    .icon-close {
      position: absolute;
      right: 10px;
      top: 10px;
      z-index: 2;
      width: 40px;
      height: 40px;
      cursor: pointer;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/index/icon-close.png")
        no-repeat center / contain;
    }
    video {
      width: 100%;
      height: 100%;
    }
    embed {
      width: 400px;
      height: 300px;
    }
  }
}
</style>
