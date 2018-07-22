import Vue from "vue";
import Router from "vue-router";
// const HelloWorld = resolve => require(["@/components/HelloWorld"], resolve);
// const blockDetail = resolve => require(["@/pages/blockDetail"], resolve);
// const marketCondition = resolve =>
//   require(["@/pages/marketCondition"], resolve);
// const blockmap = resolve =>
//   require(["@/components/blockmaps/blockmap"], resolve);
// const blockList = resolve =>
//   require(["@/components/blockmaps/blockList"], resolve);
import HelloWorld from "@/components/HelloWorld";
import blockDetail from "@/pages/blockDetail";
import marketCondition from "@/pages/marketCondition";
import blockmap from "@/components/blockmaps/blockmap.vue";
import blockList from "@/components/blockmaps/blockList.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      redirect: "/marketCondition"
    },
    {
      path: "/blockDetail",
      name: "blockDetail",
      component: blockDetail,
      children: [
        {
          path: "/",
          name: "blockmap",
          component: blockmap
        },
        {
          path: "/blockDetail/blockmap",
          name: "blockmap",
          component: blockmap
        },
        {
          path: "/blockDetail/blockList",
          name: "blockList",
          component: blockList
        }
      ]
    },
    {
      path: "/marketCondition",
      name: "marketCondition",
      component: marketCondition,
      children: [
        {
          path: "",
          name: "blockmap",
          component: blockmap
        },
        {
          path: "/marketCondition/blockmap",
          name: "blockmap",
          component: blockmap
        },
        {
          path: "/marketCondition/blockList",
          name: "blockList",
          component: blockList
        }
      ]
    },
    {
      path: "/HelloWorld",
      name: "HelloWorld",
      component: HelloWorld
    }
  ]
});
