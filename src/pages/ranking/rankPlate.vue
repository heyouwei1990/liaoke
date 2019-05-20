<!--排行榜列表组件-->
<template>
  <div class="rank-plate-conp">
    <tab :tabItem="tabHd" @tabSuccess="change"></tab>
    <div class="clearfix top-bar">
      <div class="my-ranking-wrap left">
        我的排名：
        <span class="my-ranking">{{rank}}</span>
      </div>
      <div
        class="right"
        @click="introduce"
        v-if="tabIndex==0 || (tabIndex==2 && userStatus!=1)"
      >榜单介绍<i class="icon"></i></div>
    </div>
    <ul class="rank-list clearfix" v-if="rankList.length>0">
      <li v-for="(item,index) in rankList" :key="index">
        <i class="rank-num">{{item.rank_number }}</i>
        <router-link :to="{name:'Zone',params:{uid:item.uid}}" target="_blank" class="avatar-wrap">
          <img class="avatar" v-lazy="item.avatar" alt="">
        </router-link>
        <div class="info">
          <div class="nickname">
            <span>{{item.nickname}}</span>
            <img v-if="item.vip_data.level>0" class="vip-mark" :src="item.vip_img" alt="">
            <img v-if="userStatus==1" class="level-mark" :src="item.live_level_img" alt="">
            <img v-else class="level-mark" :src="item.wealth_level_img" alt="">
          </div>
          <div class="coins" v-if="userStatus==1 && (item.rank_type=='day' || item.rank_type=='month')">{{item.money | formatNo }}</div>
          <div class="coins" v-if="userStatus!=1 || (userStatus==1 && item.rank_type=='cost')">{{item.prize_text}}</div>
        </div>
        <button
          class="btn"
          v-if="item.button_text"
          @click="receiveCoins(item.uid,userStatus,item.rank_type,index)"
          :disabled="item.button_click==0"
        >{{item.button_text}}</button>
      </li>
    </ul>
    <div v-if="empty" class="no-data">
      暂无更多数据！
    </div>
    <div class="loading-wave" v-if="loading">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <a-dialog :isShow="showIntro" @closeDialog="showIntro=false;">
      <div class="intro-inner">
        <h3>榜单介绍</h3>
        <ul class="list" v-if="userStatus!=1 && tabIndex=='0'">
          <li>1、风云榜为近7天消耗的送礼金币榜单</li>
          <li>2、每天榜单的前五十名能领取金币奖励</li>
          <li>3、每个排名位置每天只能领取一次奖励</li>
        </ul>
        <ul class="list" v-if="userStatus!=1 && tabIndex=='2'">
          <li>即日起</li>
          <li>获得上月富豪排行榜月榜前十的用户</li>
          <li>可免费领取钻石VIP</li>
        </ul>
        <ul class="list" v-if="userStatus==1 && tabIndex=='0'">
          <li>1、星光榜为近7天赚得收礼积分榜单</li>
          <li>2、每天榜单的前五十名能领取积分奖励</li>
          <li>3、每个排名位置每天只能领取一次奖励</li>
        </ul>
      </div>
    </a-dialog>
  </div>
</template>

