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
var Ioredis   = require('ioredis'),
    jsonGraph = require('falcor-json-graph'),
    falcor    = require('falcor'),
    $ref      = jsonGraph
                    .ref,
    $error    = jsonGraph
                    .error;

class FalcorIoredis {
    
    constructor(redisHost, pathString) {

        /**
         * Define variables
         */
        var returnerAll = [],
            returnerSorted,
            i = 0,
            firstElement;

        function uniq(a) {
            var seen = new Set();
            return a
                .filter(function(x) {
                    return !seen.has(x) && seen.add(x);
                })
        }

        function findElements(element){
            firstElement = element[0];
            if(typeof firstElement !== undefined){
                if(typeof element[1] === 'object'){
                    returnerAll[i] = firstElement + ' ';
                    element[1]
                        .forEach(function(element){
                            if(typeof element !== undefined){
                                returnerAll[i] = firstElement + ' ' + element;
                                i++;
                            }
                        });
                } else {
                    returnerAll[i] = firstElement + ' ' + element[1];
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

        this
            .pathString
            .forEach(findElements);

        returnerSorted = uniq(returnerAll);

        console.log(returnerSorted);
        console.log( '---' );

        //return model.asDataSource();

    }

}

module.
    exports = FalcorIoredis;
