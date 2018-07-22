<template>
  <div>
    <div id="guide">
    </div>
    <div id="guide2">
      <div v-show="index==1" class="guide guide-01">
        <div class="close" @click="closeGuide">跳过</div>
        <div class="next" @click="guide"></div>
      </div>
      <div v-show="index==2" class="guide guide-02">
        <div class="close" @click="closeGuide">跳过</div>
        <div class="next" @click="guide"></div>
      </div>
      <div v-show="index==6" class="guide guide-03">
        <div class="guide-03-01"></div>
        <div class="guide-03-02">
          <div class="close" @click="closeGuide">跳过</div>
          <div class="next" @click="guide"></div>
        </div>
      </div>
      <div v-show="index==7" class="guide guide-04">
        <div class="guide-04-01"></div>
        <div class="guide-04-02">
          <div class="next" @click="guide"></div>
        </div>
      </div>
      <div v-show="index==5" class="guide guide-05">
        <div class="next" @click="guide"></div>
      </div>
      <div v-show="index==3&&guide06" class="guide guide-06">
        <div class="guide-06-01"></div>
        <div class="guide-06-02">
          <div class="close" @click="closeGuide">跳过</div>
          <div class="next" @click="guide"></div>
        </div>
      </div>
      <div v-show="index==4" class="guide guide-07">
        <div class="guide-07-01"></div>
        <div class="guide-07-02">
          <div class="close" @click="closeGuide">跳过</div>
          <div class="next" @click="guide"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import router from "@/router/index.js";
