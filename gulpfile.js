/* eslint-env node, process */
"use strict";

// Gulp and node
const gulp = require( "gulp" );
const cp = require( "child_process" );
const { finished } = require( "stream/promises" );
const esbuild = require( "esbuild" );
const size = require( "gulp-size" );
const through = require( "through2" );
const { minify } = require( "html-minifier-terser" );

// Basic workflow plugins
const browserSync = require( "browser-sync" );
const clean = require( "gulp-clean" );
const sass = require( "gulp-sass" )( require( "sass" ) );
const jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";
const messages = {
    jekyllBuild: "<span style=\"color: grey\">Running:</span> $ jekyll build"
};

// Performance workflow plugins
const sw = require( "sw-precache" );

// Image Generation
const responsive = require( "gulp-responsive" );
const rename = require( "gulp-rename" );

const src = {
  css: "_sass/jekyll-sleek.scss",
  js: "_js/scripts.js"
};
const dist = {
  css: "_site/assets/css",
  js: "_site/assets/js"
};

function handleErrors() {
  var args = Array.prototype.slice.call( arguments );
  const error = args[ 0 ];
  console.error( error && error.message ? error.message : error );
  this.emit( "end" ); // Keep gulp from hanging on this task
}

function minifyHtml( options ) {
  return through.obj( function( file, enc, cb ) {
    if ( file.isBuffer() ) {
      minify( file.contents.toString( enc ), options )
        .then( result => {
          file.contents = Buffer.from( result );
          cb( null, file );
        } )
        .catch( cb );
      return;
    }

    cb( null, file );
  } );
}

// SASS
gulp.task( "sass", async () => {
  const { default: prefix } = await import( "gulp-autoprefixer" );
  const stream = gulp.src( src.css )
    .pipe( sass( {
      outputStyle: "compressed",
      includePaths: [ "scss" ],
      onError: browserSync.notify
    } ).on( "error", sass.logError ) )
    .pipe( prefix() )
    .pipe( rename( { basename: "main" } ) )
    .pipe( gulp.dest( dist.css ) )
    .pipe( browserSync.reload( { stream: true } ) )
    .pipe( gulp.dest( "assets/css" ) );
  return finished( stream );
} );

//  JS
gulp.task( "js", async () => {
  await esbuild.build( {
    entryPoints: [ src.js ],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: [ "es2015" ],
    outfile: `${dist.js}/bundle.js`
  } ).catch( error => {
    handleErrors.call( { emit: () => {} }, error );
    throw error;
  } );

  const stream = gulp.src( [
      `${dist.js}/bundle.js`,
      `${dist.js}/bundle.js.map`
    ],
    { base: dist.js, allowEmpty: true } )
    .pipe( size() )
    .pipe( browserSync.reload( { stream: true } ) )
    .pipe( gulp.dest( "assets/js" ) );
  return finished( stream );
} );

gulp.task( "critical", async () => {
  const { generate } = await import( "critical" );
  return generate( {
    base: "_site/",
    src: "index.html",
    css: [ "assets/css/main.css" ],
    dimensions: [ {
      width: 320,
      height: 480
    }, {
      width: 768,
      height: 1024
    }, {
      width: 1280,
      height: 960
    } ],
    dest: "../_includes/critical.css",
    minify: true,
    extract: false,
    ignore: [ "@font-face" ]
  } );
} );

// Minify HTML
gulp.task( "html", done => {
    gulp.src( "./_site/index.html" )
      .pipe( minifyHtml( { collapseWhitespace: true } ) )
      .pipe( gulp.dest( "./_site" ) );
    gulp.src( "./_site/*/*html" )
      .pipe( minifyHtml( { collapseWhitespace: true } ) )
      .pipe( gulp.dest( "./_site/./" ) );
    done();
} );

// Service Worker
gulp.task( "sw", () => {
  const rootDir = "./";
  const distDir = "./_site";

  return sw.write( `${rootDir}/sw.js`, {
    staticFileGlobs: [ distDir + "/**/*.{js,html,css,png,jpg,svg}" ],
    stripPrefix: distDir
  } );
} );

// Images
gulp.task( "img", async () => {
  const stream = gulp.src( "_img/posts/*.{png,jpg}" )
    .pipe( responsive( {
        "*": [ // For all the images in the posts folder
          {
            width: 230,
            rename: { suffix: "_placehold" }
          },
          { // thubmnail
            width: 535,
            rename: { suffix: "_thumb" }
          },
          { // thumbnail @2x
            width: 535 * 2,
            rename: { suffix: "_thumb@2x" }
          },
          {
            width: 575,
            rename: { suffix: "_xs" }
          },
          {
            width: 767,
            rename: { suffix: "_sm" }
          },
          {
            width: 991,
            rename: { suffix: "_md" }
          },
          {
            width: 1999,
            rename: { suffix: "_lg" }
          },
          { // max-width hero
            width: 1920
          }
        ]
      },
      {
        quality: 70,
        progressive: true,
        withMetadata: false,
        errorOnEnlargement: false,
        errorOnUnusedConfig: false,
        silent: true
      } ) )
      .pipe( gulp.dest( "assets/img/posts/" ) );
  return finished( stream );
} );

// Build the Jekyll Site
gulp.task( "jekyll-build", done =>  {
    browserSync.notify( messages.jekyllBuild );
    return cp.spawn( jekyll, [ "build" ], { stdio: "inherit" } )
        .on( "close", done );
} );

// Rebuild Jekyll & do page reload
gulp.task( "rebuild",
  gulp.series( [ "jekyll-build" ], done => {
    browserSync.reload();
    done();
  } )
);

gulp.task( "clean", () => {
  return gulp.src( "_site", { read: false, allowEmpty: true } )
    .pipe( clean() );
} );

gulp.task( "serve", function() {
  return browserSync( {
    server: {
      baseDir: "_site"
    }
  } );
} );

gulp.task( "styles", gulp.series( [ "sass", "critical" ] ) );

gulp.task( "watch", () => {
  gulp.watch( "_sass/**/*.scss", gulp.series( "styles" ) );
  gulp.watch( [
    "*.html",
    "_layouts/*.html",
    "_includes/*.html",
    "_posts/*.md",
    "pages_/*.md",
    "_include/*html"
  ], gulp.series( "rebuild" ) );
  gulp.watch( "_js/**/*.js", gulp.series( "js" ) );
} );

gulp.task( "build", gulp.series( [
  "clean",
  gulp.parallel( [ "sass", "js", "img" ] ),
  "jekyll-build",
  "critical",
  "sw"
] ) );

gulp.task( "default", gulp.series( [
  "build",
  "serve",
  "watch"
] ) );
