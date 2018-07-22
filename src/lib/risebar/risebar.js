const RisebarVue = require('./risebar.vue')
const RiseBar = {}

/**
 * Plugin API
 */
RiseBar.install = function (Vue, options) {
  Vue.component(RisebarVue.name, RisebarVue)
}

RiseBar.component = RisebarVue

/**
 * Auto install
 */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(RiseBar)
}

module.exports = RiseBar