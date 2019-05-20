<template>
  <div class="private-video">
    <ul class="video-list">
      <li
        v-if="videoList.length>0"
        v-for="(item, index) in videoList"
        :key="index"
        @click="lookVideo(item)"
      >
        <div class="mask"><i class="icon-play"></i></div>
        <time class="duration">{{item.length | duration }}</time>
        <img class="face blur" v-lazy="item.cover" alt="" @load="photoMiddle">
      </li>
    </ul>
    <div class="loading-wave" v-if="loading">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="no-data" v-if="empty">Ta还没上传私密视频</div>
    <!--<a-dialog :isShow="showConfirm" @closeDialog="showConfirm=false">
      <div class="confirm">
        <i class="icon-info"></i>
        <div class="tip-msg">查看视频需要2000金币</div>
        <div class="btn-group">
          <button class="btn-ensure" @click="ensure">确认</button>
          <button class="btn-cancel" @click="showConfirm=false">取消</button>
        </div>
      </div>
    </a-dialog>-->
    <div class="video-wrap" v-if="showVideo">
      <div class="icon-close" @click="closeVideo"></div>
      <video id="video" controls autoplay loop>
        <source :src="videoUrl" type="video/mp4">
      </video>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { pathJudge, setStore, getStore,removeStore } from "@/util/tools";
  import ADialog from '@/components/dialog'

  export default {
    components:{
      ADialog
    },
    data(){
      return{
        userId:null,
        videoList:[],
        showConfirm:false,
        videoId:null,
        videoUrl:null,
        showVideo:false,
        loading:false,
        empty:false,
      }
    },
    computed:{
      ...mapState({
        hostUser:state=>state.hostUser
      })
    },
    filters:{
      duration(value){
        let sec=value/1000 % 60;
        let min=(value/1000-sec) % 60;
        // let h=(value/1000-min*60-sec) % 60;
        sec=sec>9?sec:'0'+sec;
        min=min>9?min:'0'+min;
        // h=h>9?h:'0'+h;

        return min+':'+sec;
      }
    },
    mounted(){
      removeStore("ignoreVideoTip");
      this.userId=Number(this.$route.params.uid);
      this.getVideoList();
    },
    methods:{
      getVideoList() {
        var to_uid = "";
        var utl_ = "/h5/video/list";
        // console.log(this.userId)
          if (this.$store.state.hostUser&&this.$store.state.hostUser.uid == this.userId) {
            utl_ = "/h5/video/index";
          } else {
            to_uid = this.userId;
          }
        
        this.loading = true;
        this.empty = false;
        this.$get(utl_, {
          to_uid: to_uid
        }).then(r => {
          this.loading = false;
          if (r.http_code == 200) {
            let list = r.data;
            this.videoList = list;
            if (this.videoList.length == 0) {
              this.empty = true;
            }
          }
        });
      },
      //图片居中
      photoMiddle(e){
        let el=e.target?e.target:e.srcElement;
        let _w=el.naturalWidth;
        let _h=el.naturalHeight;
        if(_w>_h){
          el.style.height='180px';
        }
        if(_w<_h){
          el.style.width='180px';
        }
        if(_w==_h){
          el.style.width='180px';
          el.style.height='180px';
        }
      },
      /*//
      lookVideo(id){
        this.videoId=Number(id);
        this.$get('/h5/video/check',{
          id:this.videoId
        }).then((r)=>{
          if(r.http_code==200){
            // console.log(r.data.pay)
            if(r.data.pay==1){
              this.showConfirm=true;
            }else{
              this.ensure();
            }
          }
        })

      },

      //确认查看
      ensure(){
        this.$get('/h5/video/pay',{
          id:this.videoId
        }).then((r)=>{
          if(r.http_code==200){
            this.showVideo=true;
            this.videoUrl=pathJudge(r.data.video.filename);
          }else{
            this.$store.commit("setToast",r.msg);
          }
          this.showConfirm=false;
        })
      },*/

      //查看私密视频
      lookVideo(data) {
        let vid = data.id;
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

      //关闭视频
      closeVideo(){
        this.videoUrl=null;
        this.showVideo=false;
        let video=document.getElementById('video');
        video.pause();
      }
    }
  }
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
  .private-video{
    padding: 50px 80px;
    background-color: #fff;
    border-radius: 4px;
    .video-wrap{
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 99;
      background-color: rgba(0,0,0,0.8);
      .icon-close{
        position: absolute;
        right: 10px;
        top: 10px;
        z-index: 2;
        width: 40px;
        height: 40px;
        cursor: pointer;
        background: url("https://lib.liaoke.tv/lib/pc/static/img/index/icon-close.png") no-repeat center / contain;
      }
      video{
        width: 100%;
        height: 100%;
      }
      embed{
        width: 400px;
        height: 300px;
      }
    }
    .video-list{
      overflow: hidden;
      li{
        float: left;
        width: 180px;
        height: 180px;
        border-radius: 4px;
        overflow: hidden;
        position: relative;
        margin-right: 10px;
        margin-bottom: 10px;
        &:nth-of-type(4n){
          margin-right: 0;
        }
        .mask{
          position: absolute;
          left: 0;
          top: 0;
          z-index: 2;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.3);
        }
        .icon-play{
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 2;
          width: 36px;
          height: 36px;
          transform: translate(-50%,-50%);
          background: url("https://lib.liaoke.tv/lib/pc/static/img/zone/icon-play.png") no-repeat center / contain;
        }
        .duration{
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 3;
          font-size: 12px;
          color: #fff;
          line-height: 20px;
        }
        .face{
          display: block;
          width: 100%;
          height: 100%;
        }
        .blur{
          filter: url(https://lib.liaoke.tv/lib/pc/static/img/zone/blur.svg#blur); /* FireFox, Chrome, Opera */
          -webkit-filter: blur(10px); /* Chrome, Opera */
          -moz-filter: blur(10px);
          -ms-filter: blur(10px);
          filter: blur(10px);
          filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius=10, MakeShadow=false); /* IE6~IE9 */
        }
      }
    }
    .confirm{
      width: 338px;
      .icon-success{
        display: block;
        width: 69px;
        height: 81px;
        background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-success.png");
        margin: 20px auto 0;
      }
      .icon-info{
        display: block;
        width: 69px;
        height: 81px;
        background: url("https://lib.liaoke.tv/lib/pc/static/img/recharge/icon-info.png");
        margin: 20px auto 0;
      }
      .tip-msg{
        font-size: 18px;
        color: #333;
        line-height: 24px;
        text-align: center;
        margin-top: 20px;
      }
      .btn-group{
        margin: 30px auto 10px;
        text-align: center;
        button{
          font-size: 14px;
          width: 100px;
          height: 40px;
          border-radius: 40px;
          margin-right: 10px;
          &:last-of-type{
            margin-right: 0;
          }
        }
      }
      .btn-cancel{
        border: 1px solid #F362F5;
        background-color: transparent;
        color: #F362F5;
      }
      .btn-ensure{
        color: #fff;
        background-color: #F362F5;
        background-image: linear-gradient(90deg, #F362F5 0%, #A35AFE 100%);
      }
    }
    .no-data{
      text-align: center;
      font-size: 14px;
      color: #999;
      line-height: 24px;
    }
  }
</style>
