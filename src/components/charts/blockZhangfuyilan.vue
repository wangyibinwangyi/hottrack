<template>
  <div class="zhangfu-container" v-on:mouseover="throwTalog()" v-on:mouseleave="clearTalog()">
      <card-title cardtitle='涨幅一览'></card-title>
      <div v-if="waitTime" class="wait-time-text">
        <span>还未开盘，稍等片刻</span>
      </div>
      <span class="zhangting-title">涨停数</span>
      <span class="zhangfu-title">各涨幅股数</span>
        <div class="zhangdiefu-chart">
          <chart-zdfAllView
          ref="zdfAllView"
          :theme="theme" 
          :data="allData"
          :xAxis="xAxis"> 
          </chart-zdfAllView>
        </div>
        <div class="zhangting-chart">
          <chart-zhangtingView 
            ref="zhangtingView"
            :theme="theme"
            :hardenNum="hardenNum"
            :stockList="stockList"
            :hardenStock="hardenStock"
            :xAxis="xAxis"
          >
          </chart-zhangtingView>
        </div>
        
    <!-- 板块涨幅 -->
  </div>
</template>
<script>
import cardTitle from "@/components/card/cardTitle.vue";
import { component as zdfAllView } from "@/lib/zdfAllView/zdfAllView";
import { component as zhangtingView } from "@/lib/zhangtingView/zhangtingView";

