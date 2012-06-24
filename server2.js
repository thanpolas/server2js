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
 * @fileoverview server2js May/27/2012
 * Server2JS provides an interface between the server and your javascript
 * application. All your JS codebase can hook to server2js and listen for the
 * server's data objects
 *
 * @see https://github.com/thanpolas/server2js
 */
goog.provide('ss.Server2js');
goog.provide('ss.server2js');

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
   * @type {Array} 
   */
  this._serverDataInput = [];

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

/**
 * Declare our internal hook type
 * @typedef {!Object.<string, function(*), number, ?boolean >}
 */
ss.server2js.hookItem;

/**
 * HACK HACK HACK
 * It proved to be quite a tedious task to have an instance of 
 * a prototypical object double as a function.
 *
 * For our case, we want the instance to perform the .run() method
 * when executed. e.g.
 * <pre>
 * var server = ss.server2js.get();
 * server === server.run; // true
 *
 *
 * @see http://jsfiddle.net/thanpolas/zy9sy/14/
 * @return {ss.Server2js}
 */
ss.server2js.get = function()
{
  /** @type {ss.Server2js} */
  var server2jsInstance = new ss.Server2js();
  /** @type {ss.Server2js} */
  var capsule = goog.bind(server2jsInstance.run, server2jsInstance);
  capsule['run'] = goog.bind(server2jsInstance.run, server2jsInstance);  
  capsule['hook'] = goog.bind(server2jsInstance.hook, server2jsInstance);
  capsule['ready'] = goog.bind(server2jsInstance.ready, server2jsInstance);
  capsule['dispose'] = goog.bind(server2jsInstance.dispose, server2jsInstance);
  return capsule;
};


/**
 * Run this function synchronously on the html page
 *
 * @export
 * @param {Array|string} dataInput
 * @param {boolean=} optMoreToCome Set to true if more calls are expected
 *      and to cancel auto-disposing
 * @return {void}
 */
ss.Server2js.prototype.run = function(dataInput, optMoreToCome)
{
  /** @type {Array} */
  this._serverDataInput = this._parseDataInput(dataInput);

  this._moreToCome = optMoreToCome || false;

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
 * Will check data input if is an array or string
 * type and return proper dataInput type
 *
 * @private
 * @param {Array|string} dataInput
 * @return {Array}
 */
ss.Server2js.prototype._parseDataInput = function(dataInput)
{
  // check if we got a string (JSON)
  if ('string' == typeof dataInput) {
    /**
     * it's a string, we assume JSON encoded
     * parse it without try catch statement so the exception
     * will bubbled up
     * @type {Array}
     */
    var input = JSON.parse(dataInput);
  } else {
    var input = dataInput;
  }

  return Array.prototype.concat(this._serverDataInput, input);

};

/**
 * Use this function to hook for a server's data object
 *
 * @export
 * @param {string} nameId Your module's unique name id
 * @param {function(*)} fn Function to execute with the provided,
 *      from the server, data object
 * @param {number=} opt_prio Priority to execute the hook. Default: 100
 *      (smaller priority, faster the execution)
 * @param {boolean=} opt_onReady Set to true to run after a ready event
 *      NOTE: You have to externally trigger when that 'ready' event
 *              should be fired by executing ss.server2js.ready()
 * @return {void}
 */
ss.Server2js.prototype.hook = function(nameId, fn, opt_prio, opt_onReady)
{
  /** @type {ss.server2js.hookItem} */
  var hook = {
    nameId: nameId,
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
 * Run whenever we have a ready event like DOM ready
 * Will execute all hook that depend on the ready event
 *
 * @export
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
  var l = hooks.length;

  while(l--) {
    /** @type {ss.server2js.hookItem} */
    var hook = hooks[l];

    // store here all the matching indexes
    var foundIn = [];

    // search in the server data for the current hook's nameId
    for (var i = 0, ldata = this._serverDataInput.length; i < ldata; i++) {

      if (hook.nameId == this._serverDataInput[i]['nameId']) {
        // found a match, run
        this._runHook(hook, this._serverDataInput[i]['value']);
        foundIn.push(i);
        // do not break, we support duplicate nameId's in the
        // server's data object
      }
    }
    // remove from server data (dataInput) the executed hooks
    for (var i = 0, lfound = foundIn.length; i < lfound; i++) {
      // for every item spliced, we need to substruct the index
      // because the array is altered --> foundIn[i] - i
      Array.prototype.splice.call(this._serverDataInput, foundIn[i] - i, 1);
    }
  }
};

/**
 * Our hook sorting function
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
 * Execute the hook
 * @private
 * @param {ss.server2js.hookItem} hook
 * @param {*} theValue The value to execute with
 * @return {void}
 */
ss.Server2js.prototype._runHook = function(hook, theValue)
{
  hook.fn(theValue);
};

