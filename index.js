#!/usr/bin/env node
"use strict";

var http = require("http"),
    url = require("url");

var _ = require("highland"),
    nopt = require("nopt"),
    request = require("request");

var BinarySplitter = require("./lib/binary-splitter");

http.globalAgent.maxSockets = Infinity;

var knownOpts = {
      "concurrency": Number,
      "target": url,
      "request": String,
      "verbose": Boolean
    },
    shortHands = {
      "c": ["--concurrency"],
      "t": ["--target"],
      "X": ["--request"],
      "v": ["--verbose"]
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
  .map(function(path) {
    var method = 'head',
        tileUrl = args.target.slice(0, -1) + path;

    if (args.request) {
      method = args.request.toLowerCase();
    }

    return _(function(push, next) {
      request[method]({
        url: tileUrl,
        time: true
      }, function(err, rsp, body) {
        if (err) {
          console.error("ERROR %s: (%s)", tileUrl,  err);
          push(err, data);
        }

        console.log("[%d] %d %dms\t%s\t%s", rsp.request._redirect.redirectsFollowed, rsp.statusCode, rsp.elapsedTime, path, rsp.headers["cache-control"]);

        if (rsp.headers["cache-control"] === "public, max-age=0") {
          console.warn(path);
        }

        if (rsp.statusCode === 500) {
          console.warn(path);
          console.log(rsp.headers);
        }

        if (args.verbose) {
          console.log("%s: %d", tileUrl, rsp.statusCode, rsp.headers);
        }

        return push(null, _.nil);
      });
    });
  })
  .parallel(args.concurrency)
  .done(function() {
    // console.log("Done");
  });
