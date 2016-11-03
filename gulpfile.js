const gulp = require('gulp')
const source = require('vinyl-source-stream')
const browserify = require('browserify')
const glob = require('glob')
const es = require('event-stream')
const babel = require('gulp-babel')
const sass = require('gulp-sass')
const rename = require('gulp-rename')
const electron = require('electron-connect').server.create()

gulp.task('build-client-bundle', (done) => {
  glob('./app/js/*.js', (err, files) => {
    if (err) done(err)

    let tasks = files.map((entry) => {
      return browserify({entries: [entry]})
        .transform('babelify', {presets: ['es2015']})
        .bundle()
        .pipe(source(entry))
        .pipe(rename({
          dirname: 'js'
        }))
        .pipe(
          gulp.dest('./build')
        )
    })

    es.merge(tasks).on('end', done)
  })
})

gulp.task('build-client-scss', (done) => {
  glob('./app/scss/*.scss', (err, files) => {
    if (err) done(err)

    let tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(sass())
        .pipe(rename({
          dirname: 'css'
        }))
        .pipe(gulp.dest('./build'))
    })

    es.merge(tasks).on('end', done)
  })
})

gulp.task('build-client-html', (done) => {
  glob('./app/*.html', (err, files) => {
    if (err) done(err)

    let tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(gulp.dest('./build'))
    })

    es.merge(tasks).on('end', done)
  })
})

gulp.task('build-client', ['build-client-bundle', 'build-client-scss', 'build-client-html'])

gulp.task('build-server', (done) => {
  glob('./electron/*.js', (err, files) => {
    if (err) done(err)

    let tasks = files.map((entry) => {
      return gulp.src(entry)
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(gulp.dest('./build'))
    })

    es.merge(tasks).on('end', done)
  })
})

gulp.task('build', ['build-server', 'build-client'])

gulp.task('watch-client', () => {
  gulp.watch('./app/**/*', ['build-client'], (e) => {
    console.log('Client file ' + e.path + ' was ' + e.type + ', rebuilding...')
  })
})

gulp.task('watch-server', () => {
  gulp.watch('./src/**/*', ['build-server'], (e) => {
    console.log('Server file ' + e.path + ' was ' + e.type + ', rebuilding...')
  })
})

gulp.task('watch', ['watch-client', 'watch-server'])

gulp.task('serve', ['build', 'watch'], () => {
  electron.start()
  gulp.watch('./build/index.js', electron.restart)
  gulp.watch(['./build/js/*.js', './build/css/*.css'], electron.reload)
})
