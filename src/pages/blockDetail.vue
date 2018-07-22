<template>
  <div id="container">
      <div id="main">
             <!-- <div class="block-left-side">  -->
                 <!-- <left-side></left-side>  -->
             <!-- </div>  -->
            <div id="block-right-side">
                <div class="block-left-card">
                  <stock-ktimeline></stock-ktimeline>
                </div>
                <div class="block-left-card">
                  <block-zhangfuyilan></block-zhangfuyilan>
                </div>
                <div class="block-left-card stock-card">
                  <block-deal :tradeDays="tradeDays"></block-deal>
                </div>
                <div class="block-right-top-card">
                  <div class="block-faucet">
                    <stock-faucet></stock-faucet>
                  </div> 
                  <div class="block-faucet-zdf">
                    <faucet-and-block  :tradeDays="tradeDays"></faucet-and-block>  
                  </div> 
                  <div class="block-zx">
                    <block-zx></block-zx>
                  </div> 
                </div>
                <div class="block-right-bottom-card">
                    <stock-heat  :tradeDays="tradeDays"></stock-heat>
                </div>
            </div>
      </div>
  </div>
</template>
<script>
import leftSide from '@/pages/common/leftSide.vue'
import stockKTimeline from '@/components/stockKTimeline/stockKTimeline.vue'
import blockZhangfuyilan from '@/components/charts/blockZhangfuyilan.vue'
import blockZX from '@/components/blockReport/blockZX.vue'
import stockFaucet from '@/components/stockFaucet/stockFaucet.vue'
import faucetAndBlock from '@/components/stockFaucet/faucetAndBlock.vue'
import blockDeal from '@/components/blockDeal/blockDeal.vue'
import stockHeat from '@/components/stockHeat/stockHeat.vue'
export default {
  components: {
    'left-side':leftSide,
    'stock-ktimeline':stockKTimeline,
    'block-zhangfuyilan':blockZhangfuyilan,
    'block-zx':blockZX,
    'stock-faucet':stockFaucet,
    'faucet-and-block':faucetAndBlock,
    'block-deal':blockDeal,
    'stock-heat':stockHeat
    },
    mounted(){
      this.getPeriodTradeDays();
      self.enterTime=new Date();
      self.sessionId = API.createSessionId('external');
        API.use({
            method:'external.registerEvent',
            data:'onshow',
            persistent:true,
            sessionId:self.sessionId,
            callbackName:'onshow',
            success:function(data){
                if(data==0){
                    self.leaveTime=new Date();
                    let stayTime=parseInt((self.leaveTime-self.enterTime)/1000);
                    TA.log({id:'L2rdzz_5a77ed44_529',staytime:stayTime});
                }else if(data==1){
                    self.enterTime=new Date();
                }
            }
        });
    },
    beforeDestroy(){
      var self=this;
      self.leaveTime=new Date();
      let stayTime=parseInt((self.leaveTime-self.enterTime)/1000);
      TA.log({id:'L2rdzz_5a77ed44_529',staytime:stayTime});
    },
    data(){
      return {
        url:'http://l2.10jqka.com.cn',
        tradeDays:[],
        enterTime:null,
        leaveTime:null,
        sessionId:null
      }
    },
    methods:{
      getPeriodTradeDays(){
        var self =this;
        self.$http({
            method:'get',
            url:self.url+'/hottrack/api/getPeriodTradeDays',
            params:{
              datenum:100
            }
          })
          .then(function(response){
              if(response.data.errorcode==0){
                self.tradeDays = response.data.result;
              }
          })
          .catch(function(err){
            console.log(err);
          });
      }
    }
}
</script>

<style>
  *{
      box-sizing: border-box;         
  }
  #container, #main{
      background: black;
      height:calc(100% - 23px);
      /* height: 1000px; */
  }
  .white #container,.white #main{
    background:#f4f4f4;
  }
  #block-right-side{
        min-height: 807px;
        height: 100%;
        background: #000;
        display: flex;
        flex-flow:column wrap;
        justify-content:space-between;
        margin-left: 310px; 
        padding: 10px;
        padding-bottom: 0;
    }
  .white #block-right-side{
    background:#f4f4f4;
  }
  .block-left-card{
      width: calc(40% - 10px); 
      min-height: 280px;
      height:35%;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
      /* border: 1px solid yellow; */
  }
  .stock-card{
    min-height: 217px;
    height: 27%;
  }
  .block-right-top-card{
      width: calc(60% - 10px);
      min-height: 410px;
      height: calc(54% - 25px);
      display: flex;
      flex-flow:column wrap;
      justify-content:space-between;
      align-content: space-between;
      /* border: 1px solid orange;                */
  }
  .block-faucet{
    width:57%;
    min-width: 265px;
    height: 119px;
    background: #1b1b1b;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
    /* border: 1px solid orange;                */
  }
  .white .block-faucet{
    background:#fff;
  }
  .block-faucet-zdf{
    width:57%;
    min-width: 265px;
    min-height: 280px;
    height: 70%;
    background: #1b1b1b;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
    /* border: 1px solid orange;                */
  }
  .white .block-faucet-zdf{
    background:#fff;
  }
  .block-zx{
    width:calc(43% - 12px);
    min-width: 250px;
    min-height: 410px;
    height: 100%;
    background: #1b1b1b;
    overflow: hidden;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
    /* border: 1px solid orange;                */
  }
  .white .block-zx{
    background:#fff;
  }
  .block-right-bottom-card{
      width: calc(60% - 10px); 
      min-height: 376px;
      background:#1b1b1b;
      height: 47%;
      overflow:hidden;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
      /* border: 1px solid orange;   */
  } 
  .white .block-right-bottom-card{
    background:#fff;
  }
</style>
