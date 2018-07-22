<template>
  <div style="position:relative">
    <card-title cardtitle='今日热点'></card-title>
    <div class="hotSpotContainer">
      <div class="left">
        <div class="title">强势热点</div>
        <div class="content-wrap" v-if="timeType != 'waitTime' && stronghotinfo!='' && stronghotinfo.length !== 0">
          <div class="blockname" v-for="(item,index) in stronghotinfo" :key="index" :class="{'active':index==activeHotPlate}" @dblclick="go2TimeLine(item.key)" @click="changeActive(index,'activeHotPlate')">
            <span :title='item.platename' v-if="item.platename.length>4">{{item.platename.slice(0,3)+'...'}}</span>
            <span v-else>
              {{item.platename}}
            </span>
          </div>
          <div class="contentDetail">
            <div class="info-title">领涨股：</div>
            <div class="info-title">白马股：</div>
            <div class="info-title">潜力股：</div>
            <div class="info">
              <div @click="gotoTimeLine(stronghotinfo[activeHotPlate].leadstock[0].stockcode,'hotPlate')">{{stronghotinfo[activeHotPlate].leadstock[0].stockname}}</div>
              <div @click="gotoTimeLine(stronghotinfo[activeHotPlate].leadstock[1].stockcode,'hotPlate')">{{stronghotinfo[activeHotPlate].leadstock[1].stockname}}</div>
            </div>
            <div class="info">
              <div @click="gotoTimeLine(stronghotinfo[activeHotPlate].whitehorsestock[0].stockcode,'hotPlate')">{{stronghotinfo[activeHotPlate].whitehorsestock[0].stockname}}</div>
              <div @click="gotoTimeLine(stronghotinfo[activeHotPlate].whitehorsestock[1].stockcode,'hotPlate')">{{stronghotinfo[activeHotPlate].whitehorsestock[1].stockname}}</div>
            </div>
            <div class="info">
              <div @click="gotoTimeLine(stronghotinfo[activeHotPlate].potentialstock[0].stockcode,'hotPlate')">{{stronghotinfo[activeHotPlate].potentialstock[0].stockname}}</div>
              <div @click="gotoTimeLine(stronghotinfo[activeHotPlate].potentialstock[1].stockcode,'hotPlate')">{{stronghotinfo[activeHotPlate].potentialstock[1].stockname}}</div>
            </div>
          </div>
        </div>
        <div v-else class="nodata">
          <div v-if="timeType != 'waitTime'">暂无明显热点</div>
          <div v-else>还未开盘，稍等片刻</div>
        </div>
      </div>
      <div class="right">
        <div class="title">强势回调
          <span class="tip" :ltip="message" ltip-pos="right">&nbsp;</span>
        </div>
        <div class="content-wrap" v-if="timeType != 'waitTime' && strongcallback!='' && strongcallback.length !== 0">
          <div class="blockname" v-for="(item,index) in strongcallback" :key="index" :class="{'active':index==activeCallbackPlate}" @dblclick="go2TimeLine(item.key)" @click="changeActive(index,'activeCallbackPlate')">
            <span :title="item.platename" v-if="item.platename.length>4">{{item.platename.slice(0,3)+'...'}}</span>
            <span v-else>
              {{item.platename}}
            </span>
            <!-- <template v-if="activeCallbackPlate !== '' ">
                    <span class="active">{{item.platename}}</span>
                  </template> -->

          </div>
          <div class="contentDetail">
            <div class="info-title">领涨股：</div>
            <div class="info-title">白马股：</div>
            <div class="info-title">潜力股：</div>
            <!-- <div v-for="i in strongcallback[c].leadstock.length" :key='i' >{{strongcallback['881157'].leadstock[i].stockname}}</div>   -->
            <div class="info">
              <div @click="gotoTimeLine(strongcallback[activeCallbackPlate].leadstock[0].stockcode,'strongCallback')">{{strongcallback[activeCallbackPlate].leadstock[0].stockname}}</div>
              <div @click="gotoTimeLine(strongcallback[activeCallbackPlate].leadstock[1].stockcode,'strongCallback')">{{strongcallback[activeCallbackPlate].leadstock[1].stockname}}</div>
            </div>
            <div class="info">
              <div @click="gotoTimeLine(strongcallback[activeCallbackPlate].whitehorsestock[0].stockcode,'strongCallback')">{{strongcallback[activeCallbackPlate].whitehorsestock[0].stockname}}</div>
              <div @click="gotoTimeLine(strongcallback[activeCallbackPlate].whitehorsestock[1].stockcode,'strongCallback')">{{strongcallback[activeCallbackPlate].whitehorsestock[1].stockname}}</div>
            </div>
            <div class="info">
              <div @click="gotoTimeLine(strongcallback[activeCallbackPlate].potentialstock[0].stockcode,'strongCallback')">{{strongcallback[activeCallbackPlate].potentialstock[0].stockname}}</div>
              <div @click="gotoTimeLine(strongcallback[activeCallbackPlate].potentialstock[1].stockcode,'strongCallback')">{{strongcallback[activeCallbackPlate].potentialstock[1].stockname}}</div>
            </div>
          </div>
        </div>
        <div class="nodata" v-else>
          <div v-if="timeType != 'waitTime'">暂无强势回调</div>
          <div v-else>还未开盘，稍等片刻</div>
        </div>
      </div>
    </div>
    <div class="comment" v-if="timeType != 'waitTime' && comment!=''">{{comment}}</div>
  </div>
