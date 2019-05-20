<!--排行榜页面主体-->
<template>
  <div class="content-ranking">
    <div class="banner"></div>
    <div class="main clearfix">
      <div class="plate left">
        <h3 class="plate-title">富豪排行榜</h3>
        <rank-plate
          :rankList="magnateList"
          userStatus="2"
          @changeRanking="magnateSort"
          :loading="wealthLoading"
          :empty="wealthEmpty"
          :rank="USER_f"
        ></rank-plate>
      </div>
      <div class="plate right">
        <h3 class="plate-title">主播排行榜</h3>
        <rank-plate
          :rankList="anchorList"
          userStatus="1"
          @changeRanking="anchorSort"
          :loading="liveLoading"
          :empty="liveEmpty"
          :rank="USER_z"
        ></rank-plate>
      </div>
    </div>
  </div>
</template>

<script>
  import RankPlate from './rankPlate'
  import { pathJudge,levelMark } from '@/util/tools'
  export default {
    components:{
      RankPlate
    },
    data(){
      return{
        USER_f:null,
        USER_z:null,
        magnateList:[],
        anchorList:[],
        wealthLoading:false,
        wealthEmpty:false,
        liveLoading:false,
        liveEmpty:false,
      }
    },
    mounted(){
      this.dataInit();
    },
    methods:{
      dataInit(){
        this.magnateSort(0);
        this.anchorSort(0);
      },
      // 获取排行列表
      getRankList(key,target){
        if(target=='user' || target=='exp'){
          this.wealthEmpty=false;
        }else{
          this.liveEmpty=false;
        }
        this.$get(`/h5/rank/${key}`,{
          type:target,
          format:'json'
        }).then((r)=>{
          let list=r.data.list;
          for (let i=0; i<list.length; i++) {
            list[i].avatar=list[i].avatar!=''? pathJudge(list[i].avatar) : defaultAvatar(list[i].gender);
            list[i]=levelMark(list[i]);
            list[i]["rank_type"]=key; //新增排行榜类型，以便判断领取奖励的接口
          }
          if(target=='user' || target=='exp'){
            //富豪排行
            this.magnateList=list;
            this.wealthLoading=false;
            if(this.magnateList.length==0){
              this.wealthEmpty=true;
            }else{
              this.wealthEmpty=false;
            }
            this.USER_f=r.data.rank==0?'暂无排名':r.data.rank;
          }else{
            //主播排行
            this.anchorList=list;
            this.liveLoading=false;
            if(this.anchorList.length==0){
              this.liveEmpty=true;
            }else{
              this.liveEmpty=false;
            }
             this.USER_z=r.data.rank==0?'暂无排名':r.data.rank;
          }
        })
      },
      //富豪排行榜tab切换
      magnateSort(data){
        this.magnateList=[];
        this.wealthLoading=true;
        switch (data) {
          case 0:
            this.getRankList('cost','exp');
            break;
          case 1:
            this.getRankList('day','user');
            break;
          case 2:
            this.getRankList('month','user');
            break;
        }
      },
      //主播排行榜tab切换
      anchorSort(data){
        this.anchorList=[];
        this.liveLoading=true;
        switch (data) {
          case 0:
            this.getRankList('cost','income');
            break;
          case 1:
            this.getRankList('day','girl');
            break;
          case 2:
            this.getRankList('month','girl');
            break;
        }
      },
    }
  }
</script>

<style lang="scss">
  .content-ranking{
    overflow: hidden;
    background-color: #292432;
    background: url(https://lib.liaoke.tv/lib/pc/static/img/rank/bg.png) no-repeat top center;
    .banner{
      width: 940px;
      height: 226px;
      background: url(https://lib.liaoke.tv/lib/pc/static/img/rank/title.png) no-repeat top center;
      background-size: contain;
      margin: 14px auto 20px;
    }
    .main{
      width: 1340px;
      margin: 0 auto 58px;
    }
    .plate{
      width: 650px;
      padding: 2px;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      &.left{
        background-color: #515AFC\9;
        background-image: linear-gradient(90deg, #59B2FB 0%, #515AFC 100%);
      }
      &.right{
        background-color: #FE609B\9;
        background-image: linear-gradient(90deg, #FC7AF9 0%, #FE609B 100%);
      }
    }
    .plate-title{
      height: 72px;
      line-height: 72px;
      text-align: center;
      font-size: 22px;
      text-indent: 9999px;
      position: relative;
      &:before,&:after{
        content: '';
        width: 30px;
        height: 30px;
        position: absolute;
        left: 50%;
        top: 50%;
        z-index: 2;
        transform: translate(-50%, -50%);
        background: url('https://lib.liaoke.tv/lib/pc/static/img/rank/star.png') no-repeat center/cover;
      }
      &:before{
        margin-left: -110px;
      }
      &:after{
        margin-left: 110px;
      }
    }
    .left .plate-title{
      background: url("https://lib.liaoke.tv/lib/pc/static/img/rank/title1.png") no-repeat center;
      background-size: 158px 31px;
    }
    .right .plate-title{
      background: url("https://lib.liaoke.tv/lib/pc/static/img/rank/title2.png") no-repeat center;
      background-size: 158px 31px;
    }
  }
</style>
