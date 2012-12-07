# MasterMind

* Assumes jQuery Mobile for page rendering and navigation.
* Assumes HandlebarsJS for templating.

_All features are optional_

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