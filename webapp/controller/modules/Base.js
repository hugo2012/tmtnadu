sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../../service/Service",
	"sap/m/MessageBox"
], function (Controller, Service, MessageBox) {
	"use strict";
	let _oService = Service; // Service is shared between all controllers
	return Controller.extend("com.bosch.rb1m.tm.tmtnadu.controller.modules.Base", {
		onInit: function () {
			_oService.init(this);
		},
		getService: function () {
			//debugger;
			return _oService;
		},

		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
		/*
			Set root view busy
		*/
		
		setBusy: function (bBusy) {
			this.getView().setBusy(bBusy);
		},

		setGlobalBusy: function (bBusy) {
			this.getOwnerComponent().getModel("screenModel").setProperty("/isBusy", bBusy);
		},

		
			/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},
		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
			/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
			getResourceBundle: function () {
				return this.getModel("i18n").getResourceBundle();
			},
	
			/* Check phone device or not */
			isPhoneDevice: function () {
				return sap.ui.Device.system.phone;
			},
			// Warning message handling
		showMultileLineWarningMessageBox: function (sMainMessage, aErrorMessage) {
			if (!aErrorMessage || aErrorMessage.length === 0) {
				return;
			}

			// Build error message
			let sDetail = "";
			sDetail += "<ul>";
			for (let sMessage of aErrorMessage) {
				sDetail += `<li>${sMessage}</li>`
			}
			sDetail += "</ul>";

			MessageBox.warning((sMainMessage), {
				title: "Warning",
				details: sDetail
			});
		},
		fnSetBusyIndicatorOnDetailControls: function (oControl, bShowBusy) {
			if (oControl) {
				var iDelay = 0;
				if (!bShowBusy) {
					iDelay = 1000;
				}
				oControl.setBusyIndicatorDelay(iDelay).setBusy(bShowBusy);
			}
		},
		/* Check phone device or not */
		isPhoneDevice: function () {
			return sap.ui.Device.system.phone;
		},
		/* Check Desktop device or not */
		isDesktopDevice: function () {
			return sap.ui.Device.system.desktop;
		}
	});
});