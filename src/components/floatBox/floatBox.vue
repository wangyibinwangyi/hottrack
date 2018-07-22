<template>
  <div class="container" id="selectBox" v-show="openSeletion">
    <div class="title">
        <span class="title-name">设置</span>
        <span class="close" @click="hideBox">X</span>
    </div>
    <div class="body">
        <div class="left-side">
            <input placeholder="查找行业/概念/地域板块" type="text" class="search-input" id="floatBoxInput" @keyup="keyupInput">
            <span class="search-icon"></span>
            <span class="clear-icon" @click="clearInput"></span>
            <div class="block-list">
              <float-tree :data="treeData" :listArray="chooseList"></float-tree>
            </div>
        </div>
        <div class="right-side">
            <ul class="btn-list">
                <li :class="{'active':showFollow}" @click="changeBtn(1)">关注</li>
                <li :class="{'active':!showFollow}"  @click="changeBtn(2)">黑名单</li>
            </ul>
            <p class="text-title">
              已设置{{showFollow?'关注':'黑名单'}}<span class="info-icon button" :ltip="tipMessage" ltip-theme="white" ltip-pos="bottom"></span>: <span>{{chooseList.length}}</span>/50
            </p>
            <ul class="choose-list">
              <li v-for="(item,index) in chooseList" :key="index" :code="item.block_code" class="list-item" @click="delListItem">{{item.block_name}}</li>
            </ul>
        </div>
    <div class="hover-alert-tip" v-show="showHoverTip.show">
      {{showHoverTip.msg}}
    </div>
    </div>
    <div class="bottom">
      <ul class="bottom-btn">
        <li @click="saveAndClose()">确定</li>
        <li @click="hideFloatBox()">取消</li>
      </ul>
    </div>
  </div>
