<template>
  <div>
    <search></search>
    <div class="tableContainer" style="position:relative">
      <div id="blockListTop" class="blockList tableHeader">
        <table class="tableHead">
          <thead>
            <tr>
              <th v-for="(item,key) in tableHead" :width='item.width' :key="key" @click='sortBy(item.key,sortObj.sortOrder);maidian(item.key)'>{{item.name}}</th>
            </tr>
            <div v-if="sortObj.arrowShow" :style="arrowUpStyle"></div>
            <div v-if="sortObj.arrowShow" :style="arrowDownStyle"></div>
          </thead>
        </table>
      </div>
      <div id="fixedName">名称</div>
      <div id="listContainer">
        <div class="blockList" @mouseout="selectHover('0')">
          <table>
            <tbody>
              <tr v-for="(item,key) in hqData" :key="key" :class="{selected:item.key==selectedCode&&showSelectBlock,hoverStyle:item.key==hoverIndex}" @click="changeCode(item.key)" @dblclick="go2TimeLine(item.key)" @mouseover="selectHover(item.key)">
                <td width='100px'>{{item.zqmc}}</td>
                <td width='50px' :class="{cr:item.zhangdiefu>0 , cg:item.zhangdiefu<0}">{{format(item.zhangdiefu,'zhangdiefu')}}</td>
                <td width='80px'>
                  <span class="cr">{{format(item.risecount,'risecount')}}</span> /
                  <span class="cg">{{format(item.fallcount,'fallcount')}}</span>
                </td>
                <td width='50px' class="cr">{{format(item.riselimitcount,'riselimitcount')}}</td>
                <td width='75px' @click="go2TimeLine(item.ltggcode)">{{item.ltgg}}</td>
                <td width='75px' :class="{cr:item['592890']>0 ,cg:item['592890']<0}">{{format(item['592890'],'592890')}}</td>
                <td width='70px' :class="{cr:item['zhangshu']>0 , cg:item['zhangshu']<0}">{{format(item['zhangshu'],'zhangshu')}}</td>
                <td width='75px' :class="{cr:item['ZHANGFU_5D']>0 , cg:item['ZHANGFU_5D']<0}" class="pr-20">{{format(item['ZHANGFU_5D'],'ZHANGFU_5D')}}</td>
              </tr>
            </tbody>
          </table>
          <div id="nameHead">
            <div id="scroll-content">
              <table>
                <tbody>
                  <tr v-for="(item,key) in hqData" :key="key" :class="{selected:item.key==selectedCode&&showSelectBlock,hoverStyle:item.key==hoverIndex}" @click="changeCode(item.key)" @dblclick="go2TimeLine(item.key)">
                    <td width='100px'>{{item.zqmc}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <div class="hover-tip hover-tip-msg" id="hoverTipMsg">
        当前筛选列表中没有该板块
      </div>
    </div>

  </div>
</template>
<script>
import router from "@/router/index.js";
import search from "@/components/blockmaps/listSearch.vue";
export default {
  name: "blockList",
  components: {
    search: search
  },
  created() {
    eventBus.$on("blockCode", this.handle);
    eventBus.$on("selectStatus", this.renderScroll); //切换到右边的时候加载滚动条
    eventBus.$on("tab", this.handle2); //处理市场概览页面点击列表个股跳转
    eventBus.$on("moveToPlate", this.moveToPlate); //搜索跳转到板块
    eventBus.$on("showSelectBlock", this.checkSelectBlock); //点击概览时隐藏列表选中
    eventBus.$on("toggleSelectItem", this.updateSelect); //切换筛选
  },
  mounted() {
    var self = this;
    if (window.theme == "white") {
      $("#listContainer").niceScroll({
        cursorcolor: "#777",
        cursorborder: "1px solid #777", // 滚动条边框样式
        autohidemode: false,
        cursorwidth: "8px"
      });
    } else {
      $("#listContainer").niceScroll({
        cursorborder: "1px solid #424242", // 滚动条边框样式
        autohidemode: false,
        cursorwidth: "8px"
      });
    }
    document.getElementById("listContainer").onscroll = function(x) {
      var left = document.getElementById("listContainer").scrollLeft * -1;
      var top = document.getElementById("listContainer").scrollTop * -1;
      $("#blockListTop").css("margin-left", left);
      $("#scroll-content").css("margin-top", top);
    };
    self.getData();
  },
  beforeDestroy() {
    eventBus.$off("blockCode", this.handle);
    eventBus.$off("selectStatus", this.renderScroll);
    eventBus.$off("tab", this.handle2);
    eventBus.$off("moveToPlate", this.moveToPlate);
    eventBus.$off("showSelectBlock", this.checkSelectBlock);
    eventBus.$off("toggleSelectItem", this.updateSelect);
    clearInterval(this.interval);
  },
  data() {
    return {
      url: "http://l2.10jqka.com.cn",
      sortObj: {
        sortOrder: false,
        arrowShow: false
      },
      sortKey: "zhangdiefu",
      selectedCode: "",
      showSelectBlock: false,
      hoverIndex: "",
      arrowUpStyle: {
        height: 0,
        width: 0,
        borderTop: "4px solid transparent",
        borderLeft: "4px solid transparent",
        borderRight: "4px solid transparent",
        borderBottom: "4px solid white",
        position: "absolute",
        top: "6px"
      },
      arrowDownStyle: {
        height: 0,
        width: 0,
        borderTop: "4px solid white",
        borderLeft: "4px solid transparent",
        borderRight: "4px solid transparent",
        borderBottom: "4px solid transparent",
        position: "absolute",
        top: "16px"
      },
      tableHead: [
        {
          name: "名称",
          width: "100px",
          key: "zqmc"
        },
        {
          name: "涨幅%",
          width: "50px",
          key: "zhangdiefu"
        },
        {
          name: "涨跌数",
          width: "80px",
          key: "zhangdieshu"
        },
        {
          name: "涨停数",
          width: "50px",
          key: "riselimitcount"
        },
        {
          name: "龙头个股",
          width: "75px",
          key: "ltgg"
        },
        {
          name: "主力金额",
          width: "75px",
          key: "592890"
        },
        {
          name: "涨速%",
          width: "75px",
          key: "zhangshu"
        },
        {
          name: "5日涨幅%",
          width: "75px",
          key: "ZHANGFU_5D"
        }
      ],
      hqData: [],
      interval: null,
      location: 0 //在板块详情还是市场概览 0,1
    };
  },
  methods: {
    showTipMsg(msg) {
      if (msg) {
        $("#hoverTipMsg").fadeIn("normal", function() {
          $("#view_search_input")
            .attr("placeholder", "查找板块")
            .val("");
          $("#view_search_input")
            .siblings("i")
            .removeClass("delete");
          setTimeout(function() {
            $("#hoverTipMsg").fadeOut();
          }, 1800);
        });
      }
    },
    updateSelect() {
      this.getData();
    },
    checkSelectBlock(index) {
      if (index == 0) {
        this.showSelectBlock = false;
      } else {
        this.showSelectBlock = true;
      }
    },
    handle: function(val) {
      this.selectedCode = val;
    },
    handle2(val) {
      this.location = val;
    },
    moveToPlate(val) {
      const s = this;
      for (let i = 0; i < s.hqData.length; i++) {
        if (s.hqData[i].key === val) {
          setTimeout(function() {
            s.changeCode(val);
          }, 500);
          $("#listContainer")
            .getNiceScroll(0)
            .doScrollTop(30 * i, 0);
          s.selectedCode = val;
          break;
        }
        if (i == s.hqData.length - 1) {
          //遍历结束没有找到节点
          s.showTipMsg("抱歉：当前筛选列表中没有该板块");
        }
      }
      // console.log(this.hqData[0]);
    },
    selectHover: function(val) {
      this.hoverIndex = val;
    },
    maidian(key) {
      var self = this;
      if (key == "zqmc" || key == "ltgg" || key == "zhangdieshu") {
        return;
      } else if (key == "zhangdiefu") {
        TA.log({ id: "L2rdzz_5a77f088_580" });
      } else if (key == "huanshou") {
      } else if (key == "592890") {
        TA.log({ id: "L2rdzz_5a77f129_184" });
      } else if (key == "riselimitcount") {
        TA.log({ id: "L2rdzz_5a77f0d7_697" });
      } else if (key == "zhangshu") {
        TA.log({ id: "L2rdzz_5a77f17d_747" });
      } else if (key == "ZHANGFU_5D") {
        TA.log({ id: "L2rdzz_5a77f1b4_625" });
      }
      $("#listContainer")
        .getNiceScroll(0)
        .doScrollTop(0, 100);
    },
    renderScroll(val) {
      if (val === 1) {
        setTimeout(function() {
          $("#listContainer")
            .getNiceScroll()
            .resize();
        }, 500);
      }
    },
    getData: function() {
      var self = this;
      $.ajax({
        url: self.url + "/hottrack/service/stocklead",
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
        success: function(data) {
          var platecodes = [];
          var stocktaps = [];
          var mappingTable = {};
          for (var i = 0; i < data.result.length; i++) {
            mappingTable[data.result[i].platecode] = data.result[i];
            // mappingTable[data.result[i].platecode]=data.result[i].stockcode;
            platecodes.push(data.result[i].platecode);
            stocktaps.push(data.result[i].stocktap);
          }
          if (self.interval) {
            clearInterval(self.interval);
          }
          self.interval = setInterval(function() {
            Acme.getHqData(
              {
                code: platecodes,
                type: [
                  "zqmc",
                  "zhangdiefu",
                  "risecount",
                  "fallcount",
                  "riselimitcount",
                  "592890",
                  "zhangshu",
                  "wrzf",
                  "ZHANGFU_5D"
                ],
                period: "now",
                mode: "after"
              },
              function(data) {
                self.renderListData(data, mappingTable);
              }
            );
          }, 5000);
          Acme.getHqData(
            {
              code: platecodes,
              type: [
                "zqmc",
                "zhangdiefu",
                "risecount",
                "fallcount",
                "riselimitcount",
                "592890",
                "zhangshu",
                "wrzf",
                "ZHANGFU_5D"
              ],
              period: "now",
              mode: "after"
            },
            function(data) {
              self.renderListData(data, mappingTable);
            }
          );
        }
      });
    },
    renderListData: function(data, mappingTable) {
      var self = this;
      var sortArr = [];
      try {
        for (var key in data) {
          let element = {};
          element.key = key;
          element.zqmc = data[key].zqmc;
          element.zhangdiefu = data[key].zhangdiefu;
          element.risecount = data[key].risecount;
          element.fallcount = data[key].fallcount;
          element.riselimitcount = data[key].riselimitcount;
          element["592890"] = Number(data[key]["592890"]);
          element["zhangshu"] = data[key]["zhangshu"];
          element["ZHANGFU_5D"] = data[key]["ZHANGFU_5D"];
          element.ltgg = mappingTable[key].stocktap;
          element.ltggcode = mappingTable[key].stockcode;
          sortArr.push(element);
        }
      } catch (e) {
        console.log(e.message);
      }
      self.hqData = sortArr;

      self.sortBy(self.sortKey, "notchange");
      self.renderScroll(1);
      // if (window.theme === 'white') {
      //   console.log('white')
      //   $('#listContainer tbody tr').css({
      //     'border-bottom': '1px solid #595959'
      //   })
      // } else {
      //   $('#listContainer tbody tr').css({
      //     'border-bottom': '1px solid #282828'
      //   })
      // }
    },
    format: function(num, type) {
      if (num == "NUL" || isNaN(num)) {
        return "--";
      }

      if (
        type == "risecount" ||
        type == "fallcount" ||
        type == "riselimitcount"
      ) {
        return num;
      }
      if (type == "new") {
        return Acme.toFixed(num, 2);
      } else if (
        type == "zhangdiefu" ||
        type == "ZHANGFU_5D" ||
        type == "zhangshu"
      ) {
        if (num > 0) {
          return "+" + Acme.toFixed(num, 2);
        } else {
          return Acme.toFixed(num, 2);
        }
      } else if (type == "huanshou") {
        return Acme.toFixed(num, 2);
      } else if (type == "592888") {
        return Acme.toFixed(num, 2);
      } else if (type == "592890") {
        if (Math.abs(num) > 10000000) {
          return Acme.toFixed(num / 100000000, 2) + "亿";
        } else if (Math.abs(num) > 10000) {
          return Acme.toFixed(num / 10000, 2) + "万";
        }
      }
    },
    sortBy: function(key, order) {
      var self = this;
      if (key == "zqmc" || key == "ltgg" || key == "zhangdieshu") {
        return;
      } else if (key == "zhangdiefu") {
        self.arrowDownStyle.left = "142px";
        self.arrowUpStyle.left = "142px";
      } else if (key == "huanshou") {
        self.arrowDownStyle.left = "225px";
        self.arrowUpStyle.left = "225px";
      } else if (key == "592890") {
        self.arrowDownStyle.left = "407px";
        self.arrowUpStyle.left = "407px";
      } else if (key == "riselimitcount") {
        self.arrowDownStyle.left = "255px";
        self.arrowUpStyle.left = "255px";
      } else if (key == "zhangshu") {
        self.arrowDownStyle.left = "480px";
        self.arrowUpStyle.left = "480px";
      } else if (key == "ZHANGFU_5D") {
        self.arrowDownStyle.left = "550px";
        self.arrowUpStyle.left = "550px";
      }
      // console.log(key,order);
      if (order !== "notchange") {
        self.sortObj.arrowShow = true;
        // self.sortObj.sortOrder = self.$set(self.sortObj,'sortOrder',!self.sortObj.sortOrder);
        self.sortObj.sortOrder = !order;
        self.sortKey = key || "zhangdiefu";
        self.hqData = Object.assign([], Acme.sort(this.hqData, !order, key));
      } else {
        order = self.sortObj.sortOrder;
        self.hqData = Object.assign([], Acme.sort(this.hqData, order, key));
      }

      // Acme.sort(this.hqData,order,key);
    },
    go2TimeLine: function(code) {
      Acme.go2TimeLine(code);
    },
    changeCode: function(code) {
      if (code == this.selectedCode && this.location == 1) {
        return;
      }
      var self = this;
      router.push("/blockDetail");
      self.location = 0;
      self.selectedCode = code;
      eventBus.$emit("ListStatus", code); //将板块列表状态传递到父级...然后形成了一个循环 板块列表->父级->板块地图->板块列表
      setTimeout(function() {
        eventBus.$emit("blockCode", code);
      }, 300);
      eventBus.$emit("url", 0);
      self.checkSelectBlock(1);
      TA.log({ id: "L2rdzz_5a77f1f8_499" });
    }
  }
};
</script>
<style scoped>
* {
  box-sizing: border-box;
}

#listContainer {
  width: 305px;
  height: 455px;
}

