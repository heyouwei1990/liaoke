<template>
  <div class="info-edit-component">
    <!--<div class="input-row">
      <span class="label">更改头像：</span>
      <div class="file-box avatar" @mouseover="uploadAvatar">
        <img class="avatar" :src="avatar_img" alt="">
        <div class="btn-file">更改头像</div>
      </div>
    </div>-->
    <div class="input-row">
      <span class="label">直播封面图：</span>
      <div class="file-box cover" @mouseover="uploadPhotos_0">
        <img :src="room_cover" alt="">
        <!-- <img src="/static/img/preload.png" alt=""> -->
        <div class="btn-file">更改封面图</div>
      </div>
    </div>
    <div class="input-row">
      <span class="label">房间背景图：</span>
      <div class="file-box background" @mouseover="uploadPhotos_1">
        <img :src="room_background" alt="">

        <div class="btn-file">更改背景图</div>
      </div>
    </div>
    <div class="input-row">
      <span class="label">昵称：</span>
      <div class="iput-box">
        <input class="input" type="text" v-model="nickname">
      </div>
    </div>
    <div class="input-row">
      <span class="label">性别：</span>
      <div class="iput-box">
        <span class="val">{{gender}}</span>
        <span class="desc">(不可修改)</span>
      </div>
    </div>
    <div class="input-row">
      <span class="label">生日：</span>
      <div class="iput-box">
        <el-data-picker
          v-model="birthday"
          align="right"
          type="date"
          value-format="timestamp"
          placeholder="选择日期"
          :picker-options="date">
        >
        </el-data-picker>
      </div>
    </div>
    <div class="input-row">
      <span class="label">身高：</span>
      <div class="iput-box">
        <select class="select" v-model="height">
          <option value="155">155cm以下</option>
          <option :value="item" v-for="(item,index) in heightList">
            {{item}}cm
          </option>
          <option value="190">190cm以上</option>
        </select>
      </div>
    </div>
    <div class="input-row">
      <span class="label">体重：</span>
      <div class="iput-box">
        <select class="select" v-model="weight">
          <option value="40">40kg以下</option>
          <option :value="item" v-for="(item,index) in  weightList">{{item}}kg</option>
          <option value="90">90kg以上</option>
        </select>
      </div>
    </div>
    <div class="btn-group">
      <button class="btn-save" @click='setedit'>保存</button>
    </div>

  </div>
</template>

