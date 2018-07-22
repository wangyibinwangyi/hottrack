<template>
  <div id="left-side">
    <div class="second-nav">
        <div v-for="(item,index) in items" :key='item' @click='tabclick(index)' class="second-tab" :class='{active:index==selectStatus}'>{{item}}</div>
        <span class="filter-icon" v-bind:class="[{open:showSelectList},{iconactive:isNotDefault}]" @click="toggleSelectList"></span>
    </div>
    <ul class="select-list" v-show="showSelectList"> 
        <li class="select-item" @click="toggleSelectItem('industry')">
             <span class="select-checkbox"  v-bind:class="{checked:checkboxMark.industry}"></span> 行业
        </li>
        <li class="select-item" @click="toggleSelectItem('concept')">
             <span class="select-checkbox" v-bind:class="{checked:checkboxMark.concept}"></span> 概念
        </li>
        <li class="select-item" @click="toggleSelectItem('zone')">
            <span class="select-checkbox" v-bind:class="{checked:checkboxMark.zone}"></span> 地域
        </li>
        <li class="select-item" v-show="showConcern" @click="toggleSelectItem('concern')">
            <span class="select-checkbox" v-bind:class="{checked:checkboxMark.concern}"></span> 关注
        </li>
        <li class="select-icon" @click="openSelection" v-show="showConcern">

        </li>
    </ul>
    <div class=" tip-alert" id="mapAlertTip">

    </div>
    <!-- <router-view></router-view> -->
    <block-map v-show="show"></block-map>
    <block-list v-show="!show"></block-list>
    <div id="list2">
        <block-list2></block-list2>         
    </div>
  </div>
</template>
<script>
// import  blockmap from '@/components/blockmaps/blockmap.vue'
import router from "@/router/index.js";
import blockList2 from "@/components/blockmaps/blockList2.vue";
import blockmap from "@/components/blockmaps/blockmap.vue";
import blockList from "@/components/blockmaps/blockList.vue";
export default {
  name: "leftSide",
  components: {
    "block-list2": blockList2,
    "block-map": blockmap,
    "block-list": blockList
  },
  created() {
    eventBus.$on("ListStatus", this.handle);
    eventBus.$on("openSelect", this.openSelection);
    eventBus.$on("toggleSelectItem", this.checkConcern);
  },
  beforeDestroy() {
    eventBus.$off("openSelect", this.openSelection);
    eventBus.$off("ListStatus", this.handle);
    eventBus.$off("toggleSelectItem", this.checkConcern);
  },
  mounted() {
    var self = this;
    self.checkConcern();
    $(window).resize(function() {
      //当浏览器大小变化时
      if (document.body.clientHeight > 843) {
        var height = document.body.clientHeight - 50 + "px";
        $("#left-side").css("height", height);
      } else {
        $("#left-side").css("height", "855px");
      }
    });
    if (document.body.clientHeight > 843) {
      var height = document.body.clientHeight - 50 + "px";
      $("#left-side").css("height", height);
    } else {
      $("#left-side").css("height", "855px");
    }
  },
  data() {
    return {
      items: ["板块地图", "板块列表"],
      selectStatus: 0,
      show: true,
      showConcern: window.clientType == 2,
      checkboxMark: {
        industry: false,
        concept: false,
        zone: false,
        concern: false
      },
      hasConcern: false,
      timersTimeout: false,
      markLength: 0,
      url: "http://l2.10jqka.com.cn",
      showSelectList: true,
      mapSelect: "",
      isNotDefault: false, //默认筛选按钮样式
      listSelect: ""
    };
  },
  methods: {
    getChooseStatus() {
      const self = this;
      $.ajax({
        url: self.url + "/hottrack/plate/getchoosestatus",
        headers: {
          cookie: document.cookie
        },
        data: {
          "client-type": window.clientType
        },
        dataType: "jsonp",
        jsonp: "callback",
        success: function(data) {
          if (data.result.length == 0) {
            // 都没有选中
            $.each(self.checkboxMark, function(key, val) {
              self.checkboxMark[key] = true;
            });
          } else {
            $.each(data.result, function(key, val) {
              self.checkboxMark[val.name] = val.concern;
              if (val.concern) {
                self.markLength++;
              }
            });
            if (window.clientType != 2 && self.checkboxMark["concern"]) {
              self.markLength = 4;
              self.checkboxMark = {
                industry: true,
                concept: true,
                zone: true,
                concern: true
              };
              self.toggleSelectItem("concern");
            }
            self.checkDefaultIcon();
          }
        }
      });
    },
    checkDefaultIcon() {
      const self = this;
      //判断筛选图标是否变蓝
      if (
        self.checkboxMark["industry"] &&
        self.checkboxMark["concept"] &&
        self.checkboxMark["zone"] &&
        !self.checkboxMark["concern"]
      ) {
        //默认样式
        self.isNotDefault = false;
      } else {
        self.isNotDefault = true;
      }
    },
    handle(val) {
      this.listSelect = val;
    },
    openSelection() {
      eventBus.$emit("openSeletion", true);
    },
    toggleSelectItem(name) {
      const self = this;
      if (
        (self.checkboxMark[name] && self.markLength == 1) ||
        self.timersTimeout
      ) {
        return;
      }
      this.checkboxMark[name] = !this.checkboxMark[name];
      let markCount = 0;
      let markLength = 0;
      $.each(this.checkboxMark, function(key, val) {
        if (val) {
          switch (key) {
            case "industry":
              markCount += 1;
              break;
            case "concept":
              markCount += 2;
              break;
            case "zone":
              markCount += 4;
              break;
            case "concern":
              markCount += 8;
              break;
          }
          markLength++;
        }
      });
      self.markLength = markLength;
      $.ajax({
        url: self.url + "/hottrack/plate/addchoosestatus",
        data: {
          status: markCount,
          "client-type": window.clientType
        },
        headers: {
          cookie: document.cookie
        },
        dataType: "jsonp",
        success: function(data) {
          if (data.errorcode == 0) {
            eventBus.$emit("toggleSelectItem", self.checkboxMark);
          } else {
            self.checkboxMark[name] = !self.checkboxMark[name];
            $("#mapAlertTip").html(data.errormsg);
            self.timersTimeout = true;
            $("#mapAlertTip").fadeIn(function() {
              setTimeout(function() {
                self.timersTimeout = false;
                $("#mapAlertTip").fadeOut();
              }, 1600);
            });
            self.markLength++;
          }
          self.checkDefaultIcon();
        }
      });
    },
    checkConcern() {
      //判断是否有关注股
      const self = this;
      self.getChooseStatus();
      return;
      // $.ajax({
      //   url: self.url + "/hottrack/plate/concernblacklist",
      //   headers: {
      //     cookie: document.cookie
      //   },
      //   data: {
      //     "client-type": window.clientType
      //   },
      //   dataType: "jsonp",
      //   success: function(data) {
      //     if (data.errorcode == 0) {
      //       if (data.result.follow.length) {
      //         self.hasConcern = true;
      //       } else {
      //         self.hasConcern = false;
      //         self.checkboxMark.concern = false;
      //       }
      //     }
      //   }
      // });
    },
    toggleSelectList() {
      this.showSelectList = !this.showSelectList;
      if (this.showSelectList) {
        $("#list2").css("top", parseInt($("#list2").css("top")) + 28);
        $("#listContainer2").css(
          "height",
          parseInt($("#listContainer2").css("height")) - 28
        );
      } else {
        $("#listContainer2").css(
          "height",
          parseInt($("#listContainer2").css("height")) + 28
        );
        $("#list2").css("top", parseInt($("#list2").css("top")) - 28);
      }
      $("#listContainer2")
        .getNiceScroll()
        .resize();
      setTimeout(function() {
        $("#listContainer")
          .getNiceScroll()
          .resize();
      }, 50);
    },
    tabclick: function(index) {
      var self = this;
      if (index == self.selectStatus) {
        return;
      }
      self.selectStatus = index;
      eventBus.$emit("selectStatus", index);
      if (index == 0) {
        self.show = true;
        eventBus.$emit("tomap", self.listSelect);
        TA.log({ id: "L2rdzz_5a77eef2_379" });
        // router.push('blockmap');
      }
      if (index == 1) {
        TA.log({ id: "L2rdzz_5a77ef3a_447" });
        self.show = false;

        // router.push('blockList');
      }
    }
  }
};
</script>
<style>
#left-side {
  clear: both;
  width: 305px;
  min-height: 806px;
  height: 100%;
  margin-top: 1px;
  float: left;
  background: #1b1b1b;
  position: relative;
}
.white #left-side {
  background-color: #4a4a4a;
}
.second-nav {
  height: 28px;
  background-color: #292929;
  color: #7d7d7d;
  margin-left: 1px;
  font-size: 14px;
  position: relative;
}
.white .second-nav {
  background-color: #424242;
}
.second-nav .active {
  color: white;
}
.second-tab {
  height: 28px;
  line-height: 28px;
  float: left;
  width: calc(50% - 13px);
}