.blockList table tr .pr-20 {
  padding-right: 20px;
}

table {
  border-collapse: collapse;
  width: 560px;
}

.tableHeader {
  overflow: hidden;
}

.blockList table tr th {
  font-size: 12px;
  color: #a0a0a0;
  text-align: right;
  font-weight: normal;
  padding-right: 12px;
  height: 28px;
  line-height: 28px;
  cursor: pointer;
}

.blockList table tr th:nth-child(1) {
  text-align: left;
  padding-left: 12px;
  cursor: default;
  padding-right: 0px;
  /* visibility: hidden; */
}

.blockList table tr th:nth-child(3) {
  cursor: default;
}

.blockList table tr td {
  /* box-sizing: border-box; */
  font-size: 12px;
  color: white;
  text-align: right;
  padding-right: 12px;
  font-weight: normal;
  cursor: default;
  height: 27px;
  line-height: 27px;
}

.blockList table tr td:nth-child(1) {
  text-align: left;
  padding-left: 12px;
  /* visibility: hidden;    */
  padding-right: 0px;
  /* padding-right: 0;  */
}

.blockList table tr td:nth-child(5):hover {
  text-decoration: underline;
  cursor: pointer;
}

.tableHead {
  position: relative;
}
.tableHead tr {
  background: #2a2a2a;
}
.white .tableHead tr {
  background: #434343;
}

