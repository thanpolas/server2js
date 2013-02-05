/**
 * Copyright 2012 Thanasis Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview server2js May / 27 / 2012
 * Server2.js provides an interface between the server and the javascript
 * application. All JS codebase can hook to server2js and listen for the
 * server's operations
 *
 * @see https://github.com/thanpolas/server2js
 */
goog.provide('ss.Server2js');
goog.provide('ss.server2js');

/**
 * @define {boolean} we perform some hacks to reduce total size.
 */
ss.STANDALONE = true;

/**
 * Server2js constructor
 *
 * @constructor
 */
ss.Server2js = function()
{
  /**
   * @private
   * @type {boolean}
   */
  this._moreToCome = false;

  /**
   * @private
   * @type {boolean}
   */
  this._disposed = false;

  /**
   * @private
   * @type {boolean}
   */
  this._readyFired = false;

  /**
   * @private
   * @type {boolean}
   */
  this._haveReadyHooks = false;

  /**
   * @private
   * @type {boolean}
   */
  this._haveServerData = false;

  /**
   * Data passed by the server is stored here
   * @private
   * @type {Object}
   */
  this._serverDataInput = {};

  /**
   * All synchronous hooks are here
   * @private
   * @type {Array.<ss.server2js.hookItem>}
   */
  this._synchronousHooks = [];

  /**
   * All onReady hooks are here
   * @private
   * @type {Array.<ss.server2js.hookItem>}
   */
  this._readyHooks = [];

};

if (ss.STANDALONE) {
/**
 * This is a stripped down version of goog.typeOf which only looks if
 * a variable is an array and returns a boolean value.
 *
 * Purpose: Less minified bytes when in standalone mode
 * @param {*} value The value to get the type of.
 * @return {boolean} The name of the type.
 */
ss.server2js.isArray = function(value) {
  var s = typeof value;
  if (s !== 'object' || !value) {
    return false;
  }
  // Check these first, so we can avoid calling Object.prototype.toString if
  // possible.
  //
  // IE improperly marshals tyepof across execution contexts, but a
  // cross-context object will still return false for "instanceof Object".
  if (value instanceof Array) {
    return true;
  } else if (value instanceof Object) {
    return false;
  }

  // HACK: In order to use an Object prototype method on the arbitrary
  //   value, the compiler requires the value be cast to type Object,
  //   even though the ECMA spec explicitly allows it.
  var className = Object.prototype.toString.call(
      /** @type {Object} */ (value));
  // In Firefox 3.6, attempting to access iframe window objects' length
  // property throws an NS_ERROR_FAILURE, so we need to special-case it
  // here.
  if (className === '[object Array]') {
    return true;
  } else {
    return false;
  }
};

  /**
   * Shorter version of goog.bind()
   *
   * @param {Function} fn A function to partially apply.
   * @param {Object|undefined} selfObj Specifies the object which |this| should
   *     point to when the function is run.
   * @return {!Function} A partially-applied form of the function bind() was
   *     invoked as a method of.  goog.bind = function(fn, selfObj).
   */
  ss.server2js.bind = function(fn, selfObj)
  {
    if (arguments.length > 2) {
      var boundArgs = Array.prototype.slice.call(arguments, 2);
      return function() {
        // Prepend the bound arguments to the current arguments.
        var newArgs = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(newArgs, boundArgs);
        return fn.apply(selfObj, newArgs);
      };

    } else {
      return function() {
        return fn.apply(selfObj, arguments);
      };
    }
  };

  /**
   * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
   * entities. This function is XSS-safe and whitespace-preserving.
   * @private
   * @param {string} str The string to unescape.
   * @return {string} The unescaped {@code str} string.
   */
  ss.server2js.unescapeEntities = function(str) {
    var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
    var div = document.createElement('div');
    // Match as many valid entity characters as possible. If the actual entity
    // happens to be shorter, it will still work as innerHTML will return the
    // trailing characters unchanged. Since the entity characters do not include
    // open angle bracket, there is no chance of XSS from the innerHTML use.
    // Since no whitespace is passed to innerHTML, whitespace is preserved.
    return str.replace(/&([^;\s<&]+);?/g, function(s, entity) {
      // Check for cached entity.
      var value = seen[s];
      if (value) {
        return value;
      }
      // Check for numeric entity.
      if (entity.charAt(0) == '#') {
        // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex numbers.
        var n = Number('0' + entity.substr(1));
        if (!isNaN(n)) {
          value = String.fromCharCode(n);
        }
      }
      // Fall back to innerHTML otherwise.
      if (!value) {
        // Append a non-entity character to avoid a bug in Webkit that parses
        // an invalid entity at the end of innerHTML text as the empty string.
        div.innerHTML = s + ' ';
        // Then remove the trailing character from the result.
        value = div.firstChild.nodeValue.slice(0, -1);
      }
      // Cache and return.
      return seen[s] = value;
    });
  };

} else {
  ss.server2js.isArray = goog.isArray;
  ss.server2js.bind = goog.bind;
  ss.server2js.unescapeEntities = goog.string.unescapeEntities;
}