</template>
<script>
import floatTree from "./floatTree";
export default {
  name: "floatBox",
  props: {},
  components: {
    "float-tree": floatTree
  },
  data() {
    return {
      openSeletion: false,
      data: {},
      showFollow: true,
      chooseList: [], //目前显示的列表
      blackList: [], //黑名单列表
      followList: [], //关注列表
      saveData: {
        //最终保存传送的数据
        delList: [],
        followList: [],
        blackList: []
      },
      showHoverTip: {
        show: false,
        msg: "关注"
      },
      keyupTimeout: 0, //键盘精灵搜索间隔
      treeData: [],
      basicData: [],
      url: "http://l2.10jqka.com.cn",
      tipMessage: "设置重点关注板块，建议在20个板块以上"
    };
  },
  created() {
    eventBus.$on("openSeletion", this.openBox);
    eventBus.$on("addChooseList", this.addChooseList);
    eventBus.$on("delChooseList", this.delChooseList);
  },
  beforeDestroy() {
    eventBus.$off("openSeletion", this.openBox);
    eventBus.$off("addChooseList", this.addChooseList);
    eventBus.$off("delChooseList", this.delChooseList);
  },
  mounted() {
    LTip.reBind();
    this.getData();
    this.getListData();
  },
  methods: {
    addChooseList(obj) {
      const self = this;
      if (this.chooseList.length == 50) {
        $("[nodeid=list_" + obj.block_code + "]")
          .siblings("button")
          .removeClass("btn-del")
          .addClass("btn-add");
        if (this.showFollow) {
          this.showHoverTip.msg = "您的关注列表已满";
        } else {
          this.showHoverTip.msg = "您的黑名单列表已满";
        }
        this.showHoverTip.show = true;
        setTimeout(function() {
          self.showHoverTip.show = false;
        }, 2000);
        return false;
      }
      if (self.checkOtherList(obj)) {
        $("[nodeid=list_" + obj.block_code + "]")
          .siblings("button")
          .removeClass("btn-del")
          .addClass("btn-add");
        if (this.showFollow) {
          this.showHoverTip.msg = "该板块已被设置为黑名单,请先取消设置";
        } else {
          this.showHoverTip.msg = "该板块已被设置为关注，请先取消设置";
        }
        this.showHoverTip.show = true;
        setTimeout(function() {
          self.showHoverTip.show = false;
        }, 2000);
        return false;
      }

      this.chooseList.push(obj);
      if (this.showFollow) {
        //关注
        this.followList.push(obj);
        //在保存数组中找到原有的code，执行以下处理
        if (!this.arrayFindCode(this.saveData.followList, obj.block_code)) {
          this.saveData.followList.push(obj.block_code);
        }
        if (this.arrayFindCode(this.saveData.blackList, obj.block_code)) {
          this.arrayDelCode(this.saveData.blackList, obj.block_code);
        }
        this.objDelCode(this.blackList, "block_code", obj.block_code);
      } else {
        this.blackList.push(obj);
        if (!this.arrayFindCode(this.saveData.blackList, obj.block_code)) {
          this.saveData.blackList.push(obj.block_code);
        }
        if (this.arrayFindCode(this.saveData.followList, obj.block_code)) {
          this.arrayDelCode(this.saveData.followList, obj.block_code);
        }
        this.objDelCode(this.followList, "block_code", obj.block_code);
      }
    },
    delChooseList(obj) {
      if (!this.arrayFindCode(this.saveData.delList, obj.block_code)) {
        this.saveData.delList.push(obj.block_code);
      }
      if (this.showFollow) {
        //关注
        //在保存数组中找到原有的code，执行以下处理
        if (this.arrayFindCode(this.saveData.followList, obj.block_code)) {
          this.arrayDelCode(this.saveData.followList, obj.block_code);
        }
        this.objDelCode(this.followList, "block_code", obj.block_code);
      } else {
        if (this.arrayFindCode(this.saveData.blackList, obj.block_code)) {
          this.arrayDelCode(this.saveData.blackList, obj.block_code);
        }
        this.objDelCode(this.blackList, "block_code", obj.block_code);
      }
      //删除显示节点
      this.objDelCode(this.chooseList, "block_code", obj.block_code);
    },
    checkOtherList(obj) {
      //添加时判断另一列表是否存在
      if (this.showFollow) {
        //关注
        if (this.arrayFindCode(this.saveData.blackList, obj.block_code)) {
          return true;
        }
        if (this.objFindCode(this.blackList, "block_code", obj.block_code)) {
          return true;
        }
      } else {
        if (this.arrayFindCode(this.saveData.followList, obj.block_code)) {
          return true;
        }
        if (this.objFindCode(this.followList, "block_code", obj.block_code)) {
          return true;
        }
      }
      return false;
    },
    checkDelList() {
      // 提交前遍历删除列表，留下之前已经存在的股票
      const self = this;
      // $.each(self.saveData.delList,function(key,val){

      // });
    },
    delListItem(e) {
      if (e.offsetX < 190) {
        //删除事件无效
        return;
      }
      var code = $(e.target).attr("code");
      var name = $(e.target).html();
      $("[nodeid=list_" + code + "]")
        .siblings(".btn-del")
        .addClass("btn-add")
        .removeClass("btn-del");
      this.delChooseList({
        block_code: code,
        block_name: name
      });
    },
    objDelCode(arr, key, code) {
      let index = arr.findIndex(function(item) {
        return item[key] == code;
      });
      if (index != -1) {
        arr.splice(index, 1);
      }
    },
    arrayDelCode(arr, code) {
      let index = arr.findIndex(function(item) {
        return item == code;
      });
      if (index != -1) {
        arr.splice(index, 1);
      }
    },
    objFindCode(arr, key, code) {
      return arr.find(function(item) {
        return code == item[key];
      });
    },
    arrayFindCode(arr, code) {
      return arr.find(function(item) {
        return code == item;
      });
    },
    markCodeList() {
      //清除股票列表标记，并重新进行标记
      $(".btn-del")
        .removeClass("btn-del")
        .addClass("btn-add");
      if (this.showFollow) {
        $.each(this.followList, function(key, val) {
          $('[nodeid="list_' + val.block_code + '"]')
            .siblings(".btn-add")
            .removeClass("btn-add")
            .addClass("btn-del");
        });
      } else {
        $.each(this.blackList, function(key, val) {
          $('[nodeid="list_' + val.block_code + '"]')
            .siblings(".btn-add")
            .removeClass("btn-add")
            .addClass("btn-del");
        });
      }
    },
    hideFloatBox() {
      this.openSeletion = false;
    },
    getListData(searchValue) {
      const self = this;
      searchValue = searchValue || "";
      self.checkDelList();
      $.ajax({
        url: "http://ai.10jqka.com.cn/stock/plate/keyboardfales",
        data: { text: searchValue },
        success: function(data) {
          data = eval("(" + data + ")");
          if (data.errorcode == 0) {
            let treeData = [];
            $.each(data.result, function(key, val) {
              let treeStem = {
                title: val.block_sort,
                id: val.block_sort,
                expanded: true,
                children: []
              };
              $.each(val.block_data, function(keys, value) {
                treeStem.children.push({
                  id: "list_" + value.block_code,
                  title: value.block_name,
                  expanded: true,
                  show: true
                });
              });
              treeData.push(treeStem);
            });
            self.treeData = treeData;
          }
          setTimeout(function() {
            self.markCodeList();
          }, 50);
        }
      });
    },
    getData(dontRequest) {
      //获取关注黑名单列表
      const self = this;

      if (dontRequest) {
        if (self.showFollow) {
          //渲染关注列表
          self.chooseList = self.followList.slice();
        } else {
          self.chooseList = self.blackList.slice();
        }
        //无需再次请求
      } else {
        $.ajax({
          url: self.url + "/hottrack/plate/concernblacklist",
          // headers: {
          //   cookie: document.cookie
          // },
          xhrFields: {
            withCredentials: true
          },
          data: {
            "client-type": window.clientType
          },
          dataType: "jsonp",
          success: function(data) {
            if (data.errorcode == 0) {
              self.blackList = data.result.blacklist;
              self.followList = data.result.follow;
              if (self.showFollow) {
                //渲染关注列表
                self.chooseList = self.followList.slice();
              } else {
                self.chooseList = self.blackList.slice();
              }
              self.markCodeList();
            }
          }
        });
      }
    },
    changeBtn(index) {
      if (index === 1) {
        this.showFollow = true;
      } else {
        this.showFollow = false;
      }
      this.getData("dontRequest");
      this.markCodeList();
    },
    openBox() {
      $("#floatBoxInput").val("");
      this.keyupInput({ target: $("#floatBoxInput")[0] });
      this.getData();
      this.openSeletion = true;
    },
    hideBox(e) {
      this.openSeletion = false;
    },
    keyupInput(e) {
      const self = this;
      $(e.target)
        .siblings(".clear-icon")
        .show();
      if ($(e.target).val() == "") {
        $(e.target)
          .siblings(".clear-icon")
          .hide();
      }
      clearTimeout(self.keyupTimeout);
      self.keyupTimeout = setTimeout(function() {
        self.getListData(e.target.value);
      }, 300);
    },
    clearInput(e) {
      $(e.target)
        .hide()
        .siblings("input")
        .val("");
      this.getListData();
    },
    saveAndClose() {
      const self = this;
      $.ajax({
        url: self.url + "/hottrack/plate/addconcernblacklist",
        dataType: "jsonp",
        data: {
          delete: self.saveData.delList.join(","),
          blacklist: self.saveData.blackList.join(","),
          concern: self.saveData.followList.join(",")
        },
        success: function(data) {
          if (data.errorcode == 0) {
            self.hideBox();
            eventBus.$emit("toggleSelectItem", 1);
          } else {
            console.log(data.errormsg);
          }
        }
      });
    },
    setDefault() {
      this.saveData = {
        delList: [],
        balckList: [],
        followList: []
      };
    }
  }
};
</script>
<style scoped>
::-webkit-scrollbar-track-piece {
  background: #fff;
}
::-webkit-scrollbar-thumb {
  background: #b7b7b7;
}
.container {
  position: fixed;
  height: 370px;
  width: 445px;
  border: 1px solid #797979;
  left: 50%;
  margin-left: -222px;
  top: 200px;
  background: #fff;
  z-index: 999999999;
}
.white .container {
  /* background-color:#fff;  */
  color: #3c3c3c;
}
.title {
  height: 30px;
  line-height: 30px;
  font-size: 14px;
  color: #fff;
  background: #515151;
}
.title-name {
  margin-left: 10px;
  float: left;
}
.close {
  float: right;
  margin-right: 10px;
  cursor: pointer;
}

