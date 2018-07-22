<template>
  <div id="app" v-if="isLevel2User">
    <model-news class="model-news"></model-news>
    <header-view class="header-nav"></header-view>
    <div id="app-left" class="body-view">
      <left-side></left-side>
    </div>
    <router-view/>
    <guide-page v-if="showGuide"></guide-page>
    <network-error v-if="networkError"></network-error>
    <float-box></float-box>
  </div>
</template>

<script>
import leftSide from "@/pages/common/leftSide.vue";
import rdhead from "@/components/header/rdhead.vue";
import guidePage from "@/pages/common/guidePage.vue";
import networkError from "@/pages/common/networkError.vue";
import floatBox from "@/components/floatBox/floatBox.vue";

import modelNews from "@/components/G2/modelNews.vue";

// import Bus from '@/store/index'

export default {
  name: "App",
  components: {
    "header-view": rdhead,
    "left-side": leftSide,
    "guide-page": guidePage,
    "network-error": networkError,
    "float-box": floatBox,
    "model-news": modelNews
  },
  created() {
    eventBus.$on("closeGuide", this.handle);
    eventBus.$on("networkError", this.networkHandle);
  },
  mounted() {
    var self = this;
    self.resetAppHeight();
    if (window.navigator.onLine) {
      eventBus.$emit("networkError", false);
    } else {
      eventBus.$emit("networkError", true);
    }
    API.use({
      method: "Passport.IsLevel2User",
      success: function(result) {
        if (!result) {
          self.isLevel2User = false;
        }
      }
    });
    $(window).resize(function() {
      //高度自适应
      self.resetAppHeight();
    });
    window.API.use({
      method: "external.getUserPath", // 获取客户端下登陆用户的目录
      success: function(path) {
        window.API.use({
          method: "fileReader.open",
          data: path + "\\l2hottrack\\guide.ini",
          success: function(d) {
            if (!d) {
              self.showGuide = true;
              return;
            } // 没有读取到文件时，阻断继续
            window.API.use({
              method: "fileReader.read",
              success: function(data) {
                if (Number(data) == 1) {
                  self.showGuide = false;
                } else {
                  self.showGuide = true;
                }
                window.API.use({ method: "fileReader.close" });
              }
            });
          }
        });
      }
    });
    TA.log({ id: "L2rdzz_5abb452c_825" });
    // $('#networkError').css('height',document.);
  },
  beforeDestroy() {
    eventBus.$off("closeGuide", this.handle);
    eventBus.$off("networkError", this.networkHandle);
  },
  data() {
    return {
      showGuide: false,
      networkError: false,
      isLevel2User: true
    };
  },
  methods: {
    handle() {
      this.showGuide = false;
    },
    networkHandle(val) {
      if (val == true) {
        this.networkError = true;
      } else {
        this.networkError = false;
      }
    },
    resetAppHeight() {
      if (document.body.clientHeight > 890) {
        $("#app").attr(
          "style",
          "height:" + (document.body.clientHeight - 13) + "px"
        );
      } else {
        $("#app").attr("style", "height:890px");
      }
    }
  }
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  min-width: 1366px;
  height: 100%;
  background: #000;
  font-family: "Microsoft Yahei";
}

html,
body,
div {
  scrollbar-3dlight-color: #222;
  scrollbar-arrow-color: silver;
  scrollbar-base-color: #555;
  scrollbar-darkshadow-color: #222;
  scrollbar-face-color: #3e4404;
  scrollbar-shadow-color: #222;
  scrollbar-track-color: #111;
}

.white html {
  background: #f4f4f4;
}

.white body {
  background: #f4f4f4;
}

.header-nav {
  position: fixed;
  width: 100%;
  clear: both;
  height: 36px;
  z-index: 22;
}

.body-view {
  margin-top: 36px;
}

::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 5px;
  height: 30px;
  transition: all 0.4s ease-out;
}

html:hover ::-webkit-scrollbar-thumb {
  background: #303030;
}

::-webkit-scrollbar-track-piece {
  background: #000;
}

::-webkit-scrollbar-thumb:vertical:hover,
::-webkit-scrollbar-thumb:horizontal:hover {
  background: #303030;
}

::-webkit-scrollbar-corner {
  background: #000;
}

::-webkit-resizer {
  background: transparent;
  opacity: 0;
}

#app {
  font-family: "Microsoft Yahei", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-width: 1366px;
  overflow: hidden;
}

html,
body {
  min-width: 1250px;
  width: 100%;
}
</style>
