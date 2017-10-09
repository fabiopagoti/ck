/*global location*/
sap.ui.define([
	"pm/tlsup/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"pm/tlsup/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(
	BaseController,
	JSONModel,
	formatter,
	MessageToast,
	MessageBox,
	Filter,
	FilterOperator
) {
	"use strict";

	return BaseController.extend("pm.tlsup.controller.S3", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel = new JSONModel({
				busy: false
			});

			this.setModel(oViewModel, "view");
			this.getRouter().getRoute("order").attachPatternMatched(this.onPatternMatched, this);

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onNavBack: function(oEvent) {
			this.getRouter().navTo("list", false);
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		onPatternMatched: function(oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			this.getModel().metadataLoaded().then(function() {
				var sObjectPath = this.getModel().createKey("Orders", {
					Orderid: oArguments.id
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		onValueHelpRequestMaintainer: function(oEvent) {
			var oInput = oEvent.getSource();
			var sInputValue = oInput.getValue();

			if (!this.oDialogMaintainer) {
				this.oDialogMaintainer = sap.ui.xmlfragment(
					"pm.tlsup.fragment.F1",
					this
				);
				this.getView().addDependent(this.oDialogMaintainer);
			}

			// create a filter for the binding
			this.oDialogMaintainer.getBinding("items").filter([new Filter(
				"Name",
				FilterOperator.Contains, sInputValue
			)]);

			// open value help dialog filtered by the input value
			this.oDialogMaintainer.open(sInputValue);
		},

		onSearchMaintainer: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter(
				"Name",
				FilterOperator.Contains, sValue
			);
			oEvent.getSource().getBinding("items").filter([oFilter]);
		},

		onConfirmMaintainer: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oBindingContext = this.getView().getBindingContext();
				var oModel = this.getModel();
				oModel.setProperty("Maintainer", oSelectedItem.getBindingContext().getObject().Id, oBindingContext);
				oModel.setProperty("MaintainerName", oSelectedItem.getBindingContext().getObject().Name, oBindingContext);
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		onCancelMaintainer: function(evt) {

		},

		onSave: function(oEvent) {
			MessageBox.show(this.getText("s3_save_confirmation"), {
				icon: MessageBox.Icon.QUESTION,
				title: this.getText("s3_title"),
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function(sAction) {
					switch (sAction) {
						case "YES":
							this._assign();
							break;
						default:
					}
				}.bind(this)
			});

		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function(sObjectPath) {
			var oViewModel = this.getModel("view"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						oDataModel.metadataLoaded().then(function() {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function() {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function() {
			var oView = this.getView(),
				oViewModel = this.getModel("view"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().navTo("objectNotFound");
				return;
			}

			// Everything went fine.
			oViewModel.setProperty("/busy", false);
		},

		_assign: function() {
			var oModel = this.getModel();
			var oBindingContext = this.getView().getBindingContext();
			var oData = oBindingContext.getObject();
			var sId = oData.Orderid;
			var sPath = oModel.createKey("/Orders", {
				Orderid: sId
			});

			function onSuccess(oData, oRespose) {
				this.getRouter().navTo("list");
				MessageToast.show(this.getText("s3_save_success", sId), {
					closeOnBrowserNavigation: false
				});
			}

			function onError(err) {
				MessageBox.error(this.getText("s3_save_error"));
			}

			var oOptions = {
				success: onSuccess.bind(this),
				error: onError.bind(this),
				refreshAfterChange: true
			};

			oModel.update(
				sPath,
				oData,
				oOptions
			);
		}

	});

});