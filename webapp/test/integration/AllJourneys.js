jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"pm/tlsup/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"pm/tlsup/test/integration/pages/Worklist",
		"pm/tlsup/test/integration/pages/Object",
		"pm/tlsup/test/integration/pages/NotFound",
		"pm/tlsup/test/integration/pages/Browser",
		"pm/tlsup/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "pm.tlsup.view."
	});

	sap.ui.require([
		"pm/tlsup/test/integration/WorklistJourney",
		"pm/tlsup/test/integration/ObjectJourney",
		"pm/tlsup/test/integration/NavigationJourney",
		"pm/tlsup/test/integration/NotFoundJourney",
		"pm/tlsup/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});