<template>
  <div class="vue-chart-kline" v-if="code">
    <div v-if="!isClient" style="text-align:center;color:#666;padding-top:15%">
      ohoo, 请在客户端内查看
    </div>
    <div :id="chartId" v-if="isClient" style="width:100%;height:100%;"></div>
    <div class="ths_kline_btns" v-if="isClient && showButtons && data" :class="{black: theme === 'black'}">
      <div class="ths_kline_btn ths_kline_btn-pre" :class="{'ths_kline_btn-pre-disabled': !buttonsLock[0]}" @click="moveLeft"></div>
      <div class="ths_kline_btn ths_kline_btn-next" :class="{'ths_kline_btn-next-disabled': !buttonsLock[1]}" @click="moveRight"></div>
      <div class="ths_kline_btn ths_kline_btn-zoomin" :class="{'ths_kline_btn-zoomin-disabled': !buttonsLock[2]}" @click="zoomIn"></div>
      <div class="ths_kline_btn ths_kline_btn-zoomout" :class="{'ths_kline_btn-zoomout-disabled': !buttonsLock[3]}" @click="zoomOut"></div>
    </div>
    <slot
      :v-if="isClient"
      :open="open"
      :close="close"
      :low="low"
      :high="high"
      :vol="vol"
      :date="date"
      :zhangfu="zhangfu"
      :zhangdie="zhangdie"
      :ma="ma"
      :codeName="codeName"></slot>
  </div>
</template>

