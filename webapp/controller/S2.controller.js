sap.ui.define([
	"pm/tlsup/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"pm/tlsup/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(
	BaseController,
	JSONModel,
	formatter,
	MessageToast,
	MessageBox
) {
	"use strict";

	return BaseController.extend("pm.tlsup.controller.S2", {

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
			this.getRouter().getRoute("notification").attachPatternMatched(this.onPatternMatched, this);

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
				var sObjectPath = this.getModel().createKey("/Orders", {
					OrderNum: oArguments.id
				});
				this._bindView(sObjectPath);
			}.bind(this));
		},

		onReject: function(oEvent) {
			MessageBox.show(this.getText("s2_reject_confirmation"), {
				icon: MessageBox.Icon.WARNING,
				title: this.getText("s2_title"),
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function(sAction) {
					switch (sAction) {
						case "YES":
							this._reject();
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

		_reject: function() {
			var oModel = this.getModel();
			var oBindingContext = this.getView().getBindingContext();
			var sId = oBindingContext.getObject().OrderNum;
			var sPath = oModel.createKey("/Notifications", {
				Id: sId
			});

			function onSuccess(oData, oRespose) {
				this.getRouter().navTo("list");
				MessageToast.show(this.getText("s2_reject_success", sId), {
					closeOnBrowserNavigation: false
				});
			}

			function onError(err) {
				MessageBox.error(this.getText("s2_reject_error"));
			}

			var oOptions = {
				success: onSuccess.bind(this),
				error: onError.bind(this),
				refreshAfterChange: true
			};

			oModel.remove(
				sPath,
				oOptions
			);
		}

	});

});