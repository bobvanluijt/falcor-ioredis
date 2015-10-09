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
