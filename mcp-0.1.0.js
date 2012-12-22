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
	
	this.page = function(options){};

	//call ready function
	this.options.ready();

	console && console.log('Acknowledge.');
};
