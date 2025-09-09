sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter"
], function (Controller, JSONModel, Filter, FilterOperator, Sorter) {
	"use strict";
	var _oController = null;
	var _oService = null;
	_oService = {
		init: function (oBaseController) {
			_oController = oBaseController;
		},
		getOutputDeviceSet :function(aFilter)
		{
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				var aUrlParameters = {
					$top: "50000",
					$inlinecount: "allpages"
				};
				oModel.read("/xRB1MxTM_I_OUTPUT_DEVICES", {
					filters: aFilter,
					urlParameters: aUrlParameters,
					success: function (oData) {
						resolve(oData);
						//debugger;
					},
					error: function (oError) {
						reject(oError);
						//debugger;
					}
				});
			});
		},
		
		getTNADUSet: function (aFilter) {		
			//debugger;	
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//debugger;
				var aUrlParameters = {
					$top: "50000",
					$inlinecount: "allpages"
				};
				oModel.read("/xRB1MxTM_I_TNADU", {
					filters: aFilter,
					urlParameters: aUrlParameters,
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
		},		
		getOutputType: function (aFilter) {		
			//debugger;	
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//debugger;
				var aUrlParameters = {
					$top: "300",
					$inlinecount: "allpages"
				};
				oModel.read("/xRB1MxTM_I_OUTPUTTYPE_VH", {
					filters: aFilter,
					urlParameters: aUrlParameters,
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
		},
		getGetUname: function (aFilter) {		
			//debugger;	
			return new Promise((resolve, reject) => {
				let oModel = _oController.getOwnerComponent().getModel("mainService");
				//debugger;
				var aUrlParameters = {
					$top: "50000",
					$inlinecount: "allpages"
				};				
				oModel.read("/xRB1MxTM_I_USR02", {
					filters: aFilter,
					urlParameters: aUrlParameters,
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
		},
		
		sendMultiAction: function  (f, I, d, n, o, a, h) {
			return new Promise((resolve, reject) => {
				var p = [];
				var t = this;
				var P = {};
				var T;
				for (var b in I) {
					T = I[b];
					 
					 P = {
						"OutputType" : T.OutputType,
						"Uname" : T.Uname ,
						"OutputDevice" : T.OutputDevice,
						"PrintImmediately" : T.PrintImmediately,
						"RelAfterOutput" : T.RelAfterOutput,
						//"Createddate" : T.Createddate,
						"Createduser" : T.Createduser,
						//"Lastchangedate" : T.Lastchangedate,
						"Lastchangeuser" : T.Lastchangeuser
					};
				
					p.push(P);
				}
				
				var s = function (oData) {
					resolve(oData);
				};
				var e = function (E) {
					//debugger;
					t.oDataRequestFailed(E);
					resolve(E);
				};
				let _method = "";
				switch (d) {
					case "U":
						_method = "MERGE";
						break;		
					case "D":
						_method = "DELETE";
						break;	
					case "C":
						_method = "POST";
						break;									
					default:
						break;
				}
				t.fireBatch({
					sPath: f,
					aUrlParameters: p,
					sMethod: _method,
					sBatchGroupId: "SendMultiAction",
					numberOfRequests: I.length,
					fnSuccessCallback: s,
					fnErrorCallback: e
				});
			})
           
        },
		fireBatch: function (p, u) {
			//debugger;
			var m = _oController.getOwnerComponent().getModel("mainService");
			m.setUseBatch(true);
			if (m.hasPendingChanges()) {
				m.resetChanges();
			}
			//m.setDeferredBatchGroups([p.sBatchGroupId]);
			this.setModelDeferredGroup(m, p.sBatchGroupId);
			var P;
			var e = {
				//batchGroupId: p.sBatchGroupId
			};
			for (var i = 0; i < p.numberOfRequests; i++) {
				if (p.aUrlParameters) {
					e.urlParameters = p.aUrlParameters[i];
				}
				if (p.aProperties) {
					e.properties = p.aProperties[i];
				}
				if (p.sPath) {
					P = p.sPath;
				} else if (p.aPaths) {
					P = p.aPaths[i];
				}
				if (!jQuery.sap.startsWith(P, "/")) {
					P = "/" + P;
				}
				if (p.sMethod == "GET") {
					m.read(P, e);
				} else if (p.sMethod == "MERGE") {
					//debugger;
					e.changeSetId = "changeSetId" + i;
					P = m.createKey("/xRB1MxTM_I_TNADU", {
						OutputType: e.urlParameters.OutputType,
						Uname: e.urlParameters.Uname
					});
					m.update(P, e.urlParameters);
				} else if (p.sMethod == "POST") {
					e.changeSetId = "changeSetId" + i;
					//  P = m.createKey("/xRB1MxTM_I_TNADU", {
					//  	OutputType: e.urlParameters.OutputType,
					// 	Uname: e.urlParameters.Uname
					//  });
					m.create(P, e.urlParameters);
				} else if (p.sMethod == "DELETE") {
					e.changeSetId = "changeSetId" + i;
					P = m.createKey("/xRB1MxTM_I_TNADU", {
						OutputType: e.urlParameters.OutputType,
						Uname: e.urlParameters.Uname
					});
					m.remove(P, e.urlParameters);
				} else if (p.sMethod == "FUNCTIONIMPORT") {
					e.changeSetId = "changeSetId" + i;
					e.method = "POST";
					m.callFunction(P, e.urlParameters);
				}
			}
			m.submitChanges({
				//batchGroupId: p.sBatchGroupId,
				groupId: p.sBatchGroupId,
				success: p.fnSuccessCallback,
				error: p.fnErrorCallback
			});
			//m.attachBatchRequestCompleted(function(oEvent) {   debugger;   });
		},
		setModelDeferredGroup: function (oModel, sGroup) {
			if (oModel && sGroup) {
				var aDeferredGroups = oModel.getDeferredGroups();
				if (aDeferredGroups.indexOf(sGroup) < 0) {
					aDeferredGroups.push(sGroup);
					oModel.setDeferredGroups(aDeferredGroups);
				}
			}
		}   ,
		oDataRead: function (oModel, sPath, oUrlParams, fnSuccess, fnError, groupId) {
			var oSettings = {
				urlParameters: oUrlParams,
				success: fnSuccess,
				error: fnError,
				groupId: groupId
			};
			oModel.read(sPath, oSettings);
		},
		oDataRemove: function (oModel, sPath, fnSuccess, fnError) {
			var oSettings = {
				success: fnSuccess,
				error: fnError
			};
			oModel.remove(sPath, oSettings);
		},
		oDataCreate: function (oModel, sPath, oUrlParams, oData, oContext, fnSuccess, fnError) {
			var oSettings = {
				context: oContext,
				success: fnSuccess,
				error: fnError,
				urlParameters: oUrlParams
			};
			oModel.create(sPath, oData, oSettings);
		},
		oDataBatch: function (mParameters, oModel,oData) {
			//debugger;
			if (oModel.hasPendingChanges()) {
				oModel.resetChanges();
			}
			oModel.setDeferredBatchGroups([mParameters.sBatchGroupId]);
			var sPath;
			var oEntry = {
				batchGroupId: mParameters.sBatchGroupId
			};
			for (var i = 0; i < mParameters.numberOfRequests; i++) {
				if (mParameters.aUrlParameters) {
					oEntry.urlParameters = mParameters.aUrlParameters;
				}
				 if (mParameters.filters) {
				 	oEntry.filters = mParameters.filters;
				 }
				if (mParameters.aProperties) {
					oEntry.properties = mParameters.aProperties[i];
				}
				if (mParameters.sPath) {
					sPath = mParameters.sPath;
				} else if (mParameters.aPaths) {
					sPath = mParameters.aPaths[i];
				}
				if (!jQuery.sap.startsWith(sPath, "/")) {
					sPath = "/" + sPath;
				}
				if (mParameters.sMethod === "GET") {
					oModel.read(sPath, oEntry);
				}
				else if (mParameters.sMethod === "POST") {
					oModel.create(sPath, oData ,oEntry);
				}
			}
			oModel.submitChanges({
				batchGroupId: mParameters.sBatchGroupId,
				success: mParameters.fnSuccessCallback,
				error: mParameters.fnErrorCallback
			});

			
		},
		oDataRequestFailed: function (oModel, oError, fnError) {
			var sMessage, sDetails;
			if (oError.hasOwnProperty("customMessage")) {
				sMessage = oError.customMessage.message;
				sDetails = oError.customMessage.details;
			} else {
				if (oError.response && oError.response.statusCode === "0") {
					sMessage = this.getResourceBundle().getText("DataManager.connectionError");
				} else {
					sMessage = this.getResourceBundle().getText("DataManager.HTTPRequestFailed");
				}
				if (oError.response && oError.response.body !== "" && oError.response.statusCode === "400") {
					var oParsedError = JSON.parse(oError.response.body);
					sDetails = oParsedError.error.message.value;
				} else {
					sDetails = oError.response ? oError.response.body : null;
				}
			}
			var oParameters = {
				message: sMessage,
				responseText: sDetails
			};
			this.showLocalErrorMessage(oParameters, fnError);
			oModel.fireRequestFailed(oParameters);
		},
		getErrorMessage: function (oError) {
			var oMessage;
			if (oError.response && oError.response.body && oError.response.body !== "") {
				try {
					oMessage = JSON.parse(oError.response.body);
					return (oMessage.error.message.value ? oMessage.error.message.value : null);
				} catch (e) {
					return oError.response.body;
				}
			} else if (oError.responseText && oError.responseText !== "") {
				try {
					oMessage = JSON.parse(oError.responseText);
					return (oMessage.error.message.value ? oMessage.error.message.value : null);
				} catch (e) {
					return oError.responseText;
				}
			} else if (oError.getParameter("responseText") || oError.getParameter("response").body) {
				return oError.getParameter("responseText") ? oError.getParameter("responseText") : oError.getParameter("response").body;
			} else {
				return null;
			}
		},
		showLocalErrorMessage: function (oError, fnError) {

			this.showMessageBox( fnError);
		},
		showMessageBox: function ( fnError) {
			sap.m.MessageBox.show(fnError, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "Error"
			}); 
		}
		
	}

	return _oService;

});