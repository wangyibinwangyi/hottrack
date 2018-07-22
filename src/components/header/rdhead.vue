/*
 * @Author: COCO 
 * @Date: 2018-01-17 20:58:53 
 * @Last Modified by:   COCO 
 * @Last Modified time: 2018-01-17 20:58:53 
 * 整个页面头部组件
 */
<template>
    <div class="header">
        <div class="header-title">热点掘金</div>
        <div v-for='(item,index) in items' :key='item' class="header-tab" @click='tabclick(index)' :class='{active:index==selectStatus}'>{{item}}</div>
        <div class="back" v-if="showReturn">
            <a href="http://l2.10jqka.com.cn/index/homepage/dist/index.html">返回Level-2首页</a>
        </div>
    </div>
</template>
<script>
import router from "@/router/index.js";
export default {
  created() {
    var self = this;
    eventBus.$on("url", self.handle); //点击板块地图时将板块详情置为选中状态
    if (window.location.href.indexOf("marketCondition") != -1) {
      self.selectStatus = 0;
    } else {
      self.selectStatus = 1;
    }
  },
  mounted() {
    const s = this;
    API.use({
      method: "Quote.getHxCurPageID",
      success: function(result) {
        if (result == "5716") {
          s.showReturn = true;
        }
      }
    });
  },
  beforeDestroy() {
    // console.log('销毁了url');
    eventBus.$off("url", self.handle);
  },
  data() {
    return {
      selectStatus: 0,
      items: ["市场概览", "板块详情"],
      showReturn: false
    };
  },
  methods: {
    handle: function(val) {
      // console.log('执行了url');
      this.selectStatus = 1;
    },
    tabclick: function(index) {
      var self = this;
      if (index == self.selectStatus) {
        return;
      }
      // console.log(index);
      if (index == 0) {
        router.push("/marketCondition");
        eventBus.$emit("tab", 0);
      }
      if (index == 1) {
        router.push("/blockDetail");
        eventBus.$emit("tab", 1);
      }
      eventBus.$emit("showSelectBlock", index);
      self.selectStatus = index;
    }
  }
};
</script>
<style>
.header {
  box-sizing: border-box;
  background-color: #393939;
  height: 36px;
  color: white;
  line-height: 36px;
}

.header-title {
  float: left;
  font-size: 16px;
  font-family: "微软雅黑";
  font-weight: bold;
  margin-left: 20px;
  margin-right: 60px;
  text-align: center;
}

.header-tab {
  width: 100px;
  height: 34px;
  float: left;
  font-size: 14px;
  text-align: center;
  position: relative;
}

.header-tab:hover {
  cursor: pointer;
}

.header .active {
  background-color: #1b1b1b;
  border-bottom: 2px solid #d6524a;
  font-weight: bold;
}

.back {
  font-size: 15px;
  text-align: right;
  font-family: "宋体";
}

.back a {
  padding-right: 25px;
  color: white;
}
</style>

