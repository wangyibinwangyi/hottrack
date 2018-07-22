const HotPlateVue = require('./hotplate.vue')
const HotPlate = {}

/**
 * Plugin API
 */
HotPlate.install = function (Vue, options) {
  Vue.component(HotPlateVue.name, HotPlateVue)
}

HotPlate.component = HotPlateVue

/**
 * Auto install
 */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(HotPlate)
}

module.exports = HotPlate