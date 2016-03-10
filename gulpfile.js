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
var bootlint     = require('gulp-bootlint');
var sass         = require('gulp-sass');
var del          = require('del');

//var livereload = require('gulp-livereload');
// https://www.npmjs.com/package/gulp-s3

var s3 = require("gulp-s3");

var Paths = {
  HERE                 : './',
  ASSETS                : './assets',
  DEPLOY               :  './public',
  FILES                 : [
    '*.html'
  ]
};

// Runs a preview
gulp.task('default', ['preview']);

// Builds the bootstrap theme. Minifies CSS and JS.
gulp.task('build', ['copy']);

gulp.task('clean', function () {
  return del([Paths.DEPLOY]);
});

gulp.task('watch', function () {
  gulp.task('sass:watch');
});

gulp.task('preview', ['server'], function () {
  gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:9001/'}));
});

gulp.task('server', ['copy'], function () {
  connect.server({
    root: '',
    port: 9001,
    livereload: true
  });
});

gulp.task('publish-preview', ['publish-server'], function () {
  gulp.src(__filename)
    .pipe(open({uri: 'http://localhost:9001/'}));
});

gulp.task('publish-server', ['copy'], function () {
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

gulp.task('copy-assets', ['clean','sass'], function() {
  return gulp.src([Paths.ASSETS + '/js/**/*', 
                   Paths.ASSETS + '/css/**/*', 
                   Paths.ASSETS + '/images/**/*',
                   Paths.ASSETS + '/bootstrap/**/*', 
                   Paths.ASSETS + '/fonts/**/*'], {base:"."})
    .pipe(gulp.dest(Paths.DEPLOY));
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

gulp.task('sass', ['clean'], function () {
  return gulp.src(Paths.ASSETS + '/sass/uikit.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ 
      style: 'expanded',
      sourceComments: 'normal'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(Paths.ASSETS + '/css'));
});
 
gulp.task('sass:watch', function () {
  gulp.watch(Paths.ASSETS + '/sass/**/*.scss', ['sass']);
});

