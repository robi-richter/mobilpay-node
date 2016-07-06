var gulp = require('gulp');
var babel = require('gulp-babel');
var clean = require('gulp-clean');

gulp.task('clean', function () {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

gulp.task('dist-es5', ['clean'], function() {
  gulp.src('lib/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/es5/lib'));
  gulp.src('index.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/es5'));
  gulp.src(['package.json', 'README.md'])
    .pipe(gulp.dest('dist/es5'));
});