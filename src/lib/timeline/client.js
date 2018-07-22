/*
*  kline 依赖的底层方法
*/

if(!window.Acme && console) {
  console.error('need Acme v1.0 (http://gitlab.10jqka.com.cn/kuckboy/acme)')
}

var Client = {
  _count: 0,
  count: function() {
    return this._count ++;
  },
  isTradeDate: Acme.isTradeDate,
  getCodeName (code, cb) {
    Acme.getClientData({
        code: code,
        type:'ZQMC',
        period:'now',
        mode:'after'
    }, function (data) {
      try{
        cb(data[code]['ZQMC'])
      }catch(e) {
        cb('--')
      }
    })
  },
  getPre (code, cb) {
    Acme.getHqData({
      type : 'PRE',
      code : code,
      peroid : 'now'
    }, function(d) {
      try{
        cb(Number(d[code]['PRE']))
      }catch(e) {}
    })
  },
  getNowData (code, date, cb)  {
    let thsType = ['NEW','VOL','JUNJIA']
    window.API.use({
      method : 'Quote.request',
      callbackName: 'onready',
      data : {
        type : thsType,
        code : code,
        period : 'min',
        begin : date,
        end : date,
        timeFmt : 1
      },
      success : function(){
        API.use({
          method : 'Quote.getData2',
          data : {
            code : code,
            type : thsType,
            period : 'min',
            time : {
              begin : date,
              end : date,
              timeFmt : 1
            },
            updateMode : 1,
            timeStamp : 1
          },
          success : function(d){
            try{
              d = eval('('+d+')');
              cb(d)
            }catch(e) {}
          }
        })
      }
    })
  },
  getClientEnv: Acme.getClientEnv,
  debounce: Acme.debounce,
  getZDFText: Acme.getZDFText,
  getTime: Acme.getTime,
  getTradeDate: Acme.getTradeDate,
  getUnit: Acme.getUnit
}

module.exports = Client