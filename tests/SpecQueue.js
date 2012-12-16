describe("MCP.addQueue", function(){

	var app;
	var q;

	beforeEach(function(){
		app = new MCP();
		q = app.addQueue();
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

});

describe("queue", function(){

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
	//------------
	// it("start() sets queue.state to `enabled`", function(){
	// 	q.start(false);
	// 	expect(q.state).toBe('enabled');
	// });

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

	it("calling stop() when queue.state is `disabled` does not change state (and returns immediately)", function(){
		q.state = 'disabled';
		expect(q.clock).toBe(null);
		q.stop();
		expect(q.state).toBe('disabled');
		expect(q.clock).toBe(null);
	});

	it("calls custom handler", function(){
		var called = false;
		var handler = function(){
			called = true;
		};
		q.push(1);
		q.options.handler = handler;
		q.start(true);
		expect(called).toBe(true);
	});

});