export default {
  name: "blockZhangfu",
  created() {
    var self = this;
    eventBus.$on("blockCode", self.getEventBusData);
  },
  beforeDestroy() {
    var self = this;
    eventBus.$off("blockCode", this.getEventBusData);
    clearInterval(self.timer);
  },
  mounted() {
    const self = this;
    self.checkoutServerTime();
    $(window).resize(function() {
      if (self.$refs.zhangtingView) {
        setTimeout(function() {
          self.$refs.zhangtingView.resize();
          self.$refs.zdfAllView.resize();
        }, 30);
      }
    });
    self.timer = setInterval(function() {
      if (self.code) {
        self.getData(self.code);
      }
    }, 120000);
    if ($(".white").length) {
      //黑白皮肤切换
      self.theme = "white";
    }
  },
  components: {
    "card-title": cardTitle,
    "chart-zdfAllView": zdfAllView.default,
    "chart-zhangtingView": zhangtingView.default
  },
  methods: {
    throwTalog: function() {
      var self = this;
      let type = "zdfTaLog";
      if (self[type]) {
        return;
      }
      self[type] = setInterval(function() {
        TA.log({ id: "L2rdzz_5a77f62d_318" });
      }, 2000);
    },
    clearTalog: function() {
      var self = this;
      let type = "zdfTaLog";
      if (self[type]) {
        clearInterval(self[type]);
        delete self[type];
      }
    },
    getEventBusData: function(val) {
      const self = this;
      //根据最初宽度选取日期
      self.dateLength =
        Math.floor((Number(document.body.clientWidth) - 1250) / 214) + 12;
      this.getData(val);
    },
    resize() {
      var self = this;
      self.$refs.zhangtingView.resize();
      self.$refs.zdfAllView.resize();
    },
    getData(code) {
      var self = this;
      self.code = code;
      self
        .$http({
          method: "get",
          url: self.url + "/hottrack/api/getGainsBlock",
          params: {
            platecode: code,
            datenum: self.dateLength
          }
        })
        .then(function(response) {
          if (response.data.errorcode == 0) {
            let data = {
                "8%~10%": [],
                "6%~8%": [],
                "4%~6%": [],
                "2%~4%": [],
                "0~2%": [],
                "-2%~0": [],
                "-4%~-2%": [],
                "-6%~-4%": [],
                "-8%~-6%": [],
                "-10%~-8%": []
              },
              date = [],
              hardenNum = [];
            let nameList = [
              "8%~10%",
              "6%~8%",
              "4%~6%",
              "2%~4%",
              "0~2%",
              "-2%~0",
              "-4%~-2%",
              "-6%~-4%",
              "-8%~-6%",
              "-10%~-8%"
            ];
            let hardenStock = [];
            let stockList = [],
              checkStock = {};
            let reg = new RegExp(/\d{2}/g);
            $.each(response.data.result, function(key, val) {
              let dateArr = ("" + key).match(reg);
              date.push(dateArr[2] + "/" + dateArr[3]);
              let isEmpty = false;
              if (JSON.stringify(val["zfcount"]) == "{}") {
                //空对象，新板块
                isEmpty = true;
                hardenNum.push(-99);
              } else {
                hardenNum.push(val.hardenNum);
              }

              $.each(nameList, function(keys, value) {
                let num = 0;
                switch (value) {
                  case "8%~10%":
                    num =
                      (val["zfcount"][8] || 0) +
                      (val["zfcount"][9] || 0) +
                      (val["zfcount"][10] || 0);
                    break;
                  case "6%~8%":
                    num = (val["zfcount"][6] || 0) + (val["zfcount"][7] || 0);
                    break;
                  case "4%~6%":
                    num = (val["zfcount"][4] || 0) + (val["zfcount"][5] || 0);
                    break;
                  case "2%~4%":
                    num = (val["zfcount"][2] || 0) + (val["zfcount"][3] || 0);
                    break;
                  case "0~2%":
                    num = (val["zfcount"][0] || 0) + (val["zfcount"][1] || 0);
                    break;
                  case "-2%~0":
                    num = (val["zfcount"][-2] || 0) + (val["zfcount"][-1] || 0);
                    num = -num;
                    break;
                  case "-4%~-2%":
                    num = (val["zfcount"][-4] || 0) + (val["zfcount"][-3] || 0);
                    num = -num;
                    break;
                  case "-6%~-4%":
                    num = (val["zfcount"][-6] || 0) + (val["zfcount"][-5] || 0);
                    num = -num;
                    break;
                  case "-8%~-6%":
                    num = (val["zfcount"][-8] || 0) + (val["zfcount"][-7] || 0);
                    num = -num;
                    break;
                  case "-10%~-8%":
                    num =
                      (val["zfcount"][-10] || 0) + (val["zfcount"][-9] || 0);
                    num = -num;
                    break;
                }
                if (isEmpty) {
                  data[value].push(-99);
                } else {
                  data[value].push(num);
                }
              });
              if (val["hardenStock"].length) {
                //当天有涨停
                for (let i = 0; i < val["hardenStock"].length; i++) {
                  if (checkStock[val["hardenStock"][i]]) {
                    continue;
                  }
                  stockList.push(val["hardenStock"][i]);
                  checkStock[val["hardenStock"][i]] = 1;
                }
                hardenStock.push(val["hardenStock"]);
              } else {
                hardenStock.push([]);
              }
            });
            self.hardenStock = hardenStock;
            self.stockList = stockList;
            self.hardenNum = hardenNum;
            self.xAxis = date;
            self.allData = data;
          }
        })
        .catch(function(err) {
          console.log(err);
        });
    },
    checkoutServerTime: function() {
      var self = this;
      API.use({
        method: "Quote.getServerTime",
        success: function(result) {
          var now = new Date(result * 1000);
          // now=new Date(1517534694*1000);
          var month =
            now.getMonth() >= 9
              ? now.getMonth() + 1
              : "0" + (now.getMonth() + 1);
          var day = now.getDate() >= 10 ? now.getDate() : "0" + now.getDate();
          var date = "" + now.getFullYear() + month + day;
          cefClient.judgeTradingDay({
            date: date,
            success: function(tradingDay) {
              if (tradingDay) {
                if (
                  now.getHours() == 9 &&
                  now.getMinutes() >= 0 &&
                  now.getMinutes() < 25
                ) {
                  var delayTime =
                    (24 - now.getMinutes()) * 60 * 1000 +
                    (60 - now.getSeconds()) * 1000;
                  self.waitTime = true;
                  setTimeout(function() {
                    self.waitTime = false;
                  }, delayTime);
                } else {
                  self.waitTime = false;
                }
              } else {
                //如果是交易日9点到9点25之间
                self.waitTime = false;
              }
            }
          });
        }
      });
    }
  },
  data() {
    return {
      url: "http://l2.10jqka.com.cn",
      allData: {},
      xAxis: [],
      hardenNum: [],
      stockList: [],
      waitTime: false,
      hardenStock: [],
      dateLength: 12,
      theme: window.theme
    };
  }
};
</script>
<style scoped>
.zhangfu-container {
  position: relative;
  background: #1b1b1b;
  height: 100%;
}
.white .zhangfu-container {
  background: #fff;
}
.zhangting-title,
.zhangfu-title {
  position: absolute;
  right: 10px;
  border: 1px solid #d6524d;
  border-radius: 2px;
  top: 35px;
  color: #d6524d;
  width: 18px;
  font-size: 12px;
  padding: 1px 2px 2px 2px;
}
.zhangfu-title {
  top: 124px;
}
.zhangting-chart {
  position: absolute;
  z-index: 10;
  left: 0;
  top: 22px;
  width: calc(100% - 30px);
  height: 55px;
}
.zhangdiefu-chart {
  width: calc(100% - 30px);
  min-height: 250px;
  height: calc(100% - 30px);
}
.wait-time-text {
  color: #7d7d7d;
  font-size: 12px;
  width: 100%;
  line-height: 285px;
  text-align: center;
  position: absolute;
  z-index: 20;
  background: #1b1b1b;
  top: 25px;
  height: 275px;
}
.white .wait-time.text {
  background: #fff;
}
</style>