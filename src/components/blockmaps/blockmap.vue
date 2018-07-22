/*
 * @Author: COCO 
 * @Date: 2018-01-17 20:59:31 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-06-13 14:45:12
 * 板块地图组件
 */
<template>
  <div id="blockmap" :class="bgColor">
    <div v-for="(item,index) in mapData" :key="index" class="block" :class="['block'+index,{'selectBlock':index==selectIndex&&showSelectBlock},item.platecode=='000000'?'emptyCode':'']" @click="changeBlockCode(item.platecode,index)" @dblclick="gotoTimeLine(item.platecode)">
      <div class="block-name">
        <div :title="item.platename" v-if="(index>=16&&index!=18||index==14)&&item.platename.length>4">{{item.platename.slice(0,3)+'...'}}</div>
        <div :title="item.platename" v-else-if="(index==18)&&item.platename.length>4">{{item.platename.slice(0,3)+'...'}}</div>
        <div v-else>{{item.platename}}</div>
      </div>
      <div class="detailinfo">
        <div class="div1">
          <span v-if="index==0" v-show="isEmptyMap&&item.platecode!='000000'">累计流入：</span>
          <span v-if="item.leijiliuru!=0&&index<3">{{format(item.leijiliuru,'leijiliuru')}}</span>
        </div>
        <div class="div2">
          <span v-if="index==0" v-show="isEmptyMap&&item.platecode!='000000'">今日涨幅：</span>
          <span v-if="item.zhangdiefu!=0&&(index<13&&index!=10||index==15)">{{format(item.zhangdiefu,'zhangdiefu')}}</span>
        </div>
      </div>
    </div>
    <div class="hover-tip" id="hoverTip">
      您重点关注的板块数量少于20个，请<span class="tip-btn" @click="openSelect()">前往添加</span>。
    </div>
  </div>
