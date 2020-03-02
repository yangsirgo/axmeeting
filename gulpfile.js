var gulp = require('gulp');
// var uglify = require('gulp-uglify');
// var uglify = require('gulp-uglify-es').default;
// 获取 minify-css 模块（用于压缩 CSS）
var minifyCSS = require('gulp-minify-css')




//压缩js  网易云信的 sdk 的代码优化过了  优化后效果不大
// gulp.task('script', function () {
//   return gulp.src(['./sdk/*.js'])
//   // 2\. 压缩文件
//     .pipe(uglify({
//       compress: {
//         // 在UglifyJs删除没有用到的代码时不输出警告
//         warnings: false,
//         // 内嵌定义了但是只用到一次的变量
//         collapse_vars: true,
//         // 提取出出现多次但是没有定义成变量去引用的静态值
//         reduce_vars: true,
//       },
//       output: {
//         comments: false,
//         // 最紧凑的输出
//         beautify: false,
//       }
//     }))
//     // 3\. 另存压缩后的文件
//     .pipe(gulp.dest('./dist/sdk'))
// });

//调用js文件合并插件
// var concat = require('gulp-concat');

//用gulp建立一个all_to_one任务
// gulp.task('all_to_one', function() {
//   return gulp.src(['dist/sdk/DrawPlugin.2.0.0.js','dist/sdk/DrawPluginUI.2.0.0.js'])
//     .pipe(concat('DrawPlugin_All.2.0.0.js'))
//     .pipe(uglify())
//     .pipe(gulp.dest('dist/sdk/'));
// });


gulp.task('css', function () {
  // 1\. 找到文件
  return gulp.src('dist/*.css')
  // 2\. 压缩文件
    .pipe(minifyCSS())
    // 3\. 另存为压缩文件
    .pipe(gulp.dest('dist/'))
})

gulp.task('default', gulp.series('css'));
