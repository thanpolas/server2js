goog.provide('example.sample1');

/** @type {number} */
example.sample1.multiplier = NaN;

/**
 * Hook to server2js on init
 *
 * @return {void}
 */
example.sample1.init = function()
{
    ss.server2js.hook('multiplier', example.sample1.setMultiplier);
};

/**
 * Get an element by it's ID
 * @param {string} elementId the element's ID
 * @return {Element}
 */
example.sample1.getElement = function(elementId)
{
  return document.getElementById(elementId);
};

/**
 * Set the element's content
 *
 * @param {Element} element
 * @param {string} html
 * @return {void}
 */
example.sample1.elementHTML = function(element, html)
{
  element.innerHTML = html;
};

/**
 * Append to the element's content
 *
 * @param {Element} element
 * @param {string} html
 * @return {void}
 */
example.sample1.elementAppentHTML = function(element, html)
{
  element.innerHTML = element.innerHTML + html;
};

/**
 * @param {number} num
 * @return {number}
 */
example.sample1.times = function(num)
{
  return num * example.sample1.multiplier;
};

/**
 * @param {string} str
 * @return {string}
 */
example.sample1.locateString = function(str)
{
  return str + 'addThis';
};

/**
 * Simple setter for multiplier
 *
 * @param {number} num
 * @return {void}
 */
example.sample1.setMultiplier = function(num)
{
  example.sample1.multiplier = num;
};