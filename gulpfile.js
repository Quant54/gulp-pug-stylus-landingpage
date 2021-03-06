'use strict';
var gulp = require('gulp'), //основной плагин gulp
    stylus = require('gulp-stylus'), //препроцессор stylus
    prefixer = require('gulp-autoprefixer'), //расставление автопрефиксов
    cssmin = require('gulp-minify-css'), //минификация css
    uglify = require('gulp-uglify'), //минификация js
    jshint = require("gulp-jshint"), //отслеживание ошибкок в js
    imagemin = require('gulp-imagemin'), //минимизация изображений
    sourcemaps = require('gulp-sourcemaps'), //sourcemaps
    rename = require("gulp-rename"), //переименвоание файлов
    plumber = require("gulp-plumber"), //предохранитель для остановки гальпа
    watch = require('gulp-watch'), //расширение возможностей watch
		notify = require("gulp-notify"),
		growl = require('gulp-notify-growl'),
		concatCss = require('gulp-concat-css'),
		concat = require('gulp-concat'),
		pug = require('gulp-pug'),
    connect = require('gulp-connect'); //livereload


var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/css/images/',
        fonts: 'build/fonts/',
        htaccess: 'build/',
        contentImg: 'build/img/',
    },
    src: { //Пути откуда брать исходники
        html: 'pages/*.pug', //Синтаксис src/template/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'js/[^_]*.js',//В стилях и скриптах нам понадобятся только main файлы
        jshint: 'js/*.js',
        css: 'css/*.styl',
        cssVendor: 'css/vendor/*.*', //Если мы хотим файлы библиотек отдельно хранить то раскоментить строчку
        img: 'css/images/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'fonts/**/*.*',
        contentImg: 'img/**/*.*',
        sprites: 'css/sprites/*.png',
        htaccess: '.htaccess'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'pages/**/*.pug',
        js: 'js/**/*.js',
        css: 'css/**/*.*',
        img: 'css/images/**/*.*',
        contentImg: 'img/**/*.*',
        fonts: 'fonts/**/*.*',
        htaccess: '.htaccess',
    },
    outputDir: './build' //исходная корневая директория для запуска минисервера
};

var growlNotifier = growl({
  hostname : '127.0.0.1' // IP or Hostname to notify, default to localhost 
});


gulp.task('taskName', function(){
console.log("few");
});

// Локальный сервер для разработки
gulp.task('connect', function(){
    connect.server({ //настриваем конфиги сервера
        root: [path.outputDir], //корневая директория запуска сервера
        port: 9999, //какой порт будем использовать
        livereload: true //инициализируем работу LiveReload
    });
});

// таск для билдинга html
gulp.task('pug:build', function buildHTML() {
  return gulp.src(path.src.html)
  .pipe(pug({ yourTemplate: 'Locals' 
    // Your options in here. 
  }))
  .pipe(gulp.dest(path.build.html))
   .pipe(connect.reload()) //И перезагрузим наш сервер для обновлений
});

// проверка js на ошибки и вывод их в консоль
gulp.task('jshint:build', function() {
    return gulp.src(path.src.jshint) //выберем файлы по нужному пути
        .pipe(jshint()) //прогоним через jshint
        .pipe(jshint.reporter('jshint-stylish')); //стилизуем вывод ошибок в консоль
});

// билдинг яваскрипта
gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
      .pipe(concat('main.js'))
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
     
        .pipe(gulp.dest(path.build.js)) //выгрузим готовый файл в build
        .pipe(connect.reload()) //И перезагрузим сервер
});

// билдим статичные изображения
gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true, //сжатие .jpg
            svgoPlugins: [{removeViewBox: false}], //сжатие .svg
            interlaced: true, //сжатие .gif
            optimizationLevel: 3 //степень сжатия от 0 до 7
        }))
        .pipe(gulp.dest(path.build.img)) //выгрузим в build
        .pipe(connect.reload()) //перезагрузим сервер
});

// билдим динамичные изображения
gulp.task('imagescontent:build', function() {
    gulp.src(path.src.contentImg)
        .pipe(imagemin({ //Сожмем их
            progressive: true, //сжатие .jpg
            svgoPlugins: [{removeViewBox: false}], //сжатие .svg
            interlaced: true, //сжатие .gif
            optimizationLevel: 3 //степень сжатия от 0 до 7
        }))
        .pipe(gulp.dest(path.build.contentImg)) //выгрузим в build
        .pipe(connect.reload()) //перезагрузим сервер
});
// билдинг пользовательского css
gulp.task('cssOwn:build', function () {
    gulp.src(path.src.css) //Выберем наш основной файл стилей
      
        .pipe(stylus({
            compress: true,
            'include css': true
        })) //Скомпилируем stylus
        .pipe(concatCss("main.css"))
        .pipe(prefixer({
            browsers: ['last 3 version', "> 1%", "ie 8", "ie 7"]
        })) //Добавим вендорные префиксы
       .pipe(sourcemaps.init()) //инициализируем soucemap
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write()) //пропишем sourcemap
    
        .pipe(gulp.dest(path.build.css)) //вызгрузим в build
        .pipe(connect.reload()) //перезагрузим сервер
});

// билдинг вендорного css
gulp.task('cssVendor:build', function () {
    gulp.src(path.src.cssVendor) // Берем папку vendor
        .pipe(sourcemaps.init()) //инициализируем soucemap
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write()) //пропишем sourcemap
        .pipe(gulp.dest(path.build.css)) //выгрузим в build
        .pipe(connect.reload()) //перезагрузим сервер
});

// билдим css целиком
gulp.task('css:build', [
    'cssOwn:build',
    // 'cssVendor:build'
]);

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts)) //выгружаем в build
});

// билдим htaccess
gulp.task('htaccess:build', function() {
    gulp.src(path.src.htaccess)
        .pipe(gulp.dest(path.build.htaccess)) //выгружаем в build
});

// билдим все
gulp.task('build', [
    'pug:build',
    'jshint:build',
    'js:build',
    'css:build',
    'fonts:build',
    'htaccess:build',
    'image:build',
    'imagescontent:build'
]);

// watch
gulp.task('watch', function(){
     //билдим html в случае изменения
    watch([path.watch.html], function(event, cb) {
        gulp.start('pug:build');
    });

     //билдим контекстные изрображения в случае изменения
    watch([path.watch.contentImg], function(event, cb) {
        gulp.start('imagescontent:build');
    });
     //билдим css в случае изменения
    watch([path.watch.css], function(event, cb) {
        gulp.start('css:build');
    });
     //проверяем js в случае изменения
    watch([path.watch.js], ['jshint']);
     //билдим js в случае изменения
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
     //билдим статичные изображения в случае изменения
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
     //билдим шрифты в случае изменения
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
     //билдим htaccess в случае изменения
    watch([path.watch.htaccess], function(event, cb) {
        gulp.start('htaccess:build');
    });
});

// действия по умолчанию
gulp.task('default', ['build', 'watch', 'connect']);