.tip-alert {
  position: absolute;
  display: none;
  font-size: 12px;
  width: 160px;
  top: 60px;
  background: #fff;
  padding: 5px 9px;
  border-radius: 6px;
  cursor: default;
  left: 50%;
  margin-left: -80px;
  border: 1px solid red;
  color: rgb(218, 47, 47);
  z-index: 20;
}
.filter-icon {
  background: url(../../assets/select2.png) no-repeat;
  width: 21px;
  height: 12px;
  display: inline-block;
  margin-top: 9px;
  margin-right: 5px;
  cursor: pointer;
}
.filter-icon.open {
  background-position-y: -15px;
}
.filter-icon.iconactive {
  background-position-x: -26px;
}
.second-tab:hover {
  cursor: pointer;
}
.select-list {
  margin: 0;
  padding: 0;
  margin-top: 1px;
  background: #292929;
  list-style: none;
  width: 100%;
  height: 27px;
}
.select-list li {
  float: left;
  margin-left: 20px;
  line-height: 28px;
  color: #7d7d7d;
  font-size: 12px;
  cursor: pointer;
}
.select-list .checked::after {
  content: "\2714";
  position: absolute;
  top: -10px;
  left: 1px;
}
.select-checkbox {
  width: 12px;
  height: 12px;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  position: relative;
  border: 1px solid #7d7d7d;
}
.select-list .select-icon {
  display: inline-block;
  background-image: url(../../assets/select.svg);
  width: 16px;
  height: 16px;
  float: right;
  margin-top: 7px;
  margin-right: 10px;
}

#list2 {
  position: absolute;
  top: 578px;
  bottom: 0;
}
</style>

