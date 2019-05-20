<template>
  <div class="zone-component">
    <div class="main" v-if="userInfo">
      <div class="top-wrap ">
        <div class="info-contain clearfix">
          <div class="info-dl">
            <div class="info-dt">
              <div class="avatar-wrap">
                <img :src="userInfo.avatar" alt="" class="avatar">
                <a href="javascript:void(0)" class="btn-living" v-if="userInfo.in_room==userId" @click="toRoom(userInfo.uid)">正在直播</a>
              </div>
              <div class="fans-num">粉丝：{{fans}}</div>
              <div class="btn-group">
                <button class="btn-fav" @click="fav" v-if="userInfo.is_fav==0">关注</button>
                <button class="btn-cancelFav" @click="cancelFav" v-if="userInfo.is_fav!=0">取消关注</button>
                <button class="btn-talk" @click="talkTo">私聊</button>
              </div>
            </div>
            <div class="info-dd">
              <div class="clearfix">
                <span class="nickname">{{userInfo.nickname}}</span>
                <img v-if="userInfo.vip_img" :src="userInfo.vip_img" alt="" class="vip-mark">
                <span class="sex-mark" :class="{'man':userInfo.gender==1,'woman':userInfo.gender==2}">
                  <i class="icon-sex" ></i>
                  <i class="age">{{userInfo.age}}</i>
                </span>
                <img :src="userInfo.wealth_level_img" alt="" class="level-mark">
                <img :src="userInfo.live_level_img" alt="" class="level-mark">
                <time>{{userInfo.last_online_at_text}}</time>
              </div>
              <div class="id-num">ID:{{userInfo.uid}}</div>
              <div class="sign">个性签名：{{userInfo.sign}}</div>
              <div class="clearfix">
                <span class="info-item">星座：{{userInfo.constellation}}</span>
                <span class="info-item">身高：{{userInfo.height}}cm</span>
              </div>
              <div class="local">
                <i class="icon-local"></i>
                <span>{{userInfo.city}}</span>
              </div>
              <!--<div class="go-in" v-if="userInfo.in_room==userId" @click="toRoom(userInfo.uid)">进入房间 &gt;</div>-->
              <div class="go-in" @click="toRoom(userInfo.uid)">进入房间 &gt;</div>
            </div>
          </div>
          <div class="tag-wrap">
            <h3>标签：</h3>
            <ul class="tag-list">
              <li
                v-if="userInfo.tag_list.length>0"
                v-for="(item,index) in userInfo.tag_list"
                :key="index"
                :class="{orange:item.category=='性格',green:item.category=='爱好',blue:item.category=='外形' || item.category=='',red:item.category=='技能'}"
              >{{item.name}}</li>
            </ul>
            <div class="no-tag" v-if="userInfo.tag_list.length==0">暂无标签</div>
          </div>
        </div>
        <!--<ul>
          <router-link
            tag="li"
            v-for="(item,index) in navItems"
            :key="index"
            :to="{path:'/zone'+item.path}"
            exact
            active-class="active"
          >{{item.text}}</router-link>
        </ul>-->
        <tab-hd class="nav-items" :tabItem="navItems" @tabSuccess="pageChange"></tab-hd>
      </div>
      <div class="clearfix">
        <div class="zone-content">
          <personal-activity v-if="tabIndex==0"></personal-activity>
          <personal-photos v-if="tabIndex==1"></personal-photos>
          <personal-video v-if="tabIndex==2"></personal-video>
          <personal-info v-if="tabIndex==3" :info="userInfo"></personal-info>
          <personal-gifts v-if="tabIndex==4"></personal-gifts>
        </div>
        <div class="hot-living">
          <h3 class="title">热门直播</h3>
          <ul class="hot-list">
            <li
              v-if="hotList.length>0 && index<6"
              v-for="(item,index) in hotList"
              :key="index"
              @click="toRoom(item.uid)"
            >
              <div class="avatar-wrap">
                <img v-lazy="item.avatar" alt="" class="avatar">
              </div>
              <div class="item-dd">
                <div class="nickname">{{item.nickname}}</div>
                <p class="sign">{{item.sign}}</p>
                <div class="visitor">{{ item.view_count }}人</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { pathJudge, defaultAvatar, levelMark } from "@/util/tools";
  import TabHd from '@/components/tab'
  import PersonalActivity from './personalActivity'
  import PersonalPhotos from './personalPhotos'
  import PersonalVideo from './personalVideo'
  import PersonalInfo from './personalInfo'
  import PersonalGifts from './personalGifts'
  import Chat from '@/components/chat'

  export default {
    components:{
      TabHd,
      PersonalActivity,
      PersonalPhotos,
      PersonalVideo,
      PersonalInfo,
      PersonalGifts,
      Chat
    },
    data(){
      return{
        userId:'',
        userInfo:null, //用户信息
        is_fav:false, //是否关注过
        navItems:['Ta的动态','私密相册','私密视频','个人资料'],//收到礼物
        tabIndex:0, //默认Ta的动态
        colors:['#FEAF78','#69CFC1','#80A6E8','#F97A6E'],
        fans:0,//粉丝数
        hotList:[],
      }
    },
    computed:{
      ...mapState({
        hostUser:state=>state.hostUser,
      })
    },
    mounted(){
      this.dataInit();
    },
    methods:{
      dataInit(){
        this.userId=Number(this.$route.params.uid);
        this.getInfo();
        this.getFans();
        this.getHot();
      },
      //私聊
      talkTo(){
        if(!this.hostUser){
          this.$store.commit('set_loginDialog',true);
          return
        }
        if(this.userId==this.hostUser.uid){
          this.$store.commit('setToast','不能向自己发起私聊');
          return;
        }
        this.$store.commit('set_chatState',true);
        // Bus.$emit('talkTo',this.userInfo);
        this.$store.commit('set_talkTo',this.userInfo);
      },

      //获取信息
      getInfo(){
        this.$get('/h5/user/info',{
          uid:this.userId
        }).then((r)=>{
          if(r.http_code==200){
            let info=levelMark(r.data);
            info.avatar=info.avatar!=''?pathJudge(info.avatar):defaultAvatar(info.avatar);
            this.userInfo=info;
          }
        })
      },

      //去直播间
      toRoom(id){
        let routerData=this.$router.resolve({name:'LiveRoom',params:{uid:id}});
        window.open(routerData.href,'_target');
      },

      //热门直播
      getHot(){
        this.$get('/h5/live/index',{
          page:1
        }).then((r)=>{
          if(r.http_code==200){
            let list=r.data
            for (let i=0; i<list.length; i++) {
              list[i].avatar=list[i].avatar!=''? pathJudge(list[i].avatar) : defaultAvatar(list[i].gender);
            }
            this.hotList=list;
          }
        })
      },

      //fans
      getFans(){
        this.$get('/h5/user/fans',{
          page:1,
          to_uid:this.userId
        }).then((r)=>{
          this.fans=r.data.count;
        })
      },
      //
      pageChange(data){
        this.tabIndex=data;
      },
      //关注
      fav(){
        if(this.hostUser){
          if(this.userId==this.hostUser.uid){
            this.$store.commit('setToast','不能关注自己');
            return;
          }
          this.$get('/h5/user/follow',{
            to_uid:this.userId
          }).then((r)=>{
            if(r.http_code==200){
              this.$store.commit('setToast','您成功关注了'+this.userInfo.nickname);
              this.userInfo.is_fav=1;
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
            to_uid:this.userId,
          }).then((r)=>{
            if(r.http_code==200){
              this.$store.commit('setToast','您取消关注了'+this.userInfo.nickname);
              this.userInfo.is_fav=0;
            }
          })
        }else{
          this.$store.commit('set_loginDialog',true);
        }
      },
    }
  }
</script>

<style lang="scss">
.zone-component{
  width: 100%;
  padding-top: 20px;
  padding-bottom: 80px;
  background: #95CBC7 url("https://lib.liaoke.tv/lib/pc/static/img/zone/bg.png") no-repeat center top;
  background-size: 100% auto;
  .main{
    width: 1340px;
    margin: 0 auto;
  }
  .top-wrap{
    background-color: #fff;
    border-radius: 4px;
    position: relative;
    margin-bottom: 5px;
  }
  .nickname{
    max-width: 7em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .info-contain{
    padding: 36px 40px 50px;
    min-height: 290px;
  }
  .info-dl{
    float: left;
    width: 790px;
    overflow: hidden;
    position: relative;
    &:after{
      content: '';
      position: absolute;
      right: 0;
      top: 5%;
      width: 1px;
      height: 90%;
      background-color: #eee;
    }
  }
  .info-dt{
    float: left;
    width: 244px;
    text-align: center;
    .avatar-wrap{
      width: 124px;
      height: 140px;
      margin: 0 auto;
      position: relative;
      .avatar{
        display: block;
        width: 124px;
        height: 124px;
        border-radius: 50%;
      }
      .btn-living{
        position: absolute;
        left: 50%;
        top: 105px;
        transform: translate(-50%);
        width: 102px;
        height: 34px;
        font-size: 14px;
        color: #fff;
        line-height: 32px;
        text-align: center;
        border: 1px solid #fff;
        border-radius: 100px;
        background-color: #F362F5\9;
        background-image: linear-gradient(90deg, #F362F5 0%, #A35AFE 100%);
        box-shadow: 0 1px 2px 0 rgba(0,0,0,0.30);
      }
    }
    .fans-num{
      font-size: 12px;
      color: #333;
      line-height: 20px;
      margin-top: 14px;
      margin-bottom: 16px;
    }
    .btn-group{
      button{
        width: 80px;
        height: 30px;
        border-radius: 4px;
        font-size: 14px;
        color: #fff;
        margin-right: 10px;
        &:last-of-type{
          margin-right: 0;
        }
      }
      .btn-fav{
        background-color: #ff5a59;
      }
      .btn-cancelFav{
        background-color: #ccc;
      }
      .btn-talk{
        background-color: #4fc0e9;
      }
    }
  }
  .info-dd{
    float: left;
    max-width: 546px;
    padding-right: 30px;
    .nickname{
      vertical-align: middle;
      font-size: 22px;
      color: #333;
      line-height: 40px;
      margin-right: 10px;
    }
    .vip-mark{
      width: 15px;
      height: 14px;
      margin-right: 4px;
    }
    .sex-mark{
      margin-right: 4px;
    }
    .level-mark{
      width: 30px;
      height: 14px;
      vertical-align: middle;
      margin-right: 4px;
    }
    time{
      display: inline-block;
      vertical-align: middle;
      margin-left: 50px;
      font-size: 12px;
      color: #999;
      line-height: 20px;
    }
    .id-num{
      font-size: 12px;
      color: #999;
      line-height: 22px;
    }
    .sign{
      font-size: 12px;
      color: #999;
      line-height: 22px;
      margin-top: 6px;
      margin-bottom: 25px;
    }
    .info-item{
      font-size: 12px;
      color: #333;
      line-height: 22px;
      display: inline-block;
      margin-right: 30px;
    }
    .local{
      font-size: 12px;
      color: #999;
      line-height: 22px;
      margin-top: 6px;
      .icon-local{
        display: inline-block;
        vertical-align: middle;
        margin-top: -3px;
        margin-right: 8px;
        width: 10px;
        height: 12px;
        background: url("https://lib.liaoke.tv/lib/pc/static/img/zone/icon-local.png") no-repeat center / contain;
      }
    }
    .go-in{
      color: #F162F5;
      font-size: 14px;
      line-height: 24px;
      margin-top: 26px;
      cursor: pointer;
    }
  }
  .tag-wrap{
    float: left;
    padding-left: 36px;
    width: 432px;
    h3{
      font-size: 24px;
      color: #bbb;
      line-height: 40px;
      margin-bottom: 20px;
    }
    .tag-list{
      width: 460px;
      overflow: hidden;
      li{
        float: left;
        font-size: 16px;
        line-height: 24px;
        margin-bottom: 14px;
        margin-right: 28px;
        &.orange{
          color:#FEAF78;
        }
        &.blue{
          color:#80A6E8;
        }
        &.green{
          color:#69CFC1;
        }
        &.red{
          color:#F97A6E;
        }
      }
    }
    .no-tag{
      font-size: 16px;
      color: #999;
      line-height: 24px;
    }
  }
  .tab-hd{
    height: 44px;
    padding-left: 110px;
    >li{
      cursor: pointer;
      position: relative;
      float: left;
      height: 44px;
      line-height: 40px;
      color: #333;
      font-size: 14px;
      margin-right: 82px;
      &.on{
        color: #F162F5;
        &:after{
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 100%;
          background-color: #F162F5;
        }
      }
    }
  }
  .zone-content{
    float: left;
    width: 910px;
  }
  .hot-living{
    float: right;
    width: 425px;
    border-radius: 4px;
    background-color: #fff;
    overflow: hidden;
    .title{
      font-size: 18px;
      color: #333;
      font-weight: bold;
      line-height: 1.5;
      padding: 20px 30px;
    }
    .hot-list{
      li{
        padding: 0 30px;
        overflow: hidden;
        margin-bottom: 30px;
        cursor: pointer;
      }
      .avatar-wrap{
        width: 80px;
        height: 80px;
        float: left;
        margin-right: 20px;
      }
      .avatar{
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
      .item-dd{
        float: left;
        max-width: 250px;
        min-height: 80px;
        position: relative;
      }
      .nickname{
        font-size: 16px;
        color: #333;
        line-height: 20px;
      }
      .sign{
        font-size: 12px;
        color: #666;
        line-height: 20px;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-top: 10px;
      }
      .visitor{
        position: absolute;
        left: 0;
        bottom: 0;
        font-size: 14px;
        color: #999;
        line-height: 24px;
        white-space: nowrap;
        &:before{
          content: '';
          width: 12px;
          height: 12px;
          display: inline-block;
          vertical-align: middle;
          margin-top: -3px;
          background: url("https://lib.liaoke.tv/lib/pc/static/img/index/icon-visitor.png") no-repeat center / contain;
          margin-right: 4px;
        }
      }
    }
  }
}
</style>
