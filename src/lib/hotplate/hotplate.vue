<template>
  <div v-if="data">
    <ul class="plate-list" :class="{'plate-list-white': colorStyle=='white'}" ref="list">
      <li class="plate-nav" v-for="(item, index) in data['qs']" :stockcode="item['stockcode']" @click="choosePalte(item['stockcode'])" @dblclick="jump2plate(item['stockcode'])">
        <span class="plate-color"><span class="diamond" :style="{ background: colors['colorArr'][index] || (colorStyle=='black'?'#1b1b1b':'#ffffff') }"></span></span>
        <span class="plate-name">{{rank[index]+'：'+item['stockname']}}</span>
      </li>
    </ul>
    <div class="plate-table" id="plate_table" :class="{'plate-table-white': colorStyle=='white'}" ref="table">
      <div class="thead-serial" :style="{ lineHeight: thLineHeight+'px' }">排序</div>
      <table class="table-content" border="0" cellpadding="0" cellspacing="0">
          <thead>
            <tr :style="{ lineHeight: thLineHeight+'px' }">
              <th class="first">排序</th>
              <th v-for="(item, index) in data['mrpm']['up']">{{item['stocks'][0]['date']}}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(i, n) in data['mrpm']['up']" :style="{ lineHeight: tdLineHeight+'px' }" :class="[n==9?'brBottom':'']">
              <td class="first"><p class="first-p" style="color: #d6524d">{{n+1}}</p></td>
              <td v-for="(item, index) in data['mrpm']['up']" v-if="item['stocks'][n]" :stockcode="item['stocks'][n]['stockcode']" @click="chooseTable(item['stocks'][n]['stockcode'])" @dblclick="jump2plate(item['stocks'][n]['stockcode'])">{{item['stocks'][n]['stockname']}}</td>
              <td v-else></td>
            </tr>
            <tr v-for="(i, n) in data['mrpm']['down']" :style="{ lineHeight: tdLineHeight+'px' }">
              <td class="first"><p class="first-p" style="color: #219d72">{{reverseNumber(n)}}</p></td>
              <td v-for="(item, index) in data['mrpm']['down']" v-if="item['stocks'][n]" :stockcode="item['stocks'][n]['stockcode']" @click="chooseTable(item['stocks'][n]['stockcode'])" @dblclick="jump2plate(item['stocks'][n]['stockcode'])">{{item['stocks'][n]['stockname']}}</td>
              <td v-else></td>
            </tr>
          </tbody>
        </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "hotplate",
  props: {
    data: {
      type: Object,
      required: true
    },
    colors: {
      type: Object,
      required: true
    },
    colorStyle: {
      type: String,
      default: "black"
    },
    defaultChoose: {
      type: Number,
      required: true
    },
    jumpFlag: {
      type: String,
      default: "none"
    },
    tableLHOffset: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      rank: [
        "第一名",
        "第二名",
        "第三名",
        "第四名",
        "第五名",
        "第六名",
        "第七名",
        "第八名",
        "第九名",
        "第十名"
      ],
      tableLineHeight: void 0,
      offsetHeight: 0,
      code: void 0 // 选中的板块id
    };
  },
  mounted() {
    const s = this;
    this.$nextTick(function() {
      // Code that will run only after the
      // entire view has been rendered
      setTimeout(function() {
        let $ = document.querySelector.bind(document);
        let boxEle = $(".plate-table");
        boxEle.addEventListener("scroll", function(e) {
          let self = this;
          s.forEach(document.querySelectorAll(".first"), function(
            index,
            value
          ) {
            value.style.transform = "translate(" + self.scrollLeft + "px, 0)";
          });
          self.querySelector(".table-content>thead").style.transform =
            "translate(0, " + self.scrollTop + "px)";
          self.querySelector(".thead-serial").style.transform =
            "translate(" + self.scrollLeft + "px, " + self.scrollTop + "px)";
        });
        s.renderFirst();
        s.resize();
      });
    });
  },
  computed: {
    bgColor() {
      const s = this;
      let obj = {};
      for (let i in s.data["qs"]) {
        obj[s.data["qs"][i]["stockcode"]] =
          s.colors["colorArr"][i] || s.colors["colorDefault"];
      }
      return obj;
    },
    thLineHeight() {
      const s = this;
      return (
        s.offsetHeight -
        11 -
        (s.tableLineHeight - s.tableLHOffset) * 10 +
        s.tableLHOffset
      );
    },
    tdLineHeight() {
      const s = this;
      return s.tableLineHeight;
    }
  },
  watch: {
    data: {
      handler: function(val, oldVal) {
        const s = this;
        setTimeout(function() {
          s.renderFirst();
        });
      },
      deep: true
    }
  },
  methods: {
    resize() {
      const s = this;
      s.offsetHeight = s.$refs.table.offsetHeight;
      s.tableLineHeight = parseInt(s.offsetHeight / 11) + s.tableLHOffset;
      s.$refs.table.style.opacity = 1;
      s.$emit("use-scroll", "plate_table");
    },
    renderFirst() {
      const s = this;
      s.forEach(document.querySelectorAll("ul > .highlight"), function(
        index,
        value
      ) {
        value.className = "plate-nav";
      });
      s.forEach(document.querySelectorAll("tr > .bgColor"), function(
        index,
        value
      ) {
        value.className = "";
        value.style.background = "";
      });
      // 选中设置
      if (!s.code) {
        // 默认选中前defaultChoose个板块
        for (let i in s.data["qs"]) {
          if (i >= s.defaultChoose) {
            break;
          }
          let code = s.data["qs"][i]["stockcode"];
          s.forEach(
            document.querySelectorAll("tr>[stockcode='" + code + "']"),
            function(index, value) {
              value.className = "bgColor";
              value.style.background =
                s.bgColor[code] || s.colors["colorDefault"];
            }
          );
          if (document.querySelector("ul>[stockcode='" + code + "']")) {
            document.querySelector("ul>[stockcode='" + code + "']").className =
              "plate-nav highlight";
          }
        }
      } else {
        let code = s.code;
        s.forEach(
          document.querySelectorAll("tr>[stockcode='" + code + "']"),
          function(index, value) {
            value.className = "bgColor";
            value.style.background =
              s.bgColor[code] || s.colors["colorDefault"];
          }
        );
        if (document.querySelector("ul>[stockcode='" + code + "']")) {
          document.querySelector("ul>[stockcode='" + code + "']").className =
            "plate-nav highlight";
        }
      }
    },
    reverseNumber(val) {
      return 10 - val;
    },
    choosePalte(code) {
      const s = this;
      s.code = code;
      s.renderColor(code);
    },
    chooseTable(code) {
      const s = this;
      if (!code) {
        return;
      }
      s.code = code;
      s.renderColor(code);
    },
    renderColor(code) {
      const s = this;
      s.forEach(document.querySelectorAll("ul > .highlight"), function(
        index,
        value
      ) {
        value.className = "plate-nav";
      });
      s.forEach(document.querySelectorAll("tr > .bgColor"), function(
        index,
        value
      ) {
        value.className = "";
        value.style.background = "";
      });
      s.forEach(
        document.querySelectorAll("tr>[stockcode='" + code + "']"),
        function(index, value) {
          value.className = "bgColor";
          value.style.background = s.bgColor[code] || s.colors["colorDefault"];
        }
      );
      if (document.querySelector("ul>[stockcode='" + code + "']")) {
        document.querySelector("ul>[stockcode='" + code + "']").className =
          "plate-nav highlight";
      }
    },
    jump2plate(code) {
      const s = this;
      switch (s.jumpFlag) {
        case "kline":
          try {
            API.use({
              method: "Quote.syncStockList",
              data: {
                id: 65,
                code: code,
                period: "16384",
                stocklist: code
              },
              success: function() {}
            });
          } catch (e) {}
          break;
        case "fs":
          try {
            API.use({
              method: "Quote.syncStockList",
              data: {
                id: 379,
                code: code,
                period: "8192",
                stocklist: code
              },
              success: function() {}
            });
          } catch (e) {}
          break;
        default:
          break;
      }
    },
    forEach(array, callback, scope) {
      for (let i = 0; i < array.length; i++) {
        callback.call(scope, i, array[i]);
      }
    }
  }
};
</script>