<script>
  import Tab from '@/components/tab'
  import ADialog from '@/components/dialog'
  import { mapState } from "vuex";
  export default {
    components:{
      Tab,
      ADialog
    },
    props:{
      rankList:{
        type:Array,
        default:[]
      },
      userStatus:{
        type:[Number,String],
        default:1 //主播 1 或者富豪 2, 默认主播
      },
      rankType:{
        type:String,
        default:'' //风云榜、日榜，月榜
      },
      loading:{
        type:Boolean,
        default:false
      },
      empty:{
        type:Boolean,
        default:false
      },
      rank:{
        type:[String,Number],
        default:''
      }
    },
    data(){
      return{
        tabHd:['风云榜','日榜','月榜'],
        isLiveMonth:false,//是否是主播月榜
        showIntro:false,
        tabIndex:0,
      }
    },
    filters: {
      formatNo(value) {
        if (!value) {
          return 0;
        }
        var intPart = Number(value).toFixed(0); //获取整数部分
        var intPartFormat = intPart
          .toString()
          .replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"); //将整数部分逢三一断
        return intPartFormat;
      }
    },
    computed:{
      ...mapState({
        hostUser: state => state.hostUser
      })
    },
    created(){
      if(this.userStatus==1){
        this.$set(this.tabHd,0,'星光榜');
      }
    },
    methods:{
      //切换榜单
      change(data){
        this.$emit('changeRanking',data);
        this.tabIndex=data;
      },

      // 榜单介绍
      introduce(){
        this.showIntro=true;
      },

      //领取奖励
      receiveCoins(id,role,type,idx){
        if(!this.hostUser){
          this.$store.commit('set_loginDialog',true);
          return;
        }
        if(id!=this.hostUser.uid){
          this.$store.commit('setToast','只能领取自己的奖励');
          return;
        }
        if(role!=1 && type=="month"){
          this.getVip(id,idx);
        }
        if(role!=1 && type=="cost"){
          this.getFyPrize(id,idx);
        }
        if(role==1 && type=="cost"){
          this.getXgPrize(id,idx);
        }
      },
      //领取富豪榜钻石VIP
      getVip(id,idx){
        this.$get('/h5/rank/get-fh-month-prize').then((r)=>{
          // console.log(r);
          this.$store.commit('setToast',r.msg);
          if(r.http_code==200){
            this.rankList[idx].button_click=0;
            this.rankList[idx].button_text='已领取'
          }
        })
      },
      //领取风云榜奖励
      getFyPrize(id,idx){
        this.$get('/h5/rank/get-fy-prize').then((r)=>{
          // console.log(r);
          this.$store.commit('setToast',r.msg);
          if(r.http_code==200){
            this.rankList[idx].button_click=0;
            this.rankList[idx].button_text='已领取'
          }
        })
      },
      //领取星光榜奖励
      getXgPrize(id,idx){
        this.$get('/h5/rank/get-xg-prize').then((r)=>{
          // console.log(r);
          this.$store.commit('setToast',r.msg);
          if(r.http_code==200){
            this.rankList[idx].button_click=0;
            this.rankList[idx].button_text='已领取'
          }
        })
      },
    }
  }
</script>

