goog.provide('example');

goog.require('example.sample1');
goog.require('example.sample2');

/**
 * Executes inline from our index.html
 *
 * @return {void}
 */
example.init = function()
{
  example.sample1.init();
  example.sample2.init();

  $().ready(example.DOMReady);
};

/**
 * Triggers when DOM is Ready
 *
 * @return {void}
 */
example.DOMReady = function()
{
  // notify server2js that we are ready
  ss.server2js.ready();
};

// export our symbols to the global scope
(function(goog){
  goog.exportSymbol('example.init', example.init);
})(goog);