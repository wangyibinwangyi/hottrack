<template>
  <div class="switch-day" :class="{change_white: theme}">
    <span :class="{day_choosed: captical===1}" @click="changeNum(1)">今日</span>
    <span :class="{day_choosed: captical===2}" @click="changeNum(2)">3日</span>
    <span :class="{day_choosed: captical===3}" @click="changeNum(3)">5日</span>
    <span :class="{day_choosed: captical===4}" @click="changeNum(4)">10日</span>
  </div>
</template>

<script>
export default {
  props: ['daynumber'],
  data: function() {
    return {
      captical:1
    }
  },
  mounted: function() {
    // console.log(window.contentType)
    this.captical = this.daynumber
  },
  methods: {
   changeNum: function(num) {
    this.captical = num
    this.$emit('update:daynumber', num)
   }
  },
  computed: {
    theme: function() {
      if(window.theme === 'black') {
        return false
      } else {
        return true
      }
    }
  }
}
</script>

<style scoped>
.switch-day {
  box-sizing: border-box;
  /* width: 120px; */
  height: 16px;
  line-height: 16px;
  font-size: 0;
  cursor: pointer;
  border-radius: 2px;
  background: #1b1b1b;

}

.switch-day span {
  box-sizing: border-box;
  display: inline-block;
  width: 30px;
  height: 16px;
  font-size: 12px;
  text-align: center;
  border: 1px solid rgba(90, 90, 90, 1);
  color:white;
}

.day_choosed {
  color: white !important;
  background:rgba(90, 90, 90, 1) !important;
}

.change_white {
  background: rgb(90,90,90) !important;
}

.change_white .day_choosed {
  background: rgba(214, 82, 77, 1) !important;
}

.change_white span {
  border: 0 !important;
}
</style>
