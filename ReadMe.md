# MCP (Master Control Program)

This little gem is the baseline with which we start all of our PhoneGap apps. Lots more information to come...

* Assumes jQuery Mobile for page rendering and navigation.
* Assumes HandlebarsJS for templating.
* Includes Lawnchair for data caching.

_All features are optional_

## Local Caching of api results

Optionally store api results locally. Or don't, and just hit the API every time the page is loaded.

## Queue and queue processors

Useful for making sure that data you're capturing is NEVER lost.

## OnLoad State Checker

Useful for requiring login/etc. 

OnLoad run M truth-test (callback) and if it fails display N page; otherwise stay on the default page

## Simple tying of pages to api results

When M page is loaded, grab N api results, render O handlebars template, inject it into P in the DOM, 
and call Q callback for any further custom processing

## Page Unload Handlers

When M page is unloaded, run N callback for any tear-down (DOM cleanup) you might want to do