<script>
import { DatePicker } from "element-ui";
import { setStore, getStore, removeStore, uploader,pathJudge,defaultAvatar,levelMark } from "@/util/tools";
import { mapState } from "vuex";
import {SOURCE_H5} from "@/util/constant";
export default {
  components: {
    "el-data-picker": DatePicker
  },
  data() {
    return {
      birthday: "",
      date:{
        //今日之后的日期不能选
        disabledDate(time){
          return time.getTime()>Date.now();
        }
      },
      nickname: "",
      height: 170,
      weight: 45,
      gender:'女',
      //

      room_cover: "https://lib.liaoke.tv/lib/pc/static/img/preload.png",
      room_background: "https://lib.liaoke.tv/lib/pc/static/img/preload.png",
      avatar_img: "",
      fileObj: null, //上传实例对象
      fileObj1: null, //上传实例对象
      isUp: false, //是否在上传？  停止hover

      uploading: false
      //
    };
  },
  computed: {
    ...mapState({
      hostUser: state => state.hostUser
    }),
    heightList(){
      let min=155;
      let max=190;
      let arr=[];
      while (min<=max) {
        arr.push(min);
        min++;
      }
      return arr;
    },
    weightList(){
      let min=40;
      let max=90;
      let arr=[];
      while (min<=max) {
        arr.push(min);
        min++;
      }
      return arr;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setUser();
    });
  },
  methods: {
    setUser() {
      this.$get('/h5/user/profile').then(r=>{
        if(r.http_code==200){
          this.weight = r.data.weight == "秘密" ? 45 :  r.data.weight,
          this.height =r.data.height == "秘密" ? 165 : r.data.height,
          this.nickname = r.data.nickname;
          this.gender=r.data.gender==1?'男':'女';
          this.birthday=r.data.birthday>0?r.data.birthday*1000:'';
          this.room_cover = r.data.room_cover!=''?pathJudge(r.data.room_cover):''; //直播封面
          this.room_background = r.data.room_background!=''?pathJudge(r.data.room_background):''; //房间背景
        }
      })
    },
    // 编辑资料  保存
    setedit() {
      let birthTime=this.birthday?parseInt(this.birthday/1000):'0';
      let protocol=window.location.protocol;
      let cover='';
      let background='';
      if(this.room_cover.indexOf(protocol+'//chatfile.oss-cn-shanghai.aliyuncs.com/')>-1){
        cover=this.room_cover.replace(protocol+'//chatfile.oss-cn-shanghai.aliyuncs.com/','');
      }
      if(this.room_cover.indexOf(SOURCE_H5)>-1){
        cover=this.room_cover.replace(SOURCE_H5,'');
      }
      if(this.room_cover.indexOf('-cover2')>-1){
        cover=this.room_cover.replace('-cover2','');
      }
      if(this.room_background.indexOf(protocol+'//chatfile.oss-cn-shanghai.aliyuncs.com/')>-1){
        background=this.room_background.replace(protocol+'//chatfile.oss-cn-shanghai.aliyuncs.com/','');
      }
      if(this.room_background.indexOf(SOURCE_H5)>-1){
        background=this.room_background.replace(SOURCE_H5,'');
      }
      var obj = {
        weight: this.weight,
        height: this.height,
        birthday:birthTime,
        nickname: this.nickname,
        room_cover: cover, //直播封面
        room_background: background //房间背景
      };
      this.$post("/h5/user/edit?", obj).then(r => {
        if (r.http_code == 200) {
          this.$store.commit('setUser',obj);
          this.$store.commit('setToast','保存成功');
        }
      });
    },
    //上传图片  直播封面图：
    uploadPhotos_0(e) {
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
        "room_cover",
        () => {
          this.uploading = true;
        },
        name => {
          this.uploading = false;

          this.room_cover = name;
        }
      );
      this.fileObj.init();
    },
    // 房间背景
    uploadPhotos_1(e) {
      let el = event.target ? event.target : event.srcElement;
      let randomId = parseInt(Math.random() * 1000000);
      el.setAttribute("id", "btn" + randomId);
      // let fileId=el.getAttribute('id');
      if (this.uploading) return;
      if (this.fileObj1) {
        this.fileObj1.destroy();
      }
      this.fileObj1 = uploader(
        "btn" + randomId,
        "room_background",
        () => {
          this.uploading = true;
        },
        name => {
          this.uploading = false;
          this.room_background = name;
        }
      );
      this.fileObj1.init();
    }
  }
};
</script>

<style lang="scss">
.info-edit-component {
  .input-row {
    position: relative;
    margin-bottom: 30px;
    min-height: 32px;
    padding-left: 92px;
    .label {
      position: absolute;
      left: 0;
      top: 0;
      width: 92px;
      height: 32px;
      line-height: 32px;
      font-size: 14px;
      color: #333;
    }
    .file-box {
      width: 120px;
      overflow: hidden;
      position: relative;
      background-color: #f8f8f8;
      &.avatar,
      &.cover {
        height: 120px;
      }
      &.background {
        height: 218px;
      }
      img {
        width: 100%;
        height: 100%;
      }
      .btn-file {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 30px;
        line-height: 30px;
        background-color: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-size: 14px;
        text-align: center;
        z-index: 2;
        cursor: pointer;
      }
    }
    .input {
      width: 326px;
      height: 32px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
      line-height: 30px;
      padding: 0px 6px;
    }
    .val {
      line-height: 32px;
      color: #333;
      font-size: 14px;
    }
    .desc {
      color: #999;
      font-size: 12px;
      line-height: 32px;
    }
    .select {
      min-width: 68px;
      height: 32px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
      padding-left: 6px;
    }
  }
  .btn-group {
    padding-left: 92px;
    .btn-save {
      width: 88px;
      height: 36px;
      background-color: #f362f5;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      border-radius: 4px;
      font-size: 14px;
      color: #fff;
    }
  }
  .el-date-editor {
    height: 32px;
    .el-input__inner {
      height: 100%;
    }
    .el-input__icon {
      line-height: 32px;
    }
  }
}
</style>
