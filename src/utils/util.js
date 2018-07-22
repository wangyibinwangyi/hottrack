/*
 * @Author: COCO 
 * @Date: 2018-01-25 12:38:36 
 * @Last Modified by: COCO
 * @Last Modified time: 2018-01-25 20:24:15
 * 
 */

export default {
    callbackArr:[],
    resizeTimeout:'',
    resize: function (callback) { 
        var self = this;
        if (typeof window.onresize === 'function') {
            typeof callback === 'function' ? self.callbackArr.push(callback) : '';
        } else { 
            window.onresize = function () { 
                clearTimeout(self.resizeTimeout);
                self.resizeTimeout = setTimeout(function () {
                    self.callbackArr.forEach(function (value, index) {
                        value();
                    });
                }, 300);    
            }    
        }
    },

   
 }