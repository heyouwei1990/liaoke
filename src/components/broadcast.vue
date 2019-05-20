<template>
  <div class="broadcast-component">
    <div class="broadcast-wrapper" v-if="!showDeal">
      <h3 class="title">开播</h3>
      <div class="file-box">
        <img :src="fileImg" alt="">
        <label id="fileBtn" @mouseover="uploadFace"></label>
        <!--<input id="file" type="file" @change="uploadFace">-->
      </div>
      <div class="agree-wrap">
        <div class="check-box">
          <input id="agree" type="checkbox" v-model="agree" @change="agreeDeal">
          <label for="agree">
            我已阅读并同意
          </label>
        </div>
        <span class="deal" @click="showDeal=true">《聊客主播协议》</span>
      </div>
      <div class="warn" :class="{active:showWarn}">请阅读《聊客主播协议》！</div>
      <button class="btn-start" @click="start">开始直播</button>
    </div>
    <div class="deal-wrapper" v-if="showDeal">
      <h3 class="title">《聊客主播协议》</h3>
      <div class="deal-content scroller">
        <p>1、贵方根据我方注册要求及规则，在我方合法经营的直播平台（以下简称“平台”）上申请成为我方主播，在我方平台从事网络直播活动，即使用我方平台提供的服务从事包括但不限于在线游戏解说、游戏技巧展示、唱歌跳舞或其他才艺展示、参加比赛及综艺节目等视频内容的直播活动（以下简称“网络直播”），贵方在我方平台进行网络直播期间均应视为协议期内。我方不事先审核前述被上载的、由贵方参与、编辑、制作的视频内容，也不主动对该等视频进行任何编辑、整理、修改、加工。 </p>
        <p>2、签署本协议前，贵方已充分了解我方之各项规则及要求，且有条件及有能力、资格履行本协议约定的主播职责及义务。本协议对贵方构成有效的、带有约束力的、可强制执行的法定义务，贵方对本协议下所有条款及定义等内容均已明确知悉，并无疑义。</p>
        <p>3、贵方承诺并声明在我方平台进行网络直播时符合所在地法律的相关规定，不得以履行本协议名义从事其他违反中国及所在地法律规定的行为。</p>
      </div>
      <button class="btn-agree" @click="showDeal=false;agree=true;">我已阅读并同意</button>
    </div>
  </div>
</template>

<script>
  import { uploader } from "@/util/tools";
  import { mapState } from 'vuex'

  export default {
    data(){
      return{
        showDeal:false,
        //上传提示图
        fileImg:require('../../static/img/index/file.png'),
        showImg:'', //待上传
        agree:false, //同意协议
        showWarn:false, //显示提示信息
        pageIndex:1,
        fileObj:null,
        uploading:false,
      }
    },
    computed:{
      ...mapState({
        hostUser:state=>state.hostUser,
      })
    },
    methods:{
      //上传封面
      uploadFace(e){
        let el=event.target?event.target:event.srcElement;
        let fileId=el.getAttribute('id');
        if (this.uploading) return;
        if(this.fileObj){
          this.fileObj.destroy();
        }
        this.fileObj = uploader(
          fileId,
          'liveCover',
          () => {
            this.uploading = true;
          },
          name => {
            this.uploading = false;
            this.fileImg = name;
            this.showImg=name;
          }
        );
        this.fileObj.init();
      },
      // 开始直播
      start(){
        if(!this.agree){
          this.showWarn=true;
          return;
        }
        this.$get('/h5/live/set-cover',{
          cover:this.showImg,
        }).then((r)=>{
          if(r.http_code==200 && this.hostUser){
            this.$router.push({name:'LiveRoom',params:{uid:this.hostUser.uid}});
            this.$emit('close')
          }
        })
        /*this.$get('/h5/live/start',{
          page:this.pageIndex
        }).then((r)=>{
          console.log(r);
        })*/
      },
      // 同意协议
      agreeDeal(){
        if(this.agree){
          this.showWarn=false;
        }
      }
    }
  }
</script>

<style lang="scss">
.broadcast-component{
  width: 442px;
  min-height: 442px;
  .broadcast-wrapper{
    text-align: center;
    .title{
      font-size: 22px;
      line-height: 40px;
      color: #333;
      text-align: center;
      margin-bottom: 30px;
      &:before,
      &:after{
        content: '';
        display: inline-block;
        vertical-align: middle;
        width: 22px;
        height: 1px;
        background-color: #333;
        margin: -3px 10px 0;
      }
    }
    input[type="file"],
    input[type="checkbox"]{
      position: absolute;
      left: 0;
      top: 0;
      z-index: 3;
      width: 100%;
      height: 100%;
      clip: rect(0,0,0,0);
    }
    .file-box{
      width: 180px;
      height: 180px;
      margin: 0 auto 30px;
      overflow: hidden;
      position: relative;
      img{
        display: block;
        width: 100%;
        height: 100%;
      }
      label{
        position: absolute;
        left: 0;
        top: 0;
        z-index: 3;
        width: 100%;
        height: 100%;
      }
    }
    .agree-wrap{
      display: inline-block;
      line-height: 24px;
      font-size: 16px;
      color: #333;
      .check-box{
        display: inline-block;
        vertical-align: middle;
        label{
          position: relative;
          padding-left: 26px;
          &:before,
          &:after{
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
          }
          &:before{
            width: 18px;
            height: 18px;
            margin-top: -9px;
            border-radius: 50%;
            background-color: #d2d2d4;
          }
          &:after{
            width: 8px;
            height: 4px;
            border-left: 2px solid #fff;
            border-bottom: 2px solid #fff;
            transform: rotate(-45deg);
            margin-left: 4px;
            margin-top: -4px;
            border-radius: 2px;
          }
        }
        input:checked+label{
          &:before{
            background-color: #F362F5\9;
            background-image: linear-gradient(90deg, #F362F5 0%, #A35AFE 100%);
          }
        }
      }
      .deal{
        vertical-align: middle;
        color: #A35AFE;
        cursor: pointer;
      }
    }
    .warn{
      font-size: 12px;
      color: #f00;
      line-height: 20px;
      height: 20px;
      margin-top: 10px;
      visibility: hidden;
      &.active{
        visibility: visible;
      }
    }
  }
  .deal-wrapper{
    .title{
      font-size: 22px;
      color: #333;
      text-align: center;
      line-height: 40px;
      margin-bottom: 20px;
    }
    .deal-content{
      width: 100%;
      height: 290px;
      overflow-y: auto;
      overflow-x: hidden;
      p{
        font-size: 12px;
        color: #333;
        line-height: 22px;
      }
    }
  }
  .btn-agree,
  .btn-start{
    width: 402px;
    height: 54px;
    color: #fff;
    font-size: 18px;
    border-radius: 4px;
    margin-top: 20px;
    background-color: #F362F5;
    background-image: linear-gradient(90deg, #F362F5 0%, #A35AFE 100%);
  }
}
</style>
