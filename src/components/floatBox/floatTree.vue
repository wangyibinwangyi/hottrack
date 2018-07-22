<template>
  <div class="bkrd-wrap">
    <v-tree :data='treeData' :tpl="tpl" ref="tree1"></v-tree>  
  </div>
</template>
<script>
export default {
  name: "floatTree",
  props: {
    listArray: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true,
      default() {
        return [
          {
            id: 1,
            title: "行业",
            expanded: true,
            children: [
              {
                id: 11,
                title: "集成电路",
                expanded: true,
                show: false
              },
              {
                id: 12,
                title: "半导体及原件"
              }
            ]
          },
          {
            id: 2,
            title: "概念",
            expanded: true,
            children: [
              {
                id: 21,
                title: "集成电路",
                expanded: true
              },
              {
                id: 22,
                title: "半导体及原件"
              }
            ]
          },
          {
            id: 3,
            title: "近期不活跃",
            expanded: true,
            children: [
              {
                id: 31,
                title: "集成电路",
                selected: true
              },
              {
                id: 32,
                title: "半导体及原件",
                selected: true
              },
              {
                id: 33,
                title: "半导体及原件"
              },
              {
                id: 34,
                title: "半导体及原件"
              },
              {
                id: 35,
                title: "半导体及原件"
              }
            ]
          }
        ];
      }
    }
  },
  data() {
    return {
      openSeletion: true,
      treeData: []
    };
  },
  watch: {
    data: "updateTreeData"
  },
  mounted() {},
  methods: {
    updateTreeData() {
      this.treeData = this.data;
    },
    dealNode(id, e) {
      let $this = $(e.target);
      let itemObject = {};
      itemObject.block_name = $this.siblings(".node-title").html();
      itemObject.block_code = $this
        .siblings(".node-title")
        .attr("nodeid")
        .split("_")[1];
      if ($this.hasClass("btn-del")) {
        //删除该节点
        $this.removeClass("btn-del").addClass("btn-add");
        eventBus.$emit("delChooseList", itemObject);
      } else {
        //添加该节点
        // console.log(eventBus.$emit("addChooseList", itemObject))
        $this.removeClass("btn-add").addClass("btn-del");
        eventBus.$emit("addChooseList", itemObject);
      }
    },
    tpl(node, ctx) {
      const self = this;
      // console.log(node, ctx);
      let titleClass = node.selected
        ? "node-title node-selected"
        : "node-title";
      if (node.searched) titleClass += " node-searched";
      let itemClass = node.show ? "node-item canhover" : "node-item";

      return (
        <div
          class={itemClass}
          onClick={() => this.$refs.tree1.expandNode(node)}
        >
          <span
            class={titleClass}
            domPropsInnerHTML={node.title}
            nodeId={node.id}
          />
          {node.show && (
            <button
              class={
                self.listArray.find(function(item) {
                  return item == node.id.split("_")[1];
                })
                  ? "btn-del"
                  : "btn-add"
              }
              onClick={e => {
                // this.$refs.tree1.delNode(node.parent, node);
                self.dealNode(ctx.props.node.id, e);
              }}
            />
          )}
        </div>
      );
    }
  }
};
</script>
<style>
.bkrd-wrap ul {
  font-size: 12px !important;
}
.bkrd-wrap .tree-node-el {
  display: flex;
  align-items: center;
}
.node-item {
  flex-grow: 1;
  position: relative;
  color: #222;
}
.node-item.canhover {
  color: #333;
}
.node-item.canhover:hover {
  background: #ddd;
}
.btn-add {
  opacity: 0;
}
.btn-add:after {
  content: "+";
  position: relative;
  left: -2.5px;
  top: -0.6px;
}
.node-item.canhover:hover .btn-add,
.btn-del {
  cursor: pointer;
  background: #7aa9f8;
  opacity: 1;
  border-radius: 50%;
  border: none;
  color: #fff;
  position: absolute;
  right: 5px;
  top: 6px;
  width: 15px;
  height: 15px;
}
.btn-del:after {
  content: "—";
  left: 2px;
  font-size: 12px;
  position: absolute;
  top: 1px;
  font-family: sans-serif;
}
.btn-del {
  background: red;
}
.halo-tree .node-title {
  cursor: default;
}

.bkrd-wrap .halo-tree,
.bkrd-wrap .halo-tree ul {
  padding: 0;
  margin: 0;
}

.bkrd-wrap .halo-tree li {
  padding: 0;
  line-height: 24px;
}

.bkrd-wrap .halo-tree .tree-close,
.bkrd-wrap .halo-tree .tree-open {
}
.bkrd-wrap .halo-tree .tree-open:after,
.bkrd-wrap .halo-tree .tree-close:after,
.bkrd-wrap .halo-tree li:before,
.bkrd-wrap .halo-tree li:after {
  display: none;
}
.bkrd-wrap .halo-tree .tree-open {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-top: 5px solid #777;
  border-bottom: 0px solid transparent;
  border-right: 5px solid transparent;
}
.bkrd-wrap .halo-tree .tree-close {
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-left: 5px solid #777;
  border-bottom: 5px solid transparent;
  border-right: 5px solid transparent;
}
.bkrd-wrap .tree-node-el span {
  vertical-align: middle;
}
.bkrd-wrap .halo-tree li span:hover {
  background: transparent;
}

.bkrd-wrap .halo-tree li.leaf {
  padding-left: 14px;
}
.bkrd-wrap .halo-tree .node-title.node-searched {
  border: none;
}
</style>