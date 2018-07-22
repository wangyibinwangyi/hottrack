<template>
   <div class="stock-chart-box" v-on:mouseover="throwTalog()" v-on:mouseleave="clearTalog()">
     <card-title :cardtitle="codename"></card-title>
     <ul class="price-btn-box">
        <li class="price-btn-item" @click="changeTypeEvent('timeline')" v-bind:class="{active:!isKline}">分时</li>
        <li class="price-btn-item" @click="changeTypeEvent('kline')" v-bind:class="{active:isKline}">K线</li>
      </ul>
        <kline-chart class="kline-chart" 
          v-if="isKline"
          ref="stockKline"
          :code="code"
          :theme="theme"
          :dateLength=dateLength
          :showButtons=showButtons
          
        >
          <template slot-scope="props">
              <div class="chart-kline-extra">
                <div> 涨幅：<span v-bind:class="[ Number(props.zhangfu)>0?'red':'green' ]">{{ isNaN(props.zhangfu)?'-':Number(props.zhangfu).toFixed(2) }}%</span></div>
                <div> 成交量：<span v-bind:class="[ Number(props.zhangfu)>0?'red':'green' ]">{{ (Number(isNaN(props.vol)?0:props.vol>10000?props.vol/10000:props.vol)).toFixed(0)  }}{{props.vol>10000?'万':''}}</span></div>
              </div>
            </template>
        </kline-chart>
        <timeline-chart class="kline-chart" 
          v-if="!isKline"
          ref="timeline"
          :code="code"
          :theme="theme"
          :showJUNJIA="showJUNJIA"
        >
        <template slot-scope="props">
          <div class="chart-timeline-extra">
            <div>最新价格： <span  v-bind:class="[ Number(props.zhangfu)>0?'red':'green' ]">{{ isNaN(props.now)?'-':Number(props.now).toFixed(1) }}</span> </div>
            <div v-if="props.zhangfu">涨幅： <span  v-bind:class="[ Number(props.zhangfu)>0?'red':'green' ]">{{ (props.zhangfu * 100).toFixed(2) }}%</span></div>
          </div>
        </template>
        </timeline-chart>
   </div>
  
  
</template>
<script>
  import cardTitle from '@/components/card/cardTitle.vue'
  import { component as stockKline } from '@/lib/kline/kline'
  import { component as stockTimeline } from '@/lib/timeline/timeline'
  export default{
    name:'stockKTimeline',
    components:{
      'card-title':cardTitle,
      'kline-chart':stockKline.default,
      'timeline-chart':stockTimeline.default
    },
    created(){
      var self = this;
      eventBus.$on('blockCode',self.getEventBusData);
    },
    beforeDestroy(){
      var self = this;
      eventBus.$off('blockCode',self.getEventBusData);
    },
    mounted(){
        var self = this;
        $(window).resize(function(){
          setTimeout(function(){
            if(self.$refs.stockKline){self.$refs.stockKline.resize()}
            if(self.$refs.timeline){self.$refs.timeline.resize()}
          },30);
        });
        if($('.white').length){//黑白皮肤切换
          self.theme = 'white';
        }
    },
    data(){
      return{
        dateLength: 45,
        showButtons: true,
        isKline:false,
        codename:'',
        code:'',
        junjia:'',
        now:'',
        showJUNJIA:false,
        zhangdiefu:'',
        theme:'black'
      }
    },
    methods:{
      throwTalog:function(){
        var self = this;
        let type = self.isKline?'kline':'timeline';
        if(self[type]){
          return;
        }
        self[type] = setInterval(function(){
          if(type==='kline'){
            TA.log({id:'L2rdzz_5a77f5e7_557'});
          }else if(type==='timeline'){
            TA.log({id:'L2rdzz_5a77f5bb_549'});
          }
        },2000);
      },
      clearTalog:function(){
        var self = this;
        let type = self.isKline?'kline':'timeline';
        if(self[type]){
          clearInterval(self[type]);
          delete(self[type]);
        }
      },
      getEventBusData:function(val){
        var self = this;
        self.getStockname(val);
        self.code=val;
      },
      changeTypeEvent(type){
        var self = this;
        if(type==='timeline'){
          self.isKline = false;
          TA.log({id:'L2rdzz_5a77f51d_310'});
        }else if(type==='kline'){
          self.isKline = true;
          TA.log({id:'L2rdzz_5a77f58c_531'});
        }
      },
      getStockname(code){
        var self = this;
        Acme.getHqData({
          code:code,
          type:['ZQMC','JUNJIA','NEW','ZHANGDIEFU'],
          preiod:'now',
          mode:'after'
        },function(data){
          self.codename = data[code]['ZQMC'];
          self.junjia = isNaN(data[code]['JUNJIA'])?'-':Number(data[code]['JUNJIA']).toFixed(2);
          self.now = isNaN(data[code]['NEW'])?'-':Number(data[code]['NEW']).toFixed(2);
          self.zhangdiefu = Number(data[code]['ZHANGDIEFU']);
        });
      }
    }
  }
</script>
<style scoped>
     .stock-chart-box{
       position: relative;
       height:100%;
       background:#1b1b1b;
     }
     .white .stock-chart-box{
       background:#fff;
     }
     .kline-chart{
       min-height: 250px;
       height: calc(100% - 30px);
       width:100%;
     }
     .price-box{
       position: absolute;
       left:95px;
       top:8px;
       font-size: 12px;
       color:#5a5a5a;
     }
     .price-box>div{
       text-align: left;
       min-width:80px;
       display: inline-block;
     }
     .chart-kline-extra,
     .chart-timeline-extra{
       position: absolute;
       color:#fff;
       top: -22px;
       left:86px;
     }
     .white .chart-kline-extra,
     .white .chart-timeline-extra{
       color:#7d7d7d;
     }
     .chart-kline-extra div,
     .chart-timeline-extra div{
       float:left;
       margin-left: 10px;
     }
     .red{
        color:#f3564d;  
      }
      .green{
        color:#1cbf7b;
      }
     .price-btn-box{
      position: absolute;
      right: 50px;
      top: -7px;
      height: 20px;
      line-height: 20px;
      font-size: 12px;
    }
    .price-btn-item{
      float:left;
      list-style: none;
      cursor: pointer;
      padding:0 5px;
      background: #5a5a5a;
      color:#c9c9c9;
    }
    .price-btn-item:first-child{
      border-top-left-radius: 3px;
      border-bottom-left-radius: 3px;
    }
    .price-btn-item:last-child{
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;
    }
    .price-btn-box .active{
      color:#fff;
      background:#d6524d;
    }
    .timeline-info-text:hover{
       color:#fff;
     }
     .info-date{
        float:right;
     }
</style>
