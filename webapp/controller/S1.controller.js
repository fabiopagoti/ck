sap.ui.define([
	"pm/tlsup/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"pm/tlsup/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("pm.tlsup.controller.S1", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel,
				oTable = this.byId("table");

			this._oTable = oTable;

			oViewModel = new JSONModel({
				busy: false
			});
			this.setModel(oViewModel, "view");
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onItemPress: function(oEvent) {
			var oPressItem = oEvent.getParameters().listItem;
			var oBindingContext = oPressItem.getBindingContext();
			var oItemObject = oBindingContext.getObject();
			
			if (oItemObject.StatusCode !== this.STATUS_CLOSED) {
				this._navigate(oItemObject);
			}
		},

		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				this._oTable.getBinding("items").refresh();
			} else {
				var aFilters = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aFilters.push(new Filter("OrderNum", FilterOperator.EQ, sQuery));
				}
				this._oTable.getBinding("items").filter(aFilters, "Application");
			}

		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Navigates to detail screen depending on the Order Type
		 * @param {Order} oItem selected Item
		 * @private
		 */
		_navigate: function(oItem) {
			var sRoute;
			switch (oItem.OrderType) {
				case this.WORK_ORDER_TYPE_EMERGENCY:
				case this.WORK_ORDER_TYPE_CONVEYOR:
				case this.WORK_ORDER_TYPE_MAINTENANCE:
					sRoute = "order";
					break;
				case this.NOTIFICATION_TYPE_MAINTENANCE:
					sRoute = "notification";
					break;
				default:
			}
			this.getRouter().navTo(sRoute, {
				id: oItem.OrderNum
			});
		}

	});
});