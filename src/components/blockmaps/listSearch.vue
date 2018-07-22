<template>
    <div id="search-container">
        <div class="search-box">
            <input type="text" class="search-input" id="view_search_input" placeholder="查找板块">
            <i class="icon1 search-icon" id="view_search_icon"></i>
        </div>
        <div class="search-list" id="view_search_list">
        </div>
    </div>
</template>
<script>
export default {
  created() {
    eventBus.$on("ListStatus", this.handle);
  },
  mounted() {
    $(function() {
      var dataModel = {
        historyData: [],
        init: function() {
          // this.getFileContent();
        },
        getFileContent: function() {
          var self = this;
          window.API.use({
            method: "external.getUserPath",
            success: function(path) {
              window.API.use({
                method: "fileReader.open",
                data: path + "\\blocksearch\\historyBlock.log",
                success: function(d) {
                  if (!d) {
                    return;
                  }
                  window.API.use({
                    method: "fileReader.read",
                    success: function(data) {
                      if (data !== "") {
                        data = eval("(" + data + ")");
                        self.historyData = data;
                      }
                      historyModel.renderHistoryList();
                      window.API.use({
                        method: "fileReader.close"
                      });
                    }
                  });
                }
              });
            }
          });
        },
        setFileContent: function(text) {
          window.API.use({
            method: "external.getUserPath",
            success: function(path) {
              window.API.use({
                method: "fileWriter.open",
                data: path + "\\blocksearch\\historyBlock.log",
                success: function(d) {
                  if (!d) {
                    return;
                  }
                  window.API.use({
                    method: "fileWriter.write",
                    data: text,
                    success: function(data) {
                      window.API.use({
                        method: "fileReader.close"
                      });
                    }
                  });
                }
              });
            }
          });
        }
      };

      var historyModel = {
        listLength: 0,
        addHistory: function(data) {
          var self = this;
          var deleteIndex = self.outRepeatIndex(data);
          if (deleteIndex !== -1) {
            dataModel.historyData.splice(deleteIndex, 1);
          } else {
            if (dataModel.historyData.length >= 5) {
              dataModel.historyData.pop();
            }
          }
          dataModel.historyData.unshift(data);
          var text = "[";
          $.each(dataModel.historyData, function(key, value) {
            if (key === 0) {
              text +=
                '{"name":"' +
                value.name +
                '","stock":"' +
                value.stock +
                '","py":"' +
                value.py +
                '"}';
            } else {
              text +=
                ',{"name":"' +
                value.name +
                '","stock":"' +
                value.stock +
                '","py":"' +
                value.py +
                '"}';
            }
          });
          text += "]";
          dataModel.setFileContent(text);
        },
        outRepeatIndex: function(data) {
          var flag = -1;
          $.each(dataModel.historyData, function(key, value) {
            if (
              value.name === data.name &&
              value.py === data.py &&
              value.stock === data.stock
            ) {
              flag = key;
            }
          });
          return flag;
        },
        renderHistoryList: function() {
          var self = this;
          var html = "";
          if (dataModel.historyData.constructor === Array) {
            var attr = $("#view_search_list")[0]["attributes"]["0"]["name"];
            $.each(dataModel.historyData, function(key, value) {
              if (key == 0) {
                html +=
                  '<div class="search-item search-select" ' +
                  attr +
                  ' data-stock="' +
                  value.stock +
                  '" data-py="' +
                  value.py +
                  '">' +
                  "<span " +
                  attr +
                  ">" +
                  value.stock +
                  "</span>" +
                  "<span " +
                  attr +
                  ' class="platename">' +
                  value.name +
                  "</span>" +
                  "</div>";
              } else {
                html +=
                  '<div class="search-item" ' +
                  attr +
                  ' data-stock="' +
                  value.stock +
                  '" data-py="' +
                  value.py +
                  '">' +
                  "<span " +
                  attr +
                  ">" +
                  value.stock +
                  "</span>" +
                  "<span " +
                  attr +
                  ' class="platename">' +
                  value.name +
                  "</span>" +
                  "</div>";
              }
            });
            BlockModel.listLength = dataModel.historyData.length;
            BlockModel.isInHistory = false;
            $("#view_search_list").html(html);
          } else {
            $("#view_search_list").html("");
          }
        }
      };

      var BlockModel = {
        isInHistory: true,
        index: 0,
        listLength: 0,
        marketId: 48,
        init: function() {
          this.event();
        },
        event: function() {
          var self = this;
          $("#view_search_icon").on("click", function() {
            $("#view_search_input").val("");
            $(".icon1").css("visibility", "hidden");
            setTimeout(function() {
              $("#view_search_input").focus();
            }, 350);
          });

          $("#view_search_list").on("click", function(e) {
            e = e || window.event;
            var $target = $(e.target);

            let name;
            if ($target.hasClass("platename")) {
              name = $target.text();
            } else {
              name = $target.next().text();
            }
            $target = $target.closest(".search-item");
            if ($target.hasClass("search-item")) {
              // console.log(
              //   $target.text(),
              //   $target.attr("data-py"),
              //   $target.attr("data-stock")
              // );
              historyModel.addHistory({
                name: name,
                py: $target.attr("data-py"),
                stock: $target.attr("data-stock")
              });
              eventBus.$emit("moveToPlate", $target.attr("data-stock"));
              $("#view_search_input").val(name);
              TA.log({ id: "L2rdzz_5ab8d8a4_467" });
              $(".search-icon").addClass("delete");
              $("#view_search_input").blur();
              $(".search-list").css("visibility", "hidden");
            }
          });
          $("#view_search_input").on("keyup", function(e) {
            var text = $(this).val();
            if ($.trim(text) === "" && self.isInHistory) {
              // 渲染老的数据
              self.index = 0;
              historyModel.renderHistoryList();
              $(".search-icon").removeClass("delete");
            } else if (e.keyCode === 13) {
              if ($(".search-item").length === 0) {
                return;
              }
              // 调用客户端的接口
              var selectDom = $(".search-item").eq(self.index);
              historyModel.addHistory({
                name: selectDom.find(".platename").text(),
                py: selectDom.attr("data-py"),
                stock: selectDom.attr("data-stock")
              });
              eventBus.$emit("moveToPlate", selectDom.attr("data-stock"));
              $("#view_search_input").val(selectDom.find(".platename").text());
              TA.log({ id: "L2rdzz_5ab8d8a4_467" });
              $(".search-icon").addClass("delete");
              $("#view_search_input").blur();
              $(".search-list").css("visibility", "hidden");

              // self.searchAndClose(selectDom.attr('data-stock'));
            } else if (e.keyCode === 40) {
              self.index++;
              if (self.index >= self.listLength) {
                self.index = self.listLength - 1;
              } else {
                $(".search-select").removeClass("search-select");
                $(".search-item")
                  .eq(self.index)
                  .addClass("search-select");
              }
            } else if (e.keyCode === 38) {
              $("#view_search_input").focusEnd();
              self.index--;
              if (self.index < 0) {
                self.index = 0;
              } else {
                $(".search-select").removeClass("search-select");
                $(".search-item")
                  .eq(self.index)
                  .addClass("search-select");
              }
            } else if (e.keyCode === 37 || e.keyCode === 39) {
              return;
            } else if ($.trim(text) !== "") {
              self.index = 0;
              self.requestBlock(text);
              self.isInHistory = true;
              $(".search-icon").addClass("delete");
              $(".icon1").css("visibility", "visible");
              $("#view_search_icon");
            }
          });
        },
        // searchAndClose: function(stock) {
        //     window.API.use({
        //         method: 'Quote.scrollLocationCode',
        //         data: stock
        //     });
        //     setTimeout(function() {//lxc
        //         window.API.use({
        //             method: 'external.closeWebDlg'
        //         });
        //     }, 200);
        // },
        requestBlock: function(text) {
          var self = this;
          try {
            window.API.use({
              method: "Util.filterStock",
              data: {
                filter: text,
                count: 5,
                markets: self.marketId,
                // markets: '48',
                stockclass: "0,1"
              },
              success: function(data) {
                data = eval("(" + data + ")");
                let filterData = []; //lxc过滤区域板块
                for (let i = 0; i < data.length; i++) {
                  if (data[i].stock.substring(0, 3) !== "883") {
                    filterData.push(data[i]);
                  }
                }
                self.renderList(filterData);
              }
            });
          } catch (e) {
            console.log(e);
          }
        },
        /**
         * 判断数据，并设置数据的长度
         */
        renderList: function(list) {
          var self = this;
          var html = "";
          if (list.constructor === Array) {
            if (list.length === 0) {
              html =
                '<div class="nodata">' +
                "“" +
                $("#view_search_input").val() +
                "”" +
                "未找到匹配项" +
                "</div>";
            }
            var attr = $("#view_search_list")[0].attributes["0"]["name"];
            $.each(list, function(key, value) {
              if (key == 0) {
                html +=
                  '<div class="search-item search-select" ' +
                  attr +
                  ' data-stock="' +
                  value.stock +
                  '" data-py="' +
                  value.py +
                  '">' +
                  "<span " +
                  attr +
                  ">" +
                  value.stock +
                  "</span>" +
                  "<span " +
                  attr +
                  ' class="platename">' +
                  value.name +
                  "</span>" +
                  "</div>";
              } else {
                html +=
                  '<div class="search-item" ' +
                  attr +
                  ' data-stock="' +
                  value.stock +
                  '" data-py="' +
                  value.py +
                  '">' +
                  "<span " +
                  attr +
                  ">" +
                  value.stock +
                  "</span>" +
                  "<span " +
                  attr +
                  ' class="platename">' +
                  value.name +
                  "</span>" +
                  "</div>";
              }
            });
            self.listLength = list.length;
            $("#view_search_list").html(html);
          } else {
            $("#view_search_list").html("");
          }
        }
      };

      var app = {
        start: function() {
          this.encapsulation();
          BlockModel.marketId = $.getUrlParam("marketId");
          dataModel.init();
          BlockModel.init();

          setTimeout(function() {
            // $('#view_search_input').focus();
          }, 300);
        },
        encapsulation: function() {
          $.fn.setCursorPosition = function(position) {
            if (this.lengh == 0) return this;
            return $(this).setSelection(position, position);
          };

          $.fn.setSelection = function(selectionStart, selectionEnd) {
            if (this.lengh == 0) return this;
            var input = this[0];

            if (input.createTextRange) {
              var range = input.createTextRange();
              range.collapse(true);
              range.moveEnd("character", selectionEnd);
              range.moveStart("character", selectionStart);
              range.select();
            } else if (input.setSelectionRange) {
              input.focus();
              input.setSelectionRange(selectionStart, selectionEnd);
            }

            return this;
          };
          $.fn.focusEnd = function() {
            this.setCursorPosition(this.val().length);
          };

          $.getUrlParam = function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = decodeURIComponent(window.location.search)
              .substr(1)
              .match(reg);
            if (r != null) {
              return decodeURI(r[2]);
            } else {
              return 48;
            }
          };
        }
      };
      $("#view_search_input").focus(function() {
        dataModel.getFileContent();
        if ($("#view_search_input").val() !== "") {
          $(".icon1").addClass("delete");
          $(".icon1").css("visibility", "visible");
        } else {
          $(".icon1").css("visibility", "hidden");
        }
        $("#view_search_input").attr("placeholder", "");
        $(".search-list").css("visibility", "visible");
      });
      $("#view_search_input").blur(function() {
        $("#view_search_input").attr("placeholder", "查找板块");
        if ($("#view_search_input").val() !== "") {
          $(".search-icon").addClass("delete");
        } else {
          $(".search-icon").removeClass("delete");
        }
        $(".icon1").css("visibility", "visible");
        setTimeout(function() {
          $(".search-list").css("visibility", "hidden");
        }, 400);
      });

      $("#view_search_list").on("mouseover", function(e) {
        e = e || window.event;
        var $target = $(e.target);
        $target = $target.closest(".search-item");
        $(".search-select").removeClass("search-select");
        $target.addClass("search-select");
      });
      app.start();
    });
  },

  data() {
    return {};
  },
  methods: {
    handle(val) {
      $("#view_search_input").val("");
      $(".icon1").removeClass("delete");
    }
  }
};
</script>
<style scoped>
.clearfix:after {
  content: "\0020";
  display: block;
  height: 0;
  clear: both;
}

