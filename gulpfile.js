const gulp         = require('gulp');
const browserSync  = require('browser-sync').create();
const sass         = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const s3           = require("gulp-s3");
const sourcemaps   = require('gulp-sourcemaps');
const del          = require('del');
const fs           = require('fs');
var sequence       = require('run-sequence');

const Paths = {
  ROOT: './',
  ASSETS: './assets/',
  CSS_DIR: './assets/css/',
  SCSS_DIR: './assets/scss/',
  SCSS_FILE: './assets/scss/uikit.scss',
  DEPLOY: 'dist/site',
  FILES: [
    'index.html'
    ]
};

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {
    browserSync.init({
        server: Paths.ROOT
    });

    gulp.watch(STYLESHEET, ['sass']);
    gulp.watch(ROOT + '*.html').on('change', browserSync.reload);
});

gulp.task('clean', function () {
  return del([Paths.DEPLOY]);
});

gulp.task('publish', function(callback) {
  sequence('clean', 'copy', 'upload', callback);
});

gulp.task('upload', function() {
  var aws = JSON.parse(fs.readFileSync('./aws.json'));
  return gulp.src(Paths.DEPLOY + '/**')
    .pipe(s3(aws));
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src(Paths.SCSS_FILE)
        .pipe(sourcemaps.init())
        .pipe(sass({ 
          style: 'expanded',
          sourceComments: 'normal'
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(Paths.CSS_DIR))
        .pipe(browserSync.stream());
});

gulp.task('copy',['copy-assets'], function() {
  return gulp.src(Paths.FILES, {base:"."})
    .pipe(gulp.dest(Paths.DEPLOY));
});

gulp.task('copy-assets', ['sass'], function() {
  return gulp.src([Paths.ASSETS + '/js/**/*', 
                   Paths.ASSETS + '/css/**/*', 
                   Paths.ASSETS + '/images/**/*',
                   Paths.ASSETS + '/bootstrap/**/*', 
                   Paths.ASSETS + '/fonts/**/*'], {base:"."})
    .pipe(gulp.dest(Paths.DEPLOY));
});

gulp.task('default', ['serve']);