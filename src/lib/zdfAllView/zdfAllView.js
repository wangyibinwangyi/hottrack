const ZdfAllViewVue = require('./zdfAllView.vue')
const ZdfAllView = {}

/**
 * Plugin API
 */
ZdfAllView.install = function (Vue, options) {
  Vue.component(ZdfAllViewVue.name, ZdfAllViewVue)
}

ZdfAllView.component = ZdfAllViewVue

/**
 * Auto install
 */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(ZdfAllView)
}

module.exports = ZdfAllView