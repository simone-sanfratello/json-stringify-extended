const gulp = require('gulp')
const clean = require('gulp-clean')
const browserify = require('browserify')
const fs = require('fs-extra')
const buffer = require('gulp-buffer')
const source = require('vinyl-source-stream')
const sourcemaps = require('gulp-sourcemaps')

gulp.task('clean', function () {
  return gulp.src(['./dist/*'])
    .pipe(clean({force: true}))
})

gulp.task('default', function () {
  fs.ensureDirSync('./dist')
  const b = browserify({
    entries: './main.js',
    debug: true
  })
    .transform('babelify', {
      presets: ['env'],
      minified: true,
      comments: false
    })

  return b.bundle()
    .pipe(source('json-stringify-extended.min.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'))
})
