<template>
  <div class="private-edit-component">
    <div class="input-row">
      <span class="label">感情状况：</span>
      <div class="iput-box">
        <select v-model="statusSelect">
          <option
            :value="item"
            v-for="(item,index) in status"
            :key="index"
          >{{item}}</option>
        </select>
      </div>
    </div>
    <div class="input-row">
      <span class="label">对爱情的看法：</span>
      <div class="iput-box">
        <textarea ref="loveTextarea" v-model="loveViewVal" maxlength="250" placeholder="说说你对爱情的看法"></textarea>
        <ul class="set-checkbox">
          <li
            v-for="(item,index) in loveViewList"
            :key="index"
            :class="{active:item.type}"
            @click="chooseLoveView(index)"
          >{{item.text}}</li>
        </ul>
      </div>
    </div>
    <div class="input-row">
      <span class="label">对性的看法：</span>
      <div class="iput-box">
        <textarea v-model="sexViewVal" ref="sexTextarea" maxlength="250" placeholder="说说你对性的看法"></textarea>
        <ul class="set-checkbox">
          <li
            v-for="(item,index) in sexViewList"
            :key="index"
            :class="{active:item.type}"
            @click="chooseSexView(index)"
          >{{item.text}}</li>
        </ul>
      </div>
    </div>
    <div class="input-row">
      <span class="label">对另一半的要求：</span>
      <div class="iput-box">
        <textarea v-model="demandVal" ref="demandTextarea" maxlength="250" placeholder="说说你对另一半的要求"></textarea>
        <ul class="set-checkbox">
          <li
            v-for="(item,index) in demandList"
            :key="index"
            @click="chooseDemand(index)"
            :class="{active:item.type}"
          >{{item.text}}</li>
        </ul>
      </div>
    </div>
    <div class="btn-group">
      <button class="btn-save" @click='save'>保存</button>
    </div>
  </div>
</template>

