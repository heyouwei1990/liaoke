<!--用户资料弹框内容-->
<template>
  <div class="userinfo-detail">
    <img class="avatar" :src="info.avatar" alt="">
    <div v-if="isShowInput && info.remark_name!=''" class="remark-area">
      <input
        type="text"
        v-model="remarkName"
        placeholder="添加备注"
        maxlength="7">
      <button class="btn-ensure" @click="setRemarkName(info)">确定</button>
      <button class="btn-cancel" @click="isShowInput=false">取消</button>
    </div>
    <div v-else class="info-block">
      <span v-if="info.remark_name==''" class="nickname">{{info.nickname}}</span>
      <span v-else class="remarks"><i class="icon-edit" @click="isShowInput=true"></i>{{info.remark_name}}</span>
      <span :class="['sex-mark',{'man':info.gender==1,'woman':info.gender==2}]">
        <i class="icon-sex"></i>
        <i class="age">{{info.age}}</i>
      </span>
      <img :src="info.wealth_level_img" alt="" class="level-mark">
      <img :src="info.live_level_img" alt="" class="level-mark">
    </div>
    <div class="id-num">ID:{{info.uid}}</div>
    <div class="remark-wrap">
      <div v-if="isShowInput && info.remark_name==''" class="remark-area">
        <input
          type="text"
          v-model="remarkName"
          placeholder="添加备注"
          maxlength="7">
        <button class="btn-ensure" @click="setRemarkName(info)">确定</button>
        <button class="btn-cancel" @click="isShowInput=false">取消</button>
      </div>
      <div v-else>
        <div v-if="info.remark_name!=''" class="remarked">
          <span class="label">昵称:</span>
          <span class="nickname">{{info.nickname}}</span>
        </div>
        <div v-else class="no-remark" @click="isShowInput=true">
          <i class="icon-edit"></i>
          <span>添加备注</span>
        </div>
      </div>

    </div>
    <p class="motto" v-if="info.sign!=''">{{info.sign}}</p>
    <p class="motto" v-else>点个关注，么么哒~</p>
    <div class="btn-send-gift" @click="giveTo(info)">
      <i class="icon-gift"></i>
      <span>赠送礼物</span>
    </div>
    <div class="btn-list" v-if="hostUser!=null">
      <button v-if="anchor.id==anchor.user.id  && anchor.user.is_admin>0" @click="setAdmin(info)">取消管理员</button>
      <button
        v-if="anchor.id==anchor.user.id && info.is_admin==0"
        @click="setAdmin(info)"
      >设为管理员</button>
      <button v-if="anchor.user.is_admin>0" @click="kick(info)">踢出房间</button>
      <button @click="talkTo(info)">@Ta</button>
      <button v-if="anchor.user.is_admin>0 && info.shut_up_status==0" @click="shutUp(info,true)">禁言</button>
      <button v-if="anchor.user.is_admin>0 && info.shut_up_status!=0" @click="shutUp(info,false)">取消禁言</button>
    </div>
    <div class="btn-group">
      <button class="btn-red" v-if="info.is_fav==0" @click="fav(info)">关注</button>
      <button class="btn-gray" v-else @click="cancelFav(info)">取消关注</button>
      <button class="btn-blue" @click="$router.push({name:'Zone',params:{uid:info.uid}})">Ta的主页</button>
    </div>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  export default {
    data(){
      return{
        remarkName:'',
        isShowInput:false,
      }
    },
    computed:{
      ...mapState({
        hostUser: state => state.hostUser,
        isLogin: state => state.isLogin
      })
    },
    props:{
      info:{
        type:Object,
        default:()=>{
          return{}
        }
      },
      anchor:{
        type:Object,
        default:()=>{
          return{}
        }
      }
    },
    mounted(){
      console.log(this.anchor)
    },
    methods:{
      //赠送礼物
      giveTo(data){
        if(this.hostUser){
          if(this.anchor.user.uid===data.uid){
            this.$store.commit('setToast','不能送礼物给自己');
            return;
          }
          this.$emit('sendTo',data);
        }else{
          this.$store.commit('set_loginDialog',true);
        }

      },

      //关注
      fav(data){
        if(this.hostUser){
          if(this.anchor.user.uid===data.uid){
            this.$store.commit('setToast','不能关注自己');
            return;
          }
          this.$get('/h5/user/follow',{
            to_uid:Number(data.uid),
            created_in:Number(data.in_room)
          }).then((r)=>{
            if(r.http_code==200){
              this.$store.commit('setToast','您成功关注了'+data.nickname);
              let newData=data;
              newData.is_fav=1;
              this.$emit('changeData',newData)
            }
          })
        }else{
          this.$store.commit('set_loginDialog',true);
        }

      },

      //取消关注
      cancelFav(data){
        if(this.hostUser){
          this.$get('h5/user/cancel-follow',{
            to_uid:Number(data.uid),
            created_in:Number(data.in_room)
          }).then((r)=>{
            if(r.http_code==200){
              this.$store.commit('setToast','您取消关注了'+data.nickname);
              let newData=data;
              newData.is_fav=0;
              this.$emit('changeData',newData)
            }
          })
        }else{
          this.$store.commit('set_loginDialog',true);
        }
      },

      //@某某
      talkTo(data){
        if(this.anchor.user.uid===data.uid){
          this.$store.commit('setToast','不能 @ 自己');
          return;
        }
        this.$emit('speakTo',data)
      },

      //禁言/解除禁言
      shutUp(data,type){
        if(this.anchor.user.uid===data.uid){
          this.$store.commit('setToast','不能禁言自己');
          return;
        }
        let duration=!type?0:1800;
        if(this.hostUser){
          this.$get('/h5/live/shut-up',{
            room_id:Number(data.in_room),
            to_uid:Number(data.uid),
            shut_up_time:duration
          }).then((r)=>{
            if(r.http_code==200){
              this.$store.commit('setToast',r.msg);
            }
          })
        }else{
          this.$store.commit("set_loginDialog",true);
        }
      },

      //踢粉丝出房间
      kick(data){
        if(this.anchor.user.uid===data.uid){
          this.$store.commit('setToast','不能踢出自己');
          return;
        }
        this.$get('/h5/live/kick',{
          room_id:Number(data.in_room),
          to_uid:Number(data.uid),
          kick_time:1800000
        }).then((r)=>{
          if(r.http_code==200){
            this.$store.commit('setToast',r.msg);
          }
        })
      },

      //设置粉丝为管理员
      setAdmin(data){
        this.$get('/h5/live/set-admin',{
          room_id:Number(data.in_room),
          to_uid:Number(data.uid)
        }).then((r)=>{
          if(r.http_code==200){
            this.$store.commit('setToast','成功设置'+data.nickname+'为管理员');
          }
        })
      },

      //设置备注
      setRemarkName(data){
        this.$get('/h5/user/set-remark-name',{
          to_uid:Number(data.uid),
          value:this.remarkName
        }).then((r)=>{
          if(r.http_code==200){
            data.remark_name=this.remarkName;
            this.isShowInput=false;
            this.$store.commit('setToast',r.msg);
          }
        })
      }
    }
  }