<style lang="scss">
  .rank-plate-conp{
    position: relative;
    background-color: #312c3a;
    padding: 20px 46px 0;
    .intro-inner{
      width: 300px;
      min-height: 200px;
      h3{
        font-size: 18px;
        color: #333;
        line-height: 40px;
        border-bottom: 1px solid #ddd;
      }
      .list{
        margin-top: 30px;
        li{
          font-size: 14px;
          color: #333;
          line-height: 24px;
          margin-bottom: 10px;
        }
      }
    }
    .top-bar{
      overflow: hidden;
      margin-top: 20px;
      line-height: 24px;
      .right{
        font-size: 12px;
        color: rgba(255,255,255,0.5);
        cursor: pointer;
        .icon{
          display: inline-block;
          vertical-align: middle;
          margin-top: -3px;
          margin-left: 4px;
          width: 12px;
          height: 12px;
          background: url("https://lib.liaoke.tv/lib/pc/static/img/rank/icon-intro.png") no-repeat;
          background-size: contain;
        }
      }
    }
    .my-ranking-wrap{
      white-space: nowrap;
      font-size: 16px;
      color: #F362F5;
      .my-ranking{
        color: #fff;
      }
    }
    .tab-hd{
      overflow: hidden;
      text-align: center;
      >li{
        display: inline-block;
        height: 36px;
        font-size: 14px;
        line-height: 36px;
        position: relative;
        color: rgba(255,255,255,0.5);
        margin-right: 180px;
        &:last-child{
          margin-right: 0;
        }
        &.on{
          color: #F362F5;
        }
        &.on:after{
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          background-color: #A35AFE\9;
          background-image: linear-gradient(90deg, #F362F5 0%, #A35AFE 100%);
        }
      }
    }
    .rank-list{
      margin-top: 6px;
      position: relative;
      padding-top: 350px;
      padding-left: 20px;
      padding-right: 20px;
      padding-bottom: 1px;
      &:before{
        content: '';
        position: absolute;
        left: 0;
        top: 330px;
        width: 100%;
        height: 1px;
        background-color: rgba(255,255,255,0.2);
      }
      >li{
        overflow: hidden;
        white-space: nowrap;
        padding-top: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.2);
        &:last-of-type{
          border-bottom: 0;
        }
        &:first-of-type,
        &:nth-of-type(2),
        &:nth-of-type(3){
          width: 180px;
          border-bottom: 0;
          position: absolute;
          left: 50%;
          top: 0;
          z-index: 2;
          margin-top: 120px;
          padding-top: 22px;
          text-align: center;
          .rank-num{
            display: none;
          }
          .avatar-wrap{
            float: none;
            display: block;
            margin: 0 auto 16px;
            width: 66px;
            height: 66px;
            border: 0;
            position: relative;
            &:before{
              content: '';
              position: absolute;
              left: 50%;
              top: 50%;
              z-index: 2;
              width: 81px;
              height: 88px;
              margin-left: -38px;
              margin-top: -48px;
            }
          }
          .info{
            float: none;
          }
          .nickname{
            font-size: 14px;
          }
          .coins{
            font-size: 12px;
            color: #F162F5;
          }
          .btn{
            float: none;
          }
        }
        &:first-of-type{
          margin-left: -90px;
          margin-top: 0;
          .avatar-wrap{
            width: 88px;
            height: 88px;
            &:before{
              width: 109px;
              height: 116px;
              margin-left: -51px;
              margin-top: -64px;
              background:url("https://lib.liaoke.tv/lib/pc/static/img/rank/rank1.png") no-repeat top right;
              background-size: 100%;
            }
          }
        }
        &:nth-of-type(2){
          margin-left: -270px;
          .avatar-wrap{
            &:before{
              background:url("https://lib.liaoke.tv/lib/pc/static/img/rank/rank2.png") no-repeat top right;
              background-size: 100%;
            }
          }
        }
        &:nth-of-type(3){
          margin-left: 90px;
          .avatar-wrap{
            &:before{
              background:url("https://lib.liaoke.tv/lib/pc/static/img/rank/rank3.png") no-repeat top right;
              background-size: 100%;
            }
          }
        }
      }
      .rank-num{
        float: left;
        width: 24px;
        text-align: center;
        white-space: nowrap;
        font-size: 12px;
        color: rgba(255,255,255,0.5);
        line-height: 48px;
        margin-right: 15px;
      }
      .avatar-wrap{
        float: left;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        margin-right: 20px;
        border: 2px solid #fff;
      }
      .avatar{
        width: 100%;
        height: 100%;
        display: block;
        border-radius:50%;
      }
      .info{
        float: left;
        min-width: 110px;
      }
      .nickname{
        color: #fff;
        font-size: 12px;
        line-height: 24px;
        span{
          display: inline-block;
          vertical-align: middle;
          max-width: 7em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      .vip-mark{
         display: inline-block;
         vertical-align: middle;
         width: 14px;
         height: 14px;
         margin-left: 3px;
       }
      .level-mark{
        margin-left: 3px;
      }
      .coins{
        font-size: 10px;
        color: #F162F5;
        line-height: 20px;
        white-space: nowrap;
      }
      .btn{
        float: right;
        margin-top: 13px;
        min-width: 64px;
        height: 22px;
        border-radius: 22px;
        line-height: 22px;
        text-align: center;
        font-size: 12px;
        padding-left: 8px;
        padding-right: 8px;
        color: #fff;
        background-color: #A35AFE\9;
        background-image: linear-gradient(90deg, #F362F5 0%, #A35AFE 100%);
        &:disabled{
          cursor: not-allowed;
          background: rgba(170,170,170,0.2);
          color: rgba(255,255,255,0.7);
        }
      }
    }
    .no-data{
      text-align: center;
      line-height: 24px;
      color: #fff;
      font-size: 14px;
      padding: 20px;
    }
  }
</style>