</template>
<script>
import router from "@/router/index.js";
export default {
  data() {
    return {
      firstRender: true,
      selectIndex: 0,
      selectBlock: null,
      url: "http://l2.10jqka.com.cn",
      requestInter: null,
      showSelectBlock: true,
      mapData: [],
      blocks: [],
      bgColor: "",
      isEmptyMap: true,
      twoMinutes: null,
      location: 0, //在板块详情还是市场概览 0,1
      timeType: "tradingTime",
      changeSelect: false,
      originData: null
    };
  },
  created() {
    var self = this;
    eventBus.$on("tab", self.handle);
    eventBus.$on("tomap", self.tomap);
    eventBus.$on("timeType", self.timeHandle);
    // eventBus.$on("showSelectBlock", self.checkSelectBlock);
    eventBus.$on("toggleSelectItem", self.updateSelect);
    // eventBus.$on('blockCode',self.changeStatus);
  },
  mounted() {
    var self = this;
    API.use({
      method: "Quote.getServerTime",
      success: function(result) {
        var now = new Date(result * 1000);
        // var now=new Date(1517534684*1000);
        var month =
          now.getMonth() >= 9 ? now.getMonth() + 1 : "0" + (now.getMonth() + 1);
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
                eventBus.$emit("timeType", "waitTime");
                self.update();
                self.twoMinutes = setInterval(() => {
                  self.update();
                }, 30000);
                setTimeout(function() {
                  eventBus.$emit("timeType", "tradingTime");
                  self.update();
                }, delayTime);
              } else if (now.getHours() < 9 || now.getHours() >= 15) {
                eventBus.$emit("waitTime", "notTradingTime");
                self.update();
              } else {
                eventBus.$emit("waitTime", "tradingTime");
                self.update();
                self.twoMinutes = setInterval(() => {
                  self.update();
                }, 30000);
              }
            } else {
              eventBus.$emit("waitTime", "notTradingDay");
              self.update();
            }
          }
        });
      }
    });

    //新增鼠标移入空白格子显示tip
    $("#blockmap")
      .on("mousemove", ".emptyCode", function(e) {
        $("#hoverTip").attr("style", "");
        if (e.pageX < 150) {
          $("#hoverTip").css({
            display: "block",
            left: e.pageX - 5
          });
        } else {
          $("#hoverTip").css({
            display: "block",
            right: 300 - e.pageX
          });
        }
        if (e.pageY > 400) {
          $("#hoverTip").css({
            top: e.pageY - 140
          });
        } else {
          $("#hoverTip").css({
            top: e.pageY - 90
          });
        }
      })
      .on("mouseleave", ".emptyCode,.hover-tip", function(e) {
        if (
          $(e.toElement).hasClass("hover-tip") ||
          $(e.toElement).hasClass("emptyCode")
        ) {
          return;
        }
        $("#hoverTip").hide();
      })
      .on("mousein", ".hover-tip", function() {
        $("#hoverTip").show();
      });
    // var now=new Date();
  },
  beforeDestroy() {
    eventBus.$off("timeType", this.timeHandle);
    eventBus.$off("blockCode", this.changeStatus);
    eventBus.$off("tab", this.handle);
    eventBus.$off("tomap", self.tomap);
    eventBus.$off("toggleSelectItem", self.updateSelect);
    // eventBus.$off("showSelectBlock", self.checkSelectBlock);
    clearInterval(this.requestInter);
    clearInterval(this.twoMinutes);
    // console.log('销毁了tab');
  },
  methods: {
    updateSelect() {
      this.changeSelect = true;
      this.update();
    },
    checkSelectBlock(index) {
      if (index == 0) {
        this.showSelectBlock = false;
      } else {
        this.showSelectBlock = true;
      }
    },
    openSelect() {
      eventBus.$emit("openSelect", true);
    },
    timeHandle(val) {
      this.timeType = val;
    },
    handle(val) {
      //处理板块详情和市场概览的点击
      var self = this;
      setTimeout(function() {
        eventBus.$emit("timeType", self.timeType);
      }, 300);
      if (val == 0) {
        self.location = 0;
        return;
      } else {
        self.location = 1;
      }
      setTimeout(function() {
        eventBus.$emit("blockCode", self.selectBlock);
      }, 300);
      // eventBus.$emit('url', 0);//点击某个板块时，通知header跳转到板块详情页面
    },
    tomap(val) {
      // console.log('tomap');
      var self = this;
      self.selectBlock = val;
      let index = Acme.inArray(val, self.blocks, true); // todo
      if (index === -1) {
        self.selectIndex = 0;
        eventBus.$emit("blockCode", self.blocks[0]);
      } else {
        self.selectIndex = index;
      }
    },
    changeStatus(val) {
      //板块列表点到板块地图时触发
      var self = this;
      self.selectBlock = val;
      let index = Acme.inArray(this.selectBlock, this.blocks, true); // todo
      if (index === -1) {
        this.selectIndex = 0;
        this.selectBlock = this.blocks[0];
        // eventBus.$emit('blockCode', this.blocks[0]);
      } else {
        this.selectIndex = index;
        // console.log(index);
      }
    },
    changeBlockCode(platecode, index) {
      var self = this;
      if (
        (platecode == this.selectBlock && this.location == 1) ||
        platecode == "000000"
      ) {
        //如果点击的板块和当前选中板块相同，则不改变状态，不通知其他组件
        return;
      }
      this.selectIndex = index;
      this.selectBlock = platecode;
      router.push("/blockDetail");
      self.location = 0;
      setTimeout(function() {
        window.timers = +new Date();
        eventBus.$emit("blockCode", platecode);
        eventBus.$emit("ListStatus", platecode);
        self.checkSelectBlock(1);
      }, 300);
      eventBus.$emit("url", 0); //
      TA.log({ id: "L2rdzz_5a77ef6f_845" });
      // eventBus.$emit('blockCode', platecode);//通知其他模块板块改变
    },
    emptyMap() {
      let sortArr = [];
      for (let a = 0; a < 20; a++) {
        sortArr.push({
          platecode: "000000",
          platename: "",
          zhangdiefu: 0,
          sortzhangdiefu: 0,
          leijiliuru: 0
        });
      }
      this.isEmptyMap = false;
      const blocks = [];
      Acme.each(sortArr, function(key, value) {
        blocks.push(value.platecode);
      });
      this.blocks = blocks;
      if (this.firstRender) {
        // eventBus.$emit("blockCode", sortArr[0].platecode);
        // index 默认为0
        this.selectBlock = sortArr[0].platecode;
        this.firstRender = false;
      } else {
        let index = Acme.inArray(this.selectBlock, this.blocks, true); // todo
        if (index === -1) {
          this.selectIndex = 0;
          this.selectBlock = sortArr[0].platecode;
        } else {
          this.selectIndex = index;
        }
      }

      this.mapData = sortArr;
    },
    //获取涨幅前十和后市板块
    update() {
      const self = this;
      clearInterval(this.requestInter);
      $.ajax({
        type: "get",
        url: this.url + "/hottrack/plate/queryplaterankinfo",
        // headers: {
        //   cookie: document.cookie
        // },
        xhrFields: {
          withCredentials: true
        },
        data: {
          "client-type": window.clientType
        },
        dataType: "jsonp",
        jsonp: "callback",
        success: function(data) {
          if (data.errorcode == 0) {
            eventBus.$emit("networkError", false);
            let resultData = data.result;
            if (data.result.length == 0) {
              self.emptyMap();
              return;
            }
            if (data.result.length < 20) {
              for (var i = 20 - resultData.length; i > 0; i--) {
                resultData.unshift({
                  increase: 0,
                  platecode: "000000",
                  platename: ""
                });
              }
            }
            if (self.timeType == "waitTime") {
              self.bgColor = "map-color-0";
            } else if (resultData[19].increase >= 0) {
              self.bgColor = "map-color-1";
            } else if (resultData[16].increase >= 0) {
              self.bgColor = "map-color-2";
            } else if (resultData[13].increase >= 0) {
              self.bgColor = "map-color-3";
            } else if (resultData[10].increase >= 0) {
              self.bgColor = "map-color-4";
            } else if (resultData[0].increase <= 0) {
              self.bgColor = "map-color-9";
            } else if (resultData[3].increase <= 0) {
              self.bgColor = "map-color-8";
            } else if (resultData[6].increase <= 0) {
              self.bgColor = "map-color-7";
            } else if (resultData[9].increase <= 0) {
              self.bgColor = "map-color-6";
            } else {
              self.bgColor = "map-color-5";
            }
            var blocks = [];
            self.originData = data.result;
            var renderCount = data.result.length < 20 ? data.result.length : 20;
            for (var i = 0; i < renderCount; i++) {
              blocks.push(data.result[i].platecode);
            }
            self.blocks = blocks;
            // console.log(blocks);
            self.getHqDataAndRerender();
            // lxc
            self.requestInter = setInterval(() => {
              self.getHqDataAndRerender();
            }, 5000);
          }
        }
      });

      // .catch(err => {
      //   console.log(err);
      // });
    },
    getHqDataAndRerender() {
      var self = this;
      Acme.getHqData(
        {
          code: this.blocks,
          type: [
            "zqmc",
            "zhangdiefu",
            "BIGBUYMONEY1",
            "BIGBUYMONEY2",
            "BIGBUYMONEY3",
            "BIGBUYMONEY4"
          ],
          period: "now",
          mode: "after"
        },
        data => {
          let sortArr = [];
          for (var key in data) {
            let sortzhangdiefu; //排序的涨跌幅，解决9点到9点15取到涨跌幅为NUL导致板块地图排序不对的问题
            if (data[key].zhangdiefu != "NUL") {
              sortzhangdiefu = data[key].zhangdiefu;
            } else {
              for (let i = 0; i < self.originData.length; i++) {
                if (key == self.originData[i].platecode) {
                  sortzhangdiefu = self.originData[i].increase;
                }
              }
            }

            sortArr.push({
              platecode: key,
              platename: data[key].zqmc,
              zhangdiefu: data[key].zhangdiefu,
              sortzhangdiefu: sortzhangdiefu,
              leijiliuru:
                Number(data[key].BIGBUYMONEY1) +
                Number(data[key].BIGBUYMONEY2) +
                Number(data[key].BIGBUYMONEY3) +
                Number(data[key].BIGBUYMONEY4)
            });
          }
          if (sortArr.length !== 20) {
            for (let a = sortArr.length; a < 20; a++) {
              sortArr.push({
                platecode: "000000",
                platename: "",
                zhangdiefu: 0,
                sortzhangdiefu: 0,
                leijiliuru: 0
              });
            }
          }

          sortArr = Acme.sort(sortArr, false, "sortzhangdiefu");
          const blocks = [];
          Acme.each(sortArr, function(key, value) {
            blocks.push(value.platecode);
          });
          var hasValueIndex = 0; //有数据的第一个板块
          $.each(sortArr, function(key, val) {
            if (val.platecode == "000000") {
              return true;
            } else {
              hasValueIndex = key;
              return false;
            }
          });
          this.blocks = blocks;
          if (this.firstRender) {
            eventBus.$emit("blockCode", sortArr[hasValueIndex].platecode);
            // index 默认为0
            this.selectBlock = sortArr[hasValueIndex].platecode;
            this.firstRender = false;
          } else {
            let index = Acme.inArray(this.selectBlock, this.blocks, true); // todo
            if (index === -1) {
              this.selectIndex = hasValueIndex;
              this.selectBlock = sortArr[hasValueIndex].platecode;
              // this.selectIndex = -1;
            } else {
              this.selectIndex = index;
            }
          }

          if (this.changeSelect) {
            eventBus.$emit("blockCode", this.selectBlock);
            this.changeSelect = false;
          }

          this.mapData = sortArr;
        }
      );
    },
    format(num, type) {
      if (num == "NUL" || isNaN(num)) {
        return "--";
      }
      if (type == "zhangdiefu") {
        if (num > 0) {
          return "+" + Acme.toFixed(num, 2) + "%";
        } else {
          return Acme.toFixed(num, 2) + "%";
        }
      } else if (type == "leijiliuru") {
        if (num > 100000000) {
          return "+" + Acme.toFixed(num / 100000000, 2) + "亿";
        } else if (num > 10000) {
          return Acme.toFixed(num / 10000, 2) + "万";
        }
      }
    },
    gotoTimeLine(code) {
      if (code == "000000") {
        return;
      }
      Acme.gotoTimeLine(code);
    }
  }
};
</script>

