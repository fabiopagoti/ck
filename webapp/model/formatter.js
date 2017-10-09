sap.ui.define([], function() {
	"use strict";

	return {

		orderTypeIcon: function(sOrderType) {
			switch (sOrderType) {
				case this.WORK_ORDER_TYPE_EMERGENCY:
					return "sap-icon://alert";
				case this.WORK_ORDER_TYPE_CONVEYOR:
					return "sap-icon://inventory";
				case this.WORK_ORDER_TYPE_MAINTENANCE:
					return "sap-icon://technical-object";
				case this.NOTIFICATION_TYPE_MAINTENANCE:
					return "sap-icon://notification";
				default:
					return "";
			}
		},

		orderTypeText: function(sOrderType) {
			switch (sOrderType) {
				case this.WORK_ORDER_TYPE_EMERGENCY:
					return this.getText("WORK_ORDER_TYPE_EMERGENCY");
				case this.WORK_ORDER_TYPE_CONVEYOR:
					return this.getText("WORK_ORDER_TYPE_CONVEYOR");
				case this.WORK_ORDER_TYPE_MAINTENANCE:
					return this.getText("WORK_ORDER_TYPE_MAINTENANCE");
				case this.NOTIFICATION_TYPE_MAINTENANCE:
					return this.getText("NOTIFICATION_TYPE_MAINTENANCE");
			}
		},

		statusText: function(sStatus) {
			switch (sStatus) {
				case this.STATUS_CREATED:
					return this.getText("STATUS_CREATED");
				case this.STATUS_RELEASED:
					return this.getText("STATUS_RELEASED");
				case this.STATUS_CLOSED:
					return this.getText("STATUS_CLOSED");
				default:
					return sStatus;
			}
		},

		statusState: function(sStatus) {
			switch (sStatus) {
				case this.STATUS_CREATED:
					return "Success";
				case "2":
					return "Warning";
				case "3":
					return "Error";
				default:
					return "None";
			}
		},

		statusIcon: function(sStatus) {
			switch (sStatus) {
				case this.STATUS_CREATED:
					return "sap-icon://create-form";
				case "2":
					return "sap-icon://create";
				case "3":
					return "sap-icon://stop";
				default:
					return "sap-icon://question-mark";
			}
		}
	};

});