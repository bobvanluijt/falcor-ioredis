'use strict';
/**
 * falcor-ioredis
 * Author: Bob van Luijt <@bobvanluijt>
 */
var Router = require('falcor-router'),
    Ioredis = require('ioredis'),
    jsonGraph = require('falcor-json-graph'),
    $ref = jsonGraph.ref,
    $error = jsonGraph.error;            

class FalcorIoredis extends

    Router.createClass([
    {
        route: '[{keys}][{integers:indices}][{keys}]',
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
                 * Request the exact path from REDIS.
                 */
                if(typeof jsonGraphArg[2][0]=='undefined') {
                    return Redis.
                                hget(jsonGraphArg[0], jsonGraphArg[1]).
                                then(function(result){
                                    result = JSON.
                                                parse(result);
                                    return {
                                        path: [jsonGraphArg[0], jsonGraphArg[1]],
                                        value: result
                                    };
                                });
                } else {
                    return Redis.
                                hget(jsonGraphArg[0], jsonGraphArg[1]).
                                then(function(result){
                                    result = JSON.
                                                parse(result);
                                    return {
                                        path: [jsonGraphArg[0], jsonGraphArg[1], jsonGraphArg[2][0]],
                                        value: result[jsonGraphArg[2][0]]
                                    };
                                });
                }
            }
        }
    }
]) {
    constructor(redisHost) {
        super();
        this.redisHost = redisHost;
    }
}

module.exports = FalcorIoredis