<style>
#blockmap {
  background-color: #1b1b1b;
  width: 305px;
  height: 515px;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  font-size: 12px;
}

.white #blockmap {
  background-color: #4a4a4a;
}

.map-color-0 {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/mapbg0.png");
}

.map-color-1 {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/mapbg1.png");
}

.map-color-2 {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/mapbg2.png");
}

.map-color-3 {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/mapbg3.png");
}

.map-color-4 {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/mapbg4.png");
}

.map-color-5 {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/mapbg5.png");
}

.map-color-6 {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/mapbg6.png");
}

.map-color-7 {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/mapbg7.png");
}

.map-color-8 {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/mapbg8.png");
}

.map-color-9 {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/mapbg9.png");
}

.block {
  position: absolute;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* border:1px green solid;  */
  background-color: rgba(255, 255, 255, 0);
  opacity: 1;
  color: white;
  font-size: 10px;
  font-family: "Microsoft Yahei";
}

.activeblock {
  border: 2px red solid;
  /* background-color: rgba(255, 255, 255, 0.2); */
}

.block:hover {
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.2);
  /* background-color: white;   */
}

.block0 {
  width: 140px;
  height: 161px;
  top: 12px;
  left: 10px;
  font-size: 20px;
}

.block span {
  font-size: 12px;
}

