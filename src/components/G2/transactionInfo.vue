<template>
  <div>
    <card-title cardtitle='异动/资讯'></card-title>
    <div class="info-list" :class="{changeWhite: !mytheme}" id="info-list">
      <ul>
        <li v-for="(item, index) in newsArr" :key="index" :class="{evlistblack: mytheme, evlistwhite: !mytheme}">
          <span class="list-title" @click="openModel(item)">{{item.title}}</span>
          <span class="list--time">
            <span v-if="(new Date(Number(item.ctime + '000'))).getMonth()+1<10">0</span>{{(new Date(Number(item.ctime + '000'))).getMonth() +1}} -
            <span v-if="(new Date(Number(item.ctime + '000'))).getDate()<10">0</span>{{(new Date(Number(item.ctime + '000'))).getDate()}}</span>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
import cardTitle from '@/components/card/cardTitle.vue'

export default {
  components: {
    'card-title': cardTitle
  },
  data: function() {
    return {
      newsArr: []
    }
  },
  mounted: function() {
    // 请求数据
    let url =
      'http://ai.iwencai.com/mobile/NewHotSpotStocks/indexData?params=jrjh%3A10%2Czcxjh%3A10&source=pcsjqd'

    let vm = this
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'jsonp',
      success: function(data) {
        vm.newsArr = data.data.jrjh.concat(data.data.zcxjh)

        // for (let a of vm.newsArr) {
        //   console.log(a.ctime)
        // }
        // console.log( vm.newsArr)
        vm.newsArr = vm.newsArr.sort((a, b) => {
          // console.log(Number(b.ctime) < Number(a.ctime))
           return Number(b.ctime) - Number(a.ctime)
          // return (
          //   new Date(Number(a.ctime + '000')) <
          //   new Date(Number(b.ctime + '000'))
          // )
        })

        // 设置滚动条额颜色
        if (window.theme == 'white') {
          $('#info-list').niceScroll({
            cursorcolor: '#777',
            cursorborder: '1px solid #777', // 滚动条边框样式
            cursorwidth: '8px'
          })
        } else {
          $('#info-list').niceScroll({
            cursorborder: '1px solid #424242', // 滚动条边框样式
            cursorwidth: '8px'
          })
        }
      }
    })
  },
  watch: {
    newsArr: function(newV) {
      // console.log(newV)
    }
  },
  computed: {
    mytheme: function() {
      if (window.theme === 'black') {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    openModel: function(item) {
      // 首先更改DOM内容
      eventBus.$emit('showNews', item)
      this.modelinfo = item
      this.model = true
    },
    closeModel: function() {
      this.model = false
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.info-list {
  height: 180px;
  padding-left: 10px;
  color: #868686;
  font-size: 12px;
  text-align: left;
  overflow-y: scroll;
}

.info-list ul li {
  height: 20px;
  margin-bottom: 10px;
  padding-right: 15px;
}

.list--time {
  float: right;
}

.list-title {
  display: inline-block;
  width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.evlistblack:hover {
  color: white;
}

.evlistwhite:hover {
  color: black;
}
</style>


