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
			this.options.handler(item, function(result){
				result = result || false;
				if (result){
					this.shift();
					next(true);
					return;
				}else{
					if (this.options.rotateOnFail){
						if (this.items.length === 1) return;
						this.push(this.shift());
						next(true);
					}
					return;
				}
			});
		};

		newQueue.start = function(){
			if (this.state === 'processing') return;
			if (this.state === 'enabled') return;
			this.state = 'enabled';
			var go = function(){ $tick.apply(this); };
			this.clock = setInterval(go, this.options.frequency);
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
