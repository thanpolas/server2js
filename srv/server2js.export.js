// exports for server2.js

goog.provide('ss.server');
goog.require('ss.server2js');
goog.require('ss.Server2js');

/**
 * @type {ss.Server2js}
 */
ss.server = ss.Server2js.getInstance();

goog.exportSymbol('ss.server', ss.server);
goog.exportSymbol('ss.server.run', ss.server.run);
goog.exportSymbol('ss.server.hook', ss.server.hook);
goog.exportSymbol('ss.server.ready', ss.server.ready);
goog.exportSymbol('ss.server.dispose', ss.server.dispose);
goog.exportSymbol('ss.server.Server2jsClass', ss.server2js.get);