</template>
<script>
import cardTitle from "@/components/card/cardTitle.vue";

export default {
  name: "hotSpotToday",
  components: {
    "card-title": cardTitle
  },
  created() {
    eventBus.$on("timeType", this.handle);
    eventBus.$on("toggleSelectItem", this.updateData);
  },
  mounted() {
    var self = this;
    if (self.timeType == "tradingTime") {
      self.getData();
    } else if (self.timeType == "waitTime") {
      self.getData();
    } else if (self.timeType == "notTradingDay") {
      self.getData();
    }

    // API.use({
    //     method: 'Quote.getServerTime',
    //     success: function(result) {
    //       var now=new Date(result*1000);
    //       // var now=new Date(1517534694*1000);
    //       var month=now.getMonth()>=9 ? now.getMonth()+1 : '0'+(now.getMonth()+1);
    //       var day=now.getDate()>=10 ? now.getDate() : '0'+now.getDate();
    //       var date=''+now.getFullYear()+month+day;
    //       cefClient.judgeTradingDay({
    //         date:date,
    //         success:function(tradingDay){
    //           if(tradingDay){
    //             if(now.getHours()==9 && now.getMinutes() >= 0 && now.getMinutes() < 25){
    //               var delayTime=(24-now.getMinutes())*60*1000+(60-now.getSeconds())*1000;//开盘剩余时间
    //               self.waitTime=true;
    //               self.getData();
    //               setTimeout(function() {
    //                 self.waitTime=false;
    //                 self.getData();
    //               }, delayTime);
    //             }else{
    //               self.waitTime=false;
    //               self.getData();
    //             }
    //           }//如果是交易日9点到9点25之间
    //           else{
    //               self.waitTime=false;
    //               self.getData();
    //           }
    //         }
    //       });
    //     }
    //   });

    self.interval = setInterval(function() {
      self.getData();
    }, 30000);
    // self.getData();
    LTip.reBind();
  },
  beforeDestroy() {
    eventBus.$off("timeType", this.handle);
    eventBus.$off("toggleSelectItem", this.updateData);
    clearInterval(this.interval);
  },
  data() {
    return {
      url: "http://l2.10jqka.com.cn",
      strongcallback: "",
      activeStrongPlate: "",
      activeCallbackPlate: "",
      activeHotPlate: "",
      stronghotinfo: "",
      hotstate: "",
      callbackcode: "",
      hotinfocode: "",
      comment: "",
      tradeDay: "",
      message: "最近活跃，但是当日<br/>出现大幅回调的板块。",
      interval: null,
      // waitTime:false
      timeType: "tradingTime",
      activeHotPlateCode: "",
      activeCallbackPlateCode: ""
    };
  },
  methods: {
    handle(val) {
      this.timeType = val;
    },
    updateData() {
      this.getData();
    },
    getData() {
      var self = this;
      Acme.getTime("yyyyMMdd", function(data) {
        Acme.getTradeDate(data, function(data) {
          self.tradeDay = data;
          $.ajax({
            url: self.url + "/hottrack/service/gethotareadata",
            xhrFields: {
              withCredentials: true
            },
            data: {
              date: data,
              // test: true,
              "client-type": window.clientType
            },
            dataType: "jsonp",
            success: function(data) {
              let response = { data: data };
              if (response.data.errorcode === 0) {
                self.stronghotinfo = [];
                for (var key in response.data.result.stronghotinfo) {
                  let obj = {};
                  obj.key = key;
                  obj["platename"] =
                    response.data.result.stronghotinfo[key].platename;
                  obj["increase"] =
                    response.data.result.stronghotinfo[key].increase;
                  obj["leadstock"] =
                    response.data.result.stronghotinfo[key].leadstock;
                  obj["whitehorsestock"] =
                    response.data.result.stronghotinfo[key].whitehorsestock;
                  obj["potentialstock"] =
                    response.data.result.stronghotinfo[key].potentialstock;
                  self.stronghotinfo.push(obj);
                  self.stronghotinfo = Acme.sort(
                    self.stronghotinfo,
                    false,
                    "increase"
                  );
                }
                // self.strongcallback=response.data.result.strongcallback,

                self.strongcallback = [];
                for (var key in response.data.result.strongcallback) {
                  let obj = {};
                  obj.key = key;
                  obj["platename"] =
                    response.data.result.strongcallback[key].platename;
                  obj["increase"] =
                    response.data.result.strongcallback[key].increase;
                  obj["leadstock"] =
                    response.data.result.strongcallback[key].leadstock;
                  obj["whitehorsestock"] =
                    response.data.result.strongcallback[key].whitehorsestock;
                  obj["potentialstock"] =
                    response.data.result.strongcallback[key].potentialstock;
                  self.strongcallback.push(obj);
                  self.strongcallback = Acme.sort(
                    self.strongcallback,
                    true,
                    "increase"
                  );
                }
                // console.log(self.strongcallback);
                // self.stronghotinfo=response.data.result.stronghotinfo,
                self.hotstate = response.data.result.hotstate;
                if (response.data.result.hotstate == 0) {
                  self.comment = "热点效应明显";
                } else if (response.data.result.hotstate == 1) {
                  self.comment = "热点效应一般";
                } else if (response.data.result.hotstate == 2) {
                  self.comment = "无明显热点";
                }

                //以下是rubbish代码
                if (self.stronghotinfo.length > 0) {
                  var exist0 = false;
                  for (let i = 0; i < self.stronghotinfo.length; i++) {
                    if (self.stronghotinfo[i].key == self.activeHotPlateCode) {
                      self.activeHotPlate = i;
                      exist1 = true;
                      break;
                    }
                  }
                  if (!exist0) {
                    self.activeHotPlate = 0;
                    self.activeHotPlateCode = self.stronghotinfo[0].key;
                  }
                }

                // for(let key in self.stronghotinfo){
                //   self.activeHotPlate=key;
                //   break;
                // }
                // for(let key in self.strongcallback){
                //   self.activeCallbackPlate=key;
                //   break;
                // }
                if (self.strongcallback.length > 0) {
                  var exist1 = false;
                  for (let i = 0; i < self.strongcallback.length; i++) {
                    if (
                      self.strongcallback[i].key == self.activeCallbackPlateCode
                    ) {
                      self.activeCallbackPlate = i;
                      exist1 = true;
                      break;
                    }
                  }
                  if (!exist1) {
                    self.activeCallbackPlate = 0;
                    self.activeCallbackPlateCode = self.strongcallback[0].key;
                  }
                }
              } else {
                console.log(self.stronghotinfo);
                console.log(self.strongcallback);
              }
            }
          });
        });
      });
    },
    go2TimeLine: function(code) {
      Acme.go2TimeLine(code);
    },
    changeActive(platecode, type) {
      var self = this;
      if (type == "activeHotPlate") {
        self.activeHotPlate = platecode;
        self.activeHotPlateCode = self.stronghotinfo[platecode].key;
        TA.log({ id: "L2rdzz_5a77f9d6_49" });
      } else if (type == "activeCallbackPlate") {
        self.activeCallbackPlate = platecode;
        self.activeCallbackPlateCode = self.strongcallback[platecode].key;
        TA.log({ id: "L2rdzz_5a77fa2d_596" });
      }
    },
    splitText: function(text, length) {
      var textLength = text.length;
      if (textLength > length) {
        return text.substring(0, length) + "...";
      } else {
        return text;
      }
    },
    gotoTimeLine(code, type) {
      Acme.gotoTimeLine(code);
      if (type == "strongCallback") {
        TA.log({ id: "L2rdzz_5a77fa5d_65" });
      } else if (type == "hotPlate") {
        TA.log({ id: "L2rdzz_5a77fa01_607" });
      }
    }
  }
};
</script>
<style scoped>
.hotSpotContainer {
  height: 180px;
  background-color: #1b1b1b;
  display: flex;
}

