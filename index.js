'use strict';

var fs = require('fs');

module.exports = exports = function(sqlite, callback) {
  var base_path    = __dirname + '/build/Release/sqlite3-fts-cjk';
  var linux_path   = base_path + '.so';
  var osx_path     = base_path + '.dylib';
  var windows_path = base_path + '.dll';

  var extension_path = null;

  if (fs.existsSync(linux_path)) {
    extension_path = linux_path;
  } else if (fs.existsSync(osx_path)) {
    extension_path = osx_path;
  } else if (fs.existsSync(windows_path)) {
    extension_path = windows_path;
  } else {
    callback(new Error("Unable to find sqlite3-fts-cjk extension."));
  }

  //search.hello();
  sqlite.loadExtension(extension_path, callback);
  sqlite.run(`SELECT fts3_tokenizer("mozporter", mozporter())`)
};
