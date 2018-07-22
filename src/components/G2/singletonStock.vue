<template>
  <div id="singleton">
    <div v-show="dataNull" class="data-null" :class="{changeWhite:mytheme}">暂无数据...</div>
    <div id="chartSingle" style="width: 100%; height: 130px;">
    </div>
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
      chart: null,
      stock: [],
      dataNull: true,
      chartAvg: 46 // 均值
    }
  },
  mounted: function() {
    this.formatterDatas()

    // 这里首先应该是读取今日所有内容
    this.reDraw(this.limittime)
    let self = this
    $(window).resize(function() {
      console.log('single-resize')
      if (window.innerWidth < 1820) {
        self.chart.setOption({
          legend: {
            show: false
          }
        })
      } else {
        self.chart.setOption({
          legend: {
            show: true
          }
        })
      }
      if (self.chart) {
        self.chart.resize()
      }
    })

    // 添加tooltip监听事件
    $('#chartSingle').on('click', 'span', function(e) {
      // 得到股票代码--这里需要禁止冒泡时间
      e.stopPropagation()
      console.log($(e.target).attr('code'))
      Acme.go2TimeLine($(e.target).attr('code'))
    })

    // 添加自动触发tooltip隐藏事件
    $('#singleton').on('mouseleave', function() {
      $('#tooltip')
        .parent()
        .css({ display: 'none' })
      if (self.chart) {
        self.chart.dispatchAction({
          type: 'hideTip'
        })
      }
    })
  },
  computed: {
    mytheme: function() {
      if (window.theme === 'black') {
        return false
      } else {
        return true
      }
    }
  },
  methods: {
    formatterDatas: function() {
      let stock = []
      let keys = Object.keys(this.allresults)
      // console.log(this.allresults)
      for (let key of keys) {
        // console.log(this.allresults[key])
        let obj = {
          time: key,
          zhang: Number(this.allresults[key].harden_num),
          die: Number(this.allresults[key].drop_num),
          ping: Number(this.allresults[key].flat_num)
        }
        stock.push(obj)
      }
      this.stock = stock
    },
    drawChart: function() {
      // 模板函数--tooltip--肮脏的代码，我只是为了偷懒
      let html = function(title, ztg, lbg) {
        let zthtml = `<span class="test-item" style="display:inline-block; margin-bottom: 5px;">`
        if (ztg.length > 3) {
          zthtml += `<span style="color:#22a7f0; cursor: pointer;" code=${
            ztg[0].code
          }>${
            ztg[0].name
          }</span>&nbsp;&nbsp;<span style="color:#22a7f0;  cursor: pointer;" code=${
            ztg[1].code
          }>${
            ztg[1].name
          }</span>&nbsp;&nbsp;<span style="color:#22a7f0; cursor: pointer;" code=${
            ztg[2].code
          }>${ztg[2].name}</span> 等</span>`
        } else {
          for (let item of ztg) {
            zthtml += `<span style="color:#22a7f0; cursor: pointer;" code=${
              item.code
            }>${item.name}</span>&nbsp;&nbsp;`
          }
          zthtml += '</span>'
        }
        let lbhtml = `<span style="display:inline-block; margin-bottom: 5px;">`
        if (lbg.length > 3) {
          lbhtml += `<span style="color:#22a7f0; cursor: pointer;" code=${
            lbg[0].code
          }>${
            lbg[0].name
          }</span>&nbsp;&nbsp;<span style="color:#22a7f0; cursor: pointer;" code=${
            lbg[1].code
          }>${
            lbg[1].name
          }</span>&nbsp;&nbsp;<span style="color:#22a7f0; cursor: pointer;" code=${
            lbg[2].code
          }>${lbg[2].name}</span> 等</span>`
        } else {
          for (let item of lbg) {
            lbhtml += `<span style="color:#22a7f0; cursor: pointer;" code=${
              item.code
            }>${item.name}</span>&nbsp;&nbsp;`
          }
          lbhtml += '</span>'
        }

        return `<div id="tooltip">
        <span style="margin-bottom: 5px; display:inline-block; cursor:pointer;" code=${
          title.code
        }>${title.name}</span><br>
        <span style="display:inline-block; margin-bottom: 5px;">涨停股（${
          ztg.length
        }只）：</span><br>
        ${zthtml}<br>
        <span style="display:inline-block; margin-bottom: 5px;">连板股（${
          lbg.length
        }只）：</span><br>
        ${lbhtml}<br>
      </div>`
      }

      // 由于使用echart对于自定义的tooltip。所以这里先使用echart实现
      this.chart = echarts.init(document.getElementById('chartSingle'))
      // console.log(this.stockinfo)
      let source = this.stock
      let self = this
      let option = {
        animation: false,
        legend: {
          top: '4%',
          right: '2%',
          // width: '20',
          itemWidth: 10,
          itemHeight: 10,
          borderWidth: 0,
          textStyle: {
            color: '#868686'
          },
          formatter: function(name) {
            if (name === 'zhang') {
              return '涨幅数'
            } else {
              return '连板数'
            }
          }
        },
        dataset: {
          dimensions: ['name', 'zhang', 'die'],
          source: source
        },
        grid: {
          left: 30,
          top: 40,
          right: 0,
          bottom: 30,
          width: 'auto',
          containLabel: false
        },
        xAxis: {
          type: 'category',
          axisTick: {
            show: false
          },
          triggerEvent: true,
          axisLabel: {
            clickable: true,
            fontSize: 8, // 这个设置没有效果-暂时不知道原因
            color: '#868686',
            interval: 0,
            textStyle: {
              fontFamily: 'Microsoft YaHei'
            },
            formatter: function(name) {
              if (name.length > 3) {
                return name.slice(0, 3) + '..'
              } else {
                return name
              }
            }
          },
          axisLine: {
            lineStyle: {
              color: self.mytheme ? '#ababab' : '#393939',
              width: 1
            }
          }
        },
        yAxis: {
          type: 'value',
          axisTick: {
            show: false
          },
          minInterval: 1,
          splitNumber: 2,
          axisLabel: {
            color: '#868686'
            // interval: 0
          },
          axisLine: {
            lineStyle: {
              color: self.mytheme ? '#ababab' : '#393939',
              width: 1
            }
          },
          splitLine: {
            show: false
          },
          min: 0
        },
        tooltip: {
          trigger: 'axis',
          confine: true,
          // backgroundColor: self.mytheme ? "#6b6d6a":"#282828",
          padding: [15, 10],
          textStyle: {
            fontFamily: 'Microsoft YaHei',
            align: 'left',
            color: 'white',
            fontSize: 10
          },
          enterable: true,
          // transitionDuration: 0,
          position: function(p) {
            return [p[0] - 10, p[1] + 30]
          },
          formatter: function(datas, ticket, callback) {
            // 首先去获取所有的数据--code转换成code
            datas = datas[0].data
            let self = this
            // console.log(datas)
            let [name, ztstock, lbstock] = [
              { name: datas.name, code: datas.code },
              [],
              []
            ]
            new Promise((resolve, reject) => {
              Acme.getClientData(
                {
                  code: datas.ztstock,
                  type: ['ZQMC'],
                  period: 'now',
                  mode: 'after'
                },
                function(data) {
                  // console.log(data)
                  let arr = []
                  for (let zt of Object.keys(data)) {
                    arr.push({
                      code: zt,
                      name: data[zt].ZQMC
                    })
                  }
                  ztstock = arr

                  Acme.getClientData(
                    {
                      code: datas.lbstock,
                      type: ['ZQMC'],
                      period: 'now',
                      mode: 'after'
                    },
                    function(data) {
                      if (data !== null) {
                        let arr = []
                        for (let zt of Object.keys(data)) {
                          arr.push({
                            code: zt,
                            name: data[zt].ZQMC
                          })
                        }
                        lbstock = arr
                      }
                      resolve()
                    }
                  )
                }
              )
            }).then(() => {
              callback(ticket, html(name, ztstock, lbstock))
            })
            // 这里也需要获取名称
            return '加载中...'
          }
        },
        series: [
          {
            type: 'bar',
            barGap: 0,
            label: {
              fontWeight: 20
            },
            barMaxWidth: 10,
            itemStyle: {
              color: '#d6524d'
            }
          },
          {
            type: 'bar',
            barGap: 0,
            label: {
              fontWeight: 20
            },
            barMaxWidth: 10,
            itemStyle: {
              color: '#d59600'
            }
          }
        ]
      }

      // 这里设置今日的数据 prams = 数组最后的object
      if (window.innerWidth < 1820) {
        self.chart.setOption({
          legend: {
            show: false
          }
        })
      } else {
        self.chart.setOption({
          legend: {
            show: true
          }
        })
      }

      // 横坐标监听
      // console.log(source, this.stock)
      this.chart.on('click', function(params) {
        let fitCode = function(name) {
          for (let item of source) {
            if (item.name === name) {
              return item.code
            }
          }
        }
        console.log(params)
        if (params.componentType === 'xAxis') {
          console.log(fitCode(params.value))
          Acme.go2TimeLine(fitCode(params.value))
        }
      })

      this.chart.setOption(option)
    },
    reDraw: function(time) {
      let self = this

      // 对于今日，可能一开始就没有数据，为了防止报错，需要添加信息
      if (self.allresults[`${time}`] === undefined) {
        return
      }

      let plates = self.allresults[`${time}`].plate
      // 当数据为空的时候，不进行渲操作-但是这里需要添加信息，将图标里面的内容清除为空的
      if (plates === undefined || plates.length === 0) {
        if (self.chart) {
          self.chart.clear()
        }
        self.dataNull = true
        return
      }

      self.dataNull = false
      self.stock = []
      // console.log(plates)
      for (let plate of plates) {
        let obj = {
          name: plate.platename,
          zhang: plate.harden_num,
          die: plate.evenplate_num,
          ztstock: plate.harden_code,
          lbstock: plate.evenplate,
          code: plate.platecode
        }
        self.stock.push(obj)
      }
      self.drawChart()
    }
  },
  watch: {
    limittime: function(time) {
      // 这里没有任何问题，监测到了数据的变化--下一步，从大的stock里面提取需要的信息
      this.reDraw(time)
    },
    allresults: function() {
      // 这里默认是冲洗选择的时间为今日
      this.reDraw(this.limittime)
    }
  }
}
</script>

<style scoped>
* {
  color: white;
}
a {
  cursor: pointer;
}

.data-null {
  position: absolute;
  top: 50px;
  left: 40%;
  /* text-align: center; */
}

.changeWhite {
  color: #2c3e50 !important;
}
</style>
