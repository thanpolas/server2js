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
 * Server 2 JS provides an interface between the server and your javascript
 * application. All your JS codebase can hook to server2js and listen for the
 * server's data objects
 *
 * @see https://github.com/thanpolas/server2js
 */
goog.provide('ss.server2js');

/**
 * Declare our input data object definition
 * @typedef {!Array.<Object.<string, *>>}
 */
ss.server2js.dataInput;

/** @const {number} */
ss.server2js.DEFAULT_PRIO = 100;

/**
 * Declare our internal hook type
 * @typedef {!Object.<string, function(*), number, ?boolean >}
 */
ss.server2js.hookItem;

/** @type {ss.server2js.dataInput} */
ss.server2js._serverDataInput = [];

/** @type {boolean} */
ss.server2js._haveReadyHooks = false;

/** @type {boolean} */
ss.server2js._haveServerData = false;

/** @type {Array} */
ss.server2js._inlineHooks = [];

/** @type {Array} */
ss.server2js._readyHooks = [];


/**
 * Run this function synchronously on your html page
 *
 * @export
 * @param {ss.server2js.dataInput} dataInput
 * @return {void}
 */
ss.server2js.server = function(dataInput)
{
  ss.server2js._haveServerData = true;
  ss.server2js._runHooks(dataInput, true);
  // if we don't have any ready hooks, dispose all and return
  if (!ss.server2js._haveReadyHooks) {
    ss.server2js._dispose();
    return;
  }
  // assign the remaining server data for the ready event trigger
  ss.server2js._serverDataInput = dataInput;
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
ss.server2js.hook = function(nameId, fn, opt_prio, opt_onReady)
{
  var prio = opt_prio || ss.server2js.DEFAULT_PRIO;
  /** @type {ss.server2js.hookItem} */
  var hook = {
    nameId: nameId,
    fn: fn,
    prio: prio,
    ready: opt_onReady
  };
  // check if we want to trigger after we get the Ready event
  if (opt_onReady) {
    ss.server2js._haveReadyHooks = true;
    ss.server2js._readyHooks.push(hook);
  } else {
    // inline execution, check if we got server data
    if (ss.server2js._haveServerData) {
      // directly execute
      ss.server2js._runHook(hook, true);
    } else {
      // queue up
      ss.server2js._inlineHooks.push(hook);
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
ss.server2js.ready = function()
{
  // if we don't have any ready hooks, dispose all and return
  if (!ss.server2js._haveReadyHooks || !ss.server2js._haveServerData) {
    ss.server2js._dispose();
    return;
  }
  ss.server2js._runHooks(ss.server2js._serverDataInput, false);
};

/**
 * Dispose all disposable objects. Clean up!
 *
 * @private
 * @return {void} true
 */
ss.server2js._dispose = function()
{
  delete ss.server2js._inlineHooks;
  delete ss.server2js._readyHooks;
  delete ss.server2js._serverDataInput;
  delete ss.server2js.hook;
  delete ss.server2js._runHooks;
};

/**
 * Executes inline when we get data from the server
 * Sorts our hooks based on their prio and starts
 * executing
 * @private
 * @param {ss.server2js.dataInput} dataInput
 * @param {boolean} isInline
 * @return {void}
 */
ss.server2js._runHooks = function(dataInput, isInline)
{
  var hooks = (isInline ? ss.server2js._inlineHooks : ss.server2js._readyHooks);
  // sort all hooks in reverse order based on their prio
  Array.prototype.sort.call(hooks, ss.server2js._sortFunc);
  var l = hooks.length;
  while(l--) {
    var hook = hooks[l];
    // store here all the matching indexes
    var foundIn = [];
    // search in the server data for the current hook's nameId
    for (var i = 0, ldata = dataInput.length; i < ldata; i++) {
      if (hook.nameId == dataInput[i]['nameId']) {
        // found a match, run
        ss.server2js._runHook(hook, dataInput[i]['value']);
        foundIn.push(i);
        // do not break, we support duplicate nameId's in the
        // server's data object
      }
    }
    // remove from server data (dataInput) the executed hooks
    for (var i = 0, lfound = foundIn.length; i < lfound; i++) {
      Array.prototype.splice.call(dataInput, foundIn[i], 1);
    }
  }
};

/**
 * Our hook sorting function
 * We reverse sort them so we can run from end to start
 * @param {ss.server2js.hookItem} a
 * @param {ss.server2js.hookItem} b
 * @return {boolean}
 */
ss.server2js._sortFunc = function(a, b)
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
ss.server2js._runHook = function(hook, theValue)
{
  hook.fn(theValue);
};

