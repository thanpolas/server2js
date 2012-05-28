server2.js
===========

Server to JS is a hook based interface between your server and your JS application.

At only 593 bytes (372 bytes gzipped) server2.js enables your server to interface with your JS code base at page load. Your JS modules hook to the library and listen for a server call. 

Quick start
-----------

Clone the repo, `git clone git@github.com:thanpolas/server2js.git`, or [download the latest release](https://github.com/thanpolas/server2js/raw/master/build/server2.js).

Server API
----------
To interface with your JS codebase you need to create an array of objects. The objects need to contain two keys `nameId` and `value`.

Bundle everything into a JSON string and you are ready to go:
```javascript
var allData = [
  {nameId: 'module1', value: {modId:1, conf:'stay'}/* any type will do */}, 
  {nameId: 'module2', value: true},
  {nameId: 'module1', value: {modId:2, conf:'go'}/* duplicate calls are allowed */}
  ];
// Pass your array to server2js
ss.server2js.server(allData);
```
Simple as that.

Javascript API
--------------
Your modules can hook to server2js in the following manner:
```javascript
ss.server2js.hook('module1', function(data){
  if(1 == data.modId) {
    /* Do stuff */
  } else {
    /* Do other stuff */
  }
});
```
`ss.server2js.hook` has two more optional arguments:
  * `{number=} priority` Default priority for all hooks is 100, the smaller the priority the sooner the hook will execute
  * `{boolean=} onReady` All hooks execute inline. Meaning, the moment `ss.server2js.server()` is executed, all hooks trigger. With `onReady` you have the option to execute the hook on a *ready* event, whatever that means to you (DOM Ready or your logic).

More examples with the hook function:

```javascript
// run myModule.init() before any other hook
ss.server2js.hook('module2', myModule.init, 50);

// run myBaseModule.init() absolutely before any other hook
ss.server2js.hook('myBaseModule', myBaseModule.init, 1);

// run myLastModule.init() last
ss.server2js.hook('myLastModule', myLastModule.init, 900);

// run myReadyModule.init() at DOM ready
ss.server2js.hook('myReadyModule', myReadyModule.init, 100, true);
```

Because the server2js is agnostic of the meaning of a 'Ready Event' you have to trigger it yourself:

```javascript
// assume we use jQuery
$().ready(function(){
  // trigger all onReady hooks
  ss.server2js.ready();
});
```

Caveats
--------
The order of loading the scripts matters. 
  1. First load `server2.js`
  2. Then all your scripts
  3. Last echo your server's Array and execute the `ss.server2js.server()`

More Examples
-------------
If you clone the repo you can see a full example case in the `html/js/example` folder, or if you are lazy like me just [view them from github](https://github.com/thanpolas/server2js/tree/master/html/js/example)