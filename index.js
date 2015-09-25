'use strict';
/**
 * falcor-ioredis
 * Author: Bob van Luijt <@bobvanluijt>
 */

/**
 * Prototype functions
 */

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

/**
 * Variables
 */
var Router    = require('falcor-router'),
    Ioredis   = require('ioredis'),
    jsonGraph = require('falcor-json-graph'),
    $ref      = jsonGraph
                    .ref,
    $error    = jsonGraph
                    .error;

class FalcorIoredis extends

    Router.createClass([
    {
        route: '[{keys}][{keys}][{keys}][{keys}][{keys}][{keys}][{keys}][{keys}][{keys}][{keys}]',
        //dirty fix for route deep paths, fix later
        get: function (jsonGraphArg) {

            /**
             * Closure for ref requests
             */
            function refRedisRequest(_jsonGraphArg){
                return Redis.
                            hget(_jsonGraphArg[0], _jsonGraphArg[1]).
                                then(function(result){
                                        return result;
                                });
            }

            /**
             * Closure for request, this request repeats when $type ref is found
             */
            function redisRequest(_jsonGraphArg, _jsonGraphPath, _jsonGraphHashPath){
                if(typeof _jsonGraphArg[2][0]==='undefined') {
                    return Redis.
                                hget(_jsonGraphArg[0], _jsonGraphArg[1]).
                                then(function(result){
                                    var returnVal = JSON.
                                                        parse(result);

                                    if (typeof returnVal === 'undefined'){
                                        returnVal = $error('This path does not exist in Redis');
                                    }

                                    return {
                                        path: [_jsonGraphArg[0], _jsonGraphArg[1]],
                                        value: returnVal
                                    };
                                                                    });
                } else {
                    return Redis.
                                hget(_jsonGraphArg[0], _jsonGraphArg[1]).
                                then(function(result){

                                    result = JSON.
                                                parse(result);

                                    /**
                                     * Loop through the path, if ref is found update returned value
                                     */
                                    var jsonGraphPathSteps = [],
                                        jsonGraphPathStepsResult;
                                    _jsonGraphPath.every(function(step){
                                        jsonGraphPathSteps.push(step);
                                        jsonGraphPathStepsResult = jsonGraphPathSteps.reduce(function(obj, name) {
                                            return obj[name];
                                        }, result);

                                        if(jsonGraphPathStepsResult['$type']==='ref'){

                                                var graphPathFull = [jsonGraphPathStepsResult['value'][0],
                                                                     jsonGraphPathStepsResult['value'][1]];
                                                    graphPathFull = graphPathFull
                                                                        .concat(_jsonGraphPath.diff(jsonGraphPathSteps));

                                                return false;
                                        } else {
                                                return true;
                                        }

                                    });

                                    if (typeof jsonGraphPathStepsResult === 'undefined'){
                                        jsonGraphPathStepsResult = $error('This path does not exist in Redis');
                                    }

                                        jsonGraphPathSteps.unshift(_jsonGraphArg[0], _jsonGraphArg[1]);

                                    return {
                                        path:  jsonGraphPathSteps,
                                        value: jsonGraphPathStepsResult
                                    };
                                });
                }
            }

            var Redis = new Ioredis(this.redisHost);
            var uidKey = jsonGraphArg[0].toString();
            if(jsonGraphArg[0].toString().substring(0,1) === '_'){ //if the requested key is private, return error
                return {
                            path: [jsonGraphArg[0], jsonGraphArg[1], jsonGraphArg[2][0]],
                            value: {
                                path: [jsonGraphArg[0], jsonGraphArg[1], jsonGraphArg[2][0]],
                                value: $error('No private keys allowed (keys that are prefixed with _ )')
                            }
                        };
            } else {

                /**
                 * Create the json path without redis hash
                 */
                var jsonGraphPath = [];
                for(var i = 2; i<jsonGraphArg.length; i++){ // note how i = 2, it removes hashes used in redis lookup
                    if(typeof jsonGraphArg[i][0] !== 'undefined'){
                        jsonGraphPath.
                            push(jsonGraphArg[i]);
                    }
                }

                /**
                 * Create the json path with redis hash
                 */
                var jsonGraphHashPath = [];
                for(var i2 = 0; i2<jsonGraphArg.length; i2++){
                    if(typeof jsonGraphArg[i2][0] !== 'undefined'){
                        jsonGraphHashPath.
                            push(jsonGraphArg[i2]);
                    }
                }

                /**
                 * Request the exact path from REDIS.
                 */
                return redisRequest(jsonGraphArg, jsonGraphPath, jsonGraphHashPath);
            }
        }
    }
]) {
    constructor(redisHost) {
        super();
        this.
            redisHost = redisHost;
    }
}

module.
    exports = FalcorIoredis;