export default {
  name: "guide",
  mounted() {
    var self = this
    setTimeout(function() {
      self.resize()
      router.push('/marketCondition')
      let left = $('.block-left-card').css('width')
      $(window).resize(self.resize)
      // router.push('/marketCondition');
    }, 300)
    $('body').css('overflow', 'hidden')
    // console.log(height);
  },
  data() {
    return {
      index: 1,
      guide06: false,
      zIndex: 50
    };
  },
  methods: {
    resize() {
      var height = $('#app').css('height')
      var width = $('#app').css('width')
      if (document.body.clientHeight > 843) {
        $('#guide').css('height', parseInt(height) + 12)
        $('#guide2').css('height', parseInt(height))
      } else {
        $('#guide').css('height', parseInt(height))
        $('#guide2').css('height', parseInt(height))
      }
      $('#guide').css('width', parseInt(width))
      $('#guide2').css('width', parseInt(width))

      let left3 = parseInt($('.block-left-card').css('width'))
      let width3 = parseInt($('.block-faucet').css('width'))
      let height3 = parseInt($('.block-right-top-card').css('height'))
      $('.guide-03-01').css('width', width3 + 65)
      $('.guide-03').css('width', 368 + width3 + 65)
      $('.guide-03').css('left', 305 + left3 - 368)
      $('.guide-03').css('height', height3 + 40)
      $('.guide-03-01').css('height', height3 + 40)

      let left4 = parseInt($('.block-left-card').css('width'))
      let width4 = parseInt($('.block-right-bottom-card').css('width'))
      let height4 = parseInt($('.block-right-bottom-card').css('height'))
      $('.guide-04-01').css('width', width4 + 40)
      $('.guide-04').css('width', 283 + width4 + 40)
      $('.guide-04-01,.guide-04').css('height', height4 + 50)
      $('.guide-04').css('left', 305 + left4 - 283 + 6)

      let left6 = parseInt($('.left-card').css('width'))
      let width6 = parseInt($('.middle-card').css('width'))
      $('.guide-06-01').css('width', width6 + 35)
      $('.guide-06').css('width', 300 + width6 + 35)
      $('.guide-06').css('left', 305 + left6 - 300 + 10)

      let width7 = parseInt($('#right-side-down').css('width'))
      let height7 = parseInt($('#right-side-down').css('height'))
      $('.guide-07-01').css('width', width7 + 50)
      $('.guide-07').css('width', width7 + 50)
      $('.guide-07').css('left', 280)
      $('.guide-07').css('top', 260)
      $('.guide-07-01').css('height', height7 + 40)
      $('.guide-07').css('height', height7 + 201 + 40)
    },
    guide() {
      var self = this
      $('#guide').css('z-index', self.zIndex + 1)
      $('.header').css('z-index', self.zIndex + 1)
      if (self.index == 1) {
        $('#blockmap').css('z-index', self.zIndex + 2)
        $('.second-nav').css('z-index', self.zIndex + 2)
        self.zIndex += 2
      } else if (self.index == 5) {
        $('body').scrollTop(0)
        $('.header-tab')
          .eq(1)
          .trigger('click')
        setTimeout(function() {
          $('.block-faucet').css('z-index', self.zIndex + 2)
          $('.block-faucet-zdf').css('z-index', self.zIndex + 2)
          self.zIndex += 2
          let left = parseInt($('.block-left-card').css('width'))
          let width = parseInt($('.block-faucet').css('width'))
          let height = parseInt($('.block-right-top-card').css('height'))
          $('.guide-03-01').css('width', width + 65)
          $('.guide-03').css('width', 368 + width + 65)
          $('.guide-03').css('left', 305 + left - 368)
          $('.guide-03').css('height', height + 40)
          $('.guide-03-01').css('height', height + 40)
        }, 300)
      } else if (self.index == 6) {
        $('body').scrollTop($('#app').height())
        $('.block-right-bottom-card').css('z-index', self.zIndex + 2)
        self.zIndex += 2
        let left = parseInt($('.block-left-card').css('width'))
        let width = parseInt($('.block-right-bottom-card').css('width'))
        let height = parseInt($('.block-right-bottom-card').css('height'))
        $('.guide-04-01').css('width', width + 40)
        $('.guide-04').css('width', 283 + width + 40)
        $('.guide-04-01,.guide-04').css('height', height + 50)
        $('.guide-04').css('left', 305 + left - 283 + 6)
      } else if (self.index == 4) {
      } else if (self.index == 2) {
        $('body').scrollTop(0)
        setTimeout(function() {
          $('.middle-card').css('z-index', self.zIndex + 2)
          self.zIndex += 2
          let left = parseInt($('.left-card').css('width'))
          let width = parseInt($('.middle-card').css('width'))
          $('.guide-06-01').css('width', width + 35)
          $('.guide-06').css('width', 300 + width + 35)
          $('.guide-06').css('left', 305 + left - 300 + 10)
          self.guide06 = true
        }, 300)
      } else if (self.index == 3) {
        $('body').scrollTop($('#app').height())
        $('#right-side-down').css('z-index', self.zIndex + 2)
        self.zIndex += 2
        let width = parseInt($('#right-side-down').css('width'))
        let height = parseInt($('#right-side-down').css('height'))
        $('.guide-07-01').css('width', width + 50)
        $('.guide-07').css('width', width + 50)
        $('.guide-07').css('left', 280)
        $('.guide-07').css('top', 260)
        $('.guide-07-01').css('height', height + 40)
        $('.guide-07').css('height', height + 201 + 40)
      } else if (self.index == 7) {
        this.closeGuide()
      }
      self.index++
    },
    closeGuide: function() {
      // let self = this
      eventBus.$emit('closeGuide', true)
      $('body').css('overflow', 'auto')
      window.API.use({
        method: 'external.getUserPath', // 获取客户端下登陆用户的目录
        success: function(path) {
          window.API.use({
            method: 'fileWriter.open',
            data: path + '\\l2hottrack\\guide.ini',
            success: function(d) {
              if (!d) {
                return
              } // 没有读取到文件时，阻断继续
              window.API.use({
                method: 'fileWriter.write',
                data: '1',
                success: function(data) {
                  window.API.use({ method: 'fileWriter.close' })
                }
              })
            }
          })
        }
      })
      $('.header-tab')
        .eq(0)
        .trigger('click')
      $('body').scrollTop(0)
    }
  }
}
</script>
<style scoped>
#guide {
  position: absolute;
  top: 0;
  bottom: 0;
  /* width: 100%;     */
  /* left: 0;
    right: 0; */
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 50;
}

