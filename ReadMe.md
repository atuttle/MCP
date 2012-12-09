# MCP (Master Control Program)

This little gem is the baseline with which we start all of our PhoneGap apps. Lots more information to come...

* Assumes jQuery Mobile for page rendering and navigation. (Not included)
* Includes [HandlebarsJS](http://handlebarsjs.com/) for templating.
* Includes [Lawnchair](http://brian.io/lawnchair/) for data caching.

_All features are optional_

## Create an instance

	var myApp = new MCP({
		apiBaseURL: 'http://domain.com/path/to/api/base'
		, loadFromCache: ['key1', 'key2', 'key3']
	});

Items listed in `loadFromCache` will be pulled from localStorage if they exist there; allowing your data 
to persist across application runs. Any cached api results (as described below) are automatically included
in this list.

## Queue and queue processors

Useful for making sure that data you're capturing is NEVER lost. Queue items are persisted in localStorage until 
you remove them from the queue.

	myApp.clickTrackingQueue = new MCP.queue({
		//timer frequency in milliseconds
		frequency: 5000 // <~ 5 seconds

		//automatically enable+disable on appropriate phonegap events to conserve battery and
		//try to make use of network if/when it comes online
		, phonegapEvents: true

		//you write a function to handle a queue item
		, handler: function(queueItem){
			//do what you need to do with the item
			//...

			//remove it from the queue on success
			myApp.clickTrackingQueue.shift();
		}
	});
	
	//manually start the interval
	myApp.clickTrackingQueue.start();
	
	//manually stop the interval
	myApp.clickTrackingQueue.stop();
	
	//add data to the queue (your handler is passed one queue item at a time)
	myApp.clickTrackingQueue.push({data: 'foo'});

Unless there is an error in your queue handler function, the handler will be called again immediately for 
the next item in the queue until the queue is emptied.

## OnLoad State Checker

Useful for requiring login/etc.

	myApp.onStart({
		truthTest: function(){}
		pass: function(){}
		fail: function(){}
	});

## Simply associate a page with an API request

When M page is loaded, grab N api results, render O handlebars template, inject it into P in the DOM, 
and call Q callback for any further custom processing

	myApp.onPage({
		
		//jquery selector for the page you're hooking up to
		page: '#somePage'
		
		//this is appended to the api base url defined at instance creation
		, get: '/someResource.json'
		
		//data included in the request
		, getdata: {
			key: 'value'
		}

		//client-side cache duration (in seconds) for the response
		, cacheDuration: 60 * 3 // <~ 3 minutes
		
		//jquery ajax error callback
		, apiError: function(jqXHR, textStatus, errorThrown){}

		//handlebars template selector
		, renders: '#someTemplate'

		//container in the page in which the rendered handlebars template content is injected
		, container: '#someContent'

		//callback in which you can run more custom code after everything is loaded and displayed
		, onComplete: function(options, data){}

		//callback in which you can run cleanup after the page is removed
		, onTeardown: function(page){}
	});

### Local Caching of api results

Optionally store api results locally. Or don't, and just hit the API every time the page is 
loaded. Enter a `cacheDuration` of 0 to bypass caching completely.

### Page Unload Handlers

When the page is unloaded, run a callback for any tear-down (DOM cleanup) you might want to 
do. This is useful if the DOM could get large and cluttered on a given page (eg. showing a 
twitter stream, and user loads a lot of history). Cleaning up the DOM will keep your application
performant.

# Future

We'd love to reduce the dependency on jQuery Mobile (it paints with too wide a brush at the cost 
of performance), but the fact is that they've really nailed a few key components:

* Displaying one "page" at a time
* Navigating between "pages"
* A few other minor things we're using

They recently released the download builder, so if/when we figure out how, we'll probably 
switch to including the bare minimum to make the app functional. We like to use our own
styling to keep things as lightweight and simple as possible.