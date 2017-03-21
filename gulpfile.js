'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');

gulp.task('buildJS', function() {
  gulp.src([  //List of packages is written manually for organisatory and testing purposes
      './js/packages/angular-routes.js',
      './js/packages/angular-animate.js',
      './js/packages/bootstrap.min.js',
      './js/packages/moment.js',
      './js/packages/datetimepicker.js',
      './js/packages/datetimepicker.templates.js',
      './js/packages/cookies.js'
    ])
    .pipe(concat('packages.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./js/'));
});
 
gulp.task('buildSass', function () {
  gulp.src('./css/main.scss')
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});

gulp.task('buildSass:watch', function () {
  gulp.watch('./css/main.scss', ['buildSass']);
});