'use strict';

const gulp = require('gulp');
const { src, dest } = require('gulp');
const { series, parallel } = require('gulp');

const sass = require('gulp-sass')(require('sass'));
const server = require('browser-sync').create();
const webpack = require('webpack-stream');
const del = require('del');
const rename = require('gulp-rename');
const plumber = require('gulp-plumber');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const htmlmin = require('gulp-htmlmin');
const cleanss = require('gulp-cleancss');
const minify = require('gulp-minify');
const gulpIf = require('gulp-if');
const fileinclude = require('gulp-file-include');

let PROD = false;

const SRC_STYLE = 'src/style/main.scss';
const SRC_HTML = 'src/*.html';
const SRC_IMG = 'src/img/**/*.{png,jpg,jpeg,gif,ico,svg}';
const SRC_FONTS = 'src/fonts/**/*';
const SRC_JS_EXTERNAL = 'src/js-external/**/*.{js,mjs,map,wasm}';
const SRC_JS = 'src/js/main.js';

const DST_HTML = 'out/src/';
const DST_STYLE = 'out/src/css/';
const DST_IMG = 'out/src/img/';
const DST_FONTS = 'out/src/fonts/';
const DST_JS = 'out/src/js/';

const WATCH_PATTERN_HTML = 'src/**/*.html';
const WATCH_PATTERN_STYLE = 'src/style/**/*.scss';
const WATCH_PATTERN_JS = 'src/js/**/*.js';
const WATCH_PATTERN_JS_EXTERNAL = 'src/js-external/**/*.{js,mjs,map,wasm}';
const WATCH_PATTERN_IMG = 'src/img/**/*';
const WATCH_PATTERN_FONTS = 'src/fonts/**/*';

const buildHtml = () => {
  return src(SRC_HTML)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulpIf(PROD,
      htmlmin({
        collapseWhitespace: true,
        trimCustomFragments: true,
        // collapseInlineTagWhitespace: true,
        removeComments: true
      })))
    .pipe(dest(DST_HTML));
};

const buildStyle = () => {
  return src(SRC_STYLE)
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(rename('style.css'))
    .pipe(gulpIf(PROD, cleanss()))
    .pipe(dest(DST_STYLE));
};

const buildJs = () => {
  return src(SRC_JS)
    .pipe(plumber())
    .pipe(webpack({
      devtool: (PROD) ? false : 'source-map',
      mode: (PROD) ? 'production' : 'development',
      module: {
        rules: [{
          test: /\.js$/,
          // loader: 'babel-loader'
        }]
      },
      output: {
        // libraryTarget: 'this',
        libraryTarget: 'var',
        library: 'appES6',
        filename: 'script.js'
      }
    }))
    .pipe(gulpIf(PROD,
      minify({
        ext: {
          min:'.js'
        },
        noSource: true
      })))
    .pipe(dest(DST_JS));
};

const copyImg = () => {
  return src(SRC_IMG)
    .pipe(dest(DST_IMG));
};

const copyFonts = () => {
  return src(SRC_FONTS)
    .pipe(dest(DST_FONTS));
};

const copyJs = () => {
  return src(SRC_JS)
    .pipe(dest(DST_JS));
};

const copyJsExternal = () => {
  return src(SRC_JS_EXTERNAL)
    .pipe(dest(DST_JS));
};

const clear = () => {
  return del(DST_HTML);
};

const reloadServer = (source) => {
  return src(source)
    .pipe(server.stream());
};

const startServer = (cb) => {
  server.init({
    server: {
      baseDir: DST_HTML,
      middleware: (req, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Access-Control-Allow-Origin', '*');
          next();
      },
    },
    port: 3502
  });

  gulp.watch(WATCH_PATTERN_HTML, series(buildHtml, reloadServer.bind(null, DST_HTML)));
  gulp.watch(WATCH_PATTERN_STYLE, series(buildStyle, reloadServer.bind(null, DST_STYLE)));
  // gulp.watch(WATCH_PATTERN_JS, series(buildJs, reloadServer.bind(null, DST_JS)));
  gulp.watch(WATCH_PATTERN_JS, series(copyJs, reloadServer.bind(null, DST_JS)));
  gulp.watch(WATCH_PATTERN_JS_EXTERNAL, series(copyJsExternal, reloadServer.bind(null, DST_JS)));
  gulp.watch(WATCH_PATTERN_IMG, series(copyImg, reloadServer.bind(null, DST_IMG)));
  gulp.watch(WATCH_PATTERN_FONTS, series(copyFonts, reloadServer.bind(null, DST_FONTS)));

  cb();
};

const setProdaction = (cb) => {
  PROD = true;
  cb();
};

// const build = series(clear, parallel(buildHtml, buildStyle, copyImg, copyFonts, buildJs, copyJsExternal));

const build = series(clear, parallel(buildHtml, buildStyle, copyImg, copyFonts, copyJs, copyJsExternal));

exports.dev = series(build, startServer);
exports.prod = series(setProdaction, build);
exports.clear = clear;
exports.build = build;