/**
 * Add a custom getInstance static function
 * which uses ss.server2js.get()
 *
 * @see ss.server2js.get
 * @return {ss.Server2js} -ish
 */
ss.Server2js.getInstance = function() {
  return ss.Server2js.instance_ || (ss.Server2js.instance_ = ss.server2js.get());
};


/** @const {number} */
ss.server2js.DEFAULT_PRIO = 100;

/** @const {string} */
ss.server2js.OPERATION_KEY = 'op';

/** @const {string} */
ss.server2js.VALUE_KEY = 'val';

/**
 * Declare our internal hook type
 * @typedef {!Object.<string, function(*), number, ?boolean >}
 */
ss.server2js.hookItem;

/**
 * HACK HACK HACK
 * It proved to be quite a tedious task to have an instance of
 * a prototypical object also be a function.
 *
 * In our case, we want the instance to perform the .run() method
 * when executed. e.g.
 * <pre>
 * var server = ss.server2js.get();
 * server === server.run; // true
 *
 * @see http://jsfiddle.net/thanpolas/zy9sy/14/
 * @return {function((Array|null|string), boolean=)}
 */
ss.server2js.get = function()
{
  /** @type {ss.Server2js} */
  var server2jsInstance = new ss.Server2js();
  /** @type {function((Array|null|string), boolean=)} */
  var capsule = ss.server2js.bind(server2jsInstance.run, server2jsInstance);
  capsule['run'] = ss.server2js.bind(server2jsInstance.run, server2jsInstance);
  capsule['hook'] = ss.server2js.bind(server2jsInstance.hook, server2jsInstance);
  capsule['ready'] = ss.server2js.bind(server2jsInstance.ready, server2jsInstance);
  capsule['dispose'] = ss.server2js.bind(server2jsInstance.dispose, server2jsInstance);
  return capsule;
};


/**
 * Run this function synchronously on the html page
 *
 * @param {string} dataInput
 * @param {boolean=} optDispose Set to true if you want to automatically
 *   dispose the data objects after the parsing operation finishes.
 * @return {void}
 */
ss.Server2js.prototype.run = function(dataInput, optDispose)
{

  this._parseDataInput(dataInput);

  this._moreToCome = !!!optDispose;

  this._haveServerData = true;

  this._runHooks(true);

  // check if ready event fired
  if (this._readyFired) {
    this._runHooks(false);
  }

  // if we don't have any ready hooks, dispose
  if (!this._haveReadyHooks) {
    this._dispose();
  }
};

/**
 * Will parse the incoming string. Unescape htmlentities
 * and json parse.
 *
 * @private
 * @param {string} dataInput
 * @return {void}
 */
ss.Server2js.prototype._parseDataInput = function(dataInput)
{
  /** @type {*} */
  var input = JSON.parse(dataInput);

  if (!ss.server2js.isArray(input)) {
    // not valid
    return;
  }

  // loop through the operations and assign by key to our data object
  for (var i = 0, l = input.length; i < l; i++) {
    // get operation name
    var op = input[i][ss.server2js.OPERATION_KEY];

    // check if already set
    if (this._serverDataInput[op]) {

      // it's already set, check if array or object
      if (ss.server2js.isArray(this._serverDataInput[op])) {

        this._serverDataInput[op].push(this._parseInputItem(input[i]));

      } else {

        // it is an object, put in an array with the new operation
        this._serverDataInput[op] = [
          this._serverDataInput[op],
          this._parseInputItem(input[i])
        ];

      }
    } else {

      // not set, assign
      this._serverDataInput[op] = this._parseInputItem(input[i]);

    }
  }

};

/**
 * Parse a single operation's item.
 * @param  {Array} item The key/value pair of the operation.
 * @return {Array} The same array but with the value decoded.
 */
ss.Server2js.prototype._parseInputItem = function(item) {

  var rawValue = item[ss.server2js.VALUE_KEY];

  var unescapedJSON = ss.server2js.unescapeEntities(rawValue);

  var value = JSON.parse(unescapedJSON);

  item[ss.server2js.VALUE_KEY] = value;

  return item;
};

/**
 * Use this function to hook to a server operation
 *
 * @export
 * @param {string} op The operation name
 * @param {function(*)} fn Function to execute with the provided,
 *      from the server, data object
 * @param {number=} opt_prio Priority to execute the hook. Default: 100
 *      (smaller priority, faster the execution)
 * @param {boolean=} opt_onReady Set to true to run after a ready event
 *      NOTE: You have to externally trigger when that 'ready' event
 *              should be fired by executing the ready() method
 * @return {void}
 */
