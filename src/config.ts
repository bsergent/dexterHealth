declare var requirejs:any;
declare var require:any;
requirejs.config({
  //By default load any module IDs from js/lib
  baseUrl: 'dist',
  //except, if the module ID starts with "app",
  //load it from the js/app directory. paths
  //config is relative to the baseUrl, and
  //never includes a ".js" extension since
  //the paths config could be for a directory.
  paths: {
      jquery: '../node_modules/jquery/dist/jquery.min',
      moment: '../node_modules/moment/min/moment.min',
      bootstrap: '../node_modules/bootstrap/dist/js/bootstrap.min'
  },
  // Wait up to this amount; needed bc loading from URLs
  waitSeconds : 15,
  // Makes the following requireJS compatible by putting it in a wrapper
  shim: {
    bootstrap: {
      deps: ['jquery'],
      exports: 'bootstrap'
    }
  },
  // Configurations
  config: {
    moment: {
      noGlobal: true
    }
  }
});
require(['main'], function (main) {
});