<style scoped>
.bgColor {
  color: #fff;
}
p {
  margin: 0;
  padding: 0;
}
ul,
li {
  list-style: none;
  padding: 0;
  margin: 0;
}
.plate-list {
  width: 160px;
  height: 100%;
  float: left;
}
.highlight {
  color: #ffffff;
  font-weight: bold;
}
.plate-list-white .highlight {
  color: #3c3c3c;
  font-weight: bold;
}
.plate-nav {
  height: 10%;
  text-align: left;
  cursor: pointer;
}
.plate-nav-choose {
  font-weight: 700;
}
.plate-color {
  width: 10px;
  height: 100%;
  margin-left: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  float: left;
}
.diamond {
  width: 8px;
  height: 8px;
  display: inline-block;
  margin-top: 5px;
  -webkit-transform-origin: 0 100%;
  -moz-transform-origin: 0 100%;
  -o-transform-origin: 0 100%;
  -ms-transform-origin: 0 100%;
  transform-origin: 0 100%;
  -webkit-transform: rotate(-45deg);
  -moz-transform: rotate(-45deg);
  -o-transform: rotate(-45deg);
  -ms-transform: rotate(-45deg);
  transform: rotate(-45deg);
}
.plate-name {
  display: flex;
  flex-direction: column;
  justify-content: center;
  float: left;
  width: calc(100% - 25px);
  height: 100%;
}
.plate-table {
  width: calc(100% - 160px);
  height: 100%;
  float: left;
  overflow: auto;
  opacity: 0;
  position: relative;
  cursor: default;
}
.thead-serial {
  position: absolute;
  left: 0;
  top: 0;
  width: 50px;
  text-align: center;
  font-weight: bold;
  background: #2f2f2f;
  z-index: 10;
}
.plate-table-white .thead-serial {
  background: #e5e5e5;
}
.brBottom {
  border-bottom: 4px solid #2f2f2f;
}
.plate-table-white .brBottom {
  border-bottom: 4px solid #e5e5e5;
}
.plate-table table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.plate-table table .first {
  width: 50px;
  min-width: 50px !important;
  background: #1b1b1b;
  border-right: none;
  padding: 0;
}
.plate-table-white table .first {
  background: #ffffff;
}
.first-p {
  /*padding-left: 17px;*/
  text-align: center;
  border-right: 1px solid #2f2f2f;
  border-left: 1px solid #2f2f2f;
}
.plate-table-white .first-p {
  border-right: 1px solid #e5e5e5;
  border-left: 1px solid #e5e5e5;
}
.plate-table table th {
  background-color: #2f2f2f !important;
}
.plate-table-white table th {
  background-color: #e5e5e5 !important;
}
.plate-table table th,
.plate-table table td {
  min-width: 80px;
  border-right: 1px solid #2f2f2f;
  border-bottom: 1px solid #2f2f2f;
  white-space: nowrap;
}
.plate-table-white table th,
.plate-table-white table td {
  border-right: 1px solid #e5e5e5;
  border-bottom: 1px solid #e5e5e5;
}
.plate-table table td {
  text-align: left;
  padding: 0 5px;
}
</style>