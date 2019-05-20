<template>
  <div class="tag-edit-component">
    <h2 class="tag-hd">我的标签：</h2>
    <div class="sumary">(添加标签 增加曝光度)</div>
    <dl
      class="tag-dl"
      v-for="(item,index) in dataList"
      :key="index"
    >
      <dt class="label">{{item.category}}：</dt>
      <dd class="tag-dd">
        <span
          class="tag-item"
          v-for="(tag,tagIndex) in item.list"
          :key="tagIndex"
          ref="tag"
          :class="{orange:item.category=='性格',green:item.category=='爱好',blue:item.category=='外形',red:item.category=='技能',active:tag.checked}"
          @click="changeTag(tag)"
        >
          {{tag.name}}
        </span>
      </dd>
    </dl>
    <ul class="my-tag-list" v-if="checkedTag.length>0">
      <li
        v-for="(item,index) in checkedTag"
        :key="index"
        :class="{orange:item.category=='性格',green:item.category=='爱好',blue:item.category=='外形' || item.category=='',red:item.category=='技能'}"
      >
        <i class="icon-clear" @click="deleteTag(index)"></i>
        <span>{{item.name}}</span>
      </li>
    </ul>
    <div class="input-block">
      <input v-model="tagAdd" maxlength="5" placeholder="输入标签(限5个字)" type="text">
      <span v-show="tagAdd" class="btn-join" @click="pushTag">加入</span>
    </div>
    <div class="btn-group">
      <button class="btn-save" @click="save">保存</button>
      <div class="tip">(最多9枚标签)</div>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  export default {
    data(){
      return{
        dataList:[],
        tagList:[],
        checkedTag:[],
        tagAdd:'',
      }
    },
    computed:{
      ...mapState({
        hostUser:state=>state.hostUser
      })
    },
    watch:{
      checkedTag(v){
        for(let i=0;i<this.dataList.length;i++){
          for(let j=0;j<this.dataList[i].list.length;j++){
            this.dataList[i].list[j].checked=false;
            if(v.length>0){
              for(let k=0;k<v.length;k++){
                if(v[k].id==this.dataList[i].list[j].id){
                  this.dataList[i].list[j].checked=true;
                }
              }
            }
          }
        }
      }
    },
    created(){
      this.getTagList();
    },
    methods:{
      // 获取标签列表
      getTagList(){
        this.$get('/h5/system/tags').then(r=>{
          if(r.http_code==200){
            for(let i=0;i<r.data.length;i++){
              for(let j=0;j<r.data[i].list.length;j++){
                r.data[i].list[j]['checked']=false;
                this.tagList.push(r.data[i].list[j]);
              }
            }
            this.dataList=r.data;
            this.$nextTick(()=>{
              this.getUser();
            })
          }
        })
      },

      //获取已有标签
      getUser(){
        this.$get('/h5/user/profile').then(r=>{
          if(r.http_code==200){
            this.checkedTag=r.data.tag_list;
          }
        })
      },

      //点击标签
      changeTag(data){
        let index=-1;
        for(let i=0;i<this.checkedTag.length;i++){
          if(this.checkedTag[i].id==data.id){
            index=i
          }
        }
        if(index>-1){
          this.checkedTag.splice(index,1);
        }else{
          if(this.checkedTag.length==9){
            this.$store.commit('setToast','最多可选9枚标签');
            return;
          }
          this.checkedTag.push(data);
        }
      },
      //删除标签
      deleteTag(index){
        this.checkedTag.splice(index,1);
      },
      // 自定义标签
      pushTag(){
        if(this.tagAdd.trim()==''){
          this.$store.commit('setToast','请输入标签');
          return;
        }
        if(this.checkedTag.length<9){
          let obj={};
          obj['category']='';
          obj['id']=parseInt(Math.random()*1000000);
          obj['name']=this.tagAdd.trim();
          this.checkedTag.push(obj);
        }else{
          this.$store.commit('setToast','最多可选9枚标签');
        }
        this.tagAdd='';
      },
      // 保存
      save(){
        let tagArr=[];
        let str='';
        for (let i=0;i<this.checkedTag.length;i++) {
          tagArr.push(this.checkedTag[i].name);
        }
        if(tagArr.length>0){
          str=tagArr.join(',')
        }
        this.$post('/h5/user/edit-tag',{
          tags:str
        }).then((r)=>{
          this.$store.commit('setToast',r.msg)
        })
      }
    }
  }
</script>

<style lang="scss">
.tag-edit-component{
  .tag-hd{
    font-size: 20px;
    color: #333;
    line-height: 2;
    font-weight: bold;
  }
  .sumary{
    font-size: 12px;
    color: #999;
    line-height: 1.5;
    margin-bottom: 40px;
  }
  .tag-dl{
    margin-bottom: 30px;
    overflow: hidden;
    .label{
      float: left;
      font-size: 16px;
      color: #333;
      line-height: 20px;
    }
    .tag-dd{
      float: left;
      width: 480px;
    }
  }
  .tag-item{
    display: inline-block;
    margin-right: 8px;
    margin-bottom: 8px;
    height: 24px;
    line-height: 22px;
    padding: 0 10px;
    border-width: 1px;
    border-style: solid;
    font-size: 12px;
    color: #666;
    background-color: #fff;
    border-radius: 2px;
    cursor: pointer;
    &.orange{
      border-color: rgba(254,175,120,0.6);
    }
    &.green{
      border-color: rgba(105,207,193,0.6);
    }
    &.blue{
      border-color: rgba(128,166,232,0.6);
    }
    &.red{
      border-color: rgba(249,122,110,0.6);
    }
    &.active.orange{
      background-color: rgba(254,175,120,0.2);
      border-color: rgba(254,175,120,1);
      color: rgba(254,175,120,1);
    }
    &.active.green{
      background-color: rgba(105,207,193,0.2);
      border-color: rgba(105,207,193,1);
      color: rgba(105,207,193,1);
    }
    &.active.blue{
      background-color: rgba(128,166,232,0.2);
      border-color: rgba(128,166,232,1);
      color: rgba(128,166,232,1);
    }
    &.active.red{
      background-color: rgba(249,122,110,0.2);
      border-color: rgba(249,122,110,1);
      color: rgba(249,122,110,1);
    }
  }
  .my-tag-list{
    overflow: hidden;
    >li{
      float: left;
      position: relative;
      font-size: 12px;
      color: #666;
      background-color: #fff;
      border-radius: 2px;
      height: 24px;
      line-height: 22px;
      padding: 0 10px;
      border-width: 1px;
      border-style: solid;
      margin-right: 8px;
      margin-bottom: 8px;
      margin-top: 8px;
      &.orange{
        border-color: rgba(254,175,120,1);
        color: rgba(254,175,120,1);
      }
      &.green{
        border-color: rgba(105,207,193,1);
        color: rgba(105,207,193,1);
      }
      &.blue{
        border-color: rgba(128,166,232,1);
        color: rgba(128,166,232,1);
      }
      &.red{
        border-color: rgba(249,122,110,1);
        color: rgba(249,122,110,1);
      }
      cursor: pointer;
    }
    .icon-clear{
      position: absolute;
      right: -6px;
      top: -6px;
      width: 12px;
      height: 12px;
      background: url("https://lib.liaoke.tv/lib/pc/static/img/center/icon-clear.png") no-repeat center / contain;
      cursor: pointer;
    }
  }
  .input-block{
    position: relative;
    width: 260px;
    height: 30px;
    input{
      width: 260px;
      height: 30px;
      border:1px solid #ccc;
      line-height: 20px;
      font-size: 12px;
      color: #333;
      padding: 4px 40px 4px 10px;
    }
    .btn-join{
      position: absolute;
      top: 0;
      right: 0;
      z-index: 2;
      width: 40px;
      height: 30px;
      text-align: center;
      font-size: 12px;
      line-height: 30px;
      color: #F162F5;
      cursor: pointer;
    }
  }

  .btn-group {
    margin-top: 30px;
    .btn-save {
      width: 88px;
      height: 36px;
      background-color: #f362f5;
      background-image: linear-gradient(90deg, #f362f5 0%, #a35afe 100%);
      border-radius: 4px;
      font-size: 14px;
      color: #fff;
    }
    .tip{
      color: #999;
      font-size: 12px;
      line-height: 2;
      margin-top: 6px;
    }
  }
}
</style>
