<template>
  <div class="personal-info" v-if="info">
    <ul class="info-list">
      <li>
        <div class="info-item">
          <span class="label">年龄：</span>
          <span class="val">{{info.age}}</span>
        </div>
        <div class="info-item">
          <span class="label">职业：</span>
          <span class="val">{{info.job}}</span>
        </div>
      </li>
      <li>
        <div class="info-item">
          <span class="label">身高：</span>
          <span class="val">{{info.height}} <i v-if="info.height>0">cm</i></span>
        </div>
        <div class="info-item">
          <span class="label">体重：</span>
          <span class="val">{{info.weight}}<i v-if="info.weight>0">kg</i></span>
        </div>
        <div class="info-item">
          <span class="label">感情状况：</span>
          <span class="val">{{info.mate}}</span>
        </div>
      </li>
      <li>
        <div class="info-item">
          <span class="label">自我介绍：</span>
          <span class="val">{{info.introduction}}</span>
        </div>
      </li>
    </ul>
    <hr>
    <ul class="info-list">
      <li>
        <div class="info-item">
          <span class="label">对爱情的看法：</span>
          <span class="val">{{info.love}}</span>
        </div>
      </li>
      <li>
        <div class="info-item">
          <span class="label">对性的看法：</span>
          <span class="val">{{info.sex}}</span>
        </div>
      </li>
      <li>
        <div class="info-item">
          <span class="label">对另一半的看法：</span>
          <span class="val">{{info.mate_require}}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    props:{
      info:{
        type:Object,
        default:()=>{
          return{}
        }
      }
    }
  }
</script>

<style lang="scss">
.personal-info{
  padding: 36px 100px;
  background-color: #fff;
  border-radius: 4px;
  .info-list{
    >li{
      overflow: hidden;
    }
  }
  hr{
    border: 0;
    border-top: 1px solid #ddd;
    margin-bottom: 28px;
  }
  .info-item{
    float: left;
    margin-right: 80px;
    font-size: 14px;
    line-height: 22px;
    margin-bottom: 28px;
    .label{
      color: #999;
    }
    .val{
      color: #333;
    }
  }
}
</style>
