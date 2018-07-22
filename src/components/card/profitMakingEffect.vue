<template>
  <div id="profitMakingEffect">
    <card-title cardtitle='热点赚钱效应'></card-title>
    <card-switch class="card-switch" :sWitch.sync="sWitch" selectarr='["热点","全景"]' v-if="clientType"></card-switch>
    <div v-if="!clientType">
      <div class="main-container">
        <div class="subtitle">热点持续性</div>
        <div class="lastEffect">
          <div class="progress">
            <div class="subProgress" :style="{width:persistentPercent + '%'}"></div>
          </div>
          <div class="lastCommend">{{persistentValue}}</div>
        </div>
        <div class="subtitle">昨日热点今日涨幅</div>
        <div class="yesterdayZhangfu" v-if="yearshotblock!=''">
          <div class="zhangfuSub" v-for="item in yearshotblock" :key='item.platecode'>
            <span :title="setTitle(item.platename)" class="pointer" @click="go2TimeLine(item.platecode,'yesterday')">{{splitText(item.platename,4)}}</span>
            <span :class="toFixed(item.increase)['color']">{{toFixed(item.increase)['num']}}%</span>
            <span>&nbsp;</span>
            <span class="txt-r" :class="getZF(preHotPlate[item.platecode])['color']">{{getZF(preHotPlate[item.platecode])['num']}}%</span>
          </div>
        </div>
        <div v-else class="nodata2">昨日无热点板块</div>
        <div class="subtitle">连板情况</div>
        <div class="lianban">
          <div class='lianbanSub'>
            <span class="title title--top">四板及以上：</span>
            <template v-if="typeof evenplate[4] === 'object' && evenplate[4].length !== 0">
              <span v-for="(item,index) in evenplate[4]" v-bind:key="index">
                <template v-if="index === showNumber">
                  <span class="pointer eplies" @click="changeModal(4)">...
                    <template v-if="modal[4]">
                      <div class="modal-continue">
                        <span v-for="(item2,index2) in evenplate[4]" v-bind:key="index2">
                          <template v-if="index2 >= showNumber">
                            <span :title="setTitle(getStockName(item2['stockcode']))" class="modal-text pointer" @click="go2TimeLine(item2['stockcode'],'lianban')">{{splitText(getStockName(item2['stockcode']),4)}}</span>
                          </template>
                        </span>
                      </div>
                    </template>
                  </span>
                </template>
                <template v-else-if="index < showNumber">
                  <span :title="setTitle(getStockName(item['stockcode']))" class="text pointer" @click="go2TimeLine(item['stockcode'],'lianban')">{{getStockName(item['stockcode'])}}</span>
                </template>
              </span>
            </template>
            <template v-else>
              <span>暂无</span>
            </template>

          </div>
          <div class='lianbanSub'>
            <span class="title">三连板：</span>
            <template v-if="typeof evenplate[3] === 'object' && evenplate[3].length !== 0">
              <span v-for="(item,index) in evenplate[3]" v-bind:key="index">
                <template v-if="index === showNumber">
                  <span class="pointer eplies" @click="changeModal(3)">...
                    <template v-if="modal[3]">
                      <div class="modal-continue">
                        <span v-for="(item2,index2) in evenplate[3]" v-bind:key="index2">
                          <template v-if="index2 >= showNumber">
                            <span :title="setTitle(getStockName(item2['stockcode']))" class="modal-text pointer" @click="go2TimeLine(item2['stockcode'],'lianban')">{{splitText(getStockName(item2['stockcode']),4)}}</span>
                          </template>
                        </span>
                      </div>
                    </template>
                  </span>
                </template>
                <template v-else-if="index < showNumber">
                  <span :title="setTitle(getStockName(item['stockcode']))" class="text pointer" @click="go2TimeLine(item['stockcode'],'lianban')">{{getStockName(item['stockcode'])}}</span>
                </template>
              </span>
            </template>
            <template v-else>
              <span>暂无</span>
            </template>

          </div>
          <div class='lianbanSub'>
            <span class="title">二连板：</span>
            <template v-if="typeof evenplate[2] === 'object' && evenplate[2].length !== 0">
              <span v-for="(item,index) in evenplate[2]" v-bind:key="index">
                <template v-if="index === showNumber">
                  <span class="pointer eplies" @click="changeModal(2)">...
                    <template v-if="modal[2]">
                      <div class="modal-continue">
                        <span v-for="(item2,index2) in evenplate[2]" v-bind:key="index2">
                          <template v-if="index2 >= showNumber">
                            <span :title="setTitle(getStockName(item2['stockcode']))" class="modal-text pointer" @click="go2TimeLine(item2['stockcode'],'lianban')">{{splitText(getStockName(item2['stockcode']),4)}}</span>
                          </template>
                        </span>
                      </div>
                    </template>
                  </span>
                </template>
                <template v-else-if="index < showNumber">
                  <span :title="setTitle(getStockName(item['stockcode']))" class="text pointer" @click="go2TimeLine(item['stockcode'],'lianban')">{{getStockName(item['stockcode'])}}</span>
                </template>

              </span>
            </template>
            <template v-else>
              <span>暂无</span>
            </template>
            <!-- <span class="text">{{evenplate['2'][0]['stockname']}}</span> -->
            <!-- <span class="text">{{evenplate['2'][1]['stockname']}}</span> -->

          </div>

        </div>
        <div class="subtitle pb-5">最赚钱板块与个股（十日收益）</div>
        <div class="tenDaysWrap">

          <div class="tenDays">
            <div class="tenDaysSub" v-for="item in popstockPlate" :key="item.id">
              <span :title="setTitle(getStockName(item['platecode']))" class="pointer" @click="go2TimeLine(item['platecode'],'mostEffect')">{{splitText(getStockName(item.platecode),3,1)}}</span>
              <span :class="toFixed(item.earningsrate)['color']">{{toFixed(item.earningsrate)['num']}}%</span>
            </div>
          </div>
          <div class="tenDays">
            <div class="tenDaysSub" v-for="item in popstockStock" :key="item.id">
              <span :title="setTitle(getStockName(item['stockcode']))" class="pointer" @click="go2TimeLine(item['stockcode'],'mostEffect')">{{splitText(getStockName(item.stockcode),3,1)}}</span>
              <span :class="toFixed(item.earningsrate)['color']">{{toFixed(item.earningsrate)['num']}}%</span>
            </div>

          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="main-container" v-if="sWitch">
        <div class="subtitle">热点持续性</div>
        <div class="lastEffect">
          <div class="progress">
            <div class="subProgress" :style="{width:persistentPercent + '%'}"></div>
          </div>
          <div class="lastCommend">{{persistentValue}}</div>
        </div>
        <div class="subtitle">昨日热点今日涨幅</div>
        <div class="yesterdayZhangfu" v-if="yearshotblock!=''">
          <div class="zhangfuSub" v-for="item in yearshotblock" :key='item.platecode'>
            <span :title="setTitle(item.platename)" class="pointer" @click="go2TimeLine(item.platecode,'yesterday')">{{splitText(item.platename,4)}}</span>
            <span :class="toFixed(item.increase)['color']">{{toFixed(item.increase)['num']}}%</span>
            <span>&nbsp;</span>
            <span class="txt-r" :class="getZF(preHotPlate[item.platecode])['color']">{{getZF(preHotPlate[item.platecode])['num']}}%</span>
          </div>
        </div>
        <div v-else class="nodata2">昨日无热点板块</div>
        <div class="subtitle">连板情况</div>
        <div class="lianban">
          <div class='lianbanSub'>
            <span class="title title--top">四板及以上：</span>
            <template v-if="typeof evenplate[4] === 'object' && evenplate[4].length !== 0">
              <span v-for="(item,index) in evenplate[4]" v-bind:key="index">
                <template v-if="index === showNumber">
                  <span class="pointer eplies" @click="changeModal(4)">...
                    <template v-if="modal[4]">
                      <div class="modal-continue">
                        <span v-for="(item2,index2) in evenplate[4]" v-bind:key="index2">
                          <template v-if="index2 >= showNumber">
                            <span :title="setTitle(getStockName(item2['stockcode']))" class="modal-text pointer" @click="go2TimeLine(item2['stockcode'],'lianban')">{{splitText(getStockName(item2['stockcode']),4)}}</span>
                          </template>
                        </span>
                      </div>
                    </template>
                  </span>
                </template>
                <template v-else-if="index < showNumber">
                  <span :title="setTitle(getStockName(item['stockcode']))" class="text pointer" @click="go2TimeLine(item['stockcode'],'lianban')">{{getStockName(item['stockcode'])}}</span>
                </template>
              </span>
            </template>
            <template v-else>
              <span>暂无</span>
            </template>

          </div>
          <div class='lianbanSub'>
            <span class="title">三连板：</span>
            <template v-if="typeof evenplate[3] === 'object' && evenplate[3].length !== 0">
              <span v-for="(item,index) in evenplate[3]" v-bind:key="index">
                <template v-if="index === showNumber">
                  <span class="pointer eplies" @click="changeModal(3)">...
                    <template v-if="modal[3]">
                      <div class="modal-continue">
                        <span v-for="(item2,index2) in evenplate[3]" v-bind:key="index2">
                          <template v-if="index2 >= showNumber">
                            <span :title="setTitle(getStockName(item2['stockcode']))" class="modal-text pointer" @click="go2TimeLine(item2['stockcode'],'lianban')">{{splitText(getStockName(item2['stockcode']),4)}}</span>
                          </template>
                        </span>
                      </div>
                    </template>
                  </span>
                </template>
                <template v-else-if="index < showNumber">
                  <span :title="setTitle(getStockName(item['stockcode']))" class="text pointer" @click="go2TimeLine(item['stockcode'],'lianban')">{{getStockName(item['stockcode'])}}</span>
                </template>
              </span>
            </template>
            <template v-else>
              <span>暂无</span>
            </template>

          </div>
          <div class='lianbanSub'>
            <span class="title">二连板：</span>
            <template v-if="typeof evenplate[2] === 'object' && evenplate[2].length !== 0">
              <span v-for="(item,index) in evenplate[2]" v-bind:key="index">
                <template v-if="index === showNumber">
                  <span class="pointer eplies" @click="changeModal(2)">...
                    <template v-if="modal[2]">
                      <div class="modal-continue">
                        <span v-for="(item2,index2) in evenplate[2]" v-bind:key="index2">
                          <template v-if="index2 >= showNumber">
                            <span :title="setTitle(getStockName(item2['stockcode']))" class="modal-text pointer" @click="go2TimeLine(item2['stockcode'],'lianban')">{{splitText(getStockName(item2['stockcode']),4)}}</span>
                          </template>
                        </span>
                      </div>
                    </template>
                  </span>
                </template>
                <template v-else-if="index < showNumber">
                  <span :title="setTitle(getStockName(item['stockcode']))" class="text pointer" @click="go2TimeLine(item['stockcode'],'lianban')">{{getStockName(item['stockcode'])}}</span>
                </template>

              </span>
            </template>
            <template v-else>
              <span>暂无</span>
            </template>
            <!-- <span class="text">{{evenplate['2'][0]['stockname']}}</span> -->
            <!-- <span class="text">{{evenplate['2'][1]['stockname']}}</span> -->

          </div>

        </div>
        <div class="subtitle pb-5">最赚钱板块与个股（十日收益）</div>
        <div class="tenDaysWrap">

          <div class="tenDays">
            <div class="tenDaysSub" v-for="item in popstockPlate" :key="item.id">
              <span :title="setTitle(getStockName(item['platecode']))" class="pointer" @click="go2TimeLine(item['platecode'],'mostEffect')">{{splitText(getStockName(item.platecode),3,1)}}</span>
              <span :class="toFixed(item.earningsrate)['color']">{{toFixed(item.earningsrate)['num']}}%</span>
            </div>
          </div>
          <div class="tenDays">
            <div class="tenDaysSub" v-for="item in popstockStock" :key="item.id">
              <span :title="setTitle(getStockName(item['stockcode']))" class="pointer" @click="go2TimeLine(item['stockcode'],'mostEffect')">{{splitText(getStockName(item.stockcode),3,1)}}</span>
              <span :class="toFixed(item.earningsrate)['color']">{{toFixed(item.earningsrate)['num']}}%</span>
            </div>

          </div>
        </div>
      </div>
      <div class="main-container" v-else>
        <div class="zhangting-gailan">
          <span class="zt-title" :class="{changeWhite:theme}">近10日涨/跌停概览</span>
          <limit-overview @getTitle="getMMDD" :allresults="allResults"></limit-overview>
        </div>
        <div class="zhangdie-analyse">
          <span class="zd-title" :class="{changeWhite:theme}">{{limitTime.slice(4,6)}}-{{limitTime.slice(6)}}
            <span v-if="limitTime === today">(今日)</span>市场涨跌分析</span>
          <diagram-ring class="ring" :allresults="allResults" :limittime="limitTime"></diagram-ring>
        </div>
        <div class="single-analyse">
          <span class="zd-title" :class="{changeWhite:theme}">{{limitTime.slice(4,6)}}-{{limitTime.slice(6)}}
            <span v-if="limitTime === today">(今日)</span>板块个股涨停前五</span>
          <singleton-stock :allresults="allResults" :limittime="limitTime"></singleton-stock>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import cardTitle from "@/components/card/cardTitle.vue";