<script>
import Client from './client.js'
export default {
  name: 'kline',
  props: {
    code: {
      type: [String, Number],
      required: true
    },
    showButtons: {
      type: Boolean,
      default () {
        return false
      }
    },
    theme: {
      type: String,
      default () {
        return 'white'
      }
    },
    dateLength: {
      type: Number,
      default () {
        return 365
      }
    },
    chartStyle: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      isClient: false,
      chart: void 0,
      style: void 0, //  合并props.chartStyle
      chartId: 'vue-chart-kline-aim_' + Client.count(),
      beginDate: void 0,
      endDate: void 0,
      data: void 0,
      categoryData: [],
      volumes: [],
      MA5: [],
      MA10: [],
      MA20: [],
      MA30: [],
      MA60: [],
      zoomMin: 15,
      zoomScale: 0.66, // 缩放比
      buttonsLock: [true, false, true, true],
      requestAll: false, // 是否历史所有都加载过了 @todo
      requestLock: false, // 锁：数据加载中 @todo
      diffIndex: void 0, // restartCode 为计算更多内容的偏差值，这个值以前的数据都不渲染仅供计算使用
      mouseInChart: false, // 鼠标是否在图表内
      chartMsg: {},

      // hover Data ----
      codeName: void 0,
      open: void 0,
      close: void 0,
      high: void 0,
      low: void 0,
      high: void 0,
      vol: void 0,
      date: void 0,
      zhangfu: void 0,
      zhangdie: void 0,
      ma: void 0,
      // ---------------
      // themeStyle ----
      themeStyle: {
        black: {
          MAColors: ['#2c82cb','#cc9047','#994c92','#30b9cb','#009688'],
          fontColor: '#aaa',
          splitLineColor: '#222'
        },
        white: {
          MAColors: ['#2c82cb','#cc9047','#994c92','#30b9cb','#009688'],
          fontColor: '#555',
          splitLineColor: '#dedede'
        }
      }
      // --------------
    }
  },
  mounted () {
    const s = this

    this.isClient = Client.getClientEnv()
    if(!this.isClient) return

    s.updateFromStyle()
    s.restartCode()

    document.onkeydown = Client.debounce(function(e) {
      if(!e || !e.keyCode || !s.mouseInChart) return
      switch(e.keyCode) {
        case 38:
          s.zoomIn()
          break
        case 40:
          s.zoomOut()
          break
        case 37:
          s.keyupLeft()
          break
        case 39:
          s.keyupRight()
          break
      }
    }, 100, true)
  },
  watch: {
    chartStyle: {
      handler() {
        this.updateFromStyle()
      },
      deep: true
    },
    code: 'restartCode',
    theme: 'updateFromStyle'
  },
  methods: {
    updateFromStyle () {
      const s = this
      let chartStyle = s.chartStyle
      let themeStyle = s.themeStyle[s.theme]
      s.style = {
        upColor: chartStyle.upColor || 'transparent',
        upBorderColor: chartStyle.upBorderColor || '#da3d44',
        downColor: chartStyle.downColor || '#2fab6f',
        downBorderColor: chartStyle.downBorderColor || '#2fab6f',
        borderWidth: chartStyle.borderWidth || 1,
        MAColors: chartStyle.MAColors || themeStyle.MAColors,
        splitLineColor: chartStyle.splitLineColor || themeStyle.splitLineColor,
        fontColor: chartStyle.fontColor || themeStyle.fontColor
      }
      if(s.chart) {
        s.renderChart()
      }
    },
    restartCode () {
      const s = this
      if(!s.isClient) return

      // 用于验证，防止错乱绘图
      Client.code = s.code; 
      s.chart && s.chart.clear()

      // data & categoryData
      s.data = []
      s.categoryData = []
      s.volumes = []
      s.MA5 = []
      s.MA10 = []
      s.MA20 = []
      s.MA30 = []
      s.MA60 = []

      s.requestAll = false
      s.diffIndex = 60  // 60日线

      // codeName
      Client.getCodeName(s.code, function(name) {
        s.codeName = name
      })

      // endDate
      Client.getTime('yyyyMMdd', function(end) {
        s.getData(end, function(){
          s.setDataZoom(s.diffIndex, s.categoryData.length - 1)
        })
      })
    },
    splitData (cData, cb) {
      const s = this
      let data = []
      let categoryData = []
      let volumes = []
      let forceUpdate = false
      for(let i in cData) {
        categoryData.push(i)
        data.push([cData[i]['open'], cData[i]['close'], cData[i]['low'], cData[i]['high']])
        volumes.push([i, cData[i]['VOL'], cData[i]['open'] > cData[i]['close'] ? 1 : -1])
      }
      // console.log(categoryData, categoryData.length)

      // 如果获取的数据长度小于偏差值，那么可以认定是无效数据，所有数据已获取完全
      if(categoryData.length - 1 <= s.diffIndex ) {
        s.requestAll = true
      }
      if(!s.categoryData || !s.categoryData.length) {
        forceUpdate = true
        // 首次获取，一旦数据量过少(zoomMin + diffIndex)，消除偏差值
        if(categoryData.length <= s.diffIndex + s.zoomMin) {
          s.diffIndex = 0
        }
        s.volumes = volumes
        s.categoryData = categoryData
        s.data = data
        s.MA5 = s.calculateMA(5, data)
        s.MA10 = s.calculateMA(10, data)
        s.MA20 = s.calculateMA(20, data)
        s.MA30 = s.calculateMA(30, data)
        s.MA60 = s.calculateMA(60, data)
      } else {
        s.volumes       = volumes.slice(0, categoryData.length - 1).concat(s.volumes.slice(s.diffIndex))
        s.categoryData  = categoryData.slice(0, categoryData.length - 1).concat(s.categoryData.slice(s.diffIndex))
        s.data          = data.slice(0, categoryData.length - 1).concat(s.data.slice(s.diffIndex))
        s.MA5           = s.calculateMA(5, data).slice(0, categoryData.length - 1).concat(s.MA5.slice(s.diffIndex))
        s.MA10          = s.calculateMA(10, data).slice(0, categoryData.length - 1).concat(s.MA10.slice(s.diffIndex))
        s.MA20          = s.calculateMA(20, data).slice(0, categoryData.length - 1).concat(s.MA20.slice(s.diffIndex))
        s.MA30          = s.calculateMA(30, data).slice(0, categoryData.length - 1).concat(s.MA30.slice(s.diffIndex))
        s.MA60          = s.calculateMA(60, data).slice(0, categoryData.length - 1).concat(s.MA60.slice(s.diffIndex))
      }

      // console.warn(s.categoryData)
      s.renderChart(forceUpdate)
      s.requestLock = false
      cb && cb()
    },
    getData (end, cb) {
      //console.log('getData:::::::::')
      const s = this
      if(s.requestAll) return
      s.requestLock = true
      Client.getKlineData(s.code, end, -s.dateLength - s.diffIndex, function(data) {
        s.splitData(data, cb)
      })
    },
    renderChart(strict) {
      const s = this;
      let isInit = false;
      if(!s.chart) {
        isInit = true
        s.chart = echarts.init(document.getElementById(this.chartId))
      }

      let opt = {
        animation: false,
        axisPointer: {
          type: 'cross',
          snap: true,
          label: {
            margin: 0,
            shadowBlur: 0,
            backgroundColor: '#555',
            padding: [3,5,3,5]
          },
          link: {
            xAxisIndex: 'all'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            snap: true,
            type: 'cross'
          },
          formatter (p) {
            s.mouseInChart = true
            if(p[0]!==undefined && p[0]['dataIndex']!==undefined) {
              s.chartMsg.xIndex = p[0]['dataIndex']
              s.outputData(p[0]['dataIndex'])
            }
          }
        },
        grid: [
          {
            left: '25px',
            right: '55px',
            height: '60%',
            top: '3%'
          },
          {
            left: '25px',
            right: '55px',
            top: '63%',
            height: '25%'
          }
        ],
        xAxis: [{
          type: 'category',
          data: s.categoryData,
          scale: true,
          axisLine: {show: false},
          axisTick: {show: false},
          min: 'dataMin',
          max: 'dataMax',
          axisLabel: {
            showMinLabel: true,
            showMaxLabel: true,
            formatter (v) {
              return
            },
            interval (p) {
              return 
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: s.style.splitLineColor
            }
          },
          axisPointer: {
            label: {
              show: false
            }
          }
        },{
          type: 'category',
          gridIndex: 1,
          data: s.categoryData,
          scale: true,
          axisTick: {show: false},
          axisLine: {show: false},
          min: 'dataMin',
          max: 'dataMax',
          splitLine: {
            show: true,
            lineStyle: {
              color: s.style.splitLineColor
            }
          },
          axisLabel: {
            color: s.style.fontColor,
            showMinLabel: true,
            showMaxLabel: true,
            formatter (v) {
              if(!v) return
              return v.substring(2,4) + '-' + v.substring(4,6) + '-' + v.substring(6,8)
            },
            interval (p) {
              return 
            }
          },
          axisPointer: {
            label: {
              formatter (p) {
                let v = p.value
                if(!v) return
                return v.substring(0,4) + '-' + v.substring(4,6) + '-' + v.substring(6,8)
              }
            }
          }
        }],
        yAxis: [{
          scale: true,
          position: 'right',
          axisLine: {show: false},
          axisTick: {show: false},
          splitLine: {
            lineStyle: {
              color: s.style.splitLineColor
            }
          },         
          axisLabel: {
            color: s.style.fontColor
          },
          axisPointer: {
            label: {
              formatter (p) {
                s.chartMsg.sIndex = 0
                return Client.getUnit(p.value,2)
              }
            }
          }
        },{
          scale: true,
          position: 'right',
          gridIndex: 1,
          splitNumber: 2,
          axisLine: {show: false},
          axisTick: {show: false},
          splitLine: {
            lineStyle: {
              color: s.style.splitLineColor
            }
          },  
          axisLabel: {
            color: s.style.fontColor,
            showMaxLabel: false,
            formatter(v) {
              if(!v) return
              return Client.getUnit(v, 0)
            }
          },
          axisPointer: {
            label: {
              formatter (p) {
                s.chartMsg.sIndex = 6
                return Client.getUnit(p.value,1)
              }
            }
          }
        },{
          scale: true,
          gridIndex: 1,
          axisPointer: {show: false},
          axisLabel: {show: false},
          axisLine: {show: false},
          axisTick: {show: false},
          splitLine: {show: false}
        }],
        visualMap: {
          show: false,
          seriesIndex: 6,
          dimension: 2,
          pieces: [{
            value: 1,
            color: s.style.downColor && s.style.downColor !== 'transparent' ? s.style.downColor : s.style.downBorderColor 
          }, {
            value: -1,
            color: s.style.upColor && s.style.upColor !== 'transparent' ? s.style.upColor : s.style.upBorderColor 
          }]
        },
        series: [{
          name: 'Kline',
          type: 'candlestick',
          data: s.data,
          hoverAnimation: false, 
          barMaxWidth: 30,
          itemStyle: {
            normal: {
              color: s.style.upColor,
              color0: s.style.downColor,
              borderColor: s.style.upBorderColor,
              borderColor0: s.style.downBorderColor,
              borderWidth: s.style.borderWidth,
              shadowBlur: 0
            }
          },
          emphasis: { itemStyle: null }
          },{
            name: 'MA5',
            type: 'line',
            data: s.MA5,
            symbol: 'none',
            itemStyle: {color: s.style.MAColors[0]},
            lineStyle: {width: 1.5},
            smooth: true
          },{
            name: 'MA10',
            type: 'line',
            data: s.MA10,
            symbol: 'none',
            itemStyle: {color: s.style.MAColors[1]},
            lineStyle: {width: 1.5},
            smooth: true
          },{
            name: 'MA20',
            type: 'line',
            data: s.MA20,
            symbol: 'none',
            itemStyle: {color: s.style.MAColors[2]},
            lineStyle: {width: 1.5},
            smooth: true
          },{
            name: 'MA30',
            type: 'line',
            data: s.MA30,
            symbol: 'none',
            itemStyle: {color: s.style.MAColors[3]},
            lineStyle: {width: 1.5},
            smooth: true
          },{
            name: 'MA60',
            type: 'line',
            symbol: 'none',
            data: s.MA60,
            lineStyle: {width: 1.5},
            itemStyle: {color: s.style.MAColors[4]},
            smooth: true
          },{
            name: 'VOL',
            type: 'bar',
            barMaxWidth: 30,
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: s.volumes
          },{
            name: 'MA5',
            type: 'line',
            data: s.MA5,
            xAxisIndex: 1,
            yAxisIndex: 2,
            symbol: 'none',
            itemStyle: {color: s.style.MAColors[0]},
            lineStyle: {width: 1.5},
            smooth: true
          },{
            name: 'MA10',
            type: 'line',
            data: s.MA10,
            xAxisIndex: 1,
            yAxisIndex: 2,
            symbol: 'none',
            itemStyle: {color: s.style.MAColors[1]},
            lineStyle: {width: 1.5},
            smooth: true
        }],
        dataZoom: {
          type: 'inside',
          zoomOnMouseWheel: false,
          moveOnMouseMove: false,
          xAxisIndex: [0, 1]
          // startValue: 0,
          // endValue: s.categoryData.length - 10
        }
      }
     
      s.chart.setOption(opt, strict)
      s.outputData()

      if(isInit) {
        s.registerChartEvent()
      }
    },
    // load once
    registerChartEvent () {
      const s = this
      // 移除图表 给出最后一根轴的数据
      s.chart.on('globalout', function() {
        // 是否在图表内
        s.mouseInChart = false
        // 图表内的鼠标落地状态
        s.chartMsg.xIndex = void 0
        s.chartMsg.sIndex = void 0
        // 更新输出
        s.outputData()
      })

    },
    calculateMA (count, data) {
      var rst = []
      for(let i = 0; i < data.length; i++) {
        if( i < count ) {
          rst.push(null)
          continue
        }
        let sum = 0
        for(let j = 0; j < count; j++) {
          //tip: close = data[i][1]
          sum += +data[i - j][1]
        }
        rst.push( +(sum / count).toFixed(2) )
      }
      return rst
    },
    outputData (index) {
      const s = this
      index = index !== undefined ? index : s.categoryData.length - 1
      s.open = s.data[index][0]
      s.close = s.data[index][1]
      s.low = s.data[index][2]
      s.high = s.data[index][3]
      s.vol = s.volumes[index][1]
      s.date = s.categoryData[index]
      s.ma = {
        5: {
          value: s.MA5[index],
          color: s.style.MAColors[0]
        },
        10: {
          value: s.MA10[index],
          color: s.style.MAColors[1]
        },
        20: {
          value: s.MA20[index],
          color: s.style.MAColors[2]
        },
        30: {
          value: s.MA30[index],
          color: s.style.MAColors[3]
        },
        60: {
          value: s.MA60[index],
          color: s.style.MAColors[4]
        }
      }

      if(index === 0) {
        s.zhangdie = null
        s.zhangfu = null
      } else {
        s.zhangdie = Number((s.data[index][1] - s.data[index - 1][1]).toFixed(2))
        s.zhangfu = Number((s.zhangdie * 100 / s.data[index - 1][1]).toFixed(2))
      }
    },
    zoomIn () {
      const s = this
      if(!s.chart|| s.requestLock) return

      let oIndex = s.getDataZoomIndex()
      // 固定右侧放大
      let tmp = (oIndex.endValue - oIndex.startValue) * s.zoomScale
      // 最小zoomMin个
      tmp = tmp > s.zoomMin ? tmp : s.zoomMin
      let nStartValue = parseInt(oIndex.endValue - tmp)
      s.setDataZoom(nStartValue, oIndex.endValue)
    },
    zoomOut () {
      const s = this
      if(!s.chart || s.requestLock) return

      let oIndex = s.getDataZoomIndex()

      if(oIndex.startValue === 0) {
        // console.log('load more')
        return
      } 

      // 从中间开始缩小
      let len = oIndex.endValue - oIndex.startValue + 1
      let nStartValue
      let nEndValue

      //diff1左侧剩余 diff2右侧剩余
      let diff1 = parseInt(oIndex.startValue - s.diffIndex - len/2)
      let diff2 = parseInt(s.categoryData.length - oIndex.endValue - len/2)

      // 左右都没有剩余
      if(diff1 <= 0 && diff2 <= 0) {
        nStartValue = s.diffIndex
        nEndValue = s.categoryData.length - 1
      } else if(diff1 <= 0 ) {
        diff2 = diff2 + diff1 <= 0 ? 0 : diff2 + diff1
        nStartValue = s.diffIndex
        nEndValue = s.categoryData.length - 1 - diff2
      } else if(diff2 <= 0) {
        diff1 = diff1 + diff2 <= 0 ? 0 : diff1 + diff2
        nStartValue = s.diffIndex + diff1
        nEndValue = s.categoryData.length - 1
      } else {
        nStartValue = parseInt(oIndex.startValue - len/2)
        nEndValue = parseInt(oIndex.endValue + len/2)
      }

      s.setDataZoom(nStartValue, nEndValue)
    },
    moveLeft () {
      const s = this
      if(!s.chart || s.requestLock) return

      let oIndex = s.getDataZoomIndex()

      if(oIndex.startValue === s.diffIndex) {
        // console.log('load more')
        return
      } 

      let len = oIndex.endValue - oIndex.startValue
      let nStartValue = oIndex.startValue - parseInt(len * s.zoomScale)
      nStartValue = nStartValue < s.diffIndex ? s.diffIndex : nStartValue
      let nEndValue = nStartValue + len
      s.setDataZoom(nStartValue, nEndValue)
    },
    moveRight () {
      const s = this
      if(!s.chart || s.requestLock) return

      let oIndex = s.getDataZoomIndex()

      if(oIndex.endValue === s.categoryData.length - 1) return

      let len = oIndex.endValue - oIndex.startValue
      let nEndValue = oIndex.endValue + parseInt(len * s.zoomScale)
      nEndValue = nEndValue > s.categoryData.length - 1 ? s.categoryData.length - 1 : nEndValue
      let nStartValue = nEndValue - len
      s.setDataZoom(nStartValue, nEndValue)
    },
    keyupLeft () {
      const s = this
      if(!s.chart || s.requestLock) return

      let oIndex = s.getDataZoomIndex()
      // 视图边界 && 数据边界
      if(dataIndex <= oIndex.startValue && oIndex.startValue === s.diffIndex) return

      let dataIndex = s.chartMsg.xIndex
      // 视图边界
      if(dataIndex <= oIndex.startValue) {
        s.setDataZoom(oIndex.startValue - 1, oIndex.endValue - 1)
      }

      // console.log(s.chartMsg.sIndex)
      s.chart.dispatchAction({
        type: 'updateAxisPointer',
        seriesIndex: s.chartMsg.sIndex, // here have BUG
        dataIndex: dataIndex - 1
      })
    },
    keyupRight () {
      const s = this
      if(!s.chart || s.requestLock) return

      let oIndex = s.getDataZoomIndex()
      // 视图边界 && 数据边界
      if(dataIndex >= oIndex.endValue && oIndex.endValue === s.categoryData.length - 1) return

      let dataIndex = s.chartMsg.xIndex
      // 视图边界
      if(dataIndex >= oIndex.endValue) {
        s.setDataZoom(oIndex.startValue + 1, oIndex.endValue + 1)
      }

      s.chart.dispatchAction({
        type: 'updateAxisPointer',
        seriesIndex: s.chartMsg.sIndex,
        dataIndex: dataIndex + 1
      })
    },
    setDataZoom (start, end) {
      const s = this
      if(!s.chart) return

      s.chart.dispatchAction({
        type: 'dataZoom',
        startValue: start,
        endValue: end
      })

      s.refreshButtonsLock()
    },
    refreshButtonsLock () {
      const s = this
      if(!s.chart) return
      let oIndex = s.getDataZoomIndex()

      s.buttonsLock[0] = !(oIndex.startValue === 0 && s.requestAll)
      s.buttonsLock[1] = !(oIndex.endValue === s.categoryData.length - 1)
      s.buttonsLock[2] = !(oIndex.endValue - oIndex.startValue <= s.zoomMin)
      s.buttonsLock[3] = !(oIndex.startValue === 0 && s.requestAll)

      // 主动补充数据
      if(oIndex.startValue === s.diffIndex && !s.requestAll) {
        let oLen = s.categoryData.length
        s.getData(s.categoryData[oIndex.startValue], function() {
          let diff = s.categoryData.length - oLen
          s.setDataZoom( oIndex.startValue + diff, oIndex.endValue + diff)
        })
      }
    },
    getDataZoomIndex () {
      const s = this
      if(!s.chart) return
      let opt = s.chart.getOption()
      return {
        startValue: opt.dataZoom[0].startValue,
        endValue: opt.dataZoom[0].endValue
      }
    },
    resize () {
      const s = this
      if(s.chart) {
        s.chart.resize()
      }
    }
  }
}
</script>

