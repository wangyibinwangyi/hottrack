const TimelineVue = require('./timeline.vue')
const Timeline = {}

/**
 * Plugin API
 */
Timeline.install = function (Vue, options) {
  Vue.component(TimelineVue.name, TimelineVue)
}

Timeline.component = TimelineVue

/**
 * Auto install
 */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(Timeline)
}

module.exports = Timeline