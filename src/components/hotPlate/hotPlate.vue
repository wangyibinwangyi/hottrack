<template>
   <div style="height:100%;position:relative;">
     <card-title cardtitle='近日热门' class="card-title-plate"></card-title>
     <div class="table-title-plate">板块周期表
       <!-- <span class="table-select-title" v-on:click="showSelect" v-bind:class="{open:open}">{{checkThisValue}}</span>
       <ul class="table-select" id="tableSelect" v-if="isShowSelect">
         <li class="option" v-on:click="checkThis" valueType="concept">概念</li>
         <li class="option" v-on:click="checkThis" valueType="industry">行业</li>
       </ul> -->
     </div>
      <hot-plate-chart
        class="table"
        ref="hotplate"
        v-if="data&&data.qs.length"
        :data="data"
        :colors="colors"
        :defaultChoose="defaultChoose"
        :jumpFlag="jumpFlag"
        :colorStyle="colorStyle"
        :tableLHOffset="tableLHOffset"
        @use-scroll="nicescrollInit"
      ></hot-plate-chart>
      <div v-else class="no-date">
        暂无数据...
      </div>
   </div>
  
  
</template>
<script>
import cardTitle from "@/components/card/cardTitle.vue";
import { component as hotplate } from "@/lib/hotplate/hotplate";
export default {
  name: "hotPlate",
  components: {
    "card-title": cardTitle,
    "hot-plate-chart": hotplate.default
  },
  created() {
    var self = this;
    eventBus.$on("toggleSelectItem", self.getBlockData);
    //eventBus.$emit('persistent',persistent);
  },
  data() {
    return {
      tableLHOffset: -2,
      data: void 0,
      colors: {
        colorArr: ["#bf1f00", "#d59600", "#1b6ba5"],
        colorDefault: "#d6524d"
      },
      url: "http://l2.10jqka.com.cn",
      defaultChoose: 3,
      jumpFlag: "kline",
      open: false,
      checkThisValue: "概念",
      // isShowSelect: false,
      colorStyle: "black",
      niceScorllObj: null
    };
  },
  mounted() {
    const self = this;
    self.getBlockData();
    self.timer = setInterval(function() {
      // let type =
      // $(".table-select-title").html() == "概念" ? "concept" : "industry";
      self.getBlockData();
    }, 120000);
    // $("body")[0].addEventListener(
    //   "click",
    //   function() {
    //     //当点击其他地方时自定义下拉列表框隐藏和效果移除
    //     if ($("#tableSelect:visible").length) {
    //       self.isShowSelect = false;
    //     }
    //   },
    //   false
    // );
    if ($(".white").length) {
      self.colorStyle = "white";
    }
    $("#right-side-down")
      .on("mouseover", ".plate-list,#plate_table", function(e) {
        self.throwTalog(e);
      })
      .on("mouseleave", ".plate-list,#plate_table", function(e) {
        self.clearTalog(e);
      });
  },
  beforeDestroy() {
    var self = this;
    clearInterval(self.timer);
  },
  methods: {
    throwTalog(e) {
      var self = this;
      let type =
        e.currentTarget.id == "plate_table" ? "tableTaLog" : "topTaLog";
      if (self[type]) {
        return;
      }
      self[type] = setInterval(function() {
        if (type === "tableTaLog") {
          TA.log({ id: "L2rdzz_5a77fd25_544" });
        } else if (type === "topTaLog") {
          TA.log({ id: "L2rdzz_5a77fd54_55" });
        }
      }, 2000);
    },
    clearTalog(e) {
      var self = this;
      let type =
        e.currentTarget.id == "plate_table" ? "tableTaLog" : "topTaLog";
      if (self[type]) {
        clearInterval(self[type]);
        delete self[type];
      }
    },
    checkThis(el) {
      var self = this;
      self.checkThisValue = $(el.target).html();
      // self.isShowSelect = false;
      self.getBlockData();
      TA.log({ id: "L2rdzz_5a77fcfe_148" });
    },
    // showSelect(el) {
    //   var self = this;
    //   self.isShowSelect = true;
    // },
    getBlockData() {
      var self = this;
      var newData = [];
      $.ajax({
        url: self.url + "/hottrack/api/getcircleblocks",
        xhrFields: {
          withCredentials: true
        },
        success: function(data) {
          let response = { data: data };
          if (response.data.errorcode == 0) {
            //只取前100
            response.data.result.qs.splice(
              10,
              response.data.result.qs.length - 1
            );
            eventBus.$emit("persistent", response.data.result.persistent);
            // response.data.result.qs=response.data.result.rm.reverse();
            // var onlyOne = response.data.result.mrpm.down[0]["stocks"][0];
            // response.data.result.mrpm.down[0]["stocks"] = [];
            // response.data.result.mrpm.down[0]["stocks"].push(onlyOne);
            // console.log(response);
            self.data = response.data.result;
            if (self.data.qs.length == 0 && self.niceScorllObj) {
              self.niceScorllObj.hide();
              self.hideNiceScroll();
            }
          }
        }
      });
      // self
      //   .$http({
      //     method: "get",
      //     url: self.url + "/hottrack/api/getcircleblocks",
      //     xhrFields: {
      //       withCredentials: true
      //     }
      //   })
      //   .then(function(response) {
      //     if (response.data.errorcode == 0) {
      //       //只取前100
      //       response.data.result.qs.splice(
      //         10,
      //         response.data.result.qs.length - 1
      //       );
      //       eventBus.$emit("persistent", response.data.result.persistent);
      //       // response.data.result.qs=response.data.result.rm.reverse();
      //       // var onlyOne = response.data.result.mrpm.down[0]["stocks"][0];
      //       // response.data.result.mrpm.down[0]["stocks"] = [];
      //       // response.data.result.mrpm.down[0]["stocks"].push(onlyOne);
      //       // console.log(response);
      //       self.data = response.data.result;
      //     }
      //   })
      //   .catch(function(err) {
      //     console.log(err);
      //   });
    },
    hideNiceScroll() {
      const self = this;
      this.nicescrollTimers = setTimeout(function() {
        if ($("#" + self.niceScorllObj[0]["id"] + ":visible").length) {
          self.niceScorllObj.hide();
          self.hideNiceScroll();
        }
      }, 600);
    },
    nicescrollInit() {
      $(this.$el)
        .find("#plate_table")
        .niceScroll({
          cursorborder: "1px solid black", // 滚动条边框样式
          background: this.colorStyle,
          autohidemode: "leave"
        });
      this.niceScorllObj = $(this.$el)
        .find("#plate_table")
        .getNiceScroll();
    }
  }
};
</script>
<style scoped>
.table {
  min-height: 323px;
  height: calc(100% - 56px);
  width: 100%;
  position: relative;
  background: #1b1b1b;
  color: #7d7d7d;
  margin-top: 8px;
  font-size: 12px;
}
.white .table {
  background: #fff;
}
.card-title-plate {
  position: absolute;
  z-index: 20;
}
.table-title-plate {
  height: 30px;
  line-height: 36px;
  color: #fff;
}
.white .table-title-plate {
  color: #7d7d7d;
}
.table-select-title {
  font-size: 12px;
  border: 1px solid #7d7d7d;
  border-radius: 2px;
  height: 20px;
  line-height: 20px;
  display: inline-block;
  padding: 0 15px 0 5px;
  cursor: pointer;
  background: url(http://i.thsi.cn/images/level2/hottrack/20180208/select.png)
    no-repeat 33px 9px;
}
.table-title-plate .open {
  background: url(http://i.thsi.cn/images/level2/hottrack/20180208/select.png)
    no-repeat 33px -4px;
}
.table-select {
  width: 46px;
  position: absolute;
  cursor: pointer;
  font-size: 12px;
  top: 27px;
  left: calc(50% + 19px);
  color: #7d7d7d;
  border: 1px solid #7d7d7d;
  margin: 0;
  padding: 0;
  background: transparent;
  z-index: 10;
}
.table-select .option {
  clear: both;
  padding-left: 3px;
  line-height: 20px;
  cursor: pointer;
  list-style: none;
  text-align: left;
  background: #676767;
  color: #bcbcbc;
  user-select: none;
}
/* .white .table-select .option{
      background:#fff;
      color:#7d7d7d;
    } */
.table-select .option:hover {
  color: #fff;
}
/* .white .table-select .option:hover{
      color:#333;
    } */
.table-select:focus {
  color: #fff;
}
.no-date {
  width: 100%;
  color: #fff;
  margin-top: 195px;
}
</style>