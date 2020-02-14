const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');

gulp.task('clean', function () {
  return gulp.src('dist', {read: false, allowEmpty: true})
    .pipe(clean());
});

gulp.task('dist-es5', gulp.series('clean', function() {
  gulp.src('lib/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/es5/lib'));
  gulp.src('index.js')
    .pipe(babel())
    .pipe(gulp.dest('dist/es5'));
  return gulp.src(['package.json', 'README.md'])
    .pipe(gulp.dest('dist/es5'));
}));