.blockList .cr {
  color: #d6524d;
}

.blockList .cg {
  color: #1cbf7b;
}

#listContainer .selected {
  background-color: #0d2a4a;
}

.white #listContainer .selected {
  background-color: #354c82;
}

#nameHead {
  position: absolute;
  top: 30px;
  width: 97px;
  height: 487px;
  overflow: hidden;
  background-color: #1b1b1b;
}

.white #nameHead {
  background-color: #4a4a4a;
}

#nameHead table tr td:nth-child(1) {
  visibility: visible;
}

.hoverStyle {
  background-color: #333333;
}

.white .hoverStyle {
  background-color: #595959;
}

#fixedName {
  width: 97px;
  background-color: #2a2a2a;
  position: absolute;
  top: 0px;
  font-size: 12px;
  color: #a0a0a0;
  text-align: left;
  font-weight: normal;
  padding-right: 12px;
  padding-left: 12px;
  height: 28px;
  line-height: 28px;
  cursor: default;
}

.white #fixedName {
  background-color: #434343;
}

/* 新添加的样式*/
tbody tr {
  border-bottom: 1px solid #282828;
}

.white tbody tr {
  border-bottom: 1px solid #595959;
}

.hover-tip-msg {
  position: absolute;
  display: none;
  width: 160px;
  background: #fff;
  padding: 5px 9px;
  border: 1px solid #7d7d7d;
  border-radius: 6px;
  cursor: default;
  font-size: 12px;
  border: 1px solid #ac0000;
  color: #ac0000;
  left: 50%;
  margin-left: -80px;
  top: 100px;
}
</style>
