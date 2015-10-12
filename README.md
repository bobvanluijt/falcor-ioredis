# falcor-ioredis 

[![NPM](https://img.shields.io/npm/v/falcor-ioredis.svg)](https://www.npmjs.com/package/falcor-ioredis)
[![Build Status](https://travis-ci.org/kubrickology/falcor-ioredis.svg)](https://travis-ci.org/kubrickology/falcor-ioredis)
[![bitHound Score](https://www.bithound.io/github/kubrickology/falcor-ioredis/badges/score.svg)](https://www.bithound.io/github/kubrickology/falcor-ioredis)

## What is this?
Falcor-ioredis is a simple piece of middleware that uses the Falcor-model to sync with a JSON Graph stored in a Redis database. If references are found, redis will be queried automatically for the references.

Useful links: [Falcor](http://netflix.github.io/falcor), [Ioredis](https://github.com/luin/ioredis)


## Installation

```bash
$ npm install falcor-ioredis
```

```js
'use strict';

var EXPRESS         = require('express'),
    FALCORIOREDIS   = require('falcor-ioredis'),
    FALCORSERVER    = require('falcor-express'),
    FALCOR          = require('falcor'),
    EXPRESS         = require('express'),
    APP             = EXPRESS();

APP
    .use('/', function(req, res){
        var falcorIoredis = new FALCORIOREDIS('redis://localhost:6379', req, function(resultModel){
            var falcorModel = new FALCOR
                                    .Model(resultModel) ;
            var dataSourceRoute = FALCORSERVER
                                    .dataSourceRoute(function(req, res) {
                                        return  falcorModel
                                                    .asDataSource();
                                    });
            dataSourceRoute(req,res);
        });
    });

var server = APP
                .listen(8080, function(err) {
                    if (err) console.error(err);
                    console.log('JSON graph available on http://localhost:8080');
                });
```

## How does it work?
Json Graph example:
```js
{
    "somethingById": {
        "a": {
            "foo": "bar"
        },
        "b": {
            "foo": {
                "$type": "ref",
                "value": "valuesById[c]"
            }
        }
    },
    "valuesById": {
        "c": {
            "foo": "baz"
        }
    }
}
```

The above example will be stored like this in Redis:
```bash
HSET somethingById a '{"foo":{$type:"ref","value":"valuesById[a]"}}'
HSET somethingById b '{"foo":{"$type":"ref","value":"valuesById[c]"}}'
HSET valuesById c '{"foo":"baz"}'
```

Model request for: `//localhost/?paths=[["somethingById","a","foo"]]&method=get` will return:
```json
{
    "jsonGraph": {
        "somethingById": {
            "a": {
                "foo": {
                    "$type": "atom",
                    "value": "bar",
                    "$modelCreated": true,
                    "$size": 3
                }
            }
        }
    },
    "paths": [
        [
            "somethingById",
            "a",
            "foo"
        ]
    ]
}
```
