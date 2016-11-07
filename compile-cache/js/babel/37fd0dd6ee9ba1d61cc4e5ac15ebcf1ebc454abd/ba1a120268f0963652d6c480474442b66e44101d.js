/**
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;

var AUTOPREFIXER_BROWSERS = ['ie >= 10', 'ie_mob >= 10', 'ff >= 30', 'chrome >= 34', 'safari >= 7', 'opera >= 23', 'ios >= 7', 'android >= 4.4', 'bb >= 10'];

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js').pipe(reload({ stream: true, once: true })).pipe($.jshint()).pipe($.jshint.reporter('jshint-stylish')).pipe($['if'](!browserSync.active, $.jshint.reporter('fail')));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src('app/images/**/*').pipe($.cache($.imagemin({
    progressive: true,
    interlaced: true
  }))).pipe(gulp.dest('dist/images')).pipe($.size({ title: 'images' }));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function () {
  return gulp.src(['app/*', '!app/*.html', 'node_modules/apache-server-configs/dist/.htaccess'], {
    dot: true
  }).pipe(gulp.dest('dist')).pipe($.size({ title: 'copy' }));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src(['app/fonts/**']).pipe(gulp.dest('dist/fonts')).pipe($.size({ title: 'fonts' }));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src(['app/styles/*.scss', 'app/styles/**/*.css', 'app/styles/components/components.scss']).pipe($.sourcemaps.init()).pipe($.changed('.tmp/styles', { extension: '.css' })).pipe($.sass({
    precision: 10,
    onError: console.error.bind(console, 'Sass error:')
  })).pipe($.autoprefixer({ browsers: AUTOPREFIXER_BROWSERS })).pipe($.sourcemaps.write()).pipe(gulp.dest('.tmp/styles'))
  // Concatenate And Minify Styles
  .pipe($['if']('*.css', $.csso())).pipe(gulp.dest('dist/styles')).pipe($.size({ title: 'styles' }));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  var assets = $.useref.assets({ searchPath: '{.tmp,app}' });

  return gulp.src('app/**/*.html').pipe(assets)
  // Concatenate And Minify JavaScript
  .pipe($['if']('*.js', $.uglify({ preserveComments: 'some' })))
  // Remove Any Unused CSS
  // Note: If not using the Style Guide, you can delete it from
  // the next line to only include styles your project uses.
  .pipe($['if']('*.css', $.uncss({
    html: ['app/index.html', 'app/styleguide.html'],
    // CSS Selectors for UnCSS to ignore
    ignore: [/.navdrawer-container.open/, /.app-bar.open/]
  })))
  // Concatenate And Minify Styles
  // In case you are still using useref build blocks
  .pipe($['if']('*.css', $.csso())).pipe(assets.restore()).pipe($.useref())
  // Update Production Style Guide Paths
  .pipe($.replace('components/components.css', 'components/main.min.css'))
  // Minify Any HTML
  .pipe($['if']('*.html', $.minifyHtml()))
  // Output Files
  .pipe(gulp.dest('dist')).pipe($.size({ title: 'html' }));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist/*', '!dist/.git'], { dot: true }));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles'], function () {
  browserSync({
    notify: false,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'WSK',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app']
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['jshint']);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist'
  });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence('styles', ['jshint', 'html', 'images', 'fonts', 'copy'], cb);
});

// Run PageSpeed Insights
gulp.task('pagespeed', function (cb) {
  // Update the below URL to the public URL of your site
  pagespeed.output('example.com', {
    strategy: 'mobile'
  }, cb);
});

// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
// By default we use the PageSpeed Insights free (no API key) tier.
// Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
// key: 'YOUR_API_KEY'
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvc2V0aS1zeW50YXgvc2FtcGxlLWZpbGVzL0d1bHBmaWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkEsWUFBWSxDQUFDOzs7QUFHYixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0IsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztBQUN2QyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDekIsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzFDLElBQUksV0FBVyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUMxQyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0IsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQzs7QUFFaEMsSUFBSSxxQkFBcUIsR0FBRyxDQUMxQixVQUFVLEVBQ1YsY0FBYyxFQUNkLFVBQVUsRUFDVixjQUFjLEVBQ2QsYUFBYSxFQUNiLGFBQWEsRUFDYixVQUFVLEVBQ1YsZ0JBQWdCLEVBQ2hCLFVBQVUsQ0FDWCxDQUFDOzs7QUFHRixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxZQUFZO0FBQzlCLFNBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUNuQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUN4QyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQ2hCLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQ3pDLElBQUksQ0FBQyxDQUFDLE1BQUcsQ0FB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QUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztDQUMxRSxDQUFDLENBQUM7OztBQUdILElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxFQUFFOztBQUVuQyxXQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRTtBQUM5QixZQUFRLEVBQUUsUUFBUTtHQUluQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0NBQ1IsQ0FBQyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9tazIvLmF0b20vcGFja2FnZXMvc2V0aS1zeW50YXgvc2FtcGxlLWZpbGVzL0d1bHBmaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKlxuICogIFdlYiBTdGFydGVyIEtpdFxuICogIENvcHlyaWdodCAyMDE0IEdvb2dsZSBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiAgeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cHM6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqICBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiAgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqICBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZVxuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIEluY2x1ZGUgR3VscCAmIFRvb2xzIFdlJ2xsIFVzZVxudmFyIGd1bHAgPSByZXF1aXJlKCdndWxwJyk7XG52YXIgJCA9IHJlcXVpcmUoJ2d1bHAtbG9hZC1wbHVnaW5zJykoKTtcbnZhciBkZWwgPSByZXF1aXJlKCdkZWwnKTtcbnZhciBydW5TZXF1ZW5jZSA9IHJlcXVpcmUoJ3J1bi1zZXF1ZW5jZScpO1xudmFyIGJyb3dzZXJTeW5jID0gcmVxdWlyZSgnYnJvd3Nlci1zeW5jJyk7XG52YXIgcGFnZXNwZWVkID0gcmVxdWlyZSgncHNpJyk7XG52YXIgcmVsb2FkID0gYnJvd3NlclN5bmMucmVsb2FkO1xuXG52YXIgQVVUT1BSRUZJWEVSX0JST1dTRVJTID0gW1xuICAnaWUgPj0gMTAnLFxuICAnaWVfbW9iID49IDEwJyxcbiAgJ2ZmID49IDMwJyxcbiAgJ2Nocm9tZSA+PSAzNCcsXG4gICdzYWZhcmkgPj0gNycsXG4gICdvcGVyYSA+PSAyMycsXG4gICdpb3MgPj0gNycsXG4gICdhbmRyb2lkID49IDQuNCcsXG4gICdiYiA+PSAxMCdcbl07XG5cbi8vIExpbnQgSmF2YVNjcmlwdFxuZ3VscC50YXNrKCdqc2hpbnQnLCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBndWxwLnNyYygnYXBwL3NjcmlwdHMvKiovKi5qcycpXG4gICAgLnBpcGUocmVsb2FkKHtzdHJlYW06IHRydWUsIG9uY2U6IHRydWV9KSlcbiAgICAucGlwZSgkLmpzaGludCgpKVxuICAgIC5waXBlKCQuanNoaW50LnJlcG9ydGVyKCdqc2hpbnQtc3R5bGlzaCcpKVxuICAgIC5waXBlKCQuaWYoIWJyb3dzZXJTeW5jLmFjdGl2ZSwgJC5qc2hpbnQucmVwb3J0ZXIoJ2ZhaWwnKSkpO1xufSk7XG5cbi8vIE9wdGltaXplIEltYWdlc1xuZ3VscC50YXNrKCdpbWFnZXMnLCBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBndWxwLnNyYygnYXBwL2ltYWdlcy8qKi8qJylcbiAgICAucGlwZSgkLmNhY2hlKCQuaW1hZ2VtaW4oe1xuICAgICAgcHJvZ3Jlc3NpdmU6IHRydWUsXG4gICAgICBpbnRlcmxhY2VkOiB0cnVlXG4gICAgfSkpKVxuICAgIC5waXBlKGd1bHAuZGVzdCgnZGlzdC9pbWFnZXMnKSlcbiAgICAucGlwZSgkLnNpemUoe3RpdGxlOiAnaW1hZ2VzJ30pKTtcbn0pO1xuXG4vLyBDb3B5IEFsbCBGaWxlcyBBdCBUaGUgUm9vdCBMZXZlbCAoYXBwKVxuZ3VscC50YXNrKCdjb3B5JywgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZ3VscC5zcmMoW1xuICAgICdhcHAvKicsXG4gICAgJyFhcHAvKi5odG1sJyxcbiAgICAnbm9kZV9tb2R1bGVzL2FwYWNoZS1zZXJ2ZXItY29uZmlncy9kaXN0Ly5odGFjY2VzcydcbiAgXSwge1xuICAgIGRvdDogdHJ1ZVxuICB9KS5waXBlKGd1bHAuZGVzdCgnZGlzdCcpKVxuICAgIC5waXBlKCQuc2l6ZSh7dGl0bGU6ICdjb3B5J30pKTtcbn0pO1xuXG4vLyBDb3B5IFdlYiBGb250cyBUbyBEaXN0XG5ndWxwLnRhc2soJ2ZvbnRzJywgZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZ3VscC5zcmMoWydhcHAvZm9udHMvKionXSlcbiAgICAucGlwZShndWxwLmRlc3QoJ2Rpc3QvZm9udHMnKSlcbiAgICAucGlwZSgkLnNpemUoe3RpdGxlOiAnZm9udHMnfSkpO1xufSk7XG5cbi8vIENvbXBpbGUgYW5kIEF1dG9tYXRpY2FsbHkgUHJlZml4IFN0eWxlc2hlZXRzXG5ndWxwLnRhc2soJ3N0eWxlcycsIGZ1bmN0aW9uICgpIHtcbiAgLy8gRm9yIGJlc3QgcGVyZm9ybWFuY2UsIGRvbid0IGFkZCBTYXNzIHBhcnRpYWxzIHRvIGBndWxwLnNyY2BcbiAgcmV0dXJuIGd1bHAuc3JjKFtcbiAgICAnYXBwL3N0eWxlcy8qLnNjc3MnLFxuICAgICdhcHAvc3R5bGVzLyoqLyouY3NzJyxcbiAgICAnYXBwL3N0eWxlcy9jb21wb25lbnRzL2NvbXBvbmVudHMuc2NzcydcbiAgXSlcbiAgICAucGlwZSgkLnNvdXJjZW1hcHMuaW5pdCgpKVxuICAgIC5waXBlKCQuY2hhbmdlZCgnLnRtcC9zdHlsZXMnLCB7ZXh0ZW5zaW9uOiAnLmNzcyd9KSlcbiAgICAucGlwZSgkLnNhc3Moe1xuICAgICAgcHJlY2lzaW9uOiAxMCxcbiAgICAgIG9uRXJyb3I6IGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlLCAnU2FzcyBlcnJvcjonKVxuICAgIH0pKVxuICAgIC5waXBlKCQuYXV0b3ByZWZpeGVyKHticm93c2VyczogQVVUT1BSRUZJWEVSX0JST1dTRVJTfSkpXG4gICAgLnBpcGUoJC5zb3VyY2VtYXBzLndyaXRlKCkpXG4gICAgLnBpcGUoZ3VscC5kZXN0KCcudG1wL3N0eWxlcycpKVxuICAgIC8vIENvbmNhdGVuYXRlIEFuZCBNaW5pZnkgU3R5bGVzXG4gICAgLnBpcGUoJC5pZignKi5jc3MnLCAkLmNzc28oKSkpXG4gICAgLnBpcGUoZ3VscC5kZXN0KCdkaXN0L3N0eWxlcycpKVxuICAgIC5waXBlKCQuc2l6ZSh7dGl0bGU6ICdzdHlsZXMnfSkpO1xufSk7XG5cbi8vIFNjYW4gWW91ciBIVE1MIEZvciBBc3NldHMgJiBPcHRpbWl6ZSBUaGVtXG5ndWxwLnRhc2soJ2h0bWwnLCBmdW5jdGlvbiAoKSB7XG4gIHZhciBhc3NldHMgPSAkLnVzZXJlZi5hc3NldHMoe3NlYXJjaFBhdGg6ICd7LnRtcCxhcHB9J30pO1xuXG4gIHJldHVybiBndWxwLnNyYygnYXBwLyoqLyouaHRtbCcpXG4gICAgLnBpcGUoYXNzZXRzKVxuICAgIC8vIENvbmNhdGVuYXRlIEFuZCBNaW5pZnkgSmF2YVNjcmlwdFxuICAgIC5waXBlKCQuaWYoJyouanMnLCAkLnVnbGlmeSh7cHJlc2VydmVDb21tZW50czogJ3NvbWUnfSkpKVxuICAgIC8vIFJlbW92ZSBBbnkgVW51c2VkIENTU1xuICAgIC8vIE5vdGU6IElmIG5vdCB1c2luZyB0aGUgU3R5bGUgR3VpZGUsIHlvdSBjYW4gZGVsZXRlIGl0IGZyb21cbiAgICAvLyB0aGUgbmV4dCBsaW5lIHRvIG9ubHkgaW5jbHVkZSBzdHlsZXMgeW91ciBwcm9qZWN0IHVzZXMuXG4gICAgLnBpcGUoJC5pZignKi5jc3MnLCAkLnVuY3NzKHtcbiAgICAgIGh0bWw6IFtcbiAgICAgICAgJ2FwcC9pbmRleC5odG1sJyxcbiAgICAgICAgJ2FwcC9zdHlsZWd1aWRlLmh0bWwnXG4gICAgICBdLFxuICAgICAgLy8gQ1NTIFNlbGVjdG9ycyBmb3IgVW5DU1MgdG8gaWdub3JlXG4gICAgICBpZ25vcmU6IFtcbiAgICAgICAgLy5uYXZkcmF3ZXItY29udGFpbmVyLm9wZW4vLFxuICAgICAgICAvLmFwcC1iYXIub3Blbi9cbiAgICAgIF1cbiAgICB9KSkpXG4gICAgLy8gQ29uY2F0ZW5hdGUgQW5kIE1pbmlmeSBTdHlsZXNcbiAgICAvLyBJbiBjYXNlIHlvdSBhcmUgc3RpbGwgdXNpbmcgdXNlcmVmIGJ1aWxkIGJsb2Nrc1xuICAgIC5waXBlKCQuaWYoJyouY3NzJywgJC5jc3NvKCkpKVxuICAgIC5waXBlKGFzc2V0cy5yZXN0b3JlKCkpXG4gICAgLnBpcGUoJC51c2VyZWYoKSlcbiAgICAvLyBVcGRhdGUgUHJvZHVjdGlvbiBTdHlsZSBHdWlkZSBQYXRoc1xuICAgIC5waXBlKCQucmVwbGFjZSgnY29tcG9uZW50cy9jb21wb25lbnRzLmNzcycsICdjb21wb25lbnRzL21haW4ubWluLmNzcycpKVxuICAgIC8vIE1pbmlmeSBBbnkgSFRNTFxuICAgIC5waXBlKCQuaWYoJyouaHRtbCcsICQubWluaWZ5SHRtbCgpKSlcbiAgICAvLyBPdXRwdXQgRmlsZXNcbiAgICAucGlwZShndWxwLmRlc3QoJ2Rpc3QnKSlcbiAgICAucGlwZSgkLnNpemUoe3RpdGxlOiAnaHRtbCd9KSk7XG59KTtcblxuLy8gQ2xlYW4gT3V0cHV0IERpcmVjdG9yeVxuZ3VscC50YXNrKCdjbGVhbicsIGRlbC5iaW5kKG51bGwsIFsnLnRtcCcsICdkaXN0LyonLCAnIWRpc3QvLmdpdCddLCB7ZG90OiB0cnVlfSkpO1xuXG4vLyBXYXRjaCBGaWxlcyBGb3IgQ2hhbmdlcyAmIFJlbG9hZFxuZ3VscC50YXNrKCdzZXJ2ZScsIFsnc3R5bGVzJ10sIGZ1bmN0aW9uICgpIHtcbiAgYnJvd3NlclN5bmMoe1xuICAgIG5vdGlmeTogZmFsc2UsXG4gICAgLy8gQ3VzdG9taXplIHRoZSBCcm93c2VyU3luYyBjb25zb2xlIGxvZ2dpbmcgcHJlZml4XG4gICAgbG9nUHJlZml4OiAnV1NLJyxcbiAgICAvLyBSdW4gYXMgYW4gaHR0cHMgYnkgdW5jb21tZW50aW5nICdodHRwczogdHJ1ZSdcbiAgICAvLyBOb3RlOiB0aGlzIHVzZXMgYW4gdW5zaWduZWQgY2VydGlmaWNhdGUgd2hpY2ggb24gZmlyc3QgYWNjZXNzXG4gICAgLy8gICAgICAgd2lsbCBwcmVzZW50IGEgY2VydGlmaWNhdGUgd2FybmluZyBpbiB0aGUgYnJvd3Nlci5cbiAgICAvLyBodHRwczogdHJ1ZSxcbiAgICBzZXJ2ZXI6IFsnLnRtcCcsICdhcHAnXVxuICB9KTtcblxuICBndWxwLndhdGNoKFsnYXBwLyoqLyouaHRtbCddLCByZWxvYWQpO1xuICBndWxwLndhdGNoKFsnYXBwL3N0eWxlcy8qKi8qLntzY3NzLGNzc30nXSwgWydzdHlsZXMnLCByZWxvYWRdKTtcbiAgZ3VscC53YXRjaChbJ2FwcC9zY3JpcHRzLyoqLyouanMnXSwgWydqc2hpbnQnXSk7XG4gIGd1bHAud2F0Y2goWydhcHAvaW1hZ2VzLyoqLyonXSwgcmVsb2FkKTtcbn0pO1xuXG4vLyBCdWlsZCBhbmQgc2VydmUgdGhlIG91dHB1dCBmcm9tIHRoZSBkaXN0IGJ1aWxkXG5ndWxwLnRhc2soJ3NlcnZlOmRpc3QnLCBbJ2RlZmF1bHQnXSwgZnVuY3Rpb24gKCkge1xuICBicm93c2VyU3luYyh7XG4gICAgbm90aWZ5OiBmYWxzZSxcbiAgICBsb2dQcmVmaXg6ICdXU0snLFxuICAgIC8vIFJ1biBhcyBhbiBodHRwcyBieSB1bmNvbW1lbnRpbmcgJ2h0dHBzOiB0cnVlJ1xuICAgIC8vIE5vdGU6IHRoaXMgdXNlcyBhbiB1bnNpZ25lZCBjZXJ0aWZpY2F0ZSB3aGljaCBvbiBmaXJzdCBhY2Nlc3NcbiAgICAvLyAgICAgICB3aWxsIHByZXNlbnQgYSBjZXJ0aWZpY2F0ZSB3YXJuaW5nIGluIHRoZSBicm93c2VyLlxuICAgIC8vIGh0dHBzOiB0cnVlLFxuICAgIHNlcnZlcjogJ2Rpc3QnXG4gIH0pO1xufSk7XG5cbi8vIEJ1aWxkIFByb2R1Y3Rpb24gRmlsZXMsIHRoZSBEZWZhdWx0IFRhc2tcbmd1bHAudGFzaygnZGVmYXVsdCcsIFsnY2xlYW4nXSwgZnVuY3Rpb24gKGNiKSB7XG4gIHJ1blNlcXVlbmNlKCdzdHlsZXMnLCBbJ2pzaGludCcsICdodG1sJywgJ2ltYWdlcycsICdmb250cycsICdjb3B5J10sIGNiKTtcbn0pO1xuXG4vLyBSdW4gUGFnZVNwZWVkIEluc2lnaHRzXG5ndWxwLnRhc2soJ3BhZ2VzcGVlZCcsIGZ1bmN0aW9uIChjYikge1xuICAvLyBVcGRhdGUgdGhlIGJlbG93IFVSTCB0byB0aGUgcHVibGljIFVSTCBvZiB5b3VyIHNpdGVcbiAgcGFnZXNwZWVkLm91dHB1dCgnZXhhbXBsZS5jb20nLCB7XG4gICAgc3RyYXRlZ3k6ICdtb2JpbGUnLFxuICAgIC8vIEJ5IGRlZmF1bHQgd2UgdXNlIHRoZSBQYWdlU3BlZWQgSW5zaWdodHMgZnJlZSAobm8gQVBJIGtleSkgdGllci5cbiAgICAvLyBVc2UgYSBHb29nbGUgRGV2ZWxvcGVyIEFQSSBrZXkgaWYgeW91IGhhdmUgb25lOiBodHRwOi8vZ29vLmdsL1JrTjB2RVxuICAgIC8vIGtleTogJ1lPVVJfQVBJX0tFWSdcbiAgfSwgY2IpO1xufSk7XG5cbi8vIExvYWQgY3VzdG9tIHRhc2tzIGZyb20gdGhlIGB0YXNrc2AgZGlyZWN0b3J5XG4vLyB0cnkgeyByZXF1aXJlKCdyZXF1aXJlLWRpcicpKCd0YXNrcycpOyB9IGNhdGNoIChlcnIpIHsgY29uc29sZS5lcnJvcihlcnIpOyB9XG4iXX0=