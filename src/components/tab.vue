<!--切换组件-->
<template>
  <div>
    <ul class="tab-hd">
      <li
        v-for="(item ,index) in tabItem"
        :key="index"
        :class="['tab-item',{on:choosed==index}]"
        @click="tabChange(item,index)"
      >
        <i v-if="item.icon" :class="item.icon"></i>
        <span>{{typeof item=="string"?item:item.text}}</span>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    props:{
      tabItem:{
        type:Array,
        default:[]
      },
      selected:{
        type:[Number, String],
        default:0
      }
    },
    data(){
      return{
        choosed:this.selected,
      }
    },
    watch:{
      selected(v){
        this.choosed=v;
      }
    },
    methods:{
      tabChange(opt,idx){
        this.choosed=idx;
        let pkid;
        if(typeof opt=="object" && opt.id){
          pkid=opt.id;
        }else {
          pkid=idx;
        }
        this.$emit('tabSuccess',pkid);
      }
    }
  }
</script>

<style lang="scss">
  .tab-hd{
    .tab-item{
      cursor: pointer;
    }
  }
</style>
