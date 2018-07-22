const ZhangtingViewVue = require('./zhangtingView.vue')
const ZhangtingView = {}

/**
 * Plugin API
 */
ZhangtingView.install = function (Vue, options) {
  Vue.component(ZhangtingViewVue.name,ZhangtingViewVue);
}

ZhangtingView.component =ZhangtingViewVue

/**
 * Auto install
 */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(ZhangtingView)
}

module.exports = ZhangtingView