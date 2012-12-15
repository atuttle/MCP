/*
 * MCP
 * ======
 * https://github.com/CounterMarch/MCP
 * MIT Licensed
 */

var MCP = function(options){
	this.MCP = {
		version: '0.1.0'
	};

	//set defaults
	this.options = options || {};
	this.options.apiBaseUrl = this.options.apiBaseUrl || '';
	this.options.loadFromCache = this.options.loadFromCache || [];
	this.options.ready = this.options.ready || function(){/* noop */};

	this.queue = function(options){};
	
	this.page = function(options){};

	//call ready function
	this.options.ready();

	console && console.log('Acknowledge.');
};