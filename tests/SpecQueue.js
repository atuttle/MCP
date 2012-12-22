describe("MCP.addQueue", function(){

	var app;
	var q;

	beforeEach(function(){
		app = new MCP();
		q = app.addQueue();

		//make sure there are no pre-existing event handlers
		$(document).off('deviceready');
		$(document).off('pause');
		$(document).off('resume');
		$(document).off('online');
		$(document).off('offline');
	});

	it("returns an object", function(){
		expect(typeof q).toBe('object');
	});
	
	it("defaults frequency to 5000ms", function(){
		expect(q.options.frequency).toBe(5000);
	});
	
	it("defaults phonegapEvents to false", function(){
		expect(q.options.phonegapEvents).toBe(false);
	});
	
	it("defaults rotateOnFail to false", function(){
		expect(q.options.rotateOnFail).toBe(false);
	});
	
	it("defaults handler to a function", function(){
		expect(typeof q.options.handler).toBe('function');
	});
	
	it("has start() and stop(), nuke(), push() and shift()", function(){
		expect(q.start).toBeDefined();
		expect(q.stop).toBeDefined();
		expect(q.nuke).toBeDefined();
		expect(q.push).toBeDefined();
		expect(q.shift).toBeDefined();

		expect(typeof q.start).toBe('function');
		expect(typeof q.stop).toBe('function');
		expect(typeof q.nuke).toBe('function');
		expect(typeof q.push).toBe('function');
		expect(typeof q.shift).toBe('function');
	});

	it("defaults to no phonegap listeners", function(){
		var listeners = $._data(document, 'events');
		expect(listeners).not.toBeDefined();
	});

	it("attaches to deviceready and pause for pause", function(){
		q = app.addQueue({ phonegapEvents: 'pause' });
		var listeners = $._data(document, 'events');
		expect(listeners.deviceready).toBeDefined();
		expect(typeof listeners.deviceready).toBe('object');
		$(document).trigger('deviceready');
		listeners = $._data(document, 'events');
		expect(listeners.pause).toBeDefined();
		expect(typeof listeners.pause).toBe('object');
	});
	
	it("attaches to deviceready and resume for resume", function(){
		q = app.addQueue({ phonegapEvents: 'resume' });
		var listeners = $._data(document, 'events');
		expect(listeners.deviceready).toBeDefined();
		expect(typeof listeners.deviceready).toBe('object');
		$(document).trigger('deviceready');
		listeners = $._data(document, 'events');
		expect(listeners.resume).toBeDefined();
		expect(typeof listeners.resume).toBe('object');
	});
	
	it("attaches to deviceready and online for online", function(){
		q = app.addQueue({ phonegapEvents: 'online' });
		var listeners = $._data(document, 'events');
		expect(listeners.deviceready).toBeDefined();
		expect(typeof listeners.deviceready).toBe('object');
		$(document).trigger('deviceready');
		listeners = $._data(document, 'events');
		expect(listeners.online).toBeDefined();
		expect(typeof listeners.online).toBe('object');
	});
	
	it("attaches to deviceready for offline", function(){
		q = app.addQueue({ phonegapEvents: 'offline' });
		var listeners = $._data(document, 'events');
		expect(listeners.deviceready).toBeDefined();
		expect(typeof listeners.deviceready).toBe('object');
		$(document).trigger('deviceready');
		listeners = $._data(document, 'events');
		expect(listeners.offline).toBeDefined();
		expect(typeof listeners.offline).toBe('object');
	});

});

describe("An MCP Queue", function(){

	var app;
	var q;

	beforeEach(function(){
		app = new MCP();
		q = app.addQueue();
		q.nuke();
	});

	it("has property `state`", function(){
		expect(q.state).toBeDefined();
	});

	it("default queue.state is `disabled`", function(){
		expect(q.state).toBe('disabled');
	});

	// This test is removed for now because, while start() does initially change state to `enabled` 
	// it is quickly updated to `processing`, before the expectation can complete.
	// Maybe we can come back to this at some point but for now I don't have any ideas.
	xit("start() sets queue.state to `enabled`", function(){
		q.start(false);
		expect(q.state).toBe('enabled');
	});

	it("stop() sets queue.state to `disabled`", function(){
		q.start();
		q.stop();
		expect(q.state).toBe('disabled');
	});

	it("calling start() when queue.state is `processing` does not change state (and returns immediately)", function(){
		q.state = 'processing';
		expect(q.clock).toBe(null);
		q.start();
		expect(q.state).toBe('processing');
		expect(q.clock).toBe(null);
	});

	it("calling start() when queue.state is `enabled` does not change state (and returns immediately)", function(){
		q.state = 'enabled';
		expect(q.clock).toBe(null);
		q.start();
		expect(q.state).toBe('enabled');
		expect(q.clock).toBe(null);
	});

	it("calling stop() when queue.state is `disabled` does not change state (and returns immediately)", function(){
		q.state = 'disabled';
		expect(q.clock).toBe(null);
		q.stop();
		expect(q.state).toBe('disabled');
		expect(q.clock).toBe(null);
	});

	it("calls custom handler when running", function(){
		var called = 0;
		var handler = function(item, cb){
			called++;
			cb(true);
		};
		q.push(1);
		q.push(1);
		q.options.handler = handler;
		q.start(true);
		waitsFor(function(){
			return called === 2;
		}, "called twice", 25);
		waitsFor(function(){
			return q.items.length === 0;
		}, "Queue to empty", 1);
	});

	it("stops when stop() is called", function(){
		var i = 1000;
		while(--i) q.push(1);
		q.options.handler = function(item, cb){
			cb(true);
		};
		q.start();
		q.stop();
		expect(q.items.length).toBeGreaterThan(0);
	});

	it("calls stop on pause (when pause specified)", function(){
		q = app.addQueue({ phonegapEvents: 'pause' });
		spyOn(q, 'stop').andCallThrough();
		$(document).trigger('deviceready');
		$(document).trigger('pause');
		expect(q.stop).toHaveBeenCalled();
	});

	it("calls stop on offline (when offline specified)", function(){
		q = app.addQueue({ phonegapEvents: 'offline' });
		spyOn(q, 'stop').andCallThrough();
		$(document).trigger('deviceready');
		$(document).trigger('offline');
		expect(q.stop).toHaveBeenCalled();
	});

	it("calls start on resume (when resume specified)", function(){
		q = app.addQueue({ phonegapEvents: 'resume' });
		spyOn(q, 'start').andCallThrough();
		$(document).trigger('deviceready');
		$(document).trigger('resume');
		expect(q.start).toHaveBeenCalled();
	});

	it("calls start on online (when online specified)", function(){
		q = app.addQueue({ phonegapEvents: 'online' });
		spyOn(q, 'start').andCallThrough();
		$(document).trigger('deviceready');
		$(document).trigger('online');
		expect(q.start).toHaveBeenCalled();
	});

});