.body {
  clear: both;
  height: 305px;
  position: relative;
}
.left-side {
  float: left;
  width: 50%;
  height: 100%;
  border-right: 1px solid #e4e4e4;
  position: relative;
  font-size: 12px !important;
}
.block-list {
  overflow-y: auto;
  margin-top: 10px;
  margin-left: 10px;
  height: 258px;
}
.search-input {
  margin-top: 15px;
  width: calc(100% - 30px);
  text-indent: 1.5em;
  font-size: 12px;
  border: 1px solid #ccc;
}
.search-icon {
  background: url(../../assets/searchwhite.svg) no-repeat;
  width: 14px;
  height: 14px;
  position: absolute;
  left: 18px;
  top: 17px;
  cursor: default;
}
.clear-icon {
  width: 14px;
  height: 14px;
  display: inline-block;
  background: url(../../assets/deletewhite.svg) no-repeat;
  position: absolute;
  top: 17px;
  right: 30px;
  display: none;
  cursor: pointer;
}
.right-side {
  float: left;
  height: 100%;
  width: 50%;
}
.btn-list {
  list-style: none;
  margin: 10px 0 0 50px;
  padding: 0;
  overflow: hidden;
}
.btn-list li {
  float: left;
  width: 60px;
  text-align: center;
  font-size: 12px;
  height: 26px;
  border: 1px solid #ddd;
  line-height: 26px;
  cursor: pointer;
}
.btn-list li.active {
  background: #e4e4e4;
}
.text-title {
  font-size: 12px;
  clear: both;
  text-align: left;
  padding-left: 1em;
  color: #868686;
  margin: 10px 0;
}
.info-icon {
  width: 16px;
  height: 16px;
  background: url(../../assets/tip-black.svg);
  display: inline-block;
  vertical-align: sub;
  position: relative;
}

