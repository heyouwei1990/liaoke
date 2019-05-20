<template>
  <div class="private-photos">
    <ul class="photo-list">
      <li
        v-if="photoList.length>0"
        v-for="(item, index) in photoList"
        :key="index"
        @click="lookPhoto(item)"
        :id="'photo'+item.id"
      >
        <div class="mask" v-if="item.mask"><i class="icon-lock"></i></div>
        <img ref="pic" class="photo" :src="item.cover" alt="" @load="photoMiddle">
        <!--<img class="photo" :src="item.filename" alt="" @load="photoMiddle">-->
      </li>
    </ul>
    <div class="loading-wave" v-if="loading">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="no-data" v-if="empty">Ta还没上传私密照片</div>
    <!--<a-dialog :isShow="showConfirm" @closeDialog="showConfirm=false">
      <div class="confirm">
        <i class="icon-info"></i>
        <div class="tip-msg">查看私照需要700金币</div>
        <div class="btn-group">
          <button class="btn-ensure" @click="ensure">确认</button>
          <button class="btn-cancel" @click="showConfirm=false">取消</button>
        </div>
      </div>
    </a-dialog>-->
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
        photoList:[],
        viewer:null,
        photoId:null,
        showConfirm:false,
        loading:false,
        empty:false,
      }
    },
    computed:{
      ...mapState({
        hostUser:state=>state.hostUser
      })
    },
    mounted(){
      this.userId=Number(this.$route.params.uid);
      this.getPhotoList();
    },
    methods:{
      getPhotoList() {
        // /h5/photo/index

        var to_uid = "";
        var utl_ = "/h5/photo/list";
        // console.log(this.userId)
          if (this.$store.state.hostUser&&this.$store.state.hostUser.uid == this.userId) {
            utl_ = "/h5/photo/index";
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
            for (let i = 0; i < list.length; i++) {
              list[i].filename = pathJudge(list[i].filename);
              list[i]["mask"] = true;
            }
            this.photoList = list;
            if (this.photoList.length == 0) {
              this.empty = true;
            }
          }
        });
      },
      /*lookPhoto(id){
        this.photoId=Number(id);
        this.$get('/h5/photo/check',{
          id:this.photoId
        }).then((r)=>{
          if(r.http_code==200){
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
        this.$get('/h5/photo/pay',{
          id:this.photoId
        }).then((r)=>{
          if(r.http_code==200){
            r.data.photo.filename=pathJudge(r.data.photo.filename);
            let index='';
            for(let i=0;i<this.photoList.length;i++){
              if(this.photoList[i].id==this.photoId){
                index=i;
              }
            }
            this.$refs.pic[index].setAttribute('data-original',r.data.photo.filename);
            this.viewer && this.viewer.destroy();
            this.viewer=new Viewer(document.getElementById('pic'+index),{
              url:'data-original'
            });
            this.viewer.show();
          }else{
            this.$store.commit("setToast",r.msg);
          }
          this.showConfirm=false;
        })
      },*/

      //查看照片照片
      lookPhoto(data) {
        if(!this.hostUser){
          this.$store.commit('set_loginDialog',true);
        }
        let photoId = Number(data.id);
        let parent = document.getElementById("photo" + data.id);
        let tip = getStore("ignorePhotoTip");
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
  .private-photos{
    padding: 50px 80px;
    background-color: #fff;
    border-radius: 4px;
    .photo-list{
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
        .icon-lock{
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 2;
          width: 36px;
          height: 36px;
          transform: translate(-50%,-50%);
          background: url("https://lib.liaoke.tv/lib/pc/static/img/zone/icon-lock.png") no-repeat center / contain;
        }
        .photo{
          display: block;
          /*width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;*/
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%,-50%);
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