.white .hotSpotContainer {
  background-color: white;
}

.left {
  height: 100%;
  width: 50%;
}

.right {
  height: 100%;
  width: 50%;
}

.hotSpotContainer .title {
  color: white;
  font-size: 12px;
  height: 32px;
  line-height: 32px;
  text-align: left;
  margin-left: 10px;
  background-color: #1b1b1b;
}

.white .hotSpotContainer .title {
  background-color: #fff;
  color: #000;
}

.content-wrap {
  width: 90%;
  height: 134px;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  /*justify-content: space-between;*/
}

.nodata {
  border: 1px solid #393939;
  width: 90%;
  height: 134px;
  margin-left: 10px;
  text-align: center;
  color: #ababab;
  font-size: 12px;
  line-height: 134px;
}

.white .nodata {
  border-color: #ababab;
}

.content-wrap .active {
  width: calc(35% + 5px);
  background-color: #d6524a;
}

.white .content-wrap .active {
  background-color: #f16a4d;
  color: white;
}

.blockname {
  height: 28px;
  line-height: 28px;
  width: 35%;
  background-color: #393939;
  color: white;
  text-align: center;
  font-size: 12px;
  cursor: pointer;
  margin-bottom: 25px;
}

/* .blockname:nth-child(2){
    margin-bottom: 0px;
  } */