.clearfix {
  *zoom: 1;
}

.container {
  width: 142px;
  height: 120px;
  margin: 0 auto;
}

.search-box {
  width: 100%;
  height: 33px;
  position: relative;
}

.search-input {
  margin-top: 4px;
  width: 290px;
  background-color: #1b1b1b;
  color: #ffffff;
  border: none;
  height: 24px;
  line-height: 24px;
  font-family: "SimSun";
  margin-left: 7px;
  border-radius: 4px;
}

.white .search-input {
  background-color: #4a4a4a;
}

.icon1 {
  display: inline-block;
  /* float: left; */
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/search.svg");
  background-position: 0 0;
  background-repeat: no-repeat;
  position: absolute;
  top: 7px;
  left: 270px;
  width: 16px;
  height: 16px;
}

.white .icon1 {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/searchwhite.svg");
}

.delete {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/delete.svg");
}

.white .delete {
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180326/deletewhite.svg");
}

.search-icon {
  background-position: 0 0;
  margin: 1px 2px;
  cursor: pointer;
}

.search-list {
  margin-left: 7px;
  width: 290px;
  height: 128px;
  color: #ffffff;
  font-size: 14px;
  overflow: auto;
  position: absolute;
  z-index: 999;
  background-color: #0a0a0a;
  visibility: hidden;
  border: 1px solid #333;
}

.white .search-list {
  background-color: #424242;
}

.search-item {
  margin: 1px;
  height: 24px;
  line-height: 24px;
  padding-left: 5px;
  cursor: pointer;
}

.search-item span {
  display: inline-block;
  width: 80px;
  /* border: 1px solid red; */
}

.search-item .platename {
  width: 187px;
}

#search-container {
  margin-top: 2px;
  background-color: #292929;
  height: 32px;
  text-align: left;
}

.white #search-container {
  background-color: #434343;
}

.search-list .search-select {
  background-color: #08294a;
}

.white .search-list .search-select {
  background-color: #354c82;
}

input {
  padding-left: 8px;
  outline: none;
}

input:focus {
  border: 1px solid #095a9b;
}

input:hover {
  border: 1px solid #095a9b;
}

.white input:focus {
  border: 1px solid #1c6dd8;
}

.white input:hover {
  border: 1px solid #1c6dd8;
}

.nodata {
  text-align: left;
  padding-left: 5px;
  padding-top: 5px;
}
</style>
