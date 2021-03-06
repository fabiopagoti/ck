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
				busy: false,
				reject: {
					reason: ""
				}
			});

			this.setModel(oViewModel, "view");
			this._oViewModel = oViewModel;
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
				var sObjectPath = this.getModel().createKey("/PMNotifications", {
					NotifNo: oArguments.id
				});
				this._bindView(sObjectPath);
			}.bind(this));
		},

		onReject: function(oEvent) {
			
			if (!this.oDialogReason) {
				this.oDialogReason = sap.ui.xmlfragment(
					"pm.tlsup.fragment.F4",
					this
				);
				this.getView().addDependent(this.oDialogReason);
			}

			this.oDialogReason.open();
		},
		
		onConfirmReject: function(oEvent){
			this._reject();
			this.oDialogReason.close();
		},
		
		onCancelReject: function(oEvent){
			this.oDialogReason.close();
		},

		onCreate: function(oEvent) {
			this._create();
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
			var sId = oBindingContext.getObject().NotifNo;
			var sPath = oModel.createKey("/PMNotifications", {
				NotifNo: sId
			});
			var sReason = this._oViewModel.getProperty("/reject/reason");
			
			var oData = {
				NotifNo: sId,
				LongDescription: sReason
			};
			
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

			oModel.update(
				sPath,
				oData,
				oOptions
			);
		},

		_create: function() {
			var oBindingContext = this.getView().getBindingContext();
			var sId = oBindingContext.getObject().NotifNo;
			this.getRouter().navTo("order-create", {
				id: sId
			});
		}

	});

});