import cardSwitch from "@/components/card/cardSwitch.vue";
import limitOverview from "@/components/G2/limitOverview.vue";

import diagramRing from "@/components/G2/diagramRing.vue";
import singletonStock from "@/components/G2/singletonStock.vue";
import transactionInfoVue from "../G2/transactionInfo.vue";

export default {
  name: "profitMakingEffect",
  created() {
    var self = this;

    // 全局请求，获得数据

    self.getData();
    this.timers = setInterval(self.getData(), 60000);
    eventBus.$on("toggleSelectItem", function() {
      // console.log('重新请求数据')
      self.getData();
    });

    eventBus.$on("persistent", function(val) {
      self.persistent = val;
    });

    self.interval = setInterval(function() {
      self.update();
    }, 30000);
    self.update();
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  components: {
    "card-title": cardTitle,
    "card-switch": cardSwitch,
    "limit-overview": limitOverview,
    "diagram-ring": diagramRing,
    "singleton-stock": singletonStock
  },
  mounted() {
    var self = this;

    // 全局请求，获得数据

    document.body.onclick = function(e) {
      if (e.target.className.indexOf("eplies") < 0) {
        for (let key of Object.keys(self.modal)) {
          self.$set(self.modal, key, false);
        }
      }
    };
    if (parseInt($(".main-container").css("width")) > 280) {
      self.showNumber = 3;
      $(".lianbanSub .title").width("20%");
    } else {
      self.showNumber = 2;
      $(".lianbanSub .title").width(55);
    }
    $(window).resize(function() {
      if (parseInt($(".main-container").css("width")) > 280) {
        self.showNumber = 3;
        $(".lianbanSub .title").width("20%");
      } else {
        self.showNumber = 2;
        $(".lianbanSub .title").width(55);
      }
    });
  },
  computed: {
    persistentValue: function() {
      var self = this;
      var result = "";
      if (self.persistent === "") {
        result = "暂无数据";
      } else if (self.persistent <= 4) {
        result = "持续性极差";
      } else if (self.persistent > 4 && self.persistent <= 7) {
        result = "持续性一般";
      } else if (self.persistent >= 8 && self.persistent <= 10) {
        result = "持续性良好";
      } else if (self.persistent >= 11 && self.persistent <= 15) {
        result = "持续性极好";
      }
      return result;
    },
    persistentPercent: function() {
      var self = this;
      var result = 0;
      if (self.persistent === "" || self.persistent === 0) {
        result = 0;
      } else {
        result = self.persistent / 15 * 100;
      }
      return result;
    },
    theme: function() {
      if (window.theme === "black") {
        return false;
      } else {
        return true;
      }
    },
    clientType: function() {
      if (window.clientType === 2) {
        return true;
      } else {
        return false; // 这里到后面可以进行设置权限为false
      }
    }
  },
  data() {
    return {
      url: "http://l2.10jqka.com.cn",
      persistent: "",
      yearshotblock: [],
      evenplate: {},
      popstockPlate: [],
      popstockStock: [],
      continuteCode: {},
      pushTime: "",
      preHotBlock: [],
      preHotPlate: {}, //昨日热门的3个板块
      quoteSessionId: "",
      modal: { 2: false, 3: false, 4: false },
      interval: null,
      showNumber: 2,
      sWitch: false,
      today: "05-09",
      limitTime: "05-09",
      allResults: {},
      timers: null
    };
  },
  methods: {
    getData: function() {
      let self = this;
      $.ajax({
        type: "GET",
        url: "http://l2.10jqka.com.cn/hottrack/api/getmarketstatetest",
        dataType: "json",
        xhrFields: {
          withCredentials: true
        },
        data: {
          "client-type": window.clientType
        },
        success: function(data) {
          // console.log(typeof data.result)
          let length = Object.keys(data.result).length;
          if (length !== 0) {
            let temp = Object.keys(data.result)[length - 1].slice(0, 4);
            self.today = Object.keys(data.result)[length - 1];
            self.limitTime = Object.keys(data.result)[length - 1];
            self.allResults = data.result;
            // console.log(self.allResults)
          }
        }
      });
    },
    update: function() {
      var self = this;
      self
        .$http({
          method: "get",
          url: self.url + "/hottrack/api/getHotMoney"
        })
        .then(function(response) {
          //昨日热点今日涨幅
          self.yearshotblock = response.data.result.yearshotblock;
          self.preHotBlock = [];
          for (let hotblock of self.yearshotblock) {
            self.preHotBlock.push(hotblock["platecode"]);
          }

          // if(!self.quoteSessionId && self.preHotBlock.length !== 0){
          self.registerPush(self.preHotBlock);
          // }

          if (self.preHotBlock.length == 0) {
            // self.preHotBlock = ["000001"];
            self.preHotPlate = {};
          } else {
            window.API.use({
              method: "Quote.request",
              data: {
                code: self.preHotBlock,
                type: ["NEW", "PRE", "zhangdiefu"],
                period: "now"
              },
              callbackName: "onready",
              success: function(data) {
                window.API.use({
                  method: "Quote.getData2",
                  data: {
                    code: self.preHotBlock,
                    type: ["NEW", "PRE", "zhangdiefu"],
                    period: "now",
                    mode: "after"
                  },
                  success: function(data) {
                    if (data) {
                      self.preHotPlate = JSON.parse(data);
                    }
                  }
                });
              }
            });
          }

          //连板数据渲染
          let evenArr = [];
          for (let key in response.data.result.evenplate) {
            if (Number(key) > 3) {
              evenArr = evenArr.concat(response.data.result.evenplate[key]);
            }
          }
          response.data.result.evenplate[4] = evenArr;
          self.evenplate = response.data.result.evenplate;
          let stockCodeArr = [];
          for (let key of Object.keys(self.evenplate)) {
            for (let stock of self.evenplate[key]) {
              stockCodeArr.push(stock["stockcode"]);
            }
          }
          self.popstockPlate = response.data.result.popstock.plate;
          self.popstockStock = response.data.result.popstock.stock;

          //近十日涨幅个股和板块数据渲染
          for (let plate of self.popstockPlate) {
            stockCodeArr.push(plate["platecode"]);
          }
          for (let stock of self.popstockStock) {
            stockCodeArr.push(stock["stockcode"]);
          }
          Acme.getClientData(
            {
              code: stockCodeArr,
              type: ["NEW", "ZQMC"],
              period: "now",
              mode: "after"
            },
            function(data) {
              // console.log(data)
              self.continuteCode = data;
            }
          );
        })
        .catch(function(err) {
          console.log(err.message);
        });
    },

    go2TimeLine: function(code, type) {
      Acme.go2TimeLine(code);
      if (type == "yesterday") {
        TA.log({ id: "L2rdzz_5a77faca_158" });
      } else if (type == "lianban") {
        TA.log({ id: "L2rdzz_5a77fb0b_754" });
      } else if (type == "mostEffect") {
        TA.log({ id: "L2rdzz_5a77fb4a_38" });
      }
    },
    setTitle: function(platename) {
      if (platename != "undefined" && platename.length > 4) {
        return platename;
      }
      return "";
    },
    toFixed: function(num) {
      num = parseFloat(num);
      var obj = { color: "", num: "--" };
      if (num > 0) {
        obj.num = "+" + num.toFixed(2);
        obj.color = "red";
      } else if (num < 0) {
        obj.num = num.toFixed(2);
        obj.color = "green";
      } else if (num === 0) {
        obj.num = num.toFixed(2);
      }
      return obj;
    },
    getZF: function(stock) {
      if (stock) {
        stock["PRE"] = parseFloat(stock["PRE"]);
        stock["NEW"] = parseFloat(stock["NEW"]);

        let result;
        if (stock["zhangdiefu"]) {
          result = stock["zhangdiefu"];
        } else {
          result =
            stock["PRE"] && stock["PRE"] !== "NUL"
              ? (stock["NEW"] - stock["PRE"]) / stock["PRE"] * 100
              : "--";
        }

        return this.toFixed(result);
      } else {
        return "--";
      }
    },
    getStockName(stockcode) {
      var self = this;
      if (self.continuteCode[stockcode]) {
        return self.continuteCode[stockcode]["ZQMC"].replace(/\s/g, "");
      } else {
        return "--";
      }
    },
    changeModal: function(type) {
      var self = this;
      for (let key of Object.keys(self.modal)) {
        this.$set(self.modal, key, false);
      }
      this.$set(self.modal, type, true);
    },
    /**
     * 截取字符串，保留几个文字，超出用点表示
     */
    splitText: function(text, length = 4, type = 0) {
      var textLength = text.length;
      if (type === 1) {
        if (textLength > 4) {
          return text.substring(0, length) + "...";
        } else {
          return text;
        }
      }
      if (textLength > length) {
        return text.substring(0, length) + "...";
      } else {
        return text;
      }
    },
    registerPush(stockarr) {
      var self = this;
      if (stockarr.length === 0) return;
      self.pushTime = new Date().getTime();
      //解除推送
      window.API.use({
        method: "Quote.unregisterPush",
        sessionId: self.quoteSessionId //这里要传个sessionId，表明是解绑哪个对象的推送事件
      });
      //推送注册
      self.quoteSessionId = window.API.createSessionId("Quote");
      window.API.use({
        method: "Quote.registerPush",
        data: { code: stockarr.join(",") },
        sessionId: self.quoteSessionId,
        persistent: true,
        callbackName: "onready",
        success: function(data) {
          window.API.use({
            method: "Quote.getData2",
            data: {
              code: stockarr.join(","),
              type: ["NEW", "PRE", "zhangdiefu"],
              period: "now",
              mode: "after"
            },
            success: function(data) {
              if (data && new Date().getTime() - self.pushTime > 1000) {
                self.preHotPlate = JSON.parse(data);
              }
            }
          });
        }
      });
    },
    getMMDD: function(title) {
      // console.log(title, this.today, this.limitTime)
      this.limitTime = title;
    }
  },
  watch: {
    sWitch: function(nvl) {
      // 当nsWitch为false的时候，这时候需要提醒子组件，此时的时间应该为今日时间
      let self = this;
      if (nvl === false) {
        // console.log(self.limitTime, self.today);
        self.limitTime = self.today;
        self.timers = setInterval(self.getData, 60000);
      }

      if (nvl === true) {
        // 当switch为真得时候，需要清除定时器
        clearInterval(self.timers);
      }
    }
  }
};
</script>
<style scoped>
.main-container {
  background-color: #1b1b1b;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 12px;
}
.white .main-container {
  background-color: #fff;
}
.subtitle {
  width: 90%;
  height: 22px;
  line-height: 22px;
  color: white;
  text-align: left;
}
.white .subtitle {
  color: #3c3c3c;
}
.lastEffect {
  overflow: hidden;
  height: 49px;
  border-bottom: 1px solid #292929;
  margin-bottom: 5px;
}
.white .lastEffect {
  border-color: #eee;
}
.red {
  color: #d6524d;
}
.green {
  color: #1cbf7b;
}
.pb-5 {
  padding-bottom: 5px;
}
.progress {
  margin-top: 5px;
  height: 10px;
  background-color: #4c4c4c;
}
.white .progress {
  background-color: #e5e5e5;
}
.subProgress {
  width: 45%;
  height: 10px;
  background-color: #d59600;
}
.white .subProgress {
  background-color: #f8b551;
}
.lastCommend {
  margin-top: 5px;
  color: #7d7d7d;
}
.yesterdayZhangfu {
  height: 80px;
  border-bottom: 1px solid #292929;
  margin-bottom: 10px;
}
.white .yesterdayZhangfu {
  border-color: #eee;
}
.modal-continue {
  background: rgba(31, 31, 39, 0.9);
  text-align: center;
  color: #fff;
  width: 70px;
  /* height:105px; */
  max-height: 105px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 3px;
  position: absolute;
  bottom: 17px;
  left: 0;
  z-index: 99999;
  border-radius: 3px;
  overflow-y: auto;
  scrollbar-arrow-color: #c0c0c0;
  scrollbar-face-color: #3e4044;
  scrollbar-3dlight-color: #222;
  scrollbar-highlight-color: #000;
  scrollbar-shadow-color: #222;
  scrollbar-darkshadow-color: #222;
  scrollbar-track-color: #111;
  scrollbar-base-color: #555;
}
.modal-continue::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
.modal-continue::-webkit-scrollbar-corner {
  background: #526373;
}
.modal-continue::-webkit-scrollbar-thumb {
  background: #949ca5;
  height: 60px;
  border: 1px solid #526373;
  border-radius: 3px;
}
.modal-continue::-webkit-scrollbar-track-piece {
  background: #526373;
}

.modal-text {
  padding: 5px 0;
}
.zhangfuSub {
  color: #7d7d7d;
  text-align: left;
  height: 25px;
  line-height: 25px;
}
.zhangfuSub span {
  display: inline-block;
  width: 20%;
}
.zhangfuSub span:nth-child(1) {
  width: 30%;
}
.zhangfuSub span:nth-child(2) {
  text-align: center;
}
.zhangfuSub span:nth-child(4) {
  text-align: center;
}
.zhangfuSub span:nth-child(3) {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180208/right-black.svg");
  background-repeat: no-repeat;
  background-position: center center;
}
.lianban {
  width: 100%;
  height: 81px;
  border-bottom: 1px solid #292929;
  margin-bottom: 10px;
}
.white .lianban {
  border-color: #eee;
}
.lianbanSub {
  color: #7d7d7d;
  text-align: left;
  height: 25px;
  line-height: 25px;
}
.lianbanSub .text {
  display: inline-block;
  width: 63px;
}
.lianbanSub .title {
  display: inline-block;
  width: 55px;
}

.pointer {
  cursor: pointer;
}
.eplies {
  position: relative;
}
.tenDaysWrap {
  display: flex;
  justify-content: space-between;
}
.tenDays {
  margin-top: 5px;
  height: 76px;
  width: 50%;
  display: inline-flex;
  box-sizing: border-box;
  justify-content: space-between;
  flex-wrap: wrap;
}
.tenDaysSub {
  color: #7d7d7d;
  height: 25px;
  width: 100%;
  /* display: inline-flex; */
  /* justify-content:space-between;  */
  box-sizing: border-box;
  text-align: left;
  /* padding-right:5px;  */
}
.txt-r {
  text-align: right !important;
}
.nodata2 {
  height: 90px;
  line-height: 90px;
  color: #ababab;
  border-bottom: 1px solid #292929;
}
.white .nodata2 {
  border-color: #eee;
}
#profitMakingEffect {
  position: relative;
}

/* 新添加的样式 */
.title--top {
  width: 30% !important;
}

/*
  扩展css
*/

.card-switch {
  /* display: inline-block; */
  position: absolute;
  left: 100px;
  top: 8px;
}

.zhangting-gailan,
.zhangdie-analyse {
  width: 100%;
  height: 140px;
  position: relative;
  border-bottom: 1px solid rgb(47, 47, 47);
}

.zhangting-gailan {
  margin-top: 4px;
}

.zhangdie-analyse {
  height: 130px;
  padding-top: 20px;
}

.single-analyse {
  width: 100%;
  height: 100px;
  position: relative;
}

.zt-title,
.zd-title {
  position: absolute;
  left: 0;
  /* top: 10px; */
  color: white;
}

.zd-title {
  top: 10px;
}

/*新添加的信息*/
.changeWhite {
  color: #2c3e50;
}
</style>