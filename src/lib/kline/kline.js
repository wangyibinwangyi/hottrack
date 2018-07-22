const KlineVue = require('./Kline.vue')
const Kline = {}

/**
 * Plugin API
 */
Kline.install = function (Vue, options) {
  Vue.component(KlineVue.name, KlineVue)
}

Kline.component = KlineVue

/**
 * Auto install
 */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Kline)
}

module.exports = Kline