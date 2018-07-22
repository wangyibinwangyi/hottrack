<template>
   <div class="stock-heat-box" style="height:100%" v-on:mouseover="throwTalog()" v-on:mouseleave="clearTalog()">
      <card-title cardtitle='个股热力图' class="card-title-heat"></card-title>
      <ul class="btn-box">
        <li class="btn-item" @click="changeTypeEvent('vol')" v-bind:class="{active:!isActive}">成交额</li>
        <li class="btn-item" @click="changeTypeEvent('zdf')" v-bind:class="{active:isActive}">涨幅</li>
      </ul>
      <div class="stock-heat-chart">
        <stock-heat-chart
          ref="stockHeatChart"
          :theme="theme"
          :data="data"
          :dataVol="dataVol"
          :codeList="pageCodeList"
          :codeVolList ='codeVolList'
          :dataZQMC="dataZQMC"
          :searchZQMC="searchZQMC"
          :changeType="changeType"
          :newTradeDays="newTradeDays"
          :maxVol="maxVol"
          :active='isActive'
        >
        </stock-heat-chart>
      </div>
      <ul class="button-tools">
        <li class="button-item" @click="changePage(-1)" id="buttonPageUp" style="visibility:hidden;">上一页</li>
        <li>当前第{{pageNum}}页</li>
        <li>共{{Math.ceil(codeList.length/pageSize)}}页</li>
        <li class="button-item" id="buttonPageDown" style="visibility:hidden;" @click="changePage(1)">下一页</li>
      </ul>
   </div>
  
  
