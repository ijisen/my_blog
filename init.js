/*================初始化目录结构===================
 * +_+ 说明：      创建项目目录结构
 * j_s 编辑人：    jisen
 * r_r 编辑时间：  2017-03-15
 * -_- 使用说明：  node init
 * ==============================================*/

const fs = require('fs');



//根目录名称
var basePath = 'src';

//子目录
var childPath = {
  "css" : null,
  "fonts" : null,
  "icons" : ["icon", "svg"],
  "img" : null,
  "js" : null,
  "static" : ["js", "css"]
};


function createSrc(father, obj){
  var root = father,
    child_arr = [root],
    s = '',
    k = 0;
   for(s in obj){
     var path  =  root + '/' + s,
       child = obj[s],
       child_len = 0;
     child_arr.push(path);
     if(child){
       child_len = child.length;
       for(k = 0; k < child_len; k++){
         path  = (root + '/' + s + '/' + child[k]);
         child_arr.push(path);
       }
     }
   }
 // console.log(child_arr)
  checkSrc(child_arr)
};


function checkSrc(arr){
  var child_arr = arr,
    child_arr_len = child_arr.length,
    k = 0,
    absolute_src = '';
  for(k; k < child_arr_len; k++){
    absolute_src = __dirname  + '/' + child_arr[k];
    if (!fs.existsSync(absolute_src)) {
      fs.mkdirSync(absolute_src);
      console.log( 'Create : ' + absolute_src );
    }else{
      console.log('Exist : ' + absolute_src);
    }
  }
}

module.exports = createSrc(basePath, childPath);




