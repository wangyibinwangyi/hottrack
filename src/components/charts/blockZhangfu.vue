<template>
  <div class="blockZhangfu">
    <card-title cardtitle='板块涨幅' class="card-title"></card-title>
    <div v-if="!myclientType">
      <!-- <card-switch class="card-switch" :sWitch.sync="sWitch" selectarr='["涨幅","资金"]' v-show="myclientType"></card-switch> -->
      <!-- <day-switch class="day-switch" :daynu/mber.sync="daynumber" v-if="!sWitch"></day-switch> -->
      <div id="risebar-wrap" v-if="timeType != 'waitTime'" class="risebar-wrap">
        <chart-risebar ref="risebar" :theme="theme" :data="data" :xAxis="xAxis" id="chart-risebar">
        </chart-risebar>
      </div>
      <div v-else class="nodata">
        <div class="notTime">还未开盘，稍等片刻</div>
      </div>
    </div>
    <div v-else>
      <card-switch class="card-switch" :sWitch.sync="sWitch" selectarr='["涨幅","资金"]' v-show="myclientType"></card-switch>
      <day-switch class="day-switch" :daynumber.sync="daynumber" v-if="!sWitch"></day-switch>
      <div id="risebar-wrap" v-if="timeType != 'waitTime'" class="risebar-wrap">
        <chart-risebar ref="risebar" :theme="theme" :data="data" :xAxis="xAxis" v-if="sWitch" id="chart-risebar">
        </chart-risebar>
        <captical v-else :tradedays="daynumber"></captical>
      </div>
      <div v-else class="nodata">
        <div class="notTime">还未开盘，稍等片刻</div>
      </div>
    </div>
    <!-- 板块涨幅 -->
  </div>

</template>
<script>
import cardTitle from "@/components/card/cardTitle.vue";
import { component as risebar } from "@/lib/risebar/risebar";

import cardSwitch from "@/components/card/cardSwitch.vue";
import captical from "@/components/G2/captical.vue";
import daySwitch from "@/components/card/daySwitch.vue";

export default {
  name: "blockZhangfu",
  components: {
    "card-title": cardTitle,
    "chart-risebar": risebar.default,
    "card-switch": cardSwitch,
    captical: captical,
    "day-switch": daySwitch
  },
  created() {
    eventBus.$on("timeType", this.handle);
    let self = this;
    eventBus.$on("toggleSelectItem", function() {
      self.update();
    });
  },
  mounted() {
    var self = this;
    self.theme = window.theme;
    // console.log($('#chart-risebar'))
    if (self.timeType == "tradingTime") {
      self.update();
    } else if (self.timeType == "waitTime") {
      self.update();
    } else if (self.timeType == "notTradingDay") {
      self.update();
    }
    self.interval = setInterval(self.update, 30000);

    $(window).resize(function() {
      if (self.$refs.risebar) {
        setTimeout(function() {
          self.$refs.risebar.resize();
        }, 30);
      }
    });

    $("#risebar-wrap").on("mouseover", function() {
      clearInterval(self.maidianInterval);
      self.maidianInterval = setInterval(function() {
        TA.log({ id: "L2rdzz_5a77fa85_108" });
      }, 2000);
    });
    $("#risebar-wrap").on("mouseout", function() {
      clearInterval(self.maidianInterval);
    });
  },
  beforeDestroy() {
    eventBus.$off("timeType", this.handle);
    clearInterval(this.interval);
    clearInterval(this.maidianInterval);
  },
  computed: {
    myclientType: function() {
      if (window.clientType === 2) {
        return true;
      } else {
        return false; // 这里到后面可以进行设置权限为false
      }
    }
  },
  data() {
    return {
      data: [],
      xAxis: [],
      theme: "black",
      url: "http://l2.10jqka.com.cn",
      interval: null,
      // waitTime:false,//交易日9点至9点25分
      maidianInterval: null,
      timeType: "tradingTime",
      clientType: window.clientType,
      sWitch: false,
      daynumber: 1
    };
  },
  methods: {
    handle(val) {
      this.timeType = val;
    },
    update: function() {
      const self = this;
      $.ajax({
        url: this.url + "/hottrack/api/getPlatePeriod",
        xhrFields: {
          withCredentials: true
        },
        success: function(data) {
          let response = { data: data };
          var xdata = [];
          if (response.data.errorcode === 0) {
            self.data = response.data.result.y;
            for (var i = 0; i < response.data.result.x.length; i++) {
              xdata.push(response.data.result.x[i] + "%");
            }
            // self.xAxis = response.data.result.x;
            self.xAxis = xdata;
          }
        }
      });
    }
  },
  watch: {
    sWitch: function(val) {
      // 当switch为false的时候，应该将日期选择为今日
      this.daynumber = 1;
    },
    daynumber: function(val) {
      // console.log(val)
      this.daynumber = val;
    }
  }
};
</script>
<style scoped>
.risebar-wrap {
  width: 100%;
  height: 180px;
}
.nodata {
  width: 100%;
  height: 180px;
}
.notTime {
  border: 1px solid #393939;
  width: 95%;
  height: 170px;
  margin-left: 10px;
  text-align: center;
  color: #ababab;
  font-size: 12px;
  line-height: 170px;
}
.blockZhangfu {
  position: relative;
  background-color: #1b1b1b;
}
.white .notTime {
  border: 1px solid #ababab;
}
.white .blockZhangfu {
  background-color: #fff;
}

.card-switch {
  /* display: inline-block; */
  position: absolute;
  left: 80px;
  top: 8px;
}

.day-switch {
  position: absolute;
  right: 10px;
  top: 8px;
}
</style>