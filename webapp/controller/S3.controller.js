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
				busy: false,
				isMandatoryFieldsValid: true
			});

			this.setModel(oViewModel, "view");
			this.getRouter().getRoute("order").attachPatternMatched(this.onPatternMatched, this);

			// Register the view with the message manager
			sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
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
				// var sObjectPath = this.getModel().createKey("Orders", {
				// 	OrderNum: oArguments.id
				// });
				var sObjectPath = `/OrderDetails('${oArguments.id}')`;
				this._bindView(sObjectPath);
			}.bind(this));
		},

		onValueHelpRequestMaintainer: function(oEvent) {

			if (!this.oDialogMaintainer) {
				this.oDialogMaintainer = sap.ui.xmlfragment(
					"pm.tlsup.fragment.F1",
					this
				);
				this.getView().addDependent(this.oDialogMaintainer);
			}

			// create a filter for the binding
			this.oListMaintainer = this.oDialogMaintainer.getContent()[0];

			this.oListMaintainer
				.getBinding("items")
				.filter([
					new Filter(
						"IWorkCenter",
						FilterOperator.EQ,
						this.getView().getBindingContext().getObject().WorkCenter
					)
				]);

			// open value help dialog filtered by the input value
			this.oDialogMaintainer.open();
		},

		// onSearchMaintainer: function(oEvent) {
		// 	// var sValue = oEvent.getParameter("value");
		// 	var sValue = this.getView().getBindingContext().getObject().WorkCenter;
		// 	var oFilter = new Filter(
		// 		"IWorkCenter",
		// 		FilterOperator.EQ,
		// 		sValue
		// 	);
		// 	this.oListMaintainer.getBinding("items").filter([oFilter]);
		// },

		onConfirmMaintainer: function(oEvent) {
			var oSelectedItem = this.oListMaintainer.getSelectedItem();
			if (oSelectedItem) {
				var oBindingContext = this.getView().getBindingContext();
				var oModel = this.getModel();
				var oMaintainer = oSelectedItem.getBindingContext().getObject();
				oModel.setProperty("CidNum", oMaintainer.CidNum, oBindingContext);
				oModel.setProperty("OpName", oMaintainer.OpName, oBindingContext);
			}
			this.oListMaintainer.getBinding("items").filter([]);
			this.oDialogMaintainer.close();
		},

		onCancelMaintainer: function(evt) {
			this.oDialogMaintainer.close();
		},

		onSave: function(oEvent) {
			MessageBox.show(this.getText("s3_save_confirmation"), {
				icon: MessageBox.Icon.QUESTION,
				title: this.getText("s3_title"),
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function(sAction) {
					switch (sAction) {
						case "YES":
							this._save();
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

		_save: function() {
			var oModel = this.getModel();
			var oBindingContext = this.getView().getBindingContext();
			var oOrder = oBindingContext.getObject();
			var oData = {
				OrderNum: oOrder.OrderNum,
				OrderType: oOrder.OrderType,
				Description: oOrder.OperationDescription,
				Plant: oOrder.Plant,
				Equipment: oOrder.Equipment,
				CidNum: oOrder.CidNum
			};
			var sId = oData.OrderNum;

			var sPath = oModel.createKey("/Orders", {
				OrderNum: oData.OrderNum
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