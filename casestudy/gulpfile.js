const gulp = require('gulp');

// Minify HTML
const html = 'html';
const htmlmin = require('gulp-htmlmin');
gulp.task(html, () => {
    return gulp.src('./src/*.html')
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('./dist'));
});

// Minify & Prefix Styles
const styles = 'styles';
const cleanCSS = require('gulp-clean-css');
const prefix = require('gulp-autoprefixer');
gulp.task(styles, () => {
    return gulp.src('./src/styles/*.css')
        .pipe(prefix('last 2 versions'))
        .pipe(cleanCSS({ compatibility: 'ie7' }))
        .pipe(gulp.dest('./dist/styles'));
});

// Watch Tasks
gulp.watch('./src/*.html', gulp.series([html]));
gulp.watch('./src/styles/*.css', gulp.series([styles]));

// Default Task
gulp.task('default', gulp.parallel(html, styles));