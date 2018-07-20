var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var es = require('event-stream');
var fs = require("fs");
var path = require('path');
var bowerfiles = require('main-bower-files');
var print = require('gulp-print');
var rs = require('run-sequence').use(gulp);
var Q = require('q');
var argv = require('yargs').argv;

// == PATH STRINGS ========
var SOURCE = {
    ROOT: './app',
    MODULES: './app/components'
};
var DIST = {
    ROOT: './dist',
    DEV: './dist/dev',
    REL: './dist/rel'
};

//TODO: should we incrementally build to a BUILD folder, then DEPLOY from BUILD to Distribution folders????
///gulp tasks
gulp.task('clean', clean);
gulp.task('deploy-assets', deployAssets);
gulp.task('deploy-vendor-javascript', deployVendorJavascript);
gulp.task('deploy-application', deployApplication);
gulp.task('deploy-modules', deployApplicationModules);
gulp.task('deploy-index', deployIndex);
gulp.task('deploy-web-config', deployIisWebConfig);
gulp.task('deploy', ['clean'], deploy);
gulp.task('deploy-and-run', ['deploy'], runDev);
gulp.task('run', runDev);

//functions
function clean() {
    var deferred = Q.defer();
    del(DIST.ROOT, function () {
        deferred.resolve();
    });
    return deferred.promise;
}
function deployAssets() {
    var bootstrap = gulp.src('./bower_components/bootstrap/dist/css/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    var fontawesomeCss = gulp.src('./bower_components/fontawesome/css/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    var visCss = gulp.src('./bower_components/vis/dist/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    var metisMenu = gulp.src('./bower_components/metisMenu/dist/*min.css')
        .pipe(gulp.dest(DIST.DEV + '/css'));
    var css = gulp.src([SOURCE.ROOT + '/assets/css/*.css',SOURCE.MODULES + '/**/*.css'])
        .pipe(plugins.concat('styles.css'))
        .pipe(gulp.dest(DIST.DEV + '/css'))
        .pipe(gulp.dest(DIST.REL + '/css'));
    var visImages = gulp.src('./bower_components/vis/dist/img/**/*.png')
        .pipe(gulp.dest(DIST.DEV + '/img'))
        .pipe(gulp.dest(DIST.REL + '/img'));
    var images = gulp.src(SOURCE.ROOT + '/assets/images/*.*')
        .pipe(gulp.dest(DIST.DEV + '/img'))
        .pipe(gulp.dest(DIST.REL + '/img'));
    var glyphs = gulp.src('./bower_components/bootstrap/dist/fonts/*')
        .pipe(plugins.rename({dirname: ''}))
        .pipe(gulp.dest(DIST.DEV + '/fonts'))
        .pipe(gulp.dest(DIST.REL + '/fonts'));
    var fonts = gulp.src('./bower_components/fontawesome/fonts/*')
        .pipe(plugins.rename({dirname: ''}))
        .pipe(gulp.dest(DIST.DEV + '/fonts'))
        .pipe(gulp.dest(DIST.REL + '/fonts'));
    return es.merge(bootstrap, fontawesomeCss, visCss, metisMenu, css, visImages, images, glyphs, fonts);
}
function deployVendorJavascript() {
    var vendor = gulp.src(bowerfiles('**/*.js'))
        .pipe(plugins.order(['jquery.js', 'angular.js']))
        .pipe(gulp.dest(DIST.DEV + '/js/vendor'))
        .pipe(plugins.concat('vendor.js'))
        .pipe(gulp.dest(DIST.REL + '/js'));
    return vendor;
}
function deployModule(moduleName, fileName, dir) {
    var module = gulp.src(dir + '/*module.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var constants = gulp.src(dir + '/*constants.js')
        .pipe(plugins.replace('INSERT_SENTINEL_API_HOST_URL', argv.apiurl))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var services = gulp.src(dir + '/*service.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var controllers = gulp.src(dir + '/*controller.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var directives = gulp.src(dir + '/*directive.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var filters = gulp.src(dir + '/*filter.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var routes = gulp.src(dir + '/*routes.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var runBlocks = gulp.src(dir + '/*run.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var templates = gulp.src(dir + '/*.html')
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.angularTemplatecache({
            filename: 'app-templates.js',
            root: fileName,
            module: moduleName,
            standalone: false,
            templateHeader: '(function () {angular.module("<%= module %>"<%= standalone %>).run(["$templateCache", function($templateCache) {',
            templateFooter: '}]);})();'
        }));

    return es.merge(module, constants, services, controllers, directives, filters, routes, runBlocks, templates)
        .pipe(plugins.order(['*module.js', '*constants.js', '*service.js', '*controller.js', '*directive.js', '*filter.js', '*routes.js', '*run.js']))
        .pipe(plugins.concat(fileName + '.js'))
        .pipe(gulp.dest(DIST.DEV + '/js/app'));
}
function deployApplication() {
    var dir = SOURCE.ROOT;
    var name = 'sentinel';
    var module = gulp.src(dir + '/*module.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var constants = gulp.src(dir + '/*constants.js')
        .pipe(plugins.replace('INSERT_SENTINEL_API_HOST_URL', argv.apiurl))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var services = gulp.src(dir + '/*service.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var controllers = gulp.src(dir + '/*controller.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var directives = gulp.src(dir + '/*directive.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var filters = gulp.src(dir + '/*filter.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var routes = gulp.src(dir + '/*routes.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var runBlocks = gulp.src(dir + '/*run.js')
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));

    var templates = gulp.src([dir + '/*.html', '!' + dir + '/index.html'])
        .pipe(plugins.htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(plugins.angularTemplatecache({
            filename: 'app-templates.js',
            root: '',
            module: name,
            standalone: false,
            templateHeader: '(function () {angular.module("<%= module %>"<%= standalone %>).run(["$templateCache", function($templateCache) {',
            templateFooter: '}]);})();'
        }));

    return es.merge(module, constants, services, controllers, directives, filters, routes, runBlocks, templates)
        .pipe(plugins.order(['*module.js', '*constants.js', '*service.js', '*controller.js', '*directive.js', '*filter.js', '*routes.js', '*run.js']))
        .pipe(plugins.concat(name + '.js'))
        .pipe(gulp.dest(DIST.DEV + '/js/app'));
}
function deployApplicationModules() {
//TODO: dynamically search components director for any director that contains a *module.js file. Until then, need to explicitly add the modules to include
    return es.merge
        (
            deployModule('api-common-','api-common',SOURCE.MODULES + '/api-common'),
            deployModule('api-sentinel','api-sentinel',SOURCE.MODULES + '/api-sentinel'),
            deployModule('ui-common-','ui-common',SOURCE.MODULES + '/ui-common'),
            deployModule('ui-sentinel.home','ui-sentinel-home',SOURCE.MODULES + '/ui-sentinel/home'),
            deployModule('ui-sentinel.header','ui-sentinel-header',SOURCE.MODULES + '/ui-sentinel/header'),
            deployModule('ui-sentinel.login','ui-sentinel-login',SOURCE.MODULES + '/ui-sentinel/login'),
            deployModule('ui-sentinel.session','ui-sentinel-session',SOURCE.MODULES + '/ui-sentinel/session'),
            deployModule('ui-sentinel.accounts','ui-sentinel-accounts',SOURCE.MODULES + '/ui-sentinel/accounts'),
            deployModule('ui-sentinel.logins','ui-sentinel-logins',SOURCE.MODULES + '/ui-sentinel/logins'),
            deployModule('ui-sentinel.sentry','ui-sentinel-sentry',SOURCE.MODULES + '/ui-sentinel/sentry'),
            deployModule('ui-sentinel.sentinel','ui-sentinel-sentinel',SOURCE.MODULES + '/ui-sentinel/sentinel'),
            deployModule('ui-sentinel.sentry-reports','ui-sentinel-sentry-reports',SOURCE.MODULES + '/ui-sentinel/sentry-reports'),
            deployModule('ui-sentinel.sightings','ui-sentinel-sightings',SOURCE.MODULES + '/ui-sentinel/sightings'),
            deployModule('ui-sentinel.simulators','ui-sentinel-simulators',SOURCE.MODULES + '/ui-sentinel/simulators')
            


            // deployModule('ui-sentinel.sentry','ui-sentinel-sentry',SOURCE.MODULES + '/ui-sentinel/sentry'),
            //deployModule('ui-sentinel.sightings','ui-sentinel-sightings',SOURCE.MODULES + '/ui-sentinel/sightings'),
            //deployModule('ui-sentinel.emulator','ui-sentinel-emulator',SOURCE.MODULES + '/ui-sentinel/emulator')
            // deployModule('ui-sentinel.exception','ui-sentinel-exception',SOURCE.MODULES + '/ui-sentinel/exception')
        )
        .pipe(plugins.concat('app-modules.js'))
        .pipe(gulp.dest(DIST.REL + '/js'));
}

function deployIisWebConfig() {
    if (argv.nowebconfig) {
        return null;
    }
    return gulp.src(SOURCE.ROOT + '/web.config')
        .pipe(gulp.dest(DIST.DEV));
}

function deployIndex() {
    //TODO: need to finish release deployment of index
    var css = gulp.src(DIST.DEV + '/css/*.css', { read: false });
    var vendorJs = gulp.src(DIST.DEV + '/js/vendor/*.js', { read: false })
        .pipe(plugins.order([
            'jquery.js',
            'jquery*.js',
            'bootstrap.js',
            'angular.js',
            'angular*.js'
        ]));
    var js = gulp.src(DIST.DEV + '/js/app/*.js', { read: false })
        .pipe(plugins.order([
            'ui-sentinel.js',
            'api-sentinel.js'
        ]));
    var index = gulp.src(SOURCE.ROOT + '/index.html')
        .pipe(plugins.replace('GOOGLE-MAPS-API-KEY', argv.gmapkey))
        .pipe(gulp.dest(DIST.DEV))
        .pipe(plugins.inject(css, {relative: true }))
        .pipe(plugins.inject(vendorJs, {relative: true, name: 'bower' }))
        .pipe(plugins.inject(js, {relative: true }))
        .pipe(gulp.dest(DIST.DEV));
    return index;
}
function deploy() {
    var deferred = Q.defer();
    rs(['deploy-assets', 'deploy-vendor-javascript', 'deploy-application', 'deploy-modules'],'deploy-index', 'deploy-web-config', function() {
        deferred.resolve();
    });
    return deferred.promise;
}
function runDev() {
    plugins.nodemon({script: 'server.js', ext: 'js', watch: [], env: {NODE_ENV: 'development'}})
        //.on('change', ['validate-devserver-scripts'])
        .on('restart', function () {
            console.log('[nodemon] restarted dev server');
        });

    plugins.livereload.listen({ start: true });

    //setup watches
    gulp.watch(SOURCE.ROOT + '/index.html', function() {
       return deployIndex()
           .pipe(plugins.livereload());
    });

    gulp.watch([SOURCE.ROOT + '/assets/css/*.css',SOURCE.MODULES + '/**/*.css'], function() {
        return deployAssets()
            .pipe(plugins.livereload());
    });

    gulp.watch(SOURCE.ROOT + '/*.js', function () {
        return deployApplication()
            .pipe(plugins.livereload());
    });

    gulp.watch([SOURCE.MODULES + '/**/*.js', SOURCE.MODULES + '/**/*.html'], function () {
       return deployApplicationModules()
           .pipe(plugins.livereload());
    });
}