#guide2 {
  position: absolute;
  top: 0;
  bottom: 0;
  /* width: 100%; */
  /* left: 0;
    right: 0; */
  /* background-color: rgba(255, 0, 0, 0.5);  */
  z-index: 1000;
}

.guide {
  position: absolute;
}

.next {
  position: absolute;
  /* border: 1px solid red; */
  width: 109px;
  height: 36px;
  cursor: pointer;
}

.close {
  box-sizing: border-box;
  position: absolute;
  width: 70px;
  height: 35px;
  line-height: 35px;
  cursor: pointer;
  color: white;
  text-align: center;
  border-radius: 3px;
  /* background: #19B5fe; */
  /* background: #4183d7; */
  background: #3e93e2;
}

.guide-01 {
  height: 286px;
  width: 529px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180223/guide_01.png");
  top: -8px;
  left: 110px;
}

.guide-01 .next {
  position: absolute;
  top: 244px;
  left: 350px;
}

.guide-01 .close {
  /* position: absolute; */
  top: 242px;
  left: 260px;
}

.guide-02 {
  height: 556px;
  width: 654px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180223/guide_02.png");
  top: 47px;
}

.guide-02 .next {
  top: 463px;
  left: 482px;
}

.guide-02 .close {
  top: 463px;
  left: 400px;
  /* background: red; */
}

.guide-03 {
  height: 465px;
  width: 942px;
  left: 560px;
  top: 20px;
}

.guide-03-01 {
  /* width: 577px; */
  height: 465px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180223/guide_03_01.png");
  background-repeat: no-repeat;
  position: absolute;
  right: 0;
  background-size: 100% 100%;
}

.guide-03-02 {
  width: 368px;
  height: 162px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180223/guide_03_02.png");
  position: absolute;
  top: 50%;
  margin-top: -81px;
}

.guide-03-02 .next {
  top: 114px;
  left: 75px;
}

.guide-03-02 .close {
  top: 114px;
  left: 0px;
}

.guide-04 {
  height: 432px;
  width: 1243px;
  left: 660px;
  top: 465px;
}

.guide-04-01 {
  width: 960px;
  height: 432px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180223/guide_04_01.png");
  position: absolute;
  right: 0;
  background-size: 100% 100%;
}

.guide-04-02 {
  width: 283px;
  height: 239px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180223/guide_04_02.png");
  position: absolute;
  top: 50%;
  margin-top: -81px;
}

.guide-04-02 .next {
  top: 120px;
  left: 91px;
}

.guide-05 {
  position: fixed;
  width: 230px;
  height: 109px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180223/guide_05.png");
  top: 0;
  left: 230px;
}

.guide-05 .next {
  top: 3px;
  left: 17px;
}

.guide-06 {
  height: 461px;
  width: 680px;
  left: 610px;
  top: 30px;
}

.guide-06-01 {
  width: 380px;
  height: 461px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180223/guide_06_01.png");
  position: absolute;
  right: 0;
  background-size: 100% 100%;
}

.guide-06-02 {
  width: 300px;
  height: 242px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180223/guide_06_02.png");
  position: absolute;
  top: 50%;
  margin-top: -121px;
}

.guide-06-02 .next {
  top: 196px;
  left: 83px;
}

.guide-06-02 .close {
  top: 196px;
  left: 3px;
}

.guide-07 {
  height: 660px;
  width: 1617px;
  left: 300px;
  top: 270px;
}

.guide-07-01 {
  width: 1617px;
  height: 459px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180223/guide_07_01.png");
  position: absolute;
  bottom: 0;
  background-size: 100% 100%;
}

.guide-07-02 {
  width: 402px;
  height: 201px;
  background-image: url("http://i.thsi.cn/images/level2/hottrack/20180223/guide_07_02.png");
  position: absolute;
  margin-left: 200px;
}

.guide-07-02 .next {
  top: 146px;
  left: 203px;
}

.guide-07-02 .close {
  top: 150px;
  left: 123px;
}

</style>


