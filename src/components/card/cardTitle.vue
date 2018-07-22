<template>
  <div class="container1">
     <span class="square"></span> 
    {{cardtitle}}
  </div>
</template>
<script>
export default {
  name:'cardTitle',
  props:{
      cardtitle:String
  }
}
</script>
<style scoped>
    .container1{
        position: relative;
        height: 30px;
         /* background-color: #1b1b1b;  */
        line-height: 30px;
        color: white;
        font-size: 14px;
        text-align: left;
        padding-left: 10px; 
    }
    .white .container1{
       /* background-color:#fff;  */
      color:#3c3c3c;
    }
    .square{
      display:block;
      position: absolute;
      left: 0;      
      width: 3px;
      height: 18px;
      margin-top: 6px;
      background-color: #d6524d;
    }
</style>