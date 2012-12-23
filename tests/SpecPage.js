describe("MCP Pages", function(){

	var app, q;

	beforeEach(function(){
		app = new MCP();
		q = app.addQueue();
	});

	it("does not throw if required options are present", function(){
		var noThrow = function(){
			app.onPage({
				page: '#foo'
				, get: '/foo'
				, renders: '#foo-template'
				, container: '#foo-container'
			});
		};
		expect(noThrow).not.toThrow();
	});

	it("throws if required arguments are missing", function(){
		var throw1 = function(){
			app.onPage();
		};
		expect(throw1).toThrow();

		var throw2 = function(){
			app.onPage({
				get: '/foo'
				, renders: '#foo-template'
				, container: '#foo-container'
			});
		};
		expect(throw2).toThrow();

		var throw3 = function(){
			app.onPage({
				page: '#foo'
				, renders: '#foo-template'
				, container: '#foo-container'
			});
		};
		expect(throw3).toThrow();

		var throw4 = function(){
			app.onPage({
				page: '#foo'
				, get: '/foo'
				, container: '#foo-container'
			});
		};
		expect(throw4).toThrow();

		var throw5 = function(){
			app.onPage({
				page: '#foo'
				, get: '/foo'
				, renders: '#foo-template'
			});
		};
		expect(throw5).toThrow();
	});

});