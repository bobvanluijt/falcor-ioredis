'use strict';
/**
 * falcor-ioredis
 * Author: Bob van Luijt <@bobvanluijt>
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
                if(typeof jsonGraphArg[2][0]==='undefined') {
                    return Redis.
                                hget(jsonGraphArg[0], jsonGraphArg[1]).
                                then(function(result){
                                    var returnVal = JSON.
                                                        parse(result);
                                    
                                    if (typeof returnVal === 'undefined'){
                                        returnVal = { '$type': 'error', 'value': 'This path does not exist in Redis' };
                                    }
                                                
                                    return {
                                        path: [jsonGraphArg[0], jsonGraphArg[1]],
                                        value: returnVal
                                    };
                                });
                } else {
                    return Redis.
                                hget(jsonGraphArg[0], jsonGraphArg[1]).
                                then(function(result){
                                    result = JSON.
                                                parse(result);
                                    var returnVal = jsonGraphPath.reduce(function(obj, name) {
                                                    return obj[name];
                                                }, result);
                                                
                                    if (typeof returnVal === 'undefined'){
                                        returnVal = { '$type': 'error', 'value': 'This path does not exist in Redis' };
                                    }
                                    
                                    return {
                                        path: jsonGraphHashPath,
                                        value: returnVal
                                    };
                                });
                }
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
