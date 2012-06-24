goog.provide('example.sample2');

goog.require('example.sample1');


example.sample2.init = function()
{
  ss.server2js.hook('paintWorld', example.sample2.doStuff);
  ss.server2js.hook('paintHello', example.sample2.doStuff, 50);
  ss.server2js.hook('paintReadyExclamation', example.sample2.doStuff, 100, true);
  ss.server2js.hook('writeOutput', example.sample2.doMoreStuff, 100, true);
};

/**
 * Change the html of an element
 *
 * @param {Object.<string, string>} data
 * @return {void}
 */
example.sample2.doStuff = function(data)
{
  var el = example.sample1.getElement(data['elementId']);
  example.sample1.elementAppentHTML(el, data['elementValue']);
};

/**
 * Do more stuff
 *
 * @param {boolean} data
 * @return {void}
 */
example.sample2.doMoreStuff = function(data)
{
  if (!data) {
    return;
  }
  var el = example.sample1.getElement('output');
  var output = example.sample1.locateString('gore ');
  output += example.sample1.times(4);
  output += example.sample1.locateString(' and more ');
  example.sample1.elementHTML(el, output);
};