ss.Server2js.prototype.hook = function(op, fn, opt_prio, opt_onReady)
{
  if (this._disposed){
    throw new Error('server2js has been disposed');
  }
  /** @type {ss.server2js.hookItem} */
  var hook = {
    op: op,
    fn: fn,
    prio: opt_prio || ss.server2js.DEFAULT_PRIO,
    ready: opt_onReady
  };

  // check if we want to trigger after we get the Ready event
  if (opt_onReady) {
    this._haveReadyHooks = true;
    this._readyHooks.push(hook);
    // check if ready event has fired
    if (this._readyFired) {
      this._runHooks(false);
    }
  } else {
    //  synchronous execution, queue up
    this._synchronousHooks.push(hook);
    //check if we have server data
    if (this._haveServerData) {
      // run hooks
      this._runHooks(true);
    }
  }
};

/**
 * Execute to trigger the ready event.
 * Will execute all hooks that depend on the ready event
 *
 * @return {void}
 */
ss.Server2js.prototype.ready = function()
{
  // no need to do anything if ready event was triggered
  if (this._readyFired) {
    return;
  }
  this._readyFired = true;

  // if we don't have any ready hooks, dispose all and return
  if (!this._haveReadyHooks) {
    this._dispose();
    return;
  }
  this._runHooks(false);
};

/**
 * Publicly exposed dispose method.
 * This method will force a dispose in case we are
 * in a 'moreToCome' state
 *
 * @return {boolean} true if we disposed
 */
ss.Server2js.prototype.dispose = function()
{
  return this._dispose(true);
};

/**
 * The actual dispose method.
 * All internal methods should call this method with
 * no parameters. Only publicly exposed dispose() method
 * can call with a param of true so 'moreToCome' state
 * can be overriden and perform the disposal
 *
 * @private
 * @param {boolean=} opt_override override the moreToCome state
 * @return {boolean}
 */
ss.Server2js.prototype._dispose = function (opt_override)
{
  // check if in moreToCome state and no override
  if (!opt_override && this._moreToCome) {
    return false;
  }
  // check if already disposed
  if (this._disposed) {
    return false;
  }

  delete this._readyHooks;
  delete this._synchronousHooks;
  delete this._serverDataInput;

  this._disposed = true;

  return true;
};

/**
 * Sorts hooks based on their prio and after matching hook with
 * server data object, starts executing
 *
 * Each hook that gets executed gets deleted
 * Each server operation that triggers gets deleted
 *
 * @private
 * @param {boolean} isSynch
 * @return {void}
 */
ss.Server2js.prototype._runHooks = function(isSynch)
{
  /** @type {Array.<ss.server2js.hookItem>} */
  var hooks = (isSynch ? this._synchronousHooks : this._readyHooks);

  // sort all hooks in reverse order based on their prio
  Array.prototype.sort.call(hooks, this._sortFunc);
  /** @type {number} */
  var i = hooks.length;
  /** @type {Array} store indexes of executed hooks for delition */
  var foundIn = [];
  // iterate over all hooks
  while(i--) {
    /** @type {ss.server2js.hookItem} */
    var hook = hooks[i];
    /** @type {string} get operation name */
    var op = hook.op;
    // if operation found in server data, execute and mark hook for deletion
    if (this._serverDataInput[op]) {
      this._runHook(hook, op);
      foundIn.push(i);
    }
  }
  // remove from server data (dataInput) the executed hooks
  i = 0;
  var lfound = foundIn.length;
  for (; i < lfound; i++) {
    Array.prototype.splice.call(hooks, foundIn[i], 1);
  }
};

/**
 * Our hook sorting method
 * We reverse sort them so we can run from end to start
 * @private
 * @param {ss.server2js.hookItem} a
 * @param {ss.server2js.hookItem} b
 * @return {boolean}
 */
ss.Server2js.prototype._sortFunc = function(a, b)
{
  return a.prio < b.prio;
};


/**
 * Execute the hook, check if multiple values passed from server
 *
 * After execution, remove the server values
 *
 * @private
 * @param {ss.server2js.hookItem} hook
 * @param {string} operation The operation to execute
 * @return {void}
 */
ss.Server2js.prototype._runHook = function(hook, operation)
{
  var dataObj = this._serverDataInput[operation];
  if (ss.server2js.isArray(dataObj)) {
    // multiple values
    for (var i = 0, l = dataObj.length; i < l; i++) {
      hook.fn(dataObj[i][ss.server2js.VALUE_KEY]);
    }
  } else {
    hook.fn(dataObj[ss.server2js.VALUE_KEY]);
  }

  // remove the server key
  delete this._serverDataInput[operation];
};

