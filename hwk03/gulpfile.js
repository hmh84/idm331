const gulp = require('gulp');

// Minify & Prefix Styles
const styles = 'styles';
const cleanCSS = require('gulp-clean-css');
const prefix = require('gulp-autoprefixer');
gulp.task(styles, () => {
    return gulp.src('src/styles/*.css')
        .pipe(prefix('last 2 versions'))
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('dist/styles'));
});

// Babel & Minify Scripts
const scripts = 'scripts';
const minify = require("gulp-babel-minify");
gulp.task(scripts, () => {
    return gulp.src(['src/scripts/*.js'])
        .pipe(minify({ mangle: { keepClassName: true } }))
        .pipe(gulp.dest('dist/scripts'));
});

// Minify Images
const imagemin = require('gulp-imagemin');
const images = 'images';
gulp.task(images, () => {
    return gulp.src(['src/img/*'])
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 75, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            // imagemin.svgo({
            //     plugins: [
            //         { removeViewBox: true },
            //     ]
            // })
        ]))
        .pipe(gulp.dest('dist/img'));
});

// Watch Tasks
gulp.watch('src/styles/*.css', gulp.series([styles]));
gulp.watch('src/scripts/*.js', gulp.series([scripts]));
gulp.watch('src/img/*', gulp.series([images]));

// Default Task
gulp.task('default', gulp.parallel(styles, scripts, images));