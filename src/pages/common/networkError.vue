<template>
  <div>
    <div id="networkError">
        <div id="networkImg">网络异常...</div>
    </div>  
  </div>
  
</template>
<script>
export default {
    name:'guide',
    mounted(){
      var self=this;
      setTimeout(function() {

        var height = $('#app').css('height');
        var width  = $('#app').css('width');
        if(document.body.clientHeight>843){
            $('#networkError').css('height',parseInt(height)+12);
        }else{
            $('#networkError').css('height',parseInt(height));
        }
        $('#networkError').css('width',parseInt(width));
        $('#networkErrors').css('width',parseInt(width));
        self.init();
      }, 300);
      
      // console.log(height);
      
    },
    data(){
      return{
        index:1
      }
    },
    methods:{
      init(){
        var self=this;
        if(self.index==1){
          $('.header-tab').css('z-index',52);
        }
      }
    }
  
}
</script>
<style scoped>
  #networkError{
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 50;
  }
  #networkImg{
    color: white;
    height: 112px;
    line-height: 112px;
    text-align: left;
    padding-left: 85px;
    width: 200px;
    background-image: url('http://i.thsi.cn/images/level2/hottrack/20180208/network-error.png');
    background-repeat: no-repeat;
    position: fixed;
    font-size: 18px;
    cursor: default;
    font-weight: bold;
    top: 50%;
    left: 50%;
    margin-top: -56px;
    margin-left: -100px;
    z-index: 51;
    font-family: "微软雅黑","宋体"
  }
</style>


