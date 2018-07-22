<template>
  <div id="container">
    <div id="main">
      <!-- <left-side></left-side>  -->
      <div id="right-side">
        <div id="right-side-up">
          <div class="left-card">
            <hot-spots-today></hot-spots-today>
          </div>
          <div class="left-card">
            <block-zhangfu></block-zhangfu>
          </div>
          <div class="middle-card">
            <profit-making-effect></profit-making-effect>
          </div>
          <div class="right-card">
            <transaction-info v-if="clientType"></transaction-info>
            <div v-else>
              <card-title cardtitle='市场监控'></card-title>
              <market-preformance></market-preformance>
            </div>
          </div>
          <div class="right-card">
            <div v-if="clientType">
              <card-title cardtitle='市场表现'></card-title>
              <card-switch class="card-switch" :sWitch.sync="sWitch" selectarr='["资金","涨幅"]'></card-switch>
              <market-capital-situation v-if="sWitch"></market-capital-situation>
              <market-preformance v-else></market-preformance>
            </div>
            <div v-else>
              <card-title cardtitle='市场表现'></card-title>
              <market-capital-situation></market-capital-situation>
            </div>
          </div>
        </div>
        <div id="right-side-down">
          <hot-plate></hot-plate>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import leftSide from '@/pages/common/leftSide.vue'
import marketPreformance from '@/components/charts/marketPreformance.vue'
import MarketCapitalSituation from '@/components/charts/MarketCapitalSituation.vue'
import hotSpotToday from '@/components/card/hotSpotToday.vue'
import blockZhangfu from '@/components/charts/blockZhangfu.vue'
import profitMakingEffect from '@/components/card/profitMakingEffect.vue'
import hotPlate from '@/components/hotPlate/hotPlate.vue'

import cardSwitch from '@/components/card/cardSwitch.vue'
import cardTitle from '@/components/card/cardTitle.vue'
import transactionInfo from '@/components/G2/transactionInfo.vue'

export default {
  components: {
    'left-side': leftSide,
    'market-preformance': marketPreformance,
    'market-capital-situation': MarketCapitalSituation,
    'hot-spots-today': hotSpotToday,
    'block-zhangfu': blockZhangfu,
    'profit-making-effect': profitMakingEffect,
    'hot-plate': hotPlate,
    'card-switch': cardSwitch,
    'card-title': cardTitle,
    'transaction-info': transactionInfo
  },
  mounted() {
    // console.log($('.middle-card')[0].clientWidth
    var self = this
    self.enterTime = new Date()
    self.resetAppHeight()
    $(window).resize(function() {
      //高度自适应
      self.resetAppHeight()
    })
    // console.log(window.clientType)

    self.sessionId = API.createSessionId('external')
    API.use({
      method: 'external.registerEvent',
      data: 'onshow',
      persistent: true,
      sessionId: self.sessionId,
      callbackName: 'onshow',
      success: function(data) {
        if (data == 0) {
          self.leaveTime = new Date()
          let stayTime = parseInt((self.leaveTime - self.enterTime) / 1000)
          TA.log({ id: 'L2rdzz_5a77eea2_620', staytime: stayTime })
        } else if (data == 1) {
          self.enterTime = new Date()
        }
      }
    })
  },
  beforeDestroy() {
    var self = this
    self.leaveTime = new Date()
    let stayTime = parseInt((self.leaveTime - self.enterTime) / 1000)
    TA.log({ id: 'L2rdzz_5a77eea2_620', staytime: stayTime })
  },
  data() {
    return {
      enterTime: null,
      leaveTime: null,
      sessionId: {},
      sWitch: true
    }
  },
  computed: {
    clientType: function() {
      if (window.clientType === 2) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    resetAppHeight() {
      if (document.body.clientHeight > 890) {
        $('#right-side-down').css(
          'height',
          document.body.clientHeight - $('#right-side-up').height() - 56 + 'px'
        )
      } else {
        $('#right-side-down').attr('style', 'height:406px')
      }
    }
  }
}
</script>
<style>
body {
  background: #000;
}
.white body {
  background: #f4f4f4;
}
* {
  box-sizing: border-box;
}
#main {
  height: 100%;
}
#container {
  background: black;
  height: calc(100% - 30px);
  /* height: 1000px; */
}
.white #container {
  background: #f4f4f4;
}
.white #main {
  background-color: #f4f4f4;
}

#right-side {
  /* width: 1114px;   */
  /* width: 100%;  */
  /* min-height: 807px;  */
  height: 100%;
  /* border: 1px solid green;  */
  /* float: right; */
  /* margin-top: 10px;  */
  background: black;
  margin-left: 310px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 10px;
  padding-bottom: 0;
}
.white #right-side {
  background: #f4f4f4;
}
#footer {
  clear: both;
  height: 3px;
}
#right-side-up {
  height: 434px;
  min-height: 434px;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: space-between;
  /* margin:10px; */
}
#right-side-down {
  min-height: 353px;
  height: 48%;
  width: 100%;
  background: #1b1b1b;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
  margin-top: 10px;
}
.white #right-side-down {
  background: #fff;
}
.left-card {
  width: calc(38% - 10px);
  min-width: 356px;
  height: 210px;
  min-width: 356px;
  background-color: #1b1b1b;
  /* border: 1px solid green; */
}
.white .left-card {
  background-color: #fff;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
}
.middle-card {
  width: 23%;
  /* min-width: 351px; */
  height: 433px;
  min-width: 270px;
  /* border: 1px solid green; */
  margin-left: 10px;
  margin-right: 10px;
  background-color: #1b1b1b;
  /* flex-grow: 0; */
}
.white .middle-card {
  background-color: #fff;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
}
.right-card {
  width: calc(46% - 114px);
  min-width: 356px;
  height: 210px;
  background-color: #1b1b1b;
  position: relative;
  /* border: 1px solid green;                */
}
.white .right-card {
  background-color: #fff;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
}

/**
    新添加的样式
*/
.card-switch {
  position: absolute;
  /* left: 0; */
  top: 8px;
  left: 80px;
}
</style>

