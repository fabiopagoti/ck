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

		statusState: function(sStatus) {
			switch (sStatus) {
				case this.STATUS_CREATED:
					return "Warning";
				case this.STATUS_RELEASED:
				case this.STATUS_RELEASED_NOTIFICATION:
					return "Success";
				case this.STATUS_CLOSED:
					return "Error";
			}
		},

		statusIcon: function(sStatus) {
			switch (sStatus) {
				case this.STATUS_CREATED:
					return "sap-icon://create-form";
				case this.STATUS_RELEASED:
				case this.STATUS_RELEASED_NOTIFICATION:
					return "sap-icon://create";
				case this.STATUS_CLOSED:
					return "sap-icon://stop";
			}
		},

		today: function(svalue) {
			var d = new Date();

			function pad(s) {
				return (s < 10) ? '0' + s : s;
			}
			
			return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');

		}
	};

});