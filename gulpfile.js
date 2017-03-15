var gulp = require('gulp');
//删除插件
var del = require('del');
//less编译插件
//var less = require('gulp-less');
//html页面压缩插件
var htmlMin = require('gulp-htmlmin');
//css压缩插件
var cleanCSS =  require('gulp-clean-css');
//js压缩插件
var uglify = require('gulp-uglify');
//散列函数插件
var md5 = require('gulp-md5-plus');
//文件合并插件
var useref = require('gulp-useref');
//if判断插件
var gulpif = require('gulp-if');
//图片压缩插件 jpg/png/gif/svg
var imgMin = require('gulp-imagemin');
//cache插件 压缩图片可能会占用较长时间，使用 gulp-cache 插件可以减少重复压缩
var gulpCache = require('gulp-cache');
//精灵图
var spritesMith = require('gulp.spritesmith');
//浏览器刷新
var browserSync = require('browser-sync');




/*Step 1 : 清除打包文件中的旧文件
+_+ : 将dist目录中的旧文件清除
=========================================================*/
gulp.task('clear', function(){
    var path = [
       './dist/**/*.js',
      './dist/**/*.html',
      './dist/**/*.css'
        ];
    return del(path);
});
/*========================End Step 1=================================*/

/*Step 2 : 移动静态文件
 +_+ : 将src目录中static下的文件复制到dist中
        这些文件都是引用插件如jquery.js  bootstrap.css 等 不需要打包
 =========================================================*/
gulp.task('move:static', function(){
    var path = [
      './src/static/**/*.*'
    ];
  return gulp.src(path)
    .pipe(gulp.dest('./dist/static/'))
    .pipe(browserSync.stream());
});
/*========================End Step 2=================================*/

/*Step 3 : less编译
 +_+ : 编译less文件，输出到src/css中
 如果编辑器支持node 此步可以省略
 =========================================================*/
gulp.task('build:less', function(){
    var path = './src/css/less/*.less';
    return gulp.src(path)
      .pipe(less())
      .pipe(gulp.dest('./src/css')); //输出文件夹common.min.css
});
/*========================End Step 3=================================*/

/*Step 4 : css js 文件合并、压缩
 +_+ : 检索html中的bulid配置，更名为*.min.js/ *.min/css; 同时压缩
插件 useref
    检索html页面中的build设置 ，对build文件更名
        eg1： index.css == index.min.css
        <!-- build:js js/index.min.css -->
            <script src="js/common.css"></script>
             <script src="js/index.css"></script>
         <!-- endbuild -->
        eg2： init.js == index.min.js
        <!-- build:js js/index.min.js -->
            <script src="js/init.js"></script>
         <!-- endbuild -->
插件 uglify：
        js压缩
插件 cleanCSS
        css压缩
 =========================================================*/
gulp.task('build:html', function(){
    var path = './src/*.html';
    return gulp.src(path)
      .pipe(useref())
      .pipe(gulpif('*.js', uglify()))   //js文件压缩
      .pipe(gulpif('*.css', cleanCSS({compatibility: 'ie8'}))) //css文件压缩
      .pipe(htmlMin(
       /* {
        collapseWhitespace: true,            //压缩html
        collapseBooleanAttributes: true,     //省略布尔属性的值
        removeComments: true,                //清除html注释
        removeEmptyAttributes: true,         //删除所有空格作为属性值
        removeScriptTypeAttributes: true,    //删除type=text/javascript
        removeStyleLinkTypeAttributes: true, //删除type=text/css
        minifyJS:true,                       //压缩页面js
        minifyCSS:true                       //压缩页面css
      }*/
      ))
      .pipe(gulp.dest('./dist/'));
});
/*========================End Step 4=================================*/


/*Step 5 : css js文件添加后缀
 +_+ : css js文件添加后缀， 避免缓存问题出现
'build:html'执行完成后，html页面的引用地址都为 *.min.js  || *.min.css
插件 md5
        给文件加版本号， 文件会检索目录和对应的html文件。给引用文件加上版本号
        注： html引用文件和目录文件要一致才能匹配上html的引用文件
=========================================================*/
gulp.task('build:md5', ['build:html'], function(){
  var path = [
    './dist/js/*.min.js',  //查找项目中已压缩的js文件
    './dist/css/*.min.css' //查找项目中已压缩的css文件
  ];
  return gulp.src(path)
    .pipe(md5(10,'./dist/*.html'))  //检索html文件，更改文件中匹配的引用文件，给引用文件加上时间戳
    .pipe(gulpif('*.js', gulp.dest('./dist/js')))   //css文件压缩
    .pipe(gulpif('*.css', gulp.dest('./dist/css'))) //js文件压缩
    .pipe(browserSync.stream());
});
/*========================End Step 5=================================*/

/*Step 6 : img文件压缩
 +_+ : img文件压缩到dist中
 =========================================================*/
gulp.task('imgMin', function(){
   var path = './src/img/*.+(jpg|png|gif|svg)';
  return gulp.src(path)
    .pipe(gulpCache(imgMin({
      interlaced : true
    })))
    .pipe(gulp.dest('./dist/img'))
    .pipe(browserSync.stream());
});
/*========================End Step 6=================================*/


/*Step 7 : icon图片生成sprites(精灵图)
 +_+ : 精灵图生成
 =========================================================*/
gulp.task('sprites', function(){
  var path = './src/icons/icon/*.+(png|gif|svg)';
  return gulp.src(path)
    .pipe(spritesMith({
      imgName: 'sprite.png',//保存合并后图片的地址
      cssName: 'sprite.css',//保存合并后文件名称 less/sass/css
      padding: 10//合并时两个图片的间距
     // algorithm: 'binary-tree' //图片排版方式。top-down	|left-right|diagonal|alt-diagonal|binary-tree（默认：binary-tree）
    }))
    .pipe(gulp.dest('./dist/icons/icon'))
    .pipe(browserSync.stream());
});
/*========================End Step 6=================================*/


/*Step 8 : watch监听 自动刷新
 +_+ : 创建一个http服务，并对服务进行配置，监听文件更新。自动刷新浏览器
 =========================================================*/
gulp.task('serve', ['clear'], function() {
  var path = [
    './src/css/**/*.css',
    './src/js/**/*.js',
    './src/*.html'
  ];
  gulp.start(['build:md5', 'move:static', 'imgMin', 'sprites']);
  browserSync.init({
    port: 3030,
    server: {
      baseDir: 'dist'
    }
  });
  gulp.watch(path, ['build:md5']);         //监控文件变化，自动更新
  gulp.watch('src/img/*.*', ['imgMin']);
  gulp.watch('src/static/**/*.*', ['move:static']);
  gulp.watch('src/icons/icon/*.*', ['sprites']);
});


gulp.task('default',['serve']);




