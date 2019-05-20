<!--选择送礼对象-->
<template>
  <div v-if="options.length>0" class="select-el">
    <ul>
      <li
        :class="{selected:selected===index}"
        v-for="(item, index) in options"
        :key="index"
        @click="select(item,index)"
      >{{item.nickname}}</li>
    </ul>
  </div>
</template>

<script>
  export default {
    data(){
      return{
        // choose:this.selected
      }
    },
    props:{
      options:{
        type:Array,
        default:[]
      },
      selected:{
        type:Number,
        default:0
      }
    },
    mounted(){
      if(this.options.length>0){
        this.$emit('change',this.options[0]);
      }
    },
    methods:{
      select(data,index){
        // this.selected=index;
        this.$emit('change',data);
      }
    }
  }
</script>

<style lang="scss">

</style>
