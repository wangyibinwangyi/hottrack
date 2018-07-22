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
  getTime: Acme.getTime,
  getTradeDate: Acme.getTradeDate,
  /* str: '20180101' */
  getCustomDate (str, num) {
    str = str + ''
    let y = str.substring(0,4) - 0
    let m = str.substring(4,6) - 1
    let d = str.substring(6,8) - 0
    let date = new Date(y,m,d)
    date.setDate(date.getDate() + num)
    return Acme.formatDate(date, 'yyyyMMdd')
  },
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
  getKlineData (code, end, num, cb) {

    var s = this

    if(!s.code || code != s.code) return

    code = code + ''

    // 错位日期计算依据
    // 1. 每7天缺失2天数据 -> 0.222 ， 先预估多取0.3倍 
    // 2. 停牌以3个月(92天为上限)
    // 3. 一些特殊的
    let diffNum;

    switch(code) {
      case '300104':
        diffNum = - 330 + parseInt(num * 1.3)
        break
      default:
        diffNum = -92
    }

    diffNum = parseInt(num * 1.3) < diffNum ? parseInt(num * 1.3) : diffNum
    let start = this.getCustomDate(end, diffNum)

    API.use({
      method: 'Quote.request',
      data: {
        code: code,
        type: 'open,close,high,low,VOL',
        period: 16384,
        mode: 'after',
        begin: start,
        end: end
      },
      success: function() {
        if(!s.code || code != s.code) return
        API.use({
          method: 'Quote.getData2',
          data: {
            code: code,
            type: 'open,close,high,low,VOL',
            period: 16384,
            mode: 'after',
            time: {
              begin: start,
              end: end
            }
          },
          success: function(d) {
            if(!s.code || code != s.code) return
            try{
              cb(eval('(' + d + ')')[code])
            }catch(e) {

            }
          }
        })
      }
    })
  },
  getClientEnv: Acme.getClientEnv,
  getUnit: Acme.getUnit,
  // throttle: Acme.throttle,
  debounce: Acme.debounce
}

module.exports = Client