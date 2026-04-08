import gulp from 'gulp';
import browserSync from 'browser-sync';
import gulpSass from 'gulp-sass';
import * as dartSass from 'sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import imagemin from 'gulp-imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import webp from 'gulp-webp';
import imageminSvgo from 'imagemin-svgo';
import replace from 'gulp-replace';
import svgSprite from 'gulp-svg-sprite';
import * as esbuild from 'esbuild';
import {deleteAsync} from 'del';
import imageminWebp from 'imagemin-webp';
// import imageResize from 'gulp-image-resize'

const path = {
    source: {
        folder: './source',
        css: {
            src: './source/css/style.css',
            folder: './source/css',
        },
        scss: {
            src: './source/scss/style.scss',
            watcher: './source/scss/**/*.scss'
        },
        image: {
            rasterImage: {
                src: './source/image/**/*.{png,jpg,jpeg,webp}',
                folder: './source/image'
            },
            vectorImage: {
                src: './source/image/sprite/*.svg',
                watcher: './source/image/sprite/*.svg',
                folder: './source/image/sprite'
            },
            folder: './source/image'
        },
        js: {
            src: './source/js/main.js',
            watcher: './source/js/**/*.js',
            folder: './source/js',
            fileEsBuild: './source/js/bundle.js'
        },
        html: {
            src: './source/*.html',
            watcher: './source/*.html',
        },
        fonts: {
            src: './source/font/**/*.{woff,woff2}',
            folder: './source/font',
        }
    },
    build: {
        folder: './dist',
        css: {
            folder: './dist/css',
            src: './dist/css/style.min.css',
        },
        js: {
            folder: './dist/js',
            src: './dist/js/bundle.min.js'
        },
        image: {
            rasterImage: {
                src: './dist/image/*.{jpg,jpeg,png,webp}',
                folder: './dist/image'
            },
            vectorImage: {
                folder: './dist/image/sprite',
                src: './dist/image/sprite/*.svg',
            },
            folder: './dist/image'
        },
        fonts: {
            folder: './dist/fonts'
        },
        html: {
            src: './dist/*.html',
        }
    },
}

// Конвертация scss в css
const sass = gulpSass(dartSass);

const scss = () => {
    return gulp.src(path.source.scss.src, {sourcemaps: true}) // Ищет файл и создает карту кода
        .pipe(sass()) // Преобразует scss в css
        .pipe(replace('../../', '../'))
        .pipe(postcss([autoprefixer(

        )])) // Добавляет префексы для поддержки разных браузеров
        .pipe(gulp.dest(path.source.css.folder, {sourcemaps: '.'})) // Складывает файлы в указанную папку и карту кода туда же
        .pipe(browserSync.stream()); // Обновляет страницу на случай, если он уже включен
};

// Минифицирует css для build версии
const minifyCss = () => {
    return gulp.src(path.source.css.src) // Ищет файл
        .pipe(cleanCSS()) // Минифицирует файлы css
        .pipe(rename({extname: '.min.css'})) // Переименует получившийся файл
        .pipe(gulp.dest(path.build.css.folder)) // Складывает файлы в указанную папку
}

// Сборка в один js файл всех модулей для build
const jsDev = async () => {
    await esbuild.build({
        entryPoints: [path.source.js.src],
        bundle: true,
        outfile: path.source.js.fileEsBuild, // Сюда выплюнет bundle.js
        sourcemap: true,
        allowOverwrite: true,
        format: 'iife',
    })
}

// Минифицирование и сборка в один js файл всех модулей для build (Prod версия)
const jsBuild = async () => {
    await esbuild.build({
        entryPoints: [path.source.js.src],
        bundle: true,
        outfile: path.build.js.src, // Сюда выплюнет bundle.min.js
        sourcemap: true,
        allowOverwrite: true,
        format: 'iife',
        minify: true,
    })
}

// Минифицирует html для build версии
const minifyHTML = () => {
    return gulp.src(path.source.html.src) // Ищет файл
        .pipe(htmlmin({collapseWhitespace: true})) // Минифицирует html
        .pipe(gulp.dest(path.build.folder))// Складывает файлы в указанную папку
}

// Редактирование путей в html
const renamePathHtml = () => {
    return gulp.src(path.build.html.src)
        .pipe(replace('style.css', 'style.min.css'))
        .pipe(replace(/image\/sprite\/([a-zA-Z0-9_-]+)\.svg/g, 'image/sprite/sprite.svg#$1'))
        .pipe(replace('bundle.js', 'bundle.min.js')) 
        .pipe(gulp.dest(path.build.folder))
}

// Редактирование путей в css
const renamePathCss = () => {
    return gulp.src(path.build.css.src)
        .pipe(replace('.svg', ''))
        .pipe(replace('../image/sprite/', '../image/sprite/sprite.svg#'))
        .pipe(gulp.dest(path.build.css.folder))
}

// Sprite
const sprite = () => {
    return gulp.src(path.source.image.vectorImage.src) // Ищет файлы
        .pipe(imagemin([imageminSvgo()]))
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: 'sprite.svg',
                    dest: '.'
                }
            },
            shape: {
                id: {
                    separator: ''
                },
            }
        }))
        .pipe(gulp.dest(path.build.image.vectorImage.folder)) // Кладет спрайт в корень папки
}

// Оптимизация изображений
const optimizingRasterImages = () => {
    return gulp.src(path.source.image.rasterImage.src, {encoding: false}) // Ищет изображения
        .pipe(imagemin([imageminMozjpeg({quality: 75}), imageminPngquant(), imageminWebp()])) // Оптимизирует png, jpg и webp
        .pipe(gulp.dest(path.build.image.rasterImage.folder)); // Кладет обратно в source версию
}

// Создание webp и его оптимизация
const createWebpImages = () => {
    return gulp.src(path.source.image.rasterImage.src, {encoding: false}) // Ищет изображения
        .pipe(webp()) // Создает webp изображения
        .pipe(gulp.dest(path.source.image.rasterImage.folder)); // Кладет обратно в source версию
}

// Функция для переноса файла из одной папки в другую
const fileTransfer = (file, transferFolder) => {
    return gulp.src(file, {encoding: false})
        .pipe(gulp.dest(transferFolder))
}

// Перенос шрифтов в build
const fontsTransfer = () => fileTransfer(path.source.fonts.src, path.build.fonts.folder);


// Запуск сервера
const start = () => {
    browserSync.init({
        server: {
            baseDir: path.source.folder,
        }
    })
}

const startBuild = () => {
    browserSync.init({
        server: {
            baseDir: path.build.folder,
        }
    })
}

// Наблюдатели
const watch = () => {
    gulp.watch(path.source.html.watcher).on('change', browserSync.reload);
    gulp.watch(path.source.js.watcher).on('change', gulp.series(jsDev, browserSync.reload));
    gulp.watch(path.source.scss.watcher, scss);
}

const clean = () => deleteAsync(path.build.folder);

const dev = gulp.series(scss, jsDev, gulp.parallel(watch, start));
const build = gulp.series(clean, scss, minifyHTML, minifyCss, jsBuild, optimizingRasterImages, sprite, renamePathHtml, renamePathCss, fontsTransfer);

export default dev;
export {build, startBuild, createWebpImages}