</template>
<script>
import cardTitle from "@/components/card/cardTitle.vue";
import stockHeatChart from "@/lib/stockHeatChart/stockHeatChart";
export default {
  name: "stockHeat",
  components: {
    "card-title": cardTitle,
    "stock-heat-chart": stockHeatChart
  },
  props: {
    tradeDays: {
      type: Array,
      required: true
    }
  },
  created() {
    var self = this;
    eventBus.$on("stockHeat", self.getEventBusData);
  },
  beforeDestroy() {
    var self = this;
    eventBus.$off("stockHeat", self.getEventBusData);
  },
  mounted() {
    var self = this;
    $(window).resize(function() {
      if (self.$refs.stockHeatChart) {
        setTimeout(function() {
          self.$refs.stockHeatChart.resize();
        }, 30);
      }
    });
    if ($(".white").length) {
      //黑白皮肤切换
      self.theme = "white";
    }
  },
  watch: {
    // codeList:'stockListChange',
    pageCodeList: "stockListChange",
    codeVolList: "getHqDataVol",
    nowZdf: "changeNewZdf"
  },
  data() {
    return {
      maxVol: 0,
      url: "http://l2.10jqka.com.cn",
      pageNum: 1, //页码
      pageSize: 16, //单页展示数量
      data: {}, //涨跌幅数据
      dataVol: {}, //成交额数据
      dataZQMC: {}, //代码查询证券名称
      codeList: [], //代码列表
      pageCodeList: [], //分页传入代码列表
      sortVolCodeList: [], //排序后的成交额代码列表
      codeVolList: [], //分页成交额代码列表
      searchZQMC: {}, //证券名称查询代码，用于跳转
      newTradeDays: [], //交易日列表
      dateLength: 47, //显示日期
      plateStock: "000000", //板块名称
      nowZdf: {},
      isNotChange: false,
      quoteSessionId: window.API.createSessionId("Quote"),
      nowDate: "",
      changeType: "",
      isActive: false,
      pushTime: +new Date("2017-01-01"),
      theme: "black"
    };
  },
  methods: {
    checkoutBtn: function() {
      var self = this;
      if (self.pageNum > 1) {
        $("#buttonPageUp").css("visibility", "visible");
      } else {
        $("#buttonPageUp").css("visibility", "hidden");
      }
      if (self.pageNum < Math.ceil(self.codeList.length / self.pageSize)) {
        $("#buttonPageDown").css("visibility", "visible");
      } else {
        $("#buttonPageDown").css("visibility", "hidden");
      }
    },
    changePage: function(num) {
      var self = this;
      self.pageNum += Number(num);
      let type = self.isActive ? "zdf" : "vol";
      self.checkoutBtn();
      if (type === "zdf") {
        self.pageCodeList = self.codeList
          .slice(
            (self.pageNum - 1) * self.pageSize,
            self.pageNum * self.pageSize
          )
          .reverse();
        this.isActive = true;
      } else if (type === "vol") {
        self.codeVolList = self.sortVolCodeList
          .slice(
            (self.pageNum - 1) * self.pageSize,
            self.pageNum * self.pageSize
          )
          .reverse();
        this.isActive = false;
      }
    },
    getEventBusData: function(val) {
      var self = this;
      if (self.plateStock == val.platecode && !self.isActive) {
        //板块没有改变，为每两分钟推送内容,展示为成交额时不需要。
        return;
      } else if (self.plateStock != val.platecode) {
        //板块改变，页码重置
        self.pageNum = 1;
      }
      self.maxVol = Math.random();
      self.plateStock = val.platecode;
      //根据最初宽度选取日期
      self.dateLength =
        Math.floor((Number(document.body.clientWidth) - 1250) / 44) + 30;
      self.getStockData(val.stockList);
    },
    stockListChange: function(type) {
      if (this.isNotChange) {
        this.isNotChange = false;
        return;
      }
      if (typeof type == "object") {
        type = this.isActive ? "zdf" : "vol";
      }
      // this.pageNum = 1;
      this.checkoutBtn();
      if (type === "zdf") {
        this.getHqData();
        this.isActive = true;
      } else if (type === "vol") {
        // this.getHqDataVol();
        this.renderNewData("vol");
        this.renderPushData("vol");
        this.isActive = false;
      }
    },
    changeTypeEvent: function(type) {
      if (this.isNotChange) {
        this.isNotChange = false;
      }
      this.pageNum = 1;
      this.checkoutBtn();
      if (typeof type == "object") {
        type = this.isActive ? "zdf" : "vol";
      }
      if (type === "zdf") {
        this.getHqData();
        this.pageCodeList = this.codeList
          .slice(
            (this.pageNum - 1) * this.pageSize,
            this.pageNum * this.pageSize
          )
          .reverse();
        this.isActive = true;
        TA.log({ id: "L2rdzz_5a77f8f8_956" });
      } else if (type === "vol") {
        this.renderNewData("vol");
        this.renderPushData("vol");
        // this.getHqDataVol();
        this.isActive = false;
        TA.log({ id: "L2rdzz_5a77f92b_946" });
      }
    },
    getStockData: function(data) {
      var self = this;
      let codelist = [];
      let searchZQMC = {};
      let dataZQMC = {};
      let nowZdf = {};
      window.timers = +new Date();
      $.each(data, function(key, val) {
        dataZQMC[val.key] = { ZQMC: val.zqmc };
        searchZQMC[val.zqmc] = val.key;
        nowZdf[val.key] = val.zhangdiefu;
        codelist.unshift(val.key);
      });
      self.nowZdf = nowZdf;
      self.searchZQMC = searchZQMC;
      self.dataZQMC = dataZQMC;
      self.codeList = codelist.reverse();
      self.pageCodeList = self.codeList
        .slice((self.pageNum - 1) * self.pageSize, self.pageNum * self.pageSize)
        .reverse();
      self.isNotChange = false;
    },
    renderNewData: function(type) {
      //新的数值进行排序
      const self = this;
      var codeList = self.codeList;
      Acme.getHqData(
        {
          code: codeList,
          type: ["ZHANGDIEFU", "MONEY"],
          period: "now",
          mode: "after"
        },
        function(data) {
          var sortArr = [];
          $.each(self.codeList, function(key, val) {
            sortArr.push({
              code: val == "NUL" ? -999 : val,
              value:
                data[val]["MONEY"] == "NUL" ? -999 : Number(data[val]["MONEY"])
            });
          });
          //排序
          sortArr = sortArr.sort(function(a, b) {
            return b.value - a.value;
          });

          let sortedData = self.data;
          let sortCodeList = [];
          if (type == "vol") {
            $.each(sortArr, function(key, val) {
              sortCodeList.push(val.code);
              if (
                !sortedData[val.code] ||
                val["value"] < -900 ||
                !sortedData[self.tradeDays[1]]
              ) {
                return true;
              }
              sortedData[val.code][self.nowDate]["MONEY"] = val["value"];
            });
          }
          self.newTradeDays = self.tradeDays
            .slice(0, self.dateLength - 1)
            .reverse();
          //排完序只取一段展示
          self.sortVolCodeList = sortCodeList;
          sortCodeList = sortCodeList
            .slice(
              (self.pageNum - 1) * self.pageSize,
              self.pageNum * self.pageSize
            )
            .reverse();
          self.codeVolList = sortCodeList;
          // self.data = sortedData;
          // setTimeout(function(){
          //   self.isNotChange=true;
          // },40)
        }
      );
    },
    renderPushData: function(type) {
      var self = this;
      self.pushTime = +new Date("1970-01-01");
      API.use({
        method: "Quote.registerPush",
        data: { code: self.codeList },
        sessionId: self.quoteSessionId,
        persistent: true,
        callbackName: "onready",
        success: function(data) {
          var newDate = +new Date();
          if (newDate - self.pushTime < 120000 || self.isActive) {
            return;
          } else {
            self.pushTime = +new Date();
            self.renderNewData(type);
          }
        }
      });
    },
    changeNewZdf: function(data, fromHqData) {
      var self = this;
      let endData = self.tradeDays[0];
      let changeData;
      if (fromHqData.isHqData) {
        changeData = data;
      } else {
        changeData = self.data;
      }
      $.each(changeData, function(key, val) {
        changeData[key][endData]["CLOSE"] = Number(self.nowZdf[key]) / 100 + 1;
        changeData[key][endData]["PRE"] = 1;
      });
      if (data) {
        return changeData;
      } else {
        self.data = changeData;
      }
    },
    getHqData: function() {
      //获取涨跌幅相关数据
      const self = this;
      let codeList = self.pageCodeList;
      let beginData = self.tradeDays[self.dateLength];
      let endData = self.tradeDays[0];
      self.nowDate = endData;
      Acme.getHqData(
        {
          code: codeList,
          type: ["PRE"],
          period: "day",
          mode: "before",
          time: {
            begin: beginData,
            end: beginData,
            timeFmt: 1
          }
        },
        function(checkData) {
          Acme.getHqData(
            {
              code: codeList,
              type: ["PRE", "CLOSE"],
              period: "day",
              mode: "after",
              time: {
                begin: beginData,
                end: endData,
                timeFmt: 1
              }
            },
            function(data) {
              data = self.changeNewZdf(data, { isHqData: 1 });
              data["checkData"] = checkData;
              self.newTradeDays = self.tradeDays
                .slice(0, self.dateLength - 1)
                .reverse();
              self.data = data;
              self.changeType = "zdf";
              // self.renderNewData('zdf');//无需再排序
              // self.renderPushData('zdf');
            }
          );
        }
      );
    },
    getHqDataVol: function() {
      //获取成交额相关数据
      var self = this;
      var codeList = self.codeVolList;
      let beginData = self.tradeDays[self.dateLength];
      let endData = self.tradeDays[0];
      window.timers = +new Date();
      Acme.getHqData(
        {
          code: codeList,
          type: ["PRE"],
          period: "day",
          mode: "before",
          time: {
            begin: beginData,
            end: beginData,
            timeFmt: 1
          }
        },
        function(checkData) {
          Acme.getHqData(
            {
              code: codeList,
              type: ["MONEY"],
              period: "day",
              mode: "after",
              time: {
                begin: beginData,
                end: endData,
                timeFmt: 1
              }
            },
            function(data) {
              console.log(data);
              self.newTradeDays = self.tradeDays
                .slice(0, self.dateLength - 1)
                .reverse();
              data.checkData = checkData;
              self.dataVol = data;
              self.changeType = "vol";
              // self.renderNewData('vol');
              // self.renderPushData('vol');
            }
          );
        }
      );
    },
    throwTalog: function() {
      var self = this;
      let type = "heatTaLog";
      if (self[type]) {
        return;
      }
      self[type] = setInterval(function() {
        TA.log({ id: "L2rdzz_5a77f951_855" });
      }, 2000);
    },
    clearTalog: function() {
      var self = this;
      let type = "heatTaLog";
      if (self[type]) {
        clearInterval(self[type]);
        delete self[type];
      }
    }
  }
};
</script>
<style scoped>
.stock-heat-box {
  position: relative;
}
.red {
  color: #f3564d;
}
.green {
  color: #1cbf7b;
}
.card-title-heat {
  position: absolute;
  z-index: 20;
}
.btn-box {
  position: absolute;
  left: 50px;
  top: -7px;
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  z-index: 5;
}
.btn-item {
  float: left;
  list-style: none;
  cursor: pointer;
  padding: 0 5px;
  background: #5a5a5a;
  color: #c9c9c9;
}
.btn-item:first-child {
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
}
.btn-item:last-child {
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
}
.btn-box .active {
  color: #fff;
  background: #d6524d;
}
.stock-heat-chart {
  position: absolute;
  top: 0;
  z-index: 1;
  min-height: 300px;
  height: 93%;
  width: 100%;
  background: #1b1b1b;
}
.white .stock-heat-chart {
  background: #fff;
}
.button-tools {
  position: absolute;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  top: calc(83% + 43px);
  height: 30px;
  color: #7d7d7d;
  margin: 0;
  padding: 0;
  z-index: 5;
  font-size: 12px;
  width: 260px;
  left: calc(50% - 130px);
}
.button-tools li {
  padding: 0 4px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  float: left;
  list-style: none;
}
.button-tools .button-item {
  cursor: pointer;
  border-radius: 3px;
  background: #5a5a5a;
  color: #c9c9c9;
}
.button-tools .button-item:hover {
  background: #404040;
}
</style>
