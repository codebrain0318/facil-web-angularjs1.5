var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var browserSync = require('browser-sync').create();

var filesCSS = [
  'www/css/app.scss',
  'www/modules/**/*.scss',
  'www/modules/**/**/*.scss',
  'www/util/**/*.scss',
  'www/components/**/*.scss'

]
var filesJS = [
  'www/app/*.js',
  'www/modules/**/*.js',  
  'www/modules/**/**/*.js',
  'www/service/*.js',
  'www/filter/*.js',
  'www/util/*.js',
  'www/util/**/*.js',
  'www/components/*.js',
  'www/components/**/*.js'
]

gulp.task('default', ['devCSS', 'devJS', 'watch'],
  bSync => {
    browserSync.init({
      server: './www'
    });

    gulp.watch("www/*.html").on('change', browserSync.reload);
    gulp.watch("www/**/*.html").on('change', browserSync.reload);
    gulp.watch("www/**/**/*.html").on('change', browserSync.reload);
    gulp.watch("www/**/**/**/*.html").on('change', browserSync.reload);
    
  });

gulp.task('devCSS', function () {
  return gulp.src(filesCSS)
      .pipe(concat('main.min.css'))
      .pipe(sass())
      .pipe(gulp.dest('./www/content/css/'))
      .pipe(browserSync.stream());
});

gulp.task('devJS', function () {
  return gulp.src(filesJS)
      .pipe(concat('main.min.js'))        
      .pipe(gulp.dest('./www/content/js/'))
      .pipe(browserSync.stream());
});

gulp.task('watch', function() {
  gulp.watch(filesCSS, ['devCSS']);
  gulp.watch(filesJS, ['devJS']);
})
