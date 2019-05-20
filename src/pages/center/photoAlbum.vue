<template>
  <div class="album-component">
    <div class="title-line">
      <h3 class="title">我的私照</h3>
      <div class="btn-file" v-if="photoList.length>0" @mouseover="uploadPhotos">上传</div>
    </div>
    <ul id="photos" class="photo-list" v-if="photoList.length>0">
      <li v-for="(item, index) in photoList" :key="item.id" @click="lookPhoto">
        <!-- {{item.id}} -->
        <img :data-original="item.filename" class="photo" v-lazy="item.filename" @load="photoMiddle" alt="">
        <div class="icon-delete" @click.stop="deleteShow(item.id,index)"></div>
      </li>
    </ul>
    <div class="table" v-if="photoList.length==0">
      <div class="cell">
        <p>还未上传私照~ 快来上传你的私密照片吸引关注吧~</p>
        <div class="btn-file" @mouseover="uploadPhotos">上传</div>
      </div>
    </div>
    <!-- 删除确认 -->

    <a-dialog :isShow="loginDropIn" @closeDialog="closedialog">
      <div class="deleteBox">
        <div class="imgBox">
          <img src="https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-info.png" alt="">
        </div>
        <div class="title">
          确认删除这张照片吗？
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

  </div>
</template>

<script>
import { mapState } from "vuex";
import { pathJudge, uploader } from "@/util/tools";
import ADialog from "@/components/dialog";

export default {
  data() {
    return {
      loginDropIn: false,
      id: "",
      index: "",
      //
      photoList: [],
      viewer: null,
      uploadImg: [],
      fileObj: null,
      uploading: false
    };
  },
  components: {
    ADialog
  },
  mounted() {
    this.dataInit();
  },
  computed: {
    ...mapState({
      hostUser: state => state.hostUser
    })
  },
  methods: {
    deleteShow(id, index) {
      this.loginDropIn = true;
      this.id = id;
      this.index = index;
      // this.deleteItem(id,index)
    },
    //关闭登录弹框
    closedialog() {
      this.loginDropIn = !this.loginDropIn;
      // console.log(this.$store)
      // this.$store.commit("set_loginDialog", false);
    },
    dataInit() {
      this.$get("/h5/photo/index").then(r => {
        let list = r.data;
        for (let i = 0; i < list.length; i++) {
          list[i].filename = pathJudge(list[i].filename);
        }
        this.photoList = list.reverse();
      });
    },

    //上传照片
    uploadPhotos(e) {
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
        "photos",
        () => {
          this.uploading = true;
        },
        name => {
          this.uploading = false;
          let index = -1;
          for (let i = 0; i < this.uploadImg.length; i++) {
            if (name === this.uploadImg[i]) {
              index = i;
            }
          }
          if (index == -1) {
            this.uploadImg.push(name);
          }

          console.log(name)
          /*for(let i = 0; i < this.uploadImg.length; i++){
            this.uploadImg[i]=this.uploadImg[i].replace('http://chatfile.oss-cn-shanghai.aliyuncs.com/','');
          }
          let arrStr = this.uploadImg.join(",");
          this.submitPhotos(arrStr);*/
          this.submitPhotos(this.uploadImg);
        }
      );
      this.fileObj.init();
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

    //查看照片
    lookPhoto() {
      this.viewer && this.viewer.destroy();
      this.viewer = new Viewer(document.getElementById("photos"), {
        url: "data-original"
      });
      this.viewer.show();
    },

    //删除相片
    deleteItem() {
      // console.log(index);
      // console.log(id);
      this.loginDropIn = !this.loginDropIn;
      this.$get("/h5/photo/delete", {
        id: this.id
      }).then(r => {
        if (r.http_code == 200) {
          // this.dataInit();
          this.photoList.splice(this.index, 1);
        }
      });
    },

    //上传照片
    submitPhotos(uploads) {
      var protocol=window.location.protocol;
      for(let i = 0; i < uploads.length; i++){
        uploads[i]=uploads[i].replace(protocol+'//chatfile.oss-cn-shanghai.aliyuncs.com/','');
      }
      let arrStr = uploads.join(",");
      this.$get("/h5/photo/create", {
        photos: arrStr
      }).then(r => {
        if (r.http_code == 200) {
          this.dataInit();
          this.uploadImg = [];
        }
      });
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
    }
    div:nth-child(1) {
      margin-right: 18px;
    }
    div:nth-child(2) {
      margin-left: 18px;
    }
  }
}
.album-component {
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
  .photo-list {
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
    .photo {
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
      left: 6px;
      bottom: 6px;
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
}
</style>
