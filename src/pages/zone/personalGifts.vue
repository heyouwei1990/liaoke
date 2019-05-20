<template>
  <div class="personal-gifts">
    <div class="table-hd">
      <span class="left">礼物：</span>
      <span class="right">赠送者：</span>
    </div>
    <ul class="gift-list">
      <li
        v-for="(item,index) in 10"
      >
        <dl class="gift-dl">
          <dt><img class="gift" src="https://lib.liaoke.tv/lib/pc/static/img/placeholder.png" alt=""></dt>
          <dd>
            <div class="gift-name">棒棒糖</div>
            <div class="price">价格：<i class="coin">200金币</i></div>
            <time>2018.6.12 12:29:15</time>
          </dd>
        </dl>
        <dl class="benefactor-dl">
          <dt><img class="avatar" src="https://lib.liaoke.tv/lib/pc/static/img/placeholder.png" alt=""></dt>
          <dd><div class="nickname">独霸天下独霸天</div></dd>
        </dl>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {}
</script>

<style lang="scss">
.personal-gifts{
  padding: 30px 172px;
  background-color: #fff;
  border-radius: 4px;
  .table-hd{
    overflow: hidden;
    border-bottom: 1px solid #ddd;
    font-size: 16px;
    line-height: 24px;
    font-weight: bold;
    padding-left: 20px;
    padding-bottom: 18px;
  }
  .gift-list{
    padding-top: 10px;
    >li{
      overflow: hidden;
      padding-top: 12px;
      padding-bottom: 12px;
    }
  }
  .gift-dl{
    position: relative;
    padding-left: 76px;
    float: left;
    dt{
      position: absolute;
      left: 12px;
      top: 50%;
      width: 48px;
      height: 48px;
      margin-top: -24px;
      text-align: center;
    }
    .gift{
      max-width: 48px;
      max-height: 48px;
    }
    .gift-name{
      font-size: 12px;
      color: #333;
      line-height: 20px;
    }
    .price{
      font-size: 12px;
      color: #666;
      line-height: 20px;
      i{
        color: #ffab00;
      }
    }
    time{
      font-size: 12px;
      color: #999;
      line-height: 20px;
    }
  }
  .benefactor-dl{
    text-align: center;
    float: right;
    margin-top: 4px;
    dt{
      width: 34px;
      height: 34px;
      margin: 0 auto;
    }
    .avatar{
      display: block;
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
    .nickname{
      width: 7em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 12px;
      color: #666;
      line-height: 20px;
      margin-top: 4px;
    }
  }
}
</style>
