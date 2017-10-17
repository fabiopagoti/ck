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

	return BaseController.extend("pm.tlsup.controller.S4", {

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
			this._viewModel = oViewModel;

			var oMaterialsModel = new JSONModel([]);
			this.setModel(oMaterialsModel, "materials");
			this._materialsModel = oMaterialsModel;

			this.getRouter().getRoute("order-create").attachPatternMatched(this.onPatternMatched, this);

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onNavBack: function(oEvent) {
			this.getRouter().navTo("notification",{
				id: this.getView().getBindingContext().getObject().NotifNo                         
			});
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

		onValueHelpRequestMaterial: function(oEvent) {
			this._inputMaterial = oEvent.getSource();

			if (!this._oDialogMaterials) {
				this._oDialogMaterials = sap.ui.xmlfragment(
					"pm.tlsup.fragment.F2",
					this
				);
				this.getView().addDependent(this._oDialogMaterials);
			}

			this._oDialogMaterials
				.getBinding("items")
				.filter(
					[new Filter(
						"IPlant",
						FilterOperator.EQ,
						this.getView().getBindingContext().getObject().Plant
					)]
				);

			this._oDialogMaterials.open();
		},

		onSearchMaterials: function(oEvent) {
			var sPlant = this.getView().getBindingContext().getObject().Plant;
			var aFilters = [];
			aFilters.push(new Filter(
				"IPlant",
				FilterOperator.EQ,
				sPlant
			));

			var sValue = oEvent.getParameter("value");
			if (sValue && sValue.length > 0) {
				aFilters.push(new Filter(
					"MaterialNum",
					FilterOperator.EQ,
					sValue
				));
			}
			this._oDialogMaterials.getBinding("items").filter(aFilters);
		},

		onConfirmMaterials: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedContexts");
			if (oSelectedItem[0]) {
				var oBindingContext = this._inputMaterial.getBindingContext("materials");
				var sPath = oBindingContext.getPath();
				var oMaterial = oSelectedItem[0].getObject();
				this._materialsModel.setProperty(`${sPath}/material`, oMaterial.MaterialNum);
				this._materialsModel.setProperty(`${sPath}/description`, oMaterial.Description);
			}
			this._oDialogMaterials.getBinding("items").filter([]);
		},

		onCancelMaterials: function(evt) {
		},
		
		onAddMaterial: function(oEvent) {
			var aMaterials = this._materialsModel.getProperty("/");
			aMaterials.push({
				material: null
			});
			this._materialsModel.setProperty("/", aMaterials);
		},

		onDeleteMaterial: function(oEvent) {
			var oParameters = oEvent.getParameters();
			var oDeletedListItem = oParameters.listItem;
			var iDeletedListItemIndex = -1;
			var oDeletedBindingContext = oDeletedListItem.getBindingContext("materials").getObject();
			var aMaterials = this._materialsModel.getProperty("/");

			for (var i = 0; i < aMaterials.length; i++) {
				if (oDeletedBindingContext === aMaterials[i]) {
					iDeletedListItemIndex = i;
				}
			}

			if (iDeletedListItemIndex > -1) {
				aMaterials.splice(iDeletedListItemIndex, 1);
			}

			this._materialsModel.setProperty("/", aMaterials);
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

			if (!oElementBinding.getBoundContext()) {
				this.getRouter().navTo("objectNotFound");
				return;
			}

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