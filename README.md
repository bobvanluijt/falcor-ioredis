# falcor-ioredis 

[![NPM](https://img.shields.io/npm/v/falcor-ioredis.svg)](https://www.npmjs.com/package/falcor-ioredis)
[![Build Status](https://travis-ci.org/kubrickology/falcor-ioredis.svg)](https://travis-ci.org/kubrickology/falcor-ioredis)

## What is this?
Falcor-ioredis is a simple piece of middleware that uses the Falcor-router to sync with a JSON Graph stored in a Redis database.

_note: this package is is still in version 0.0.x if you want to help, please fork an update _

Useful links: [Falcor](http://netflix.github.io/falcor), [Ioredis](https://github.com/luin/ioredis)

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

## Roadmap and todos
- Accept setting of value
- Accept get arrays

## How does it work?
Json Graph example:
```js
{
    somethingById: {
        a: {
            foo: "bar"
        },
        b: {
            foo: {
                $type: "ref",
                value: "valuesById[a]"
            }
        },
        c: {
            0: {
                $type: "ref",
                value: "valuesById[a]"
            },
            1: {
                Foo: "Bar"
            },
            3: {
                0: {
                    foo: "baz"
                },
                1: {
                    foo: "quux"
                }
            }
        }
    },
    d: {
        $type: "ref",
        value: "valuesById[7]"
    }
}
```

The above example will be stored like this in Redis:
```bash
HSET somethingById a '{foo:"bar"}'
HSET somethingById b '{foo:{$type:"ref",value:"valuesById[a]"}}'
HSET somethingById c '{0:{$type:"ref",value:"valuesById[a]"},1:{Foo:"Bar"},3:{0:{foo:"baz"},1:{foo:"quux"}}}'
HSET somethingById d '{$type:"ref",value:"valuesById[7]"}'
```

Model request for: `//localhost/model.json?paths=[[%22somethingById%22,%22a%22,%22foo%22]]&method=get` will return:
```json
{
    "jsonGraph": {
        "somethingById": {
            "a": {
                "foo": "bar"
            }
        }
    }
}
```

# Private key values
Private keys start with a underscore, keys with underscores will be ignored. (used for custom frontend keys)