<style>
  .vue-chart-kline {
    position: relative;
    width: 100%;
    height: 100%;
    font-size: 12px;
    text-align: left;
  }
  .ths_kline_btns {
    position: absolute;
    right: 60px;
    top: 60%;
  }
  .ths_kline_btns .ths_kline_btn {
    background: url('http://s.thsi.cn/js/jsmodule/chart/vue-fst/canvas-btn.png') no-repeat scroll 0 -26px;
    cursor: pointer;
    color : #666;
    float: left;
    height: 22px;
    line-height: 22px;
    margin-right: 5px;
    overflow: hidden;
    vertical-align: middle;
    width: 18px;
  }
  .ths_kline_btns.black .ths_kline_btn {
    background: url('http://s.thsi.cn/js/jsmodule/chart/vue-fst/canvas-btn2.png') no-repeat scroll 0 -26px;
  }
  .ths_kline_btns .ths_kline_btn-pre {
      background-position: 0 -27px !important;
  }
  .ths_kline_btns .ths_kline_btn-pre:hover {
      background-position: 0 -53px  !important;
  }
  .ths_kline_btns .ths_kline_btn-next {
      background-position: -60px -27px !important;
  }
  .ths_kline_btns .ths_kline_btn-next:hover {
      background-position: -60px -53px !important;
  }
  .ths_kline_btns .ths_kline_btn-zoomin {
      background-position: -40px -27px !important;
  }
  .ths_kline_btns .ths_kline_btn-zoomin:hover {
      background-position: -40px -53px !important;
  }
  .ths_kline_btns .ths_kline_btn-zoomout {
      background-position: -20px -27px !important;
  }
  .ths_kline_btns .ths_kline_btn-zoomout:hover {
      background-position: -20px -53px !important;
  }
  .ths_kline_btns .ths_kline_btn-pre-disabled,
  .ths_kline_btns .ths_kline_btn-pre-disabled:hover {
      background-position: 0 0  !important;
      cursor: default;
  }
  .ths_kline_btns .ths_kline_btn-next-disabled,
  .ths_kline_btns .ths_kline_btn-next-disabled:hover {
      background-position: -60px 0 !important;
      cursor: default;
  }
  .ths_kline_btns .ths_kline_btn-zoomin-disabled,
  .ths_kline_btns .ths_kline_btn-zoomin-disabled:hover {
      background-position: -40px 0 !important;
      cursor: default;
  }
  .ths_kline_btns .ths_kline_btn-zoomout-disabled,
  .ths_kline_btns .ths_kline_btn-zoomout-disabled:hover {
      background-position: -20px 0 !important;
      cursor: default;
  }
</style>