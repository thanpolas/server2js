// exports for server2.js

goog.provide('ssd.server');
goog.require('ssd.server2js');
goog.require('ssd.Server2js');

/**
 * @type {ssd.Server2js}
 */
ssd.server = ssd.Server2js.getInstance();
ssd.server['run'] = ssd.server.run;
ssd.server['hook'] = ssd.server.hook;
ssd.server['ready'] = ssd.server.ready;
ssd.server['dispose'] = ssd.server.dispose;
ssd.server['Server2jsClass'] = ssd.server2js.get;

goog.exportSymbol('ss.server', ssd.server);
