'use strict';
/**
 * Example
 * Author: Bob van Luijt @bobvanluijt
 */
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
