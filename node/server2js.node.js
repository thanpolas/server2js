
var gString = require('./goog.string');

var storeSpace = '__server2js';

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
    encString: ''
  };
}

/**
 * Clear the internal buffer.
 * @param {Object} req the req object to store data.
 */
exports.clear = function(req) {
  initSpace(req);
  req[storeSpace].queue = [];
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
exports.add = function(req, operation, data) {
  initSpace(req);
  var jsonData = JSON.stringify(data);
  var encData = gString.htmlEscape(jsonData);
  req[storeSpace].queue.push({op: operation, val: encData});
  // reset encString
  req[storeSpace].encString = '';
};

/**
 * get an operation's data, raw (as defined)
 *
 * @param {Object} req The request object. Can be any object, will use
 *   to store the data in.
 * @param {string} operation The operation.
 * @return {*} any value stored.
 */
exports.get = function(req, operation) {
  initSpace(req);

  return req[operation];
};

/**
 * Encodes the string or returns the already encoded one
 * @param  {Object} req [description]
 * @return {string} [description]
 */
exports.getEncString = function(req) {
  initSpace(req);
  if ('' !== req[storeSpace].encString) {
    return req[storeSpace].encString;
  }
  if (0 === req[storeSpace].queue.length) {
    return '';
  }
  req[storeSpace].encString = JSON.stringify(req[storeSpace].queue);
  return req[storeSpace].encString;
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
exports.getSnippet = function(req, optAutoDispose) {

  var _encString = exports.getEncString(req);

  var out = '// <![CDATA[\n';
  out += 'ss.server(\'' + _encString + '\'';
  if (optAutoDispose) {
    out += ', true';
  }
  out += ');\n';
  out += '// ]]>\n';

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
exports.getScript = function(req, optAutoDispose) {
  var _snippet = exports.getSnippet(optAutoDispose);
  var out = '<script type="text/javascript">' + _snippet + '</script>';
  return out;
};

