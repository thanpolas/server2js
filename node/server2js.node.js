
var gString = require('./goog.string');

var queue = [];
// store the final encoded string without ceremony.
var encString = '';

/**
 * Clear the internal buffer.
 */
exports.clear = function() {
  queue = [];
  encString = '';
};

/**
 * Encodes the string or returns the already encoded one
 * @return {string} [description]
 */
function getEncString () {
  if ('' !== encString) {
    return encString;
  }
  if (0 === queue.length) {
    return '';
  }
  encString = JSON.stringify(queue);
  return encString;
}

/**
 * Add an operation and data to be passed to JS at page load.
 *
 * @param {string} operation The operation.
 * @param {*} data any type of data.
 */
exports.add = function(operation, data) {
  var jsonData = JSON.stringify(data);
  var encData = gString.htmlEscape(jsonData);
  queue.push({op: operation, val: encData});
  // reset encString
  encString = '';
};

/**
 * Return the snippet wrapped in script tags
 * @param  {boolean=} optAutoDispose Optinally define if we want
 *   auto dispose flag enabled.
 * @return {string} sanitized string including script tags
 *   to be appended to the document.
 */
exports.getScript = function(optAutoDispose) {
  var _snippet = exports.getSnippet(optAutoDispose);
  var out = '<script type="text/javascript">' + _snippet + '</script>';
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
exports.getSnippet = function(optAutoDispose) {

  var _encString = exports.getString();

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
 * @return {string} The encoded string bare.
 */
exports.getString = function() {
  return getEncString();
};

