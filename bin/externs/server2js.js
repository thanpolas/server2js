/**
 * @fileoverview Externs for server2js v1.0
 *
 * @externs
 */

var ss = {};

/**
 * Declare our input data object definition
 * @typedef {!Array.<Object.<string, *>>}
 */
ss.server2js.dataInput;
 
/**
 * @param {ss.server2js.dataInput} dataInput
 * @return {void}
 */  
ss.server2js.server;

/**
 * Use this function to hook for a server's data object
 *
 * @param {string} nameId Your module's unique name id
 * @param {function} fn Function to execute with the provided,
 *      from the server, data object
 * @param {number=} opt_prio Priority to execute the hook. Default: 100
 *      (smaller priority, faster the execution)
 * @param {boolean=} opt_onReady Set to true to run after a ready event
 *      NOTE: You have to externally trigger when that 'ready' event
 *              should be fired by executing ss.server2js.ready()
 * @return {void}
 */
ss.server2js.hook;

/**
 * Run whenever we have a ready event like DOM ready
 * Will execute all hook that depend on the ready event
 *
 * @return {void}
 */
ss.server2js.ready;
