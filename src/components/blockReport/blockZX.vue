<template>
   <div style="height:100%">
     <card-title cardtitle='板块资讯'></card-title>
    <ul class="infomation-list" id="infomationList">
      <li class="infomation-item"  v-for="(item,key) in zxData" >
          <span class="info-text" v-on:click="openZXUrl(item,key)" >{{item.text}}</span><span class="info-date">{{item.date}}</span>
      </li>
      <li class="infomation-item" v-show="zxData==null">
          <span>暂无资讯</span>
      </li>
  </ul>
   </div>
  
  
</template>
<script>
  import cardTitle from '@/components/card/cardTitle.vue'
  export default{
    name:'blockZX',
    components:{
      'card-title':cardTitle
    },
    created(){
      var self = this;
      eventBus.$on('blockCode',self.getEventBusData);
    },
    beforeDestroy(){
      eventBus.$off('blockCode',this.getEventBusData);
    },
    mounted(){
        var self = this;
         $("#infomationList").niceScroll({
           autohidemode:'leave',
           railpadding:{right:-4},
           cursorborder: "1px solid black" // 滚动条边框样式
         });
    },
    data(){
      return{
        zxData:null,
      }
    },
    methods:{
      getEventBusData:function(val){
         this.getZXData(val);
      },
      getZXData:function(blockId){
        var self = this;
        window.API.use({
          method:'Info.hookRealInfo',
          timeout:1000,
          timeoutFunction:function(method,data){
          }
        });
        window.API.use({
          method:'Info.requestInfo',
          data:{
              stock:blockId,
              infoid:14339,
          },
          // callbackName:'callback',
          success:function(data){
          },
          timeout:1000,
          timeoutFunction:function(method,data){
          }
        });
        self.getZXDataTest(blockId);
      },
      getZXDataTest:function(blockId){
        var self = this;
        var onceTime = 0;
         window.API.use({
            method:'Info.getInfo',
            data:{
                stock:blockId,
                infoid:14339
            },
            persistent:true,
            success:function(data){
                data = eval(data);
                if(data.data.length===0||onceTime===1){
                  return;
                }
                onceTime=1;
                var html = [];
                if(data.data.length===0){
                  self.zxData=null;
                  return;
                }
                self.zxData=[];
                $.each(data.data,function(key,val){
                  self.getZXDetailData(val);
                });
            }
          });
      },
      getZXDetailData:function(infoid){
        var self = this;
        API.use({
            method:'Info.getInfoObject',
            data:[14339,infoid],
            success:function(data){
                data = eval('('+data+')');
                var date = new Date(data.time*1000);
                var title = data.title;
                var urlData = '/'+date.getFullYear()+''+(date.getMonth()<9?'0'+(date.getMonth()+1):date.getMonth()+1)+(date.getDate()>9?date.getDate():'0'+date.getDate())+'/'+data['id'];
                date = (date.getMonth()+1)+'-'+date.getDate();
                self.zxData.push({
                  text:title,
                  urlData:urlData,
                  date:date
                });
            }
        });
      },
      openZXUrl:function(item,key){
        var url = 'http://news.10jqka.com.cn/field'+item.urlData+'.shtml';
        TA.log({id:'L2rdzz_5a77f973_944'});
        API.use({
            method:'Util.openURL2',
            data:{
                url:url,
                mode:1,
                useCef:true
            }
        });
      }
    }
  }
</script>
<style scoped>
     .infomation-list{
        color:#7d7d7d;
        width:98%;
        margin:0 auto;
        min-height: 370px;
        height: calc(100% - 38px) ;
        font-size:12px;
        padding:0;
        list-style: none;
        overflow: hidden;
     }
     .infomation-item{
        line-height: 25px;
        padding:0 10px;
     }
     .info-text{
        text-align: left;
        width:80%;
        display: inline-block;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        float:left;
        cursor: pointer;
     }
    .info-text:hover{
       color:#fff;
     }
     .white .info-text:hover{
       color:#3c3c3c;
     }
     .info-date{
        float:right;
     }
</style>
