"use strict";

var http = require("http");

var _ = require("highland"),
    env = require("require-env"),
    request = require("request");

var BinarySplitter = require("./lib/binary-splitter");

http.globalAgent.maxSockets = Infinity;

var SYSLOG_RE = /^(<[0-9]+>)([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z) ([^ ]+) ([^[]+)\[([^\]]+)\]: (.*)$/;

_(request.get(env.require("SOURCE_URL")).pipe(new BinarySplitter()))
  .invoke("toString")
  .invoke("trim")
  .map(function(line) {
    var parts;
    
    if ((parts = line.match(SYSLOG_RE))) {
      var req = parts[6],
          path = req.replace(/\"/g, "").split(" ", 2).pop();

      return path;
    }

    throw new Error("Invalid line: " + line);
  })
  .filter(function(path) {
    return path.match(/^\/toner/);
  })
  .errors(function(err, push) {
    console.warn(err.stack);

    push();
  })
  .each(function(path) {
    request.head(env.require("TARGET_URL") + path, function(err, rsp, body) {
      if (err) {
        console.error(err);
        return;
      }

      if (rsp.statusCode === 200) {
        // console.log("%s: %s", path, rsp.headers["x-response-time"], rsp.headers["x-cache"], rsp.headers["x-cache-hits"]);
        return;
      }

      console.log("%s: %d", path, rsp.statusCode);
    });
  });