.choose-list {
  list-style: none;
  margin: 0;
  padding: 0;
  height: 233px;
  overflow: auto;
}
.choose-list li {
  color: #333;
  line-height: 24px;
  text-align: left;
  font-size: 12px;
}
.bottom {
  height: 30px;
  background: #fafafa;
}
.list-item {
  cursor: default;
  margin-left: 0;
  text-indent: 1em;
  line-height: 24px;
  position: relative;
}
.list-item:hover {
  background: #e4e4e4;
}
.list-item:hover::after {
  content: url(../../assets/deletewhite.svg);
  position: absolute;
  cursor: pointer;
  margin-top: 3px;
  right: 10px;
}
.bottom-btn {
  list-style: none;
  float: right;
  margin: 0;
  padding: 0;
  font-size: 12px;
  margin-right: 20px;
}
.bottom-btn li {
  float: left;
  margin-left: 10px;
  padding: 3px 15px;
  border: 1px solid #ddd;
  cursor: pointer;
}

.hover-alert-tip {
  position: absolute;
  width: 160px;
  background: #fff;
  padding: 5px 9px;
  border: 1px solid #7d7d7d;
  border-radius: 6px;
  cursor: default;
  font-size: 12px;
  border: 1px solid #ac0000;
  color: #ac0000;
  left: 50%;
  margin-left: -80px;
  top: 100px;
  z-index: 10;
}
</style>