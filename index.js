'use strict';
/**
 * falcor-ioredis
 * Author: Bob van Luijt <@bobvanluijt>
 */

/**
 * Global polyfills
 */
if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function(target) {
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                  continue;
                }
                nextSource = Object(nextSource);

                var keysArray = Object.keys(nextSource);
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}

/**
 * Global variables
 */
var IOREDIS     = require('ioredis'),
    JSONGRAPH   = require('falcor-json-graph'),
    FALCOR      = require('falcor'),
    $ref        = JSONGRAPH
                    .ref,
    $error      = JSONGRAPH
                    .error;

class FalcorIoredis {
    
    constructor(redisHost, pathString, callback) {

        /**
         * Define variables
         */
        var redisPathsAll   = [],
            redisPathsSorted,
            i               = 0,
            firstElement,
            redis           = new IOREDIS(redisHost),
            falcorModelJson = {},
            hashRequestCount= 0;

        /**
         * Define closures
         */
        function redisRequest(hashItem){
            let hashItems = hashItem
                                .split(' '),
                hashItemA = hashItems[0],
                hashItemB = hashItems[1];

            return  redis
                        .hget(hashItemA, hashItemB)
                        .then(function(result){
                            if(typeof falcorModelJson['cache'] === 'undefined'){
                                falcorModelJson['cache'] = {};
                            }
                            if(typeof falcorModelJson['cache'][hashItemA] === 'undefined'){
                                falcorModelJson['cache'][hashItemA] = {};
                            }
                            falcorModelJson['cache'][hashItemA][hashItemB] = JSON.parse(result);

                            hashRequestCount++;

                            if(hashRequestCount === redisPathsSorted.length){
                                callback(falcorModelJson);
                            }
                            
                        });
        }

        function uniq(a) {
            var seen = new Set();
            return a
                .filter(function(x) {
                    return !seen.has(x) && seen.add(x);
                });
        }

        function findElements(element){
            firstElement = element[0];
            if(typeof firstElement !== undefined){
                if(typeof element[1] === 'object'){
                    redisPathsAll[i] = firstElement + ' ';
                    element[1]
                        .forEach(function(element){
                            if(typeof element !== undefined){
                                redisPathsAll[i] = firstElement + ' ' + element;
                                i++;
                            }
                        });
                } else {
                    redisPathsAll[i] = firstElement + ' ' + element[1];
                }
            }
            i++;
        }

        /**
         * EXEC
         */
        if(pathString === undefined){
            return;
        } else {
            this.pathString = JSON.parse(pathString);
        }

        /**
         * Find redis paths
         */
        this
            .pathString
            .forEach(findElements);

        /**
         * Make a unique array
         */
        redisPathsSorted = uniq(redisPathsAll);

        /**
         * Load data from redis and create model
         */
        redisPathsSorted
                    .map(redisRequest);
    }
}

module.
    exports = FalcorIoredis;
