<template>
  <div class="switch">
    <span :class="{switch_choosed: captical}" @click="changeCapticalT()">{{selectObj[0]}}</span>
    <span :class="{switch_choosed: !captical}" @click="changeCapticalF()">{{selectObj[1]}}</span>
  </div>
</template>

<script>
export default {
  props: ['selectarr', 'sWitch'],
  data: function() {
    return {
      captical: true,
    }
  },
  mounted: function() {
    this.captical = this.sWitch
    // this.selectarr = JSON.parse(this.selectarr)
    // console.log(this.selectarr, typeof this.selectarr)
  },
  computed: {
    selectObj: function() {
      return JSON.parse(this.selectarr)
    }
  },
  methods: {
    changeCapticalT: function() {
      this.captical = true
      this.$emit('update:sWitch', true)
      // console.log('hello')
    },
    changeCapticalF: function() {
      this.captical = false
      this.$emit('update:sWitch', false)
    }
  },
  watch: {
    selectarr: function(val) {
      console.log('selectarr')
    }
  }
}
</script>

<style>
.switch {
  /* display: inline; */
  overflow: hidden;
  width: 80px;
  height: 16px;
  line-height: 16px;
  font-size: 0;
  cursor: pointer;
  border-radius: 2px;
  background: rgba(90, 90, 90, 1);
  /* color: #fefefe; */
}

.switch span {
  display: inline-block;
  width: 40px;
  height: 16px;
  font-size: 12px;
  color: white;
  text-align: center;
  background: rgba(90, 90, 90, 1);
}

.switch_choosed {
  background: rgba(214, 82, 77, 1) !important;
}
</style>
