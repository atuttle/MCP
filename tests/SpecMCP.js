function is(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}

describe("MCP Initializer", function(){

	var bare = new MCP();

	it("defaults apiBaseUrl to ''", function(){
		expect(bare.options.apiBaseUrl).toBe('');
	});

	it("defaults loadFromCache to []", function(){
		expect(is('Array', bare.options.loadFromCache)).toBe(true);
		expect(bare.options.loadFromCache.length).toBe(0);
	});

	it("defaults ready to a function", function(){
		expect(typeof(bare.options.ready)).toBe("function");
	});

	it("calls the ready function at some point", function(){
		var called = false;
		readyFunc = function(){
			called = true;
		};
		var mcp = new MCP({ready: readyFunc});
		expect(called).toEqual(true);
	});

});