sap.ui.define([], function() {
	"use strict";

	return {

		statusText: function(sStatus) {
			switch (sStatus) {
				case "1":
					return "Creato";
				case "2":
					return "Rilasciato";
				case "3":
					return "Closed";
				default:
					return sStatus;
			}
		},

		statusState: function(sStatus) {
			switch (sStatus) {
				case "1":
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
				case "1":
					return "sap-icon://create-form";
				case "2":
					return "sap-icon://create";
				case "3":
					return "sap-icon://stop";
				default:
					return "sap-icon://question-mark";
			}
		},

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		}

	};

});