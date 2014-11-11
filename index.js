#!/usr/bin/env node
"use strict";

var http = require("http"),
    url = require("url");

http.globalAgent.maxSockets = 20

var _ = require("highland"),
    nopt = require("nopt"),
    request = require("request");

var BinarySplitter = require("./lib/binary-splitter");

http.globalAgent.maxSockets = Infinity;

var knownOpts = {
      "target": url,
      "request": String,
      "verbose": Boolean
    },
    shortHands = {
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
  .each(function(path) {

    var method = 'head',
        tile_url = args.target + path;

    if (args.request) {
      method = args.request.toLowerCase();
    }


    request[method](tile_url, function(err, rsp, body) {
      if (err) {
        console.error("ERROR %s: (%s)", tile_url,  err);
        return;
      }

      if (args.verbose) {
        console.log("%s: %d", tile_url, rsp.statusCode);
      }
    });
  });
