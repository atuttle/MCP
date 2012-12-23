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

	//to allow deeply nested stuff access to the root `this` object
	var _mcp = this;

	/*
		PRIVATE METHODS
	*/
	var _renderTemplates = {};
	function render(template, container, data, replace, append){
		//defaults
		replace = replace || true;
		modifier = modifier || true;
		//compile and cache template if it's not already cached
		if (!_renderTemplates[template]){
			_renderTemplates[template] = Handlebars.compile($( template ).html());
		}
		//render
		var src = _renderTemplates[template]( data );
		//clear existing contents if replace == true
		if (replace) $( container ).empty();
		//append or prepend as necessary (default is append; default for replace is true,
		//so default is functionally equivalent to .html())
		if (append)
			$( src ).appendTo( container );
		else
			$( src ).prependTo( container );
	}

	/*
		QUEUES
	*/
	this.$queues = [];
	this.addQueue = function(options, initial){
		options = options || {};
		var newQueue = { options: {}, state: 'disabled', items: initial || [], clock: null };
		newQueue.options.frequency = options.frequency || 5000; //default 5 seconds
		newQueue.options.phonegapEvents = options.phonegapEvents || false;
		newQueue.options.handler = options.handler || function(item){ console.log(item); };
		newQueue.options.rotateOnFail = options.rotateOnFail || false;

		//handle phonegap events
		if(newQueue.options.phonegapEvents){
			var e = newQueue.options.phonegapEvents.toLowerCase();
			$(document).on("deviceready", function(){
				if (e.indexOf('pause')>=0) $(document).on("pause", newQueue.stop);
				if (e.indexOf('offline')>=0) $(document).on("offline", newQueue.stop);
				if (e.indexOf('resume')>=0) $(document).on("resume", newQueue.start);
				if (e.indexOf('online')>=0) $(document).on("online", newQueue.start);
			});
		}

		//for closure reference of the queue this/self object
		var self = newQueue;

		//internal handler that takes care of state-machine-esque behavior and 
		//delegates to user handler for domain logic
		var $tick = function next(recurse){
			recurse = recurse || false;

			//not yet turned on
			if (this.state === 'disabled') return;

			//was running but queue now empty
			if (this.items.length === 0){
				this.stop();
				return;
			}

			//already running in another thread, do nothing
			if (this.state === 'processing' && !recurse) return;

			//update state to indicate work is being done
			this.state = 'processing';

			var item = this.items[0];
			var self = this;
			this.options.handler(item, function(result){
				result = result || false;
				if (result){
					self.shift();
					next.call(self, true);
					return;
				}else{
					if (self.options.rotateOnFail){
						if (self.items.length === 1) return;
						self.push(self.shift());
						next.call(self, true);
					}
					return;
				}
			});
		};

		newQueue.start = function(immediate){
			immediate = immediate || true;
			if (this.state === 'processing') return;
			if (this.state === 'enabled') return;
			this.state = 'enabled';
			var go = function(){ $tick.apply(newQueue); };
			if (immediate) setTimeout(go, 0);
			this.clock = setInterval(go, newQueue.options.frequency);
		};
		newQueue.stop = function(){
			if (this.state === 'disabled') return;
			this.state = 'disabled';
			clearInterval(this.clock);
			this.clock = null;
		};
		newQueue.push = function(item, start){
			start = start || false;
			this.items.push(item);
			if (start) this.start();
		};
		newQueue.shift = function(){
			return this.items.shift();
		};
		newQueue.nuke = function(){
			clearInterval(this.clock);
			this.clock = null;
			this.items = [];
			this.state = 'disabled';
		};

		this.$queues.push(newQueue);
		return newQueue;
	};
	
	var _pageDataCache = {};
	this.onPage = function(options){
		if (typeof options === 'undefined') throw "options argument is required";
		if (typeof options.page === 'undefined') throw "page key of options argument is required";
		if (typeof options.get === 'undefined') throw "get key of options argument is required";
		if (typeof options.renders === 'undefined') throw "renders key of options argument is required";
		if (typeof options.container === 'undefined') throw "container key of options argument is required";

		$(options.page).on("pageshow", function(){
			var requestURL = _mcp.options.apiBaseUrl + options.get;
			var now = new Date();

			if (_pageDataCache[options.page]){
				if (_pageDataCache[options.page].expires >= now.getTime()){
					//cache not yet expired, use existing data
					//TODO: allow specifying prepend/append, maybe?
					render( options.renders, options.container, _pageDataCache[options.page].data, true );
					//TODO: allow setting `this` context of onComplete method, maybe?
					if (options.onComplete) options.onComplete(options, _pageDataCache[options.page].data);
					return;
				}else{
					delete _pageDataCache[options.page];
				}
			}

			//TODO: assumes json
			//TODO: allow setting custom timeout per page
			//TODO: setting to allow+configure the jqm loading indicator
			$.ajax({
				url: requestURL
				,type: 'GET'
				,data: options.getData
				,dataType: 'json'
				,encoding: 'UTF-8'
				,success: function(data, textStatus, jqXHR){
					var cacheDuration = new Date().getTime();
					cacheDuration += (options.cacheDuration * 1000); //add config value converted to ms
					_pageDataCache[options.page] = {
						expires: cacheDuration
						, data: data
					};
					//TODO: allow specifying prepend/append, maybe?
					render( options.renders, options.container, data, true );
					//TODO: allow setting `this` context of onComplete method, maybe?
					if (options.onComplete) options.onComplete(options, data);
				}
				,error: function(jqXHR, textStatus, errorThrown){
					if (options.apiError) options.apiError(jqXHR, textStatus, errorThrown);
				}
				,complete: function(xhr){
					console.log('MCP XHR Complete:', xhr);
				}
				,crossDomain: true
				,cache: false
			});
		})
		.on("pagehide", function(){
			if (options.onTearDown) options.onTearDown(options.page);
		});
	};


	//load requested keys from cache
	var cacheValues = [];
	for (var key in this.options.loadFromCache){
		cacheValues.push(JSON.parse(localStorage.getItem(this.options.loadFromCache[key])) || null);
	}

	//call ready function
	this.options.ready.apply(this, cacheValues);

	console && console.log('Acknowledge.');
};
