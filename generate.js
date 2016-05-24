"use strict";

var fs = require("fs");
var npath = require("path");
var mkdirp = require("mkdirp");
var randomstring = require("randomstring");
var template = require("lodash/template");

var compiledHtml = template(fs.readFileSync("index.html", "utf8"));

function writeRandom(output, size) {
  while (size > 0) {
    var len = size > 80 ? 80 : size;
    if (len > 3)
      output.push("//" + randomstring.generate({length: len - 3}));
    size -= len;
  }
}

function generateModule(path, size) {
  var output = [];
  var header = "//" + path;
  output.push(header);
  writeRandom(output, size - header.length - 1);
  fs.writeFileSync(path, output.join("\n"), "utf8");
}

function generateHtml(dir, count) {
  var content = compiledHtml({
    moduleCount: count,
    headerElements: function() {
      var output = [];
      for (var idx = 0; idx < count; idx++) {
        var name = "mod" + idx + ".js";
        var text = '<script src="' + name + '"></script>';
        output.push(text);
      }
      return output.join("\n");
    },
    dummyFiller: function() {
      var output = [];
      var len = 1000 - count;
      if (len > 0) {
        for (var idx = 0; idx < len; idx++) {
          var text = '<!-- ' + randomstring.generate({length: 33 - 9}) + ' -->';
          output.push(text);
        }
      }
      return output.join("\n");
    }
  });
  fs.writeFileSync(npath.join(dir, "index.html"), content, "utf8");
}

function generate(dir, count, totalSize) {
  console.log("Building", dir, "...");
  mkdirp.sync(dir);
  generateHtml(dir, count);
  var size = Math.round(totalSize / count);
  for (var idx = 0; idx < count; idx++) {
    var path = npath.join(dir, "mod" + idx + ".js");
    generateModule(path, size);
  }
}

module.exports = generate;
