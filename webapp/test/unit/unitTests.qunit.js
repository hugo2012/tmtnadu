/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comboschrb1mtm/tmtnadu/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