.block1 {
  font-size: 16px;
  width: 140px;
  height: 78px;
  top: 12px;
  left: 155px;
}

.block2 {
  font-size: 16px;
  width: 140px;
  height: 78px;
  top: 95px;
  left: 155px;
  font-size: 16px;
}

.block3 {
  width: 120px;
  height: 78px;
  top: 178px;
  left: 10px;
  font-size: 14px;
}

.block4 {
  width: 60px;
  height: 161px;
  top: 178px;
  left: 135px;
}

.block5 {
  width: 95px;
  height: 60px;
  top: 178px;
  left: 200px;
}

.block6 {
  width: 120px;
  height: 78px;
  top: 261px;
  left: 10px;
  font-size: 14px;
}

.block7 {
  width: 95px;
  height: 60px;
  top: 243px;
  left: 200px;
}

.block8 {
  width: 108px;
  height: 78px;
  top: 344px;
  left: 10px;
}

.block9 {
  width: 62px;
  height: 77px;
  top: 427px;
  left: 10px;
}

.block10 {
  width: 35px;
  height: 78px;
  top: 308px;
  left: 260px;
  /* border-color: red; */
}

.block11 {
  width: 55px;
  height: 78px;
  top: 308px;
  left: 200px;
  /* border-color: red; */
}

.block12 {
  width: 72px;
  height: 95px;
  top: 344px;
  left: 123px;
  /* border-color: red; */
}

.block13 {
  width: 42px;
  height: 77px;
  top: 427px;
  left: 77px;
  /* border-color: red; */
}

.block14 {
  width: 58px;
  height: 33px;
  top: 444px;
  left: 123px;
  /* border-color: red;  */
}

.block15 {
  width: 95px;
  height: 49px;
  top: 390px;
  left: 200px;
  /* border-color: red;  */
}

.block16 {
  width: 62px;
  height: 32px;
  top: 444px;
  left: 185px;
  /* border-color: red; */
}

.block17 {
  width: 64px;
  height: 25px;
  top: 480px;
  left: 123px;
  /* border-color: red; */
}

.block18 {
  width: 56px;
  height: 23px;
  top: 481px;
  left: 191px;
  /* border-color: red; */
}

.block19 {
  width: 44px;
  height: 60px;
  top: 444px;
  left: 251px;

  /* border-color: red; */
}

.selectBlock {
  font-weight: bold;
  border-width: 3px;
  border-color: rgba(255, 255, 255, 0.5);
  border-style: solid;
  background-color: rgba(255, 255, 255, 0.2);
}

/*新增没有数据的特殊显示*/
.emptyCode {
  background: #7d7d7d !important;
  cursor: default !important;
}
.hover-tip {
  position: absolute;
  display: none;
  width: 160px;
  top: 10px;
  background: #fff;
  padding: 5px 9px;
  border: 1px solid #7d7d7d;
  border-radius: 6px;
  cursor: default;
}
.tip-btn {
  color: #ff9e63;
  text-decoration: underline;
  cursor: pointer;
}
.tip-btn:hover {
  color: #ff6000;
  text-decoration: underline;
}
</style>

