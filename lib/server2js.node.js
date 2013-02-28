
var gString = require('./goog.string');

var storeSpace = '__server2js';


var server2js = module.exports = {};

/**
 * Initializes the namespace inside the req data object.
 * @param  {Object} req The data object.
 */
function initSpace(req) {
  if ( req[storeSpace] ) {
    return;
  }
  req[storeSpace] = {
    queue: [],
    hash: {},
    encString: ''
  };
}

/**
 * Clear the internal buffer.
 * @param {Object} req the req object to store data.
 */
server2js.clear = function(req) {
  initSpace(req);
  req[storeSpace].queue = [];
  req[storeSpace].hash = {};
  req[storeSpace].encString = '';
};

/**
 * Add an operation and data to be passed to JS at page load.
 *
 * @param {Object} req The request object. Can be any object, will use
 *   to store the data in.
 * @param {string} operation The operation.
 * @param {*} data any type of data.
 */
server2js.add = function(req, operation, data) {
  initSpace(req);
  var jsonData = JSON.stringify(data);
  var encData = gString.htmlEscape(jsonData);

  req[storeSpace].queue.push({op: operation, val: encData});
  req[storeSpace].hash[operation] = data;
  // reset encString
  req[storeSpace].encString = '';
};

/**
 * [quoteEscape description]
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
server2js.quoteEscape = function( str ) {
  return str;
  //return str.replace(/\"/g, '\\\"');
};

/**
 * get an operation's data, raw (as defined)
 *
 * @param {Object} req The request object. Can be any object, will use
 *   to store the data in.
 * @param {string} operation The operation.
 * @return {*} any value stored.
 */
server2js.get = function(req, operation) {
  initSpace(req);

  return req[storeSpace].hash[operation];
};

/**
 * Encodes the string or returns the already encoded one
 * @param  {Object} req [description]
 * @return {string} [description]
 */
server2js.getEncString = function(req) {
  initSpace(req);

  if ('' !== req[storeSpace].encString) {
    return req[storeSpace].encString;
  }
  if (0 === req[storeSpace].queue.length) {
    return '';
  }

  var out = JSON.stringify(req[storeSpace].queue);

  out = server2js.quoteEscape( out );

  req[storeSpace].encString = out;

  return out;
};


/**
 * Get the data to be passed to the JS app in a properly
 * formated string so it can be directly appended in the document.
 *
 * We encode htmlentities
 *
 * @param  {boolean=} optAutoDispose Optinally define if we want
 *   auto dispose flag enabled.
 * @return {string} sanitized string to be appended to the document.
 */
server2js.getSnippet = function(req, optAutoDispose) {

  var _encString = server2js.getEncString(req);

  var out = 'ss.server(' + _encString;
  if (optAutoDispose) {
    out += ', true';
  }
  out += ');';
  return out;
};


/**
 * Return the snippet wrapped in script tags
 * @param  {Object} req            [description]
 * @param  {boolean=} optAutoDispose Optinally define if we want
 *   auto dispose flag enabled.
 * @return {string} sanitized string including script tags
 *   to be appended to the document.
 */
server2js.getScript = function(req, optAutoDispose) {
  var _snippet = server2js.getSnippet(req, optAutoDispose);
  var out = '<script type="text/javascript">\n' +
    '// <![CDATA[\n' +
    _snippet +
    '\n// ]]>\n' +
   '</script>';
  return out;
};

