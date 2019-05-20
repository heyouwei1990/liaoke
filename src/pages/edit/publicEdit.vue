<template>
  <div class="public-edit-component">
    <div class="input-row">
      <span class="label">职业：</span>
      <div class="iput-box">
        <input class="input" type="text" maxlength="6" placeholder="输入职业(限6个字)" v-model="job">
        <div class="radio-box">
          <el-radio
            v-for="(item,index) in jobList"
            :key="index"
            v-model="job"
            name="job"
            :label="item"
          >{{item}}</el-radio>
        </div>
      </div>
    </div>
    <div class="input-row">
      <span class="label">所在地：</span>
      <div class="iput-box">
        <v-distpicker :province="province" :city="city" :placeholders="addrPlaceholder" hide-area @selected="setAddr"></v-distpicker>
      </div>
    </div>
    <div class="input-row">
      <span class="label">个性签名：</span>
      <div class="iput-box">
        <textarea cols="50" rows="6" v-model="sign" placeholder="请输入个性签名"></textarea>
      </div>
    </div>
    <div class="input-row">
      <span class="label">自我介绍：</span>
      <div class="iput-box">
        <textarea cols="50" rows="6" v-model="intro" placeholder="请输入自我介绍"></textarea>
      </div>
    </div>
    <div class="btn-group">
      <button class="btn-save" @click='save'>保存</button>
    </div>
  </div>
</template>

<script>
  import VDistpicker from 'v-distpicker'
  import { Radio, RadioGroup } from 'element-ui'
  import {mapState} from 'vuex'
  export default {
    components:{
      VDistpicker,
      'el-radio':Radio,
    },
    data(){
      return{
        job:'',//职业
        jobList:['职业经理人','私营企业主','中层管理者','高校学生','公司职员','工程师','军人','警察', '医生','护士','空乘',
          '航空公司','演艺人员','模特','教师','国企工作者','机关工作者','媒体工作者','互联网从业者','风险投资人'],
        sign:'',//个性签名
        intro:'', //自我介绍
        province:'',
        city:'',
        addrPlaceholder:{
          province:'省',
          city:'市'
        }
      }
    },
    computed:{
      ...mapState({
        hostUser:state=>state.hostUser
      })
    },
    mounted(){
      this.getUser();
    },
    methods:{
      getUser(){
        this.$get('/h5/user/profile').then(r=>{
          if(r.http_code==200){
            this.job=r.data.job;
            this.province=r.data.province;
            this.city=r.data.city;
            this.intro=r.data.introduction;
            this.sign=r.data.sign;
          }
        })
      },
      setAddr(data){
        if(data.province.code){
          this.province=data.province.value;
        }else{
          this.province='';
        }
        if(data.city.code){
          this.city=data.city.value;
        }else{
          this.city='';
        }
      },
      save(){
        let obj={
            job:this.job,
            province:this.province,
            city:this.city,
            introduction:this.intro,
            sign:this.sign
        };
        this.$post('/h5/user/edit',obj).then(r=>{
          if(r.http_code==200){
            this.$store.commit('setUser',obj);
            this.$store.commit('setToast','保存成功');
          }else{
            this.$store.commit('setToast',r.msg);
          }
        })
      },
    }
  }
</script>

<style lang="scss">
.public-edit-component{
  .input-row {
    position: relative;
    margin-bottom: 30px;
    min-height: 32px;
    padding-left: 92px;
    .label {
      position: absolute;
      left: 0;
      top: 0;
      width: 92px;
      height: 32px;
      line-height: 32px;
      font-size: 14px;
      color: #333;
    }
    .input {
      width: 326px;
      height: 32px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
      line-height: 30px;
      padding: 0px 6px;
    }
    textarea{
      width: 380px;
      height: 60px;
      padding: 6px 10px;
      font-size: 14px;
      color: #333;
      line-height: 20px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: inherit;
    }
    select {
      min-width: 68px;
      height: 32px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
      color: #333;
      padding-left: 6px;
      margin-right: 4px;
    }
  }
  .btn-group {
    padding-left: 92px;
    .btn-save {
      width: 88px;
      height: 36px;
      background-color: #f362f5;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      border-radius: 4px;
      font-size: 14px;
      color: #fff;
    }
  }
  .radio-box{
    overflow: hidden;
    width: 420px;
  }
  .el-radio{
    margin-right: 8px;
    margin-top: 8px;
    float: left;
    &+.el-radio{
      margin-left: 0;
    }
    &.is-checked .el-radio__label{
      /*background-color: rgba(128,166,232,0.2);*/
      border-color: rgba(128,166,232,1);
      color: rgba(128,166,232,1);
    }
  }
  .el-radio__input{
    display: none;
  }
  .el-radio__label{
    display: block;
    padding:0 8px;
    height: 24px;
    line-height: 22px;
    border: 1px solid #999;
    color: #666;
    border-radius: 2px;
    font-size: 12px;
  }
  .distpicker-address-wrapper select{
    padding: 0 10px;
  }
}

</style>
