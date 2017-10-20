sap.ui.define([
		"pm/tlsup/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("pm.tlsup.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("list");
			}

		});

	}
);