<script>
  import {mapState} from 'vuex'
  export default {
    data(){
      return{
        status:['单身', '恋爱', '暗恋', '已婚', '分居', '离异', '保密'],
        loveViewList:[],
        sexViewList:[],
        demandList:[],
        /*loveViewList:[
          {
            text:'只想简简单单，相爱到老',
            type:false,
          },
          {
            text:'哪怕山无棱天地和，我仍相信爱情',
            type:false,
          },
          {
            text:'希望谈一场轰轰烈烈的恋爱',
            type:false,
          },
          {
            text:'向往忠贞不渝的爱情，但现实太残酷',
            type:false,
          },
          {
            text:'尽管对爱情不抱期望，但还是期待那个未来可能出现的Ta',
            type:false,
          }
        ],
        sexViewList:[
          {
            text:'保守',
            type:false
          },
          {
            text:'保守且无性经历',
            type:false
          },
          {
            text:'顺其自然随感觉',
            type:false
          },
          {
            text:'享受两情相悦的性爱',
            type:false
          },
          {
            text:'开放',
            type:false
          },
          {
            text:'疯狂',
            type:false
          },
        ],
        demandList:[
          {
            text:'富足',
            type:false
          },
          {
            text:'成熟',
            type:false
          },
          {
            text:'大方',
            type:false
          },
          {
            text:'帅',
            type:false
          },
          {
            text:'高',
            type:false
          },
          {
            text:'有车',
            type:false
          },
          {
            text:'有房',
            type:false
          },
          {
            text:'踏实',
            type:false
          },
          {
            text:'稳定',
            type:false
          },
          {
            text:'专一',
            type:false
          },
          {
            text:'浪漫',
            type:false
          },
          {
            text:'个性',
            type:false
          },
          {
            text:'有才',
            type:false
          },
        ],*/
        statusSelect:'保密',
        loveViewVal:'',
        flag:false,
        loveView:[],
        sexViewVal:'',
        sexView:[],
        demandVal:'',
        demand:[],
      }
    },
    computed:{
      ...mapState({
        hostUser:state=>state.hostUser
      })
    },
    watch:{
      loveViewVal(n,o){
        let last='';
        if(this.loveView.length>0){
          last=o.slice(-this.loveView[this.loveView.length-1].length);
          if(n.length>o.length){
            if(last==this.loveView[this.loveView.length-1]){
              if(n.indexOf(o)==0){
                this.loveViewVal=n.replace(last,last+'。');
              }
            }
          }
        }
        let arr=n.split('。');
        let indexs=[];
        for(let i=0;i<this.loveViewList.length;i++){
          if(arr.indexOf(this.loveViewList[i].text)>-1){
            indexs.push(arr.indexOf(this.loveViewList[i].text));
            this.loveViewList[i].type=true;
          }else{
            this.loveViewList[i].type=false;
          }
        }
        indexs=indexs.sort((a,b)=>{
          return a>b
        });
        let list=[];
        for(let i=0;i<indexs.length;i++){
          list.push(arr[indexs[i]]);
        }
        this.loveView=list;
      },
      sexViewVal(n,o){
        let last='';
        if(this.sexView.length>0){
          last=o.slice(-this.sexView[this.sexView.length-1].length);
          if(n.length>o.length){
            if(last==this.sexView[this.sexView.length-1]){
              if(n.indexOf(o)==0){
                this.sexViewVal=n.replace(last,last+'，');
              }
            }
          }
        }
        let arr=n.split('，');
        let indexs=[];
        for(let i=0;i<this.sexViewList.length;i++){
          if(arr.indexOf(this.sexViewList[i].text)>-1){
            indexs.push(arr.indexOf(this.sexViewList[i].text));
            this.sexViewList[i].type=true;
          }else{
            this.sexViewList[i].type=false;
          }
        }
        indexs=indexs.sort((a,b)=>{
          return a>b
        });
        let list=[];
        for(let i=0;i<indexs.length;i++){
          list.push(arr[indexs[i]]);
        }
        this.sexView=list;
      },
      demandVal(n,o) {
        let last='';
        if(this.demand.length>0){
          last=o.slice(-this.demand[this.demand.length-1].length);
          if(n.length>o.length){
            if(last==this.demand[this.demand.length-1]){
              if(n.indexOf(o)==0){
                this.demandVal=n.replace(last,last+'，');
              }
            }
          }
        }
        let arr=n.split('，');
        let indexs=[];
        for(let i=0;i<this.demandList.length;i++){
          if(arr.indexOf(this.demandList[i].text)>-1){
            indexs.push(arr.indexOf(this.demandList[i].text));
            this.demandList[i].type=true;
          }else{
            this.demandList[i].type=false;
          }
        }
        indexs=indexs.sort((a,b)=>{
          return a>b
        });
        let list=[];
        for(let i=0;i<indexs.length;i++){
          list.push(arr[indexs[i]]);
        }
        this.demand=list;
      },
    },
    created(){
      this.dataInit();
    },
    mounted(){
      // setTimeout(()=>{
      //   this.getUser(this.hostUser);
      // },1000)
    },
    methods:{
      getUser(){
        this.$get('/h5/user/profile').then(r=>{
          if(r.http_code==200){
            this.loveViewVal=r.data.love;
            this.sexViewVal=r.data.sex;
            this.demandVal=r.data.mate_require;
            this.statusSelect=r.data.mate;
          }
        })
      },
      dataInit(){
        this.demandList=[];
        this.loveViewList=[];
        this.sexViewList=[];
        this.$get('/h5/system/emotion').then(r=>{
          if(r.http_code==200){
            for(let i=0;i<r.data.length;i++){
              let obj={};
              obj['text']=r.data[i];
              obj['type']=false;
              this.demandList.push(obj);
            }
          }
        })
        this.$get('/h5/system/sex').then(r=>{
          if(r.http_code==200){
            for(let i=0;i<r.data.length;i++){
              let obj={};
              obj['text']=r.data[i];
              obj['type']=false;
              this.sexViewList.push(obj);
            }
          }
        })
        this.$get('/h5/system/love').then(r=>{
          if(r.http_code==200){
            for(let i=0;i<r.data.length;i++){
              let obj={};
              obj['text']=r.data[i];
              obj['type']=false;
              this.loveViewList.push(obj);
            }
          }
          this.getUser();
        })
      },
      chooseLoveView(index){
        if(this.loveViewList[index].type){
          //删除默认选项
          let text=this.loveViewList[index].text;
          if(this.loveViewVal.indexOf(text)>-1){
            for (let i=0;i<this.loveView.length;i++){
              if(this.loveView[i]==text){
                this.loveView.splice(i,1);
              }
            }
            this.loveViewList[index].type=false;
            let valArr=this.loveViewVal.split('。');
            if(valArr.indexOf(text)>-1){
              valArr.splice(valArr.indexOf(text),1);
            }
            this.loveViewVal=valArr.join('。');
          }
        }else{
          //添加默认选项
          this.loveViewList[index].type=true;
          if(this.loveView.indexOf(this.loveViewList[index].text)==-1){
            this.loveView.push(this.loveViewList[index].text);
          }
          if(this.loveViewVal==''){
            this.loveViewVal+=this.loveViewList[index].text;
          }else{
            this.loveViewVal+='。'+this.loveViewList[index].text;
          }
        }
        this.$nextTick(()=>{
          this.$refs.loveTextarea.focus();
          this.$refs.loveTextarea.scrollTop=this.$refs.loveTextarea.scrollHeight;
        })
      },
      chooseSexView(index){
        if(this.sexViewList[index].type){
          //删除默认选项
          let text=this.sexViewList[index].text;
          if(this.sexViewVal.indexOf(text)>-1){
            for (let i=0;i<this.sexView.length;i++){
              if(this.sexView[i]==text){
                this.sexView.splice(i,1);
              }
            }
            this.sexViewList[index].type=false;
            let valArr=this.sexViewVal.split('，');
            if(valArr.indexOf(text)>-1){
              valArr.splice(valArr.indexOf(text),1);
            }
            this.sexViewVal=valArr.join('，');
          }
        }else{
          //添加默认选项
          this.sexViewList[index].type=true;
          if(this.sexView.indexOf(this.sexViewList[index].text)==-1){
            this.sexView.push(this.sexViewList[index].text);
          }
          if(this.sexViewVal==''){
            this.sexViewVal+=this.sexViewList[index].text;
          }else{
            this.sexViewVal+='，'+this.sexViewList[index].text;
          }
        }
        this.$nextTick(()=>{
          this.$refs.sexTextarea.focus();
          this.$refs.sexTextarea.scrollTop=this.$refs.sexTextarea.scrollHeight;
        })
      },
      chooseDemand(index){
        if(this.demandList[index].type){
          //删除默认选项
          let text=this.demandList[index].text;
          if(this.demandVal.indexOf(text)>-1){
            for (let i=0;i<this.demand.length;i++){
              if(this.demand[i]==text){
                this.demand.splice(i,1);
              }
            }
            this.demandList[index].type=false;
            let valArr=this.demandVal.split('，');
            if(valArr.indexOf(text)>-1){
              valArr.splice(valArr.indexOf(text),1);
            }
            this.demandVal=valArr.join('，');
          }
        }else{
          //添加默认选项
          this.demandList[index].type=true;
          if(this.demand.indexOf(this.demandList[index].text)==-1){
            this.demand.push(this.demandList[index].text);
          }
          if(this.demandVal==''){
            this.demandVal+=this.demandList[index].text;
          }else{
            this.demandVal+='，'+this.demandList[index].text;
          }
        }
        this.$nextTick(()=>{
          this.$refs.demandTextarea.focus();
          this.$refs.demandTextarea.scrollTop=this.$refs.demandTextarea.scrollHeight;
        })
      },
      save(){
        let obj={
          mate:this.statusSelect,
          love:this.loveViewVal,
          sex:this.sexViewVal,
          mate_require:this.demandVal,
        };
        this.$post('/h5/user/edit',obj).then(r=>{
          if(r.http_code==200){
            this.$store.commit('setUser',obj);
            this.$store.commit('setToast','保存成功');
          }else{
            this.$store.commit('setToast',r.msg);
          }
        })
      }
    }
  }
