<template>
  <div class="message-component">
    <!--<ul class="msg-list">
      <li v-for="(item, index) in 4" :key="index">
        <dl class="item-dl">
          <dt class="avatar-wrap">
            <img class="vip-mark" src="" alt="">
            <img class="avatar" src="" alt="">
          </dt>
          <dd>
            <div class="top">
              <span class="nickname">昵称</span>
              &lt;!&ndash;<img class="sex-mark" src="" alt="">&ndash;&gt;
              <img class="level-mark" src="" alt="">
              <span class="time">30分钟前</span>
            </div>
            <p class="desc">消息内容</p>
            <a href="" class="btn-more">详细 &gt;</a>
          </dd>
        </dl>
      </li>
    </ul>-->
    <chat></chat>
  </div>
</template>

<script>
  import Chat from '@/components/chat'
  export default {
    components:{
      Chat
    }
  }
</script>

<style lang="scss">
.message-component{
  .chat-component{
    height: 600px;
  }
























  /*.msg-list{
    overflow: hidden;
    li{
      margin-bottom: 25px;
    }
    .item-dl{
      height: 95px;
      width: 100%;
      overflow: hidden;
      padding-left: 95px;
      background-color: #fff;
      border: 1px solid #e6e6e6;
      position: relative;
      border-radius: 4px;
      dt{
        position: absolute;
        left: -1px;
        top: -1px;
        width: 95px;
        height: 95px;
        border-radius: 4px;
        overflow: hidden;
      }
      .vip-mark{
        position: absolute;
        left: 6px;
        top: 6px;
        z-index: 2;
        width: 24px;
        height: 23px;
      }
      .avatar{
        display: block;
        width: 100%;
        height: 100%;
        border-radius: 4px;
      }
      dd{
        width: 100%;
        overflow: hidden;
        position: relative;
        padding: 10px 15px 10px 20px;
        min-height: 100%;
        .top{
          height: 24px;
          overflow: hidden;
        }
        .nickname{
          float: left;
          max-width: 7em;
          font-size: 14px;
          line-height: 24px;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sex-mark,
        .level-mark{
          width: 30px;
          height: 14px;
          border-radius: 16px;
          float: left;
          margin-left: 6px;
          margin-top: 4px;
        }
        .time{
          float: right;
          font-size: 12px;
          color: #999;
          line-height: 24px;
        }
        .desc{
          width: 704px;
          font-size: 12px;
          color: #999;
          line-height: 20px;
          height: 40px;
          overflow: hidden;
          padding-right: 60px;
          margin-top: 6px;
          img{
            display: inline-block;
            width: 15px;
            height: 15px;
            vertical-align: middle;
            margin-top: -3px;
            margin-left: 2px;
            margin-right: 2px;
          }
        }
        .btn-more{
          position: absolute;
          right: 14px;
          bottom: 10px;
          color: #f362f5 ;
          font-size: 14px;
          line-height: 20px;
        }
      }
    }
  }*/
}
</style>
