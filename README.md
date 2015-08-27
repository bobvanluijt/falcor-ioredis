# falcor-ioredis 

[![NPM](https://img.shields.io/npm/v/falcor-ioredis.svg)](https://www.npmjs.com/package/falcor-ioredis)
[![Build Status](https://travis-ci.org/kubrickology/falcor-ioredis.svg)](https://travis-ci.org/kubrickology/falcor-ioredis)

## What is this?
Falcor-ioredis uses the Falcor-router to sync with a JSON Graph stored in a Redis database.

## Installation

```bash
$ npm install falcor-ioredis
```

```js
'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	FalcorServer = require('falcor-express'),
	FalcorIoredis = require('falcor-ioredis'),
	app = express(),

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/model.json', FalcorServer.dataSourceRoute(function(req, res) {
    return new FalcorIoredis('redis://localhost:6379');    
}));

app.use(express.static('.'));

var server = app.listen(8080, function(err) {
    if (err) {
        console.error(err);
        return;
    }
    console.log('navigate to http://localhost:8080');
});
```
