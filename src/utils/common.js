/*
 * @Author: COCO 
 * @Date: 2018-01-25 22:28:15 
 * @Last Modified by: COCO
 * @Last Modified time: 2018-01-25 22:28:37
 */

export default {
    setTitle:function(platename){
        if(platename !== 'undefined' && platename.length > 4 ){
          return platename;
        }
        return '';
    }
    
}