const gulp = require('gulp');
const { series } = require('gulp');
const fileinclude = require('gulp-file-include');


async function includeHTML() {
    return gulp.src("./Source/**/html/*.html", {base: "./Source/"})
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest("./Build"));
}

async function copyGarden(){
    return gulp.src([
        "./Source/Garden/**/*",
        "!./Source/Garden/html/**/*",
    ], {base: "./Source/"})
        .pipe(gulp.dest("./Build/"));
}

async function copyAreas(){
    return gulp.src([
        "./Source/Areas/**/*",
        "!./Source/Areas/**/html/**/*",
    ], { base: "./Source/"})
        .pipe(gulp.dest("./Build/"));
}

exports.includeHTML = includeHTML;
exports.copyGarden = copyGarden;
exports.copyAreas = copyAreas;

exports.build = series(copyAreas, copyGarden, includeHTML);