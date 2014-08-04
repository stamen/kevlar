"use strict";

var http = require("http"),
    url = require("url");

var _ = require("highland"),
    nopt = require("nopt"),
    request = require("request");

var BinarySplitter = require("./lib/binary-splitter");

http.globalAgent.maxSockets = Infinity;

var knownOpts = {
      "target": url
    },
    shortHands = {
      "t": ["--target"]
    },
    args = nopt(knownOpts, shortHands);

if (!args.target) {
  console.log("Usage: kevlar -t <target url>");

  process.exit(1);
}

_(process.stdin.pipe(new BinarySplitter()))
  .invoke("toString")
  .invoke("trim")
  .errors(function(err, push) {
    console.warn(err.stack);

    push();
  })
  .each(function(path) {
    request.head(url.resolve(args.target, path), function(err, rsp, body) {
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