</script>

<style lang="scss">
.userinfo-detail{
  text-align: center;
  .avatar{
    display: block;
    /*position: absolute;
    left: 50%;
    top: -100px;*/
    width: 94px;
    height: 94px;
    border-radius: 50%;
    border: 2px solid #fff;
    margin: -67px auto 12px;
    background-color: #f00;
  }
  .nickname{
    max-width: 7em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .info-block{
    white-space: nowrap;
    .nickname,.remarks{
      display: inline-block;
      vertical-align: middle;
      font-size: 16px;
      color: #151515;
      line-height: 24px;
    }
    .sex-mark,.level-mark{
      display: inline-block;
      vertical-align: middle;
      width: 30px;
      height: 14px;
      margin-left: 4px;
    }
  }
  .id-num{
    font-size: 12px;
    color: #666;
    line-height: 24px;
    margin-top: 4px;
  }
  .icon-edit{
    display: inline-block;
    vertical-align: middle;
    width: 14px;
    height: 14px;
    margin-right: 4px;
    margin-top: -2px;
    background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-edit.png") no-repeat center /contain;
  }
  .remark-wrap{
    margin-top: 6px;
    .remarked{
      white-space: nowrap;
      font-size: 14px;
      color: #666;
      line-height: 24px;
      span{
        vertical-align: middle;
      }
    }
    .no-remark{
      cursor: pointer;
      span{
        vertical-align: middle;
        color: #666;
        font-size: 14px;
      }
    }
  }
  .remark-area{
    display: inline-block;
    overflow: hidden;
    input{
      float: left;
      width: 106px;
      height: 24px;
      padding: 0 10px;
      line-height: 22px;
      border: 1px solid #e6e6e6;
      font-size: 12px;
      color: #333;
      margin-right: 10px;
    }
    button{
      background-color: transparent;
      float: left;
      font-size: 12px;
      line-height: 24px;
      color: #999;
      min-width: 32px;
    }
    .btn-ensure{
      color: #F162F5;
    }
  }
  .motto{
    font-size: 12px;
    color: #999;
    line-height: 20px;
    margin-top: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .btn-send-gift{
    cursor: pointer;
    white-space: nowrap;
    font-size: 14px;
    color: #F162F5;
    line-height: 22px;
    width: 100px;
    margin: 15px auto;
    .icon-gift{
      display: inline-block;
      vertical-align: middle;
      width: 21px;
      height: 21px;
      margin-right: 8px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/room/icon-gift.png") no-repeat center /contain;
    }
    span{
      vertical-align: middle;
    }
  }
  .btn-list{
    white-space: nowrap;
    button{
      background-color: transparent;
      color: #333;
      line-height: 24px;
      font-size: 14px;
      margin: 0 12px;
      &:first-of-type{
        margin-left: 0;
      }
      &:last-of-type{
        margin-right: 0;
      }
    }
  }
  .btn-group{
    margin-top: 12px;
    button{
      width: 144px;
      height: 38px;
      border-radius: 4px;
      font-size: 16px;
      color: #fff;
      margin-right: 10px;
      &:last-of-type{
        margin-right: 0;
      }
    }
    .btn-red{
      background-color: #FF5A59;
    }
    .btn-blue{
      background-color: #64BECA;
    }
    .btn-gray{
      background-color: #ccc;
    }
  }
}
</style>