</script>

<style lang="scss">
.private-edit-component{
  .input-row {
    position: relative;
    margin-bottom: 30px;
    min-height: 32px;
    padding-left: 110px;
    .label {
      position: absolute;
      left: 0;
      top: 0;
      width: 110px;
      height: 32px;
      line-height: 32px;
      font-size: 14px;
      color: #333;
      white-space: nowrap;
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
    padding-left: 110px;
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
  .set-checkbox{
    width: 360px;
    overflow: hidden;
    li{
      cursor: pointer;
      float: left;
      margin-right:8px;
      margin-top: 10px;
      font-size: 12px;
      color: #666;
      line-height: 22px;
      height: 24px;
      border-radius: 2px;
      padding: 0 8px;
      border: 1px solid #999;
      &.active{
        border-color: rgba(128,166,232,1);
        color: rgba(128,166,232,1);
      }
    }
  }
  .el-checkbox{
    margin-left: 0;
    margin-right:8px;
    margin-top: 10px;
    .el-checkbox__input{
      display: none;
    }
    .el-checkbox__label{
      font-size: 12px;
      color: #666;
      line-height: 22px;
      height: 24px;
      border-radius: 2px;
      padding: 0 8px;
      border: 1px solid #999;
    }
    &.is-checked{
      .el-checkbox__label{
        border-color: rgba(128,166,232,1);
        color: rgba(128,166,232,1);
      }
    }
  }
}
</style>
