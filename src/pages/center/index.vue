<template>
  <div class="center-component">
    <div class="main clearfix">
      <div class="aside-nav">
        <!-- <a href=""></a> -->
        <router-link
          class="nav-item"
          v-for="(item,index) in navList"
          :key="index"
          :to="{path:'/center'+item.path}"
          replace
          exact
          active-class="active"
          @click.native="flushCom"
        >{{item.text}}</router-link>

      </div>
      <div class="center-content">
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data(){
      return{
        navList:[
          {
            text:'我的信息',
            path:'/information'
          },
          {
            text:'访客记录',
            path:'/visitRecord'
          },
          {
            text:'我的关注',
            path:'/favorate'
          },
          {
            text:'守护',
            path:'/ward'
          },
          {
            text:'我的消息',
            path:'/message'
          },
          {
            text:'礼包',
            path:'/packbag'
          },
          {
            text:'动态',
            path:'/activity'
          },
          {
            text:'私照',
            path:'/photoAlbum'
          },
          {
            text:'视频',
            path:'/video'
          },
          {
            text:'客服',
            path:'/customService'
          },
        ],
        currUrl:null,
      }
    },
    mounted(){
      this.currUrl = window.location.href
    },
    methods: {
      flushCom(){
        if (this.currUrl == window.location.href) {
          this.$router.go(0);
        }
        this.currUrl = window.location.href;
        // 　this.$router.go(0);
      }
    }

  }
</script>

<style lang="scss">
.center-component{
  padding-top: 40px;
  padding-bottom: 80px;
  background-color: #fff;
  .main{
    background-color: #fff;
    border: 1px solid #e6e6e6;
    /*border-left: 0;*/
    width: 1340px;
    margin: 0 auto;
    position: relative;
    padding-left: 200px;
    min-height: 540px;
    // min-height: 488px;
  }
  .aside-nav{
    position: absolute;
    left: 0;
    top: 0;
    width: 200px;
    height: 100%;
    background-color: #f7f7f7;
    /*height: 583px;*/
  }
  .nav-item{
    position: relative;
    display: block;
    width: 100%;
    height: 54px;
    padding: 15px 10px;
    text-align: center;
    color: #333;
    font-size: 14px;
    border-bottom: 1px solid #fff;
    line-height: 24px;
    &.active{
      color: #F162F5;
      background-color: #fff;
      &:before{
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        width: 2px;
        height: 100%;
        border-left-color: #F162F5;
        background-image: linear-gradient(-135deg, #F362F5 0%, #A35AFE 100%);
      }
    }
  }
  .center-content{
    width: 100%;
  }
}
</style>
