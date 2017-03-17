'use strict';

var gulp = require('gulp');
//删除插件
var del = require('del');
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
var browserSync = require('browser-sync').create();//获取browsersync


/*task clean : 清除打包文件中的旧文件
 +_+ : 将dist目录中的旧文件清除
 =========================================================*/
gulp.task('clean',function(){
  var path = [
    'dist/js/*.js',
    'dist/css/*.css',
    'dist/*.html'
  ];
  return del(path);
});
/*========================End task clean=================================*/

/*move:static : 移动静态文件
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
/*========================End move:static==================*/

/* build:html ：构建html文件
 +_+ 说明: 将html文件打包至dist中，并build **.min.css 和**.min.js
 -_- 备注： 需要在html设置build，才能构建min.**文件,
 才能将html的引用地址更改，同时输出js和css文件
 eg：  <!-- build:css css/blog.min.css --> <!-- endbuild -->
 =========================================================*/
gulp.task('build:html',['clean'], function(){
  var path = [
    'src/*.html'
  ];
  return gulp.src(path)
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))   //js文件压缩
    .pipe(gulpif('*.css', cleanCSS({compatibility: 'ie8'}))) //css文件压缩
    .pipe(htmlMin(
      {
        collapseWhitespace: true,            //压缩html
        collapseBooleanAttributes: true,     //省略布尔属性的值
        removeComments: true,                //清除html注释
        removeEmptyAttributes: true,         //删除所有空格作为属性值
        removeScriptTypeAttributes: true,    //删除type=text/javascript
        removeStyleLinkTypeAttributes: true, //删除type=text/css
        minifyJS:true,                       //压缩页面js
        minifyCSS:true                       //压缩页面css
      }
    ))
    .pipe(gulp.dest('dist/'));
});
/*========================End build:html==================*/

/*=================build:md5===============================
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
    .pipe(gulpif('*.css', gulp.dest('./dist/css'))); //js文件压缩

});
/*========================End build:md5==================*/


/*=================imgMin===============================
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
/*========================End imgMin=======================*/


/*=================sprites===============================
 * +_+ : icon图片生成sprites(精灵图)
 *=========================================================*/
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
/*========================End sprites=======================*/


/*/*=================serve===============================
 * +_+ : 创建一个http服务，并对服务进行配置，监听文件更新。自动刷新浏览器
 * =========================================================*/
gulp.task('serve', function() {
  //当js文件改变时，单独处理js 文件
  gulp.task('md5:js', ['build:html'], function(){
    var path = [
      'dist/js/*.min.js'
    ];
    return gulp.src(path)
      .pipe(md5(10,'dist/*.html'))
      .pipe(gulp.dest('dist/js'))
      .pipe(browserSync.stream());
  });
//当css文件改变时，单独处理css文件
  gulp.task('md5:css', ['build:html'], function(){
    var path = [
      'dist/css/*.min.css'  //查找项目中已压缩的js文件
    ];
    return gulp.src(path)
      .pipe(md5(10,'dist/*.html'))  //检索html文件，更改文件中匹配的引用文件，给引用文件加上时间戳
      .pipe(gulp.dest('dist/css'));
  });
  //监听css处理完毕时，再刷新浏览器，避免浏览器无法刷新
  gulp.task('css-watch',['md5:css'], function(done){
    browserSync.reload();
    done();
  });
  //监听html文件，当html文件改变，build:md5处理完毕，刷新浏览器
  gulp.task('html-watch',['build:md5'], function(done){
    browserSync.reload();
    done();
  });
//初始dist任务；
  gulp.start(['build:md5', 'move:static', 'imgMin', 'sprites' ]);

//建立服务器
  browserSync.init({
    port: 2016,
    server: {
      baseDir: ['dist']
    }
  });
  //监听css文件
  gulp.watch('src/css/*.css', ['css-watch']);
  //监听js文件
  gulp.watch('src/js/*.js', ['md5:js']);
//监听html
  gulp.watch('src/*.html', ['html-watch']).on('change', function(event) {
    //通过change事件来检测删除情况。 event.type==deleted 时就可以对应处理删除情况，
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});
/*========================End servers=======================*/
gulp.task('default',['build:md5', 'move:static', 'imgMin', 'sprites' ]);

gulp.task('watch', ['serve']);

