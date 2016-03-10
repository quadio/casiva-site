var gulp         = require('gulp');
var path         = require('path');
var fs           = require('fs');
var less         = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps   = require('gulp-sourcemaps');
var minifyCSS    = require('gulp-minify-css');
var rename       = require('gulp-rename');
var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');
var connect      = require('gulp-connect');
var open         = require('gulp-open');
var bootlint    = require('gulp-bootlint');
//var livereload = require('gulp-livereload');

// https://www.npmjs.com/package/gulp-s3
var s3 = require("gulp-s3");
//var tar  = require('gulp-tar');
//var gzip = require('gulp-gzip');

var Paths = {
  HERE                 : './',
  UIKIT               : 'uikit',
  IMAGES               : 'images',
  ASSETS_DEPLOY        : 'public',
  DIST                 : 'dist',
  DIST_TOOLKIT_JS      : 'dist/toolkit.js',
  LESS_TOOLKIT_SOURCES : './less/toolkit*',
  LESS                 : './less/**/**',
  DEPLOY               :  'public',
  DIST_DEPLOY          :  'public/dist',
  JS                   : [
      './js/bootstrap/transition.js',
      './js/bootstrap/alert.js',
      './js/bootstrap/affix.js',
      './js/bootstrap/button.js',
      './js/bootstrap/carousel.js',
      './js/bootstrap/collapse.js',
      './js/bootstrap/dropdown.js',
      './js/bootstrap/modal.js',
      './js/bootstrap/tooltip.js',
      './js/bootstrap/popover.js',
      './js/bootstrap/scrollspy.js',
      './js/bootstrap/tab.js',
      './js/custom/*'
    ],
  FILES                 : [
    '*.html'
  ]
};

// Runs a preview
gulp.task('default', ['preview']);

// Builds the bootstrap theme. Minifies CSS and JS.
gulp.task('build', ['less-min', 'js-min']);

gulp.task('watch', function () {
  gulp.watch(Paths.LESS, ['less-min']);
  gulp.watch(Paths.JS,   ['js-min']);
});

gulp.task('preview', ['server'], function () {
  gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:9001/'}));
});

gulp.task('server', function () {
  connect.server({
    root: '',
    port: 9001,
    livereload: true
  });
});

gulp.task('publish-preview', ['copy','publish-server'], function () {
  gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:9001/'}));
});

gulp.task('publish-server', function () {
  connect.server({
    root: 'public',
    port: 9001,
    livereload: true
  });
});

gulp.task('copy',['copy-assets'], function() {
  return gulp.src(Paths.FILES, {base:"."})
    .pipe(gulp.dest(Paths.DEPLOY));
});

gulp.task('copy-assets', function() {
  return gulp.src([Paths.UIKIT + '/**', Paths.IMAGES + '/**'],{base:"."})
    .pipe(gulp.dest(Paths.ASSETS_DEPLOY));
});

gulp.task('publish', ['copy'], function() {
  var aws = JSON.parse(fs.readFileSync('./aws.json'));
  return gulp.src(Paths.DEPLOY + '/**')
    .pipe(s3(aws));
});

gulp.task('bootlint', function() {
  return gulp.src(Paths.FILES)
    .pipe(bootlint({
      stoponerror: true,
      stoponwarning: true,
      loglevel: debug,
      disabledIds: ['W009', 'E007']
    }));
});

gulp.task('less', function () {
  return gulp.src(Paths.LESS_TOOLKIT_SOURCES)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(sourcemaps.write(Paths.HERE))
    .pipe(gulp.dest('dist'));
});

gulp.task('less-min', ['less'], function () {
  return gulp.src(Paths.LESS_TOOLKIT_SOURCES)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(minifyCSS())
    .pipe(autoprefixer())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write(Paths.HERE))
    .pipe(gulp.dest(Paths.DIST));
});

gulp.task('js', function () {
  return gulp.src(Paths.JS)
    .pipe(concat('toolkit.js'))
    .pipe(gulp.dest(Paths.DIST));
});

gulp.task('js-min', ['js'], function () {
  return gulp.src(Paths.DIST_TOOLKIT_JS)
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(Paths.DIST));
});