.blockname:nth-child(3) {
  margin-bottom: 0px;
}

.white .blockname {
  background-color: #e5e5e5;
  color: #8c8c8c;
}

.contentDetail {
  width: 63%;
  border: 1px solid #d6524a;
  height: 134px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: center;
}

.white .contentDetail {
  border-color: #f16a4d;
}

.info-title {
  height: 40px;
  padding-top: 5px;
  width: 50%;
  color: #ababab;
  font-size: 12px;
  text-align: right;
  /* margin-top: 4px;  */
}

.info {
  height: 40px;
  padding-top: 2px;
  line-height: 17px;
  width: 50%;
  color: #ababab;
  font-size: 12px;
  text-align: left;
  /* margin-top: 4px; */
}

.white .info-title {
  color: #7d7d7d;
}

.white .info {
  color: #7d7d7d;
}

.comment {
  position: absolute;
  height: 18px;
  line-height: 18px;
  width: 100px;
  top: 6px;
  left: 80px;
  font-size: 12px;
  border: 1px solid #d6524d;
  color: #d6524d;
  border-radius: 3px;
}

.info {
  cursor: pointer;
}

.tip {
  height: 30px;
  width: 26px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180208/tip-black.svg");
  background-repeat: no-repeat;
  background-position: center center;
  display: inline-block;
  position: relative;
}
</style>