'use strict';
/**
 * ELSIO CATALOG SERVER
 * Author: Bob van Luijt <bob.vanluijt@elsevier.io>
 */
var EXPRESS         = require('express'),
    FALCORIOREDIS   = require('falcor-ioredis'),
    FALCORSERVER    = require('falcor-express'),
    FALCOR          = require('falcor'),
    EXPRESS         = require('express'),
    APP             = EXPRESS();

APP
    .use('/', function(req, res){
        new FALCORIOREDIS('redis://localhost:6379', req, function(resultModel){
            var falcorModel = new FALCOR
                                    .Model(resultModel) ;
            var outcome = FALCORSERVER
                            .dataSourceRoute(function(req, res) {
                                return  falcorModel
                                            .asDataSource();
                            });
            outcome(req,res);
        });
    });

var server = APP
                .listen(8080, function(err) {
                    if (err) console.error(err);
                    console.log('JSON graph available on http://localhost:80');
                });
