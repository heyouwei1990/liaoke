<template>
  <div class="edit-component">
    <div class="main">
      <h2 class="sec-hd">— 编辑资料 —</h2>
      <div class="edit-wrapper clearfix">
        <div class="aside">
          <div class="avatar-file" @mouseover="uploadAvatar">
            <label for="avatarFile">更改头像</label>
            <input type="file" name="" id="avatarFile">
            <img class="avatar" :src="avatar" alt="">
          </div>
          <ul class="nav-list">
            <router-link
              tag="li"
              v-for="(item,index) in navList"
              :key="index"
              exact
              replace
              active-class="active"
              :to="item.path"
            >
              {{item.text}}
            </router-link>
          </ul>
        </div>
        <div class="edit-content">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { uploader, pathJudge, defaultAvatar, levelMark } from "@/util/tools";

  export default {
    data(){
      return{
        navList:[
          {
            text:'个人信息',
            path:'infoEdit',
          },
          {
            text:'我的标签',
            path:'tagEdit',
          },
          {
            text:'交友信息',
            path:'publicEdit',
          },
          {
            text:'情感观',
            path:'privateEdit',
          },
        ],
        avatar:'',
        fileObj: null, //上传实例对象
        fileObj1: null, //上传实例对象
        isUp: false, //是否在上传？  停止hover

        uploading: false
      }
    },
    mounted(){
      this.$nextTick(()=>{
        this.getUser();
      })
    },
    methods:{
      getUser(){
        this.$get('/h5/user/profile').then(r=>{
          if(r.http_code==200){
            this.avatar = r.data.avatar!=''?pathJudge(r.data.avatar):pathJudge('assets/avatar.png');
          }
        })
      },
      //上传图片  直播封面图：
      uploadAvatar() {
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
          "avatar",
          () => {
            this.uploading = true;
          },
          name => {
            this.uploading = false;

            this.avatar = name;
            this.save();
          }
        );
        this.fileObj.init();
      },
      save(){
        let protocol=window.location.protocol;
        let avatar_img='';
        if(this.avatar.indexOf(protocol+'//chatfile.oss-cn-shanghai.aliyuncs.com/')>-1){
          avatar_img=this.avatar.replace(protocol+'//chatfile.oss-cn-shanghai.aliyuncs.com/','');
        }
        let obj={avatar:avatar_img};
        this.$post("/h5/user/edit?",obj).then(r => {
          if (r.http_code == 200) {
            this.$store.commit('setUser',obj);
          }
        });
      }
    }
  }
</script>

<style lang="scss">
.edit-component{
  padding: 60px 0;
  background-color: #fff;
  min-height: calc(100vh - 228px);
  .main{
    width: 1340px;
    margin: 0 auto;
  }
  .sec-hd{
    height: 80px;
    text-align: center;
    padding: 20px;
    background-color: #f7f7f7;
    font-size: 20px;
    color: #333;
    font-weight: bold;
    line-height: 2;
  }
  .edit-wrapper{
    background-color: #fff;
    border: 1px solid #ddd;
    border-top: 0;
  }
  .aside{
    float: left;
    width: 220px;
    padding: 50px 30px 20px;
  }
  .avatar-file{
    position: relative;
    overflow: hidden;
    width: 124px;
    height: 124px;
    border-radius: 50%;
    margin: 0 auto 40px;
    .avatar{
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
    label{
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 3;
      text-align: center;
      font-size: 14px;
      color: #fff;
      line-height: 124px;
      background-color: rgba(0,0,0,0.5);
    }
  }
  input[type="file"]{
    position: absolute;
    left: 0;
    top: 0;
    width: 0px;
    height: 0px;
    opacity: 0;
    clip: rect(0,0,0,0);
  }
  .nav-list{
    li{
      cursor: pointer;
      width: 100%;
      height: 50px;
      padding: 12px 20px 12px 30px;
      font-size: 16px;
      line-height: 26px;
      color: #333;
      white-space: nowrap;
      margin-bottom: 5px;
      &.active{
        background-color: #f7f7f7;
        color: #F162F5;
      }
    }
  }

  .edit-content{
    float: left;
    margin-left: 30px;
    width: 1000px;
    padding-top: 70px;
    padding-bottom: 80px;
  }
}
</style>
