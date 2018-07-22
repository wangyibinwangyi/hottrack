// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import Vuex from "vuex";
import VuexStore from "@/store/index";
import axios from "axios";
import util from "@/utils/util.js";
import VTree from "@/lib/vTree/index.js";

Vue.use(VTree);

Vue.config.productionTip = false;
window.eventBus = new Vue();

Vue.prototype.$http = axios;
window.$util = util;
util.resize(function() {
  var $leftSide = document.getElementById("left-side");
  var leftSideWidth = $leftSide.offsetWidth;
  var clientWidth = document.body.scrollWidth;
  document.body.style.width = clientWidth + "px";
});
API.use({
  method: "Util.getSkinName",
  success: function(theme) {
    if (theme == "白色风格") {
      document.getElementsByTagName("html")[0].className += " white";
      window.theme = "white";
    } else {
      window.theme = "black";
    }
    checkClientProduct();
  },
  error: function() {
    checkClientProduct();
  }
});

// window.bodyWidth = document.body.clientWidth;
// window.onresize = function(){
//   window.bodywidth = document.body.clientWidth;
// }

// Vue.prototype.$http=axios;
// window.bodyWidth = document.body.clientWidth;
// window.onresize = function(){
//   window.bodywidth = document.body.clientWidth;
// }

/**
 * window.clientType 客户端类型判断，0-免费页面，1-level2页面，2-金融大师页面
 */
function checkClientProduct() {
  window.clientType = 0;
  API.use({
    method: "Util.getHxProduct",
    success: res => {
      if (Number(res) === 6) {
        //金融大师客户端
        window.clientType = 2;
        openVue();
      } else if (Number(res) === 0) {
        //免费客户端
        API.use({
          method: "Passport.isLevel2User",
          success: isLevel2User => {
            if (Number(isLevel2User)) {
              //Level2用户
              window.clientType = 1;
            }
            openVue();
          }
        });
      }
    }
  });
}

/**
 *
 */

/* eslint-disable no-new */
function openVue() {
  new Vue({
    el: "#app",
    router,
    components: { App },
    template: "<App/>"
  });
}
