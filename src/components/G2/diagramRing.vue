<template>
  <div class="main-chartring">
    <div id="chart-ring1" class="chart--ring" style="width:32%; height: 100px;"></div>
    <div id="chart-ring2" class="chart--ring" style="width:32%; height: 100px;"></div>
    <div id="chart-ring3" class="chart--ring" style="width:32%; height: 100px;"></div>
  </div>

</template>

<script>
export default {
  props: {
    allresults: {
      type: Object,
      default: function() {
        return {}
      }
    },
    limittime: {
      type: String,
      default: function() {
        return ''
      }
    }
  },
  data: function() {
    return {
      chart1: null,
      chart2: null,
      chart3: null,
      stock1: [],
      stock2: [],
      stock3: []
    }
  },
  mounted: function() {
    this.reDraw(this.limittime)
    let self = this
    $(window).resize(function() {
      if (self.chart1 && self.chart2 && self.chart3) {
        // console.log('diagrams')
        self.chart1.resize()
        self.chart2.resize()
        self.chart3.resize()
      }
    })
  },
  methods: {
    drawChart: function() {
      this.chart1 = echarts.init(document.getElementById('chart-ring1'))
      this.chart2 = echarts.init(document.getElementById('chart-ring2'))
      this.chart3 = echarts.init(document.getElementById('chart-ring3'))

      this.resetDraw(this.chart1, this.stock1, '涨停比')
      this.resetDraw(this.chart2, this.stock2, '涨跌比')
      this.resetDraw(this.chart3, this.stock3, '封板率')
    },
    resetDraw: function(chart, dv, title) {
      let option = {
        animation: false,
        tooltip: {
          show: false
        },
        legend: {
          orient: 'horizontal',
          itemWidth: 10,
          itemHeight: 10,
          borderWidth: 0,
          // x: 10,
          y: 60,
          left: 'center',
          // top: 'bottom',
          textStyle: {
            color: '#868686'
          },
          formatter: function(name) {
            // console.log(dv)
            let [temp0, temp1] = [dv[0], dv[1]]
            // console.log()
            if (dv[0].type === name) {
              return (
                name + ':  ' + (dv[0].count === undefined ? '--' : dv[0].count)
              )
            } else {
              return (
                name + ':  ' + (dv[1].count === undefined ? '--' : dv[1].count)
              )
            }
          }
        },
        dataset: {
          dimension: ['type', 'count'],
          source: dv
        },
        graphic: {
          type: 'text',
          left: 'center',
          top: '30%',
          silent: true,
          style: {
            text: title,
            fill: '#868686',
            textAlign: 'center',
            fontSize: 12,
            cursor: 'none'
          }
        },
        color: ['#d6524d', '#1cbf7b'],
        series: [
          {
            type: 'pie',
            radius: ['40%', '50%'],
            center: ['50%', '35%'],
            legendHoverLink: false,
            hoverAnimation: false,
            legendHoverLink: false,
            avoidLabelOverlap: false,
            cursor: 'hand',
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            }
          }
        ]
      }

      chart.setOption(option)
    },
    reDraw: function(time) {
      // console.log(this.allresults)
      let plate = this.allresults[`${time}`]
      if(plate === undefined) {
        return 
      }
      this.stock1 = [
        {
          type: '涨停',
          count: plate.harden_num
        },
        {
          type: '跌停',
          count: plate.drop_num
        }
      ]
      this.stock2 = [
        {
          type: '上涨',
          count: plate.rose_num
        },
        {
          type: '下跌',
          count: plate.down_num
        }
      ]
      this.stock3 = [
        {
          type: '封板',
          count: plate.seal_num
        },
        {
          type: '开板',
          count: plate.open_num
        }
      ]
      this.drawChart()
    }
  },
  watch: {
    limittime: function(time) {
      this.reDraw(time)
    },
    allresults: function() {
      this.reDraw(this.limittime)
    } 
  }
}
</script>

<style scoped>
.chart--ring {
  width: 32%;
  display: inline-block;
}

.main-chartring {
  width: 96%;
  /* margin: 0 auto; */
  text-align: center;
}
</style>
