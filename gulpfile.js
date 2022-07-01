const gulp = require('gulp');
const { series } = require('gulp');
const fileinclude = require('gulp-file-include');
const replace = require('gulp-replace');


async function buildHTML() {
    return gulp.src("./Source/**/html/*.html", {base: "./Source/"})
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(replace(/Source\/Garden\/html\/(about|garden|credits)\.html/g, "$1"))
        .pipe(replace(/Source\/Areas\/(Flooding Tiles|Flower Wall)\/html\/(flooding-tiles|flower-wall)\.html/g, "$2"))
        .pipe(replace(/Source\//g, "Build/"))
        .pipe(replace(/href="\.\/(about|garden|credits)\.html/g, "href=\"/$1"))
        .pipe(gulp.dest("./Build"));
}

async function buildGardenHTML() {
    return gulp.src("./Source/Garden/html/*.html", {base: "./Source/"})
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(replace(/Source\/Garden\/html\/(about|garden|credits)\.html/g, "$1"))
        .pipe(replace(/Source\/Areas\/(Flooding Tiles|Flower Wall)\/html\/(flooding-tiles|flower-wall)\.html/g, "$2"))
        .pipe(replace(/Source\//g, "Build/"))
        .pipe(replace(/href="\.\/(about|garden|credits)\.html/g, "href=\"/$1"))
        .pipe(gulp.dest("./Build"));
}

async function buildFlowerWall(){
    return gulp.src("./Source/Areas/Flower Wall/html/*.html", {base: "./Source/"})
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
            context: {
                music: false,
                sounds: false,
            }
        }))
        .pipe(replace(/Source\/Garden\/html\/(about|garden|credits)\.html/g, "$1"))
        .pipe(replace(/Source\/Areas\/(Flooding Tiles|Flower Wall)\/html\/(flooding-tiles|flower-wall)\.html/g, "$2"))
        .pipe(replace(/Source\//g, "Build/"))
        .pipe(replace(/href="\.\/(about|garden|credits)\.html/g, "href=\"/$1"))
        .pipe(gulp.dest("./Build"));
}

async function buildFloodingTiles(){
    return gulp.src("./Source/Areas/Flooding Tiles/html/*.html", {base: "./Source/"})
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file',
        context: {
            music: false,
            sounds: false,
        }
    }))
    .pipe(replace(/Source\/Garden\/html\/(about|garden|credits)\.html/g, "$1"))
    .pipe(replace(/Source\/Areas\/(Flooding Tiles|Flower Wall)\/html\/(flooding-tiles|flower-wall)\.html/g, "$2"))
    .pipe(replace(/Source\//g, "Build/"))
    .pipe(replace(/href="\.\/(about|garden|credits)\.html/g, "href=\"/$1"))
    .pipe(gulp.dest("./Build"));
}

async function buildEndlessNight(){
    return gulp.src("./Source/Areas/Endless Night/html/*.html", {base: "./Source/"})
    .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file',
        context: {
            music: true,
            sounds: true,
        }
    }))
    .pipe(replace(/Source\/Garden\/html\/(about|garden|credits)\.html/g, "$1"))
    .pipe(replace(/Source\/Areas\/(Flooding Tiles|Flower Wall)\/html\/(flooding-tiles|flower-wall)\.html/g, "$2"))
    .pipe(replace(/Source\//g, "Build/"))
    .pipe(replace(/href="\.\/(about|garden|credits)\.html/g, "href=\"/$1"))
    .pipe(gulp.dest("./Build"));
}

async function copyGarden(){
    return gulp.src([
        "./Source/Garden/**/*",
        "!./Source/Garden/html/**/*",
    ], {base: "./Source/"})
        .pipe(replace(/Source\//g, "Build/"))
        .pipe(gulp.dest("./Build/"));
}

async function copyAreas(){
    return gulp.src([
        "./Source/Areas/**/*",
        "!./Source/Areas/**/html/**/*",
    ], { base: "./Source/"})
        .pipe(replace(/Source\//g, "Build/"))
        .pipe(gulp.dest("./Build/"));
}

exports.buildHTML = buildHTML;
exports.copyGarden = copyGarden;
exports.copyAreas = copyAreas;

exports.build = series(copyAreas, copyGarden, buildGardenHTML, buildEndlessNight, buildFloodingTiles, buildFlowerWall);