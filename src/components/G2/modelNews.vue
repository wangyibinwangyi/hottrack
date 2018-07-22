<template>
  <div class="model" v-show="model" id="model">
    <div class="model-opacity" id="model-opacity"></div>
    <div class="info-model">
      <div class="model-header">
        <span>消息监控</span>
        <div class="model-close" @click="closeModel"></div>
      </div>
      <div class="model-content">
        <h2>{{modelinfo.title}}</h2>
        <div class="ectra-info">
          <span>{{(new Date(Number(modelinfo.ctime + '000'))).getFullYear()}}-{{(new Date(Number(modelinfo.ctime + '000'))).getMonth()+1 > 9 ? (new Date(Number(modelinfo.ctime + '000'))).getMonth()+1 : '0' +((new Date(Number(modelinfo.ctime + '000'))).getMonth()+1) }}-{{(new Date(Number(modelinfo.ctime + '000'))).getDate() > 9 ? (new Date(Number(modelinfo.ctime + '000'))).getDate() : '0' + ((new Date(Number(modelinfo.ctime + '000'))).getDate())}}</span>&nbsp;&nbsp;&nbsp;
          <span>关注度: {{modelinfo.sort}}</span>&nbsp;&nbsp;&nbsp;
          <span>来自: 微信</span>
        </div>
        <div class="main-content">{{modelinfo.summ}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      model: false,
      modelinfo: {}
    };
  },
  created: function() {
    let self = this;
    eventBus.$on("showNews", item => {
      // console.log(item)
      self.modelinfo = item;
      self.model = true;
    });
  },
  mounted: function() {
    $("#model").css({
      width: document.body.clientWidth,
      height: document.body.clientHeight
    });

    $(window).resize(function() {
      // console.log('窗口大小发生改变')
      $("#model").css({
        width: document.body.clientWidth,
        height: document.body.clientHeight
      });
    });
  },
  methods: {
    closeModel: function() {
      this.model = false;
    }
  }
};
</script>

<style scoped>
.model {
  color: #c0c0c0;
  position: fixed;
  z-index: 9999999999;
}

.model-opacity {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
  background: #000;
}
.info-model {
  position: absolute;
  top: 180px;
  left: 50%;
  /* opacity: 1; */
  margin-left: -350px;
  z-index: 2000;
  width: 700px;
  height: 530px;
  border: 1px solid #434448;
  background: #323337;
}

.model-header {
  height: 30px;
  line-height: 30px;
  background: #434448;
}

.model-header span {
  float: left;
  margin-left: 20px;
}

.model-close {
  cursor: pointer;
  position: relative;
  float: right;
  width: 20px;
  height: 20px;
  margin-right: 5px;
}

.model-close::before,
.model-close::after {
  content: "";
  position: absolute;
  height: 2px;
  width: 60%;
  top: 70%;
  right: 0;
  background: #868686;
}

.model-close::before {
  transform: rotate(45deg);
}

.model-close::after {
  transform: rotate(-45deg);
}

.model-content {
  padding-top: 10px;
  /* widows: ; */
}

.model-content h2 {
  font-size: 16px;
  color: white;
  text-align: center;
  font-weight: 700;
  white-space: nowrap;
  margin-bottom: 15px;
}
.model-content div span {
  font-size: 8px;
  color: #868686;
  /* margin-bottom: 25px; */
}
.ectra-info {
  color: #757575;
  margin-bottom: 25px;
}

.main-content {
  padding-left: 20px;
  padding-right: 20px;
  color: #ffb400;
  text-indent: 2em;
  line-height: 2;
  text-align: left;
}
</style>
