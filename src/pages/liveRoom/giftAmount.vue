<!--礼物数量-->
<template>
  <div class="selection-wrapper">
    <!--<input type="text"  @blur="changeAmount" v-model="amount">-->
    <div class="val" @click.stop="toggleShow">{{amount}}</div>
    <i class="arrow"></i>
    <div v-if="isShow" class="selection">
      <ul class="option-list">
        <li :class="{active:item.selected}" v-for="(item,index) in options" :key="index" @click="check(index,item)">
          <i class="icon" :style="{backgroundImage:'url('+item.icon+')'}"></i>
          <span class="text">{{item.text}}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    data(){
      return{
        amount:this.minVal,
        nowIndex:'',
        isShow: false,
      }
    },
    props:{
      options:{
        type:Array,
        default:[]
      },
      minVal:{
        type:[String,Number],
        default:''
      }
    },
    mounted(){
      document.addEventListener('click',()=>{
        this.isShow=false;
      },false)
    },
    watch:{
      minVal(v){
        this.amount=v;
      },
    },
    methods:{
      check(index,item){
        // this.nowIndex=index;
        for(let i=0;i<this.options.length;i++){
          this.options[i].selected=false;
        }
        this.options[index].selected=true;
        this.amount=item.value;
        this.isShow=false;
        this.$emit('onchange',this.amount);
      },
      toggleShow(){
        this.isShow = !this.isShow;
      },
      /*changeAmount(){
        if(this.amount<1 || !(/^\d$/.test(this.amount))){
          this.amount=1;
        }else {
          this.amount=parseInt(this.amount);
        }
      }*/
    }
  }
</script>

<style lang="scss">
  .selection-wrapper{
    width: 100%;
    height: 24px;
    position: relative;
    cursor: pointer;
    .arrow{
      pointer-events: none;
      position: absolute;
      right: 6px;
      top: 50%;
      margin-top: -6px;
      width: 8px;
      height: 8px;
      border-right: 1px solid rgba(255,255,255,0.2);
      border-bottom: 1px solid rgba(255,255,255,0.2);
      transform: rotate(45deg);

    }
    .val{
      width: 100%;
      height: 24px;
      font-size: 12px;
      color: #fff;
      line-height: 22px;
      padding-left: 10px;
      padding-right: 20px;
      border-radius: 24px;
      background-color: transparent;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .selection{
      padding: 10px 0;
      background-color: #3D3747;
      box-shadow: 0 2px 4px 0 rgba(0,0,0,0.20);
      border-radius: 4px;
      position: absolute;
      left: 50%;
      bottom: calc(100% + 10px);
      z-index: 99;
      transform: translate(-50%);
      &:before{
        content: '';
        position: absolute;
        left: 50%;
        bottom: -19px;
        z-index: 2;
        width: 0px;
        height: 0px;
        border: 10px solid transparent;
        border-top: 10px solid #3D3747;
      }
    }
    .option-list{
      >li{
        overflow: hidden;
        width: 158px;
        height: 34px;
        padding: 6px 10px;
        line-height: 22px;
        font-size: 12px;
        color: #fff;
        &.active{
          background-color: #312C3A;
        }
      }
      .icon{
        float: left;
        background-color: #292432;
        border-radius: 2px;
        width: 22px;
        height: 22px;
        background-repeat: no-repeat;
        background-size: contain;
      }
      .text{
        float: left;
        width: 106px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        margin-left: 10px;
      }
    }
  }
</style>
