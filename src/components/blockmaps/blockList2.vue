<template>
  <div id="topContainer">
    <div class="blockList2 tableHeader">
      <table class="tableHead">
        <thead>
          <tr>
            <th v-for="(item,key) in tableHead" :width='item.width' :key='key' @click='sortBy(item.key,sortObj.sortOrder);maidian(item.key)'>{{item.name}}</th>
          </tr>
        </thead>
        <div v-if="sortObj.arrowShow" :style="arrowUpStyle"></div>
        <div v-if="sortObj.arrowShow" :style="arrowDownStyle"></div>
      </table>
    </div>
    <div id="listContainer2">
      <div class="blockList2">
        <table>
          <tbody>
            <tr v-for="(item,key) in hqData" :key='key' :class="{selected:item.key==selectedCode}" @click="selectList(item.key)">
              <td width='25%' @click="gotoTimeLine(item.key)">{{item.zqmc}}</td>
              <td width='18%' :class="{cr:item.zhangdiefu>0 , cg:item.zhangdiefu<0}">{{format(item.new,'new')}}</td>
              <td width='17%' :class="{cr:item.zhangdiefu>0 , cg:item.zhangdiefu<0}">{{format(item.zhangdiefu,'zhangdiefu')}}</td>
              <td width='20%'>{{format(item.huanshou,'huanshou')}}</td>
              <td width='20%' :class="{cr:item['592888']>0 , cg:item['592888']<0}">{{format(item['592888'],'592888')}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

</template>
<script>
export default {
  // comments:{'EasyScrollbar':EasyScroll},
  name: 'blockList2',
  created() {
    var self = this
    eventBus.$on('blockCode', this.handle)
  },
  mounted() {
    var self = this
    $(window).resize(function() {
      //当浏览器大小变化时
      if (document.body.clientHeight > 843) {
        var height = document.body.clientHeight - 629 + 'px'
        $('#listContainer2').css('height', height)
      } else {
        $('#listContainer2').css('height', '267px')
      }
    })
    if (document.body.clientHeight > 843) {
      var height = document.body.clientHeight - 629 + 'px'
      $('#listContainer2').css('height', height)
    } else {
      $('#listContainer2').css('height', '267px')
    }
    // console.log(self.bottomColor)
    self.getAllCodes(self.platecode)
    if (window.theme === 'black') {
      // $('#listContainer2 .tbody tr').css({ 'borderBottom': '1px solid #282828' })

      $('#listContainer2').niceScroll({
        cursorborder: '1px solid #424242',
        cursorwidth: '8px'
      })
    } else {
      // console.log('asdasdfasdf')
      // $('#listContainer2 tbody tr').css({ 'borderBottom': '1px solid #595959' })
      $('#listContainer2').niceScroll({
        cursorcolor: '#777',
        cursorborder: '1px solid #777',
        cursorwidth: '8px'
      })
    }

    $('#listContainer2')
      .getNiceScroll(0)
      .doScrollTop(0, 0) // 垂直滚动条，滚到某个位置
  },
  beforeDestroy() {
    // console.log('销毁了blockcode');
    clearInterval(this.interval)
    clearInterval(this.codeListInterval)
    eventBus.$off('blockCode', this.handle)
  },
  data() {
    return {
      platecode: void 0,
      sortObj: {
        sortOrder: false,
        arrowShow: false
      },
      bottomColor: window.theme === 'white' ? '#595959' : '#282828',
      sortKey: 'zhangdiefu',
      selectedCode: '',
      arrowUpStyle: {
        height: 0,
        width: 0,
        borderTop: '4px solid transparent',
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderBottom: '4px solid white',
        position: 'absolute',
        top: '6px'
      },
      arrowDownStyle: {
        height: 0,
        width: 0,
        borderTop: '4px solid white',
        borderLeft: '4px solid transparent',
        borderRight: '4px solid transparent',
        borderBottom: '4px solid transparent',
        position: 'absolute',
        top: '16px'
      },
      tableHead: [
        {
          name: '名称',
          key: 'zqmc',
          width: '25%'
        },
        {
          name: '现价',
          key: 'new',
          width: '18%'
        },
        {
          name: '涨幅%',
          key: 'zhangdiefu',
          width: '17%'
        },
        {
          name: '换手%',
          key: 'huanshou',
          width: '20%'
        },
        {
          name: '大单净量',
          key: '592888',
          width: '20%'
        }
      ],
      hqData: [],
      // hqData:{"000001":{"592888":"-0.0291","zqmc":"平安银行","huanshou":"1.4120","new":"14.650","zhangdiefu":"1.4543"},"002142":{"592888":"0.1056","zqmc":"宁波银行","huanshou":"0.7261","new":"20.660","zhangdiefu":"4.2908"},"002807":{"592888":"-0.3593","zqmc":"江阴银行","huanshou":"14.4745","new":"9.400","zhangdiefu":"3.0702"},"002839":{"592888":"-3.2823","zqmc":"张家港行","huanshou":"52.2120","new":"14.770","zhangdiefu":"1.5818"},"600000":{"592888":"-0.1217","zqmc":"浦发银行","huanshou":"0.7751","new":"12.900","zhangdiefu":"1.0180"},"600015":{"592888":"0.0411","zqmc":"华夏银行","huanshou":"0.7368","new":"9.990","zhangdiefu":"3.3092"},"600016":{"592888":"0.0607","zqmc":"民生银行","huanshou":"0.7079","new":"9.240","zhangdiefu":"3.3557"},"600036":{"592888":"-0.0172","zqmc":"招商银行","huanshou":"0.4213","new":"34.050","zhangdiefu":"2.9323"},"600908":{"592888":"-0.0391","zqmc":"无锡银行","huanshou":"10.4877","new":"9.240","zhangdiefu":"3.5874"},"600919":{"592888":"0.0699","zqmc":"江苏银行","huanshou":"1.6197","new":"8.190","zhangdiefu":"2.2472"},"600926":{"592888":"0.1284","zqmc":"杭州银行","huanshou":"3.6672","new":"12.930","zhangdiefu":"2.6190"},"601009":{"592888":"-0.2187","zqmc":"南京银行","huanshou":"1.7741","new":"9.370","zhangdiefu":"0.8611"},"601128":{"592888":"-0.0560","zqmc":"常熟银行","huanshou":"9.1253","new":"8.630","zhangdiefu":"4.9878"},"601166":{"592888":"-0.0862","zqmc":"兴业银行","huanshou":"1.8542","new":"18.280","zhangdiefu":"2.1229"},"601169":{"592888":"-0.0548","zqmc":"北京银行","huanshou":"0.6503","new":"7.650","zhangdiefu":"1.8642"},"601229":{"592888":"-0.0201","zqmc":"上海银行","huanshou":"1.1991","new":"15.990","zhangdiefu":"1.6529"},"601288":{"592888":"-0.0574","zqmc":"农业银行","huanshou":"0.5560","new":"4.480","zhangdiefu":"2.7523"},"601328":{"592888":"0.0581","zqmc":"交通银行","huanshou":"1.4173","new":"6.980","zhangdiefu":"4.6477"},"601398":{"592888":"-0.0036","zqmc":"工商银行","huanshou":"0.2237","new":"7.490","zhangdiefu":"4.4630"},"601818":{"592888":"0.1457","zqmc":"光大银行","huanshou":"1.5849","new":"4.800","zhangdiefu":"7.1429"},"601838":{"592888":"NUL","zqmc":"成都银行","huanshou":"NUL","new":"NUL","zhangdiefu":"NUL"},"601939":{"592888":"0.2225","zqmc":"建设银行","huanshou":"3.4065","new":"9.810","zhangdiefu":"8.2781"},"601988":{"592888":"0.0420","zqmc":"中国银行","huanshou":"0.3349","new":"4.680","zhangdiefu":"6.3636"},"601997":{"592888":"0.0326","zqmc":"贵阳银行","huanshou":"2.9990","new":"15.290","zhangdiefu":"2.0013"},"601998":{"592888":"-0.0147","zqmc":"中信银行","huanshou":"0.3812","new":"7.380","zhangdiefu":"3.6517"},"603323":{"592888":"3.0630","zqmc":"吴江银行","huanshou":"20.4744","new":"10.210","zhangdiefu":"10.0216"}},
      quoteSessionId: '',
      pushTime: '',
      interval: '',
      codeList: {}, //传给个股热力图的股票，2分钟一次
      codeListInterval: null,
      originData: null
    }
  },
  methods: {
    maidian(key) {
      var self = this
      if (key == 'zqmc') {
        return
      } else if (key == 'new') {
      } else if (key == 'zhangdiefu') {
        TA.log({ id: 'L2rdzz_5a77f295_7' })
      } else if (key == 'huanshou') {
        TA.log({ id: 'L2rdzz_5a77f2ce_806' })
      } else if (key == '592888') {
      }
      $('#listContainer2')
        .getNiceScroll(0)
        .doScrollTop(0, 100)
    },
    handle: function(val) {
      var self = this
      self.platecode = val
      self.getAllCodes(self.platecode)
      self.blockCode = val
    },
    selectList: function(key) {
      var self = this
      self.selectedCode = key
      TA.log({ id: 'L2rdzz_5a77f23f_129' })
    },
    getAllCodes: function(platecode) {
      var self = this
      self.sortObj.arrowShow = false
      window.timers = +new Date()
      window.API.use({
        method: 'Util.getBlockStockByCode',
        data: platecode,
        success: function(stocks) {
          clearInterval(self.interval)
          clearInterval(self.codeListInterval)
          self.interval = setInterval(function() {
            Acme.getHqData(
              {
                code: stocks,
                type: ['zqmc', 'new', 'zhangdiefu', 'huanshou', '592888'],
                period: 'now',
                mode: 'after'
              },
              function(data) {
                self.renderListData(data)
                self.originData = data
              }
            )
          }, 2000)
          self.codeListInterval = setInterval(function() {
            var toHotChart = []
            for (var key in self.originData) {
              let obj = {}
              obj['key'] = key
              obj['zqmc'] = self.originData[key]['zqmc']
              obj['zhangdiefu'] = self.originData[key]['zhangdiefu']
              toHotChart.push(obj)
            }
            self.codeList['stockList'] = Acme.sort(
              toHotChart,
              false,
              'zhangdiefu'
            )
            self.codeList['platecode'] = self.platecode
            eventBus.$emit('stockHeat', self.codeList)
          }, 60000)
          window.timers = +new Date()
          Acme.getHqData(
            {
              code: stocks,
              type: ['zqmc', 'new', 'zhangdiefu', 'huanshou', '592888'],
              period: 'now',
              mode: 'after'
            },
            function(data) {
              self.renderListData(data)
              setTimeout(function() {
                $('#listContainer2')
                  .getNiceScroll()
                  .resize()
              }, 100)

              var toHotChart2 = []
              for (var key in data) {
                let obj = {}
                obj['key'] = key
                obj['zqmc'] = data[key]['zqmc']
                obj['zhangdiefu'] = data[key]['zhangdiefu']
                toHotChart2.push(obj)
              }
              // self.codeList=Acme.sort(toHotChart2,false,'zhangdiefu');
              self.codeList['stockList'] = Acme.sort(
                toHotChart2,
                false,
                'zhangdiefu'
              )
              self.codeList['platecode'] = self.platecode
              window.timers = +new Date()
              // if (window.theme === 'white') {
              //   console.log('white=asfdjasd')
              //   $('#listContainer2 tbody tr').css({
              //     'border-bottom': '1px solid #595959'
              //   })
              // } else {
              //   $('#listContainer2 tbody tr').css({
              //     'border-bottom': '1px solid #282828'
              //   })
              // }
              eventBus.$emit('stockHeat', self.codeList)
            }
          )
          // window.API.use({
          //     method:'Quote.request',
          //     data:{
          //       code:stocks,
          //       type:['zqmc','new','zhangdiefu','huanshou','592888'],
          //       period:'now'
          //     },
          //     callbackName:'onready',
          //     success:function(data){
          //       window.API.use({
          //         method:'Quote.getData2',
          //         data:{
          //           code:stocks,
          //           type:['zqmc','new','zhangdiefu','huanshou','592888'],
          //           period:'now',
          //           mode:'after'
          //         },
          //         success:function(data){
          //           console.log(data);
          //           var obj=JSON.parse(data);
          //           var arr=[];
          //           for(var key in obj){
          //             let add={};

          //             console.log(key+' '+obj[key].zqmc);
          //           }
          //         }
          //       });
          //     }
          //   });
        },
        error: function() {}
      })
    },
    renderListData: function(data) {
      var self = this
      var sortArr = []
      for (var key in data) {
        let element = {}
        element.key = key
        element.zqmc = data[key].zqmc
        element.new = data[key].new
        element.zhangdiefu = data[key].zhangdiefu
        element.huanshou = data[key].huanshou
        element['592888'] = data[key]['592888']
        sortArr.push(element)
        // console.log(key);
      }

      self.hqData = sortArr
      self.sortBy(self.sortKey, 'notchange')
    },
    format: function(num, type) {
      if (num == 'NUL') {
        return '--'
      }
      if (type == 'new') {
        return Acme.toFixed(num, 2)
      } else if (type == 'zhangdiefu') {
        if (num > 0) {
          return '+' + Acme.toFixed(num, 2)
        } else {
          return Acme.toFixed(num, 2)
        }
      } else if (type == 'huanshou') {
        return Acme.toFixed(num, 2)
      } else if (type == '592888') {
        return Acme.toFixed(num, 2)
      }
    },
    sortBy: function(key, order) {
      var self = this
      if (key == 'zqmc') {
        return
      } else if (key == 'new') {
        self.arrowDownStyle.left = '122px'
        self.arrowUpStyle.left = '122px'
      } else if (key == 'zhangdiefu') {
        self.arrowDownStyle.left = '172px'
        self.arrowUpStyle.left = '172px'
      } else if (key == 'huanshou') {
        self.arrowDownStyle.left = '235px'
        self.arrowUpStyle.left = '235px'
      } else if (key == '592888') {
        self.arrowDownStyle.left = '295px'
        self.arrowUpStyle.left = '295px'
      }

      if (order !== 'notchange') {
        self.sortObj.arrowShow = true
        // self.sortObj.sortOrder = self.$set(self.sortObj,'sortOrder',!self.sortObj.sortOrder);
        self.sortObj.sortOrder = !order
        self.sortKey = key || 'zhangdiefu'
        self.hqData = Object.assign([], Acme.sort(this.hqData, !order, key))
      } else {
        order = self.sortObj.sortOrder
        self.hqData = Object.assign([], Acme.sort(this.hqData, order, key))
      }
      // console.log(order,key,self.sortObj.sortOrder)
    },
    gotoTimeLine: function(code) {
      // console.log(code);
      Acme.gotoTimeLine(code)
    },
    registerPush(stockarr) {
      var self = this
      // if(stockarr.length === 0)return;
      self.pushTime = new Date().getTime()
      //推送注册
      self.quoteSessionId = window.API.createSessionId('Quote')
      window.API.use({
        method: 'Quote.registerPush',
        data: { code: stockarr.join(',') },
        sessionId: self.quoteSessionId,
        persistent: true,
        callbackName: 'onready',
        success: function(data) {
          window.API.use({
            method: 'Quote.getData2',
            data: {
              code: stockarr.join(','),
              type: ['zqmc', 'new', 'zhangdiefu', 'huanshou', '592888'],
              period: 'now',
              mode: 'after'
            },
            success: function(data) {
              if (data && new Date().getTime() - self.pushTime > 1000) {
                self.preHotPlate = JSON.parse(data)
              }
            }
          })
        }
      })
    }
  }
}
</script>
<style scoped>
* {
  box-sizing: border-box;
}
#topContainer {
  position: relative;
}
#listContainer2 {
  width: 305px;
  height: 227px;
}
table {
  border-collapse: collapse;
  position: relative;
}
table tr th {
  font-size: 12px;
  color: #a0a0a0;
  background-color: #2a2a2a;
  text-align: right;
  font-weight: normal;
  padding-right: 12px;
  height: 28px;
  line-height: 28px;
  cursor: pointer;
}
.white table tr th {
  color: #a0a0a0;
  background-color: #434343;
}
table tr th:nth-child(1) {
  padding-left: 12px;
  text-align: left;
  cursor: default;
}
.blockList2 table tr td {
  font-size: 12px;
  color: white;
  text-align: right;
  font-weight: normal;
  padding-right: 12px;
  height: 28px;
  line-height: 28px;
  cursor: default;
}
.blockList2 table tr td:nth-child(5) {
  padding: 0;
  padding-right: 10px;
}
.blockList2 table tr td:nth-child(1) {
  text-align: left;
  padding-left: 12px;
  cursor: pointer;
}
.blockList2 .cr {
  color: #d6524d;
}
.blockList2 .cg {
  color: #1cbf7b;
}
table tr:hover {
  background-color: #333333;
}
#listContainer2 .selected {
  background-color: #0d2a4a;
}
.white table tbody tr:hover {
  background-color: #595959;
}
.white #listContainer2 .selected {
  background-color: #354c82;
}

/* 新添加的样式*/

tbody tr {
  border-bottom: 1px solid #282828;
}

.white tbody tr {
  border-bottom: 1px solid #595959;
}
</style>
