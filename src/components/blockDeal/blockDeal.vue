<template>
   <div style="height:100%;position:relative" v-on:mouseover="throwTalog()" v-on:mouseleave="clearTalog()">
      <card-title cardtitle='板块成交量概况' class="card-title-deal"></card-title>
      <keep-alive>
      <div class="block-deal-chart">
        <block-deal-chart
          ref="blockDealChart"
          :theme="theme"
          :data="data"
          :code="code"
          :tradeDays="tradeDays"
        >
        </block-deal-chart>
      </div>
      </keep-alive>
   </div>
  
  
</template>
<script>
import cardTitle from "@/components/card/cardTitle.vue";
import blockDealChart from "@/lib/blockDealChart/blockDealChart";
export default {
  name: "faucetAndBlock",
  components: {
    "card-title": cardTitle,
    "block-deal-chart": blockDealChart
  },
  props: {
    tradeDays: {
      type: Array,
      required: true
    }
  },
  created() {
    var self = this;
    eventBus.$on("blockCode", self.getEventBusData);
  },
  mounted() {
    // window.onresize = function(){
    //   // self.$refs.faucetBlock.resize()
    // }
    var self = this;
    $(window).resize(function() {
      if (self.$refs.blockDealChart) {
        setTimeout(function() {
          self.$refs.blockDealChart.resize();
        }, 30);
      }
    });
    self.timer = setInterval(function() {
      if (self.code) {
        self.getHqData(self.code);
      }
    }, 120000);
    if ($(".white").length) {
      //黑白皮肤切换
      self.theme = "white";
    }
  },
  beforeDestroy() {
    var self = this;
    eventBus.$off("blockCode", this.getEventBusData);
    clearInterval(self.timer);
  },
  data() {
    return {
      data: {},
      code: "",
      url: "http://l2.10jqka.com.cn",
      theme: "black"
    };
  },
  methods: {
    throwTalog: function() {
      var self = this;
      let type = "dealTaLog";
      if (self[type]) {
        return;
      }
      self[type] = setInterval(function() {
        TA.log({ id: "L2rdzz_5a77f6bf_321" });
      }, 2000);
    },
    clearTalog: function() {
      var self = this;
      let type = "dealTaLog";
      if (self[type]) {
        clearInterval(self[type]);
        delete self[type];
      }
    },
    getEventBusData: function(val) {
      this.getHqData(val);
    },
    getHqData: function(blockCode) {
      var self = this;
      if (self.tradeDays.length) {
        let beginData = self.tradeDays[25];
        let endData = self.tradeDays[0];
        Acme.getHqData(
          {
            code: blockCode,
            type: [
              "DPLTSZ",
              "MONEY",
              "vol",
              "BIGBUYMONEY2",
              "BIGBUYMONEY1",
              "WAITBUYMONEY1",
              "WAITBUYMONEY2"
            ],
            period: "day",
            mode: "after",
            time: {
              begin: beginData,
              end: endData,
              timeFmt: 1
            }
          },
          function(data) {
            self.code = "" + blockCode;
            self.data = Object.assign({}, data);
          }
        );
      } else {
        self
          .$http({
            method: "get",
            url: self.url + "/hottrack/api/getPeriodTradeDays",
            params: {
              datenum: 45
            }
          })
          .then(function(response) {
            if (response.data.errorcode == 0) {
              let beginData =
                response.data.result[response.data.result.length - 1];
              let endData = response.data.result[0];
              Acme.getHqData(
                {
                  code: blockCode,
                  type: [
                    "DPLTSZ",
                    "MONEY",
                    "vol",
                    "BIGBUYMONEY2",
                    "BIGBUYMONEY1",
                    "WAITBUYMONEY1",
                    "WAITBUYMONEY2"
                  ],
                  period: "day",
                  mode: "after",
                  time: {
                    begin: beginData,
                    end: endData,
                    timeFmt: 1
                  }
                },
                function(data) {
                  // renderData(data,'881153');
                  self.code = "" + blockCode;
                  self.data = data;
                  // console.log(data['881153']['20171207']['MONEY']/data['881153']['20171207']['DPLTSZ']*100)
                  // console.log(JSON.stringify(data));
                }
              );
            }
          })
          .catch(function(err) {
            console.log(err);
          });
      }
    }
  }
};
</script>
<style scoped>
.red {
  color: #f3564d;
}
.green {
  color: #1cbf7b;
}
.card-title-deal {
  position: absolute;
  z-index: 20;
}
.block-deal-chart {
  background: #1b1b1b;
  min-height: 184px;
  height: 100%;
  width: 100%;
}
.white .block-deal-chart {
  background: #fff;
}
</style>
