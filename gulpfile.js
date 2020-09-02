var gulp = require('gulp');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var del = require('del')
var rev = require('gulp-rev')
var minifyHtml = require('gulp-minify-html');
var realFavicon = require('gulp-real-favicon');
var fs = require('fs');
var copy = require('gulp-copy');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'cache/faviconData.json';

gulp.task('copy:fonts', ['clean'], function() {
  return gulp.src('assets/font/**/*.{ttf,woff,woff2,eot,svg}')
      .pipe(gulp.dest('public/font'));
});

gulp.task('copy:assets', ['clean'], function() {
  var assets_paths = [
    'assets/svg/**/*',
    'assets/img/**/*',
    'assets/js/touchmouse.js',
    'vendor/**/*'
  ]
  
  return gulp.src(assets_paths)
             .pipe(copy('public'));
});

gulp.task('copy:favicon', ['clean'], function() {
  return gulp.src('cache/favicon/*')
      .pipe(gulp.dest('public'));
});

gulp.task('minify', ['clean'], function() {
  return gulp.src('index.html')
      .pipe(usemin({
        css: [ minifyCss, rev ],
        js: [ uglify, rev ],
        vendorjs: [ uglify, rev ],
        html: [ minifyHtml ],
      }))
      .pipe(gulp.dest('public'));
});

gulp.task('clean', function() {
  return del([
    'public/**/*',
    // don't remove .gitkeep
    '!public/.gitkeep'
  ]);
});

// Generate the icons. This task takes a few seconds to complete. 
// You should run it at least once to create the icons. Then, 
// you should run it whenever RealFaviconGenerator updates its 
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
  realFavicon.generateFavicon({
    masterPicture: 'favicon.svg',
    dest: 'cache/favicon',
    iconsPath: '/',
    design: {
      ios: {
        pictureAspect: 'backgroundAndMargin',
        backgroundColor: '#ffffff',
        margin: '14%'
      },
      desktopBrowser: {},
      windows: {
        pictureAspect: 'noChange',
        backgroundColor: '#da532c',
        onConflict: 'override'
      },
      androidChrome: {
        pictureAspect: 'shadow',
        themeColor: '#ffffff',
        manifest: {
          name: 'Cryptoloji',
          display: 'browser',
          orientation: 'notSet',
          onConflict: 'override',
          declared: true
        }
      },
      safariPinnedTab: {
        pictureAspect: 'silhouette',
        themeColor: '#5bbad5'
      }
    },
    settings: {
      compression: 2,
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: false
    },
    markupFile: FAVICON_DATA_FILE
  }, function() {
    done();
  });
});

// Inject the favicon markups in your HTML pages. You should run 
// this task whenever you modify a page. You can keep this task 
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', ['minify'], function() {
  gulp.src('public/index.html')
      .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
      .pipe(gulp.dest('public/'));
});

gulp.task('build', ['clean', 'copy:fonts', 'copy:favicon', 'copy:assets', 'minify', 'inject-favicon-markups']);
gulp.task('favicon', ['generate-favicon']);
