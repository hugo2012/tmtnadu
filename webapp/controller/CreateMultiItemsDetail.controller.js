sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "../controller/modules/Base",
	"sap/ui/core/routing/History",
	"sap/m/MessageToast",
	"../custom/CusValueHelpDialog",
    "sap/m/Token",
	 'sap/ui/core/library'
], function (
	JSONModel,Base,
	History,MessageToast,CusValueHelpDialog,Token,coreLibrary
) {
	"use strict";
	var ValueState = coreLibrary.ValueState;
	return Base.extend("com.bosch.rb1m.tm.tmtnadu.controller.CreateMultiItemsDetail", {

		onInit: function () {
            Base.prototype.onInit.apply(this);   
			this.oSemanticPage = this.byId("idObjectPageCrt");
			this.showFooter(false);
			this.fnInitializeSettingsModel();			
			var oModel = this.getOwnerComponent().getModel("mainService");   
			this.batchObjectActive = false;       
			let that = this;
			oModel.attachBatchRequestCompleted(function(oEvent) {         
				
				// request completed
				//debugger;
				that.setBusy(false);
				// check oEvent.getParameters("success") ...
				// ... whether the request was successful and the data was loaded
				if(oEvent.getParameters("success").requests && that.batchObjectActive == true  ){
					that.batchObjectActive = false;    
					for(let i=0;i<oEvent.getParameters("success").requests.length;i++){
						var checkID = that.getOwnerComponent().getModel("oBatchCompleted").getData().oBatchCompleted;
						
                        var oModelObjectDetail = new JSONModel({ oBatchCompleted : oEvent.getParameters("success")["ID"] });
                        that.getOwnerComponent().setModel(oModelObjectDetail, "oBatchCompleted");  

						let oObj = oEvent.getParameters("success").requests[i];
						var _response1 = oObj["response"];
						if(oObj["method"] == "POST"){
												
							if(_response1.statusCode > 300){
								var b = JSON.parse(_response1.responseText)
								if(b.error.message.value)
								{
									if(checkID!=oEvent.getParameters("success")["ID"]){
									 that._fnHandleErrorExe(b.error.message.value);
									}
								}
								else{
                                    if(_response1.headers["sap-message"])
                                    {
                                       let c = JSON.parse(_response1.headers["sap-message"])
									   if(checkID!=oEvent.getParameters("success")["ID"]){
                                       	that._fnHandleErrorExe(c.message);
									   }                                      
                                    }
								}								
							}
							else{								
                                if(_response1.headers["sap-message"])
                                    {
										that.getModel("objectModel").setProperty("/showFooter",false)
										that.getModel("objectModel").setProperty("/editEnable",false)
										that.showFooter(false);		
                                       let c = JSON.parse(_response1.headers["sap-message"])
                                       if(c.severity=="success"){
                                        if(c.message){
											if(checkID!=oEvent.getParameters("success")["ID"]){
												that.getModel("objectModel").setProperty("/isChanged",false);
												that.getModel("objectModel").setProperty("/showFooter",false)
												that.getModel("objectModel").setProperty("/editEnable",false)
												that.getModel("objectModel").setProperty("/createEnable",false);
												that.showFooter(false);		
												that._fnHandleSuccessExe(c.message);
											}                                          
																
											if( that.getModel("objectModel").getProperty("/ModeChange") == "D"){
												that.getModel("objectModel").setProperty("/RowsItems",[]);
												jQuery.sap.delayedCall(2500, that, function() {
													that.onNavBack();
												});				
											}
                                        }                                     
                                       }                                       
                                    }
							}
						}						 
						break;
					}
				}
			});
			//this.fnGetOutputType();		
			this.getRouter().getRoute("CreateMultiItemsDetail").attachMatched(this.onRouteMatched, this);
		},
		/* Settings Model */
		fnInitializeSettingsModel: function () {    
			//debugger;          
			var oSettingsModel = new JSONModel({    
				tableDescription: "",	       
				languages: [],
				seltablename: "",
				seloutputtype: "",
				RowsHeader: [],
				RowsItems: [],
				editEnable: false,
				createEnable: false,
				operationMode: "",
				coEnable: true,
				dynamicTableTitle: "",
				bOnCreate: false,
				bDataFound: false,
				showFooter: false,
				dynamicForm: [],
				deepDynamicTable: {},
				ModeChange: ""	,
				oDataDeepPayload:{}	,
				FieldsSetInlineCount:[],
                ShipToPartySet:[],	
				upDateError: false,
				isChanged: false,
				batchIDCompleted: "",
				pageTitle:"",
				itemDetailTitle:"",
				checkOutputDevice: true,
				checkUname: true,
				itemsChangedError:[]
			});
			this.setModel(oSettingsModel, "objectModel");  	
			// comboBoxModel
			var ocomboBoxModel = new JSONModel({
				AfterReleaseSet: [],
				OutputDevSet:[],
				OutputTypeSet:[],
				unDoDataItems:[]
			  });    
			  this.setModel(ocomboBoxModel, "comboBoxModel");   
			  this.getModel("objectModel").setProperty("/itemsChangedError", []);  
		},
		fnGetOutputType: function (aFilters) {
			var aFilter = {};           
            if(aFilters){
            }else{
                aFilter = {};
                aFilters=[];
                aFilter =  new sap.ui.model.Filter({
                    path: "OutputType",
                    operator: sap.ui.model.FilterOperator.NotContains,
                    value1: "_ASN_"
                });
                aFilters.push(aFilter);
            }
			this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenForm"), true);      
				 this.getService().getOutputType(aFilters).then(
					function (aData) {    
						this.getModel("comboBoxModel").setProperty("/OutputTypeSet", aData.results);
						this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenForm"), false);   
					}.bind(this),
					function (oError) { this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenForm"), false); }.bind(this)
				); 
		},
		onRouteMatched: function () {		
			var oData = {};		
			if(this.getOwnerComponent().getModel("oItemDetail")){
				var odataObjDetail = this.getOwnerComponent().getModel("oItemDetail").getProperty("/oItemDetail");
				oData = JSON.parse(odataObjDetail);
			}
			else{
				this.onNavBack();
				return;
			}								
			if (oData) {				
				if(oData.mode == "C")
				{
					this.getModel("objectModel").setProperty("/editEnable",true);	
					this.getModel("objectModel").setProperty("/operationMode","C");	
					this.getModel("objectModel").setProperty("/ModeChange","C");	
					this.getModel("objectModel").setProperty("/createEnable",true);						
				}
				this.fnGetDataHeaderItem(oData);					
			}
		},

		fnGetDataHeaderItem: function(oData)
		{
			var objData = oData;	
			let arrFieldsSet = [];
			arrFieldsSet = objData.rows;			
			this.getModel("objectModel").setProperty("/RowsItems",arrFieldsSet);	
			//pageTitle
		    this.getModel("objectModel").setProperty("/pageTitle",objData.pageTitle);		
			this.getModel("objectModel").setProperty("/itemDetailTitle",oData.itemDetailTitle);	
			this.onEnableEdit();
		},
		onEnableEdit: function()
		{
			this.getModel("objectModel").setProperty("/showFooter",true)
			this.getModel("objectModel").setProperty("/isChanged",false);
			if ( this.getModel("objectModel").getProperty("/operationMode") == "C" )
			{
				this.getModel("objectModel").setProperty("/editEnable",true)
				this.getModel("objectModel").setProperty("/createEnable",true);
				if(this.getModel("objectModel").getProperty("/operationMode") == "C")
					{
						if( this.getModel("objectModel").getProperty("/upDateError") == true) {
							this.getModel("objectModel").setProperty("/ModeChange","C");
						}
					}
			} 		
			this.showFooter(true);
			//Keep Original data before change. - unDoDataItems	
			const oDataTableItems = this.getModel("objectModel").getProperty("/RowsItems");				
			if(oDataTableItems)
			{                  
				var aData = [];  
				aData =  oDataTableItems ;        
				this.getModel("comboBoxModel").setProperty("/unDoDataItems", []);
				var oJsonObj = JSON.stringify(aData);
				this.getModel("comboBoxModel").setProperty("/unDoDataItems",  oJsonObj); 
			}			
		},
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				var aParts = sPreviousHash.split("/");
				var sWorkItemId = aParts[2];
				var rSpecialCharacters = /[^a-zA-Z0-9-_. ]/g;
				var bContainsSpecialCharacters = rSpecialCharacters.test(sWorkItemId);
				if (bContainsSpecialCharacters) {
					history.go(-2); // eslint-disable-line sap-no-history-manipulation
				} else {
					history.go(-1);
				}
			} else {
				history.go(-1);
			}
		},
		onExit: function(){
				this.setModel("objectModel",{});  	
				//objectModel
				this.setModel("comboBoxModel",{}); 
				this.getModel("objectModel").setProperty("/isChanged",false); 
		},		
		onTokenUpdate : function(oEvent){
			this.getModel("objectModel").setProperty("/isChanged",true);
		},		
		showFooter: function(bShow) {
			this.oSemanticPage.setShowFooter(bShow);
		},		
		onSave: function() {
		  debugger;
			  var k = this.getModel("objectModel").getProperty("/itemsChangedError");  
			  let flagCheck = false;
			  if(k.length >0){
				  for(let a =0; a < k.length; a ++ )
				  {
					  flagCheck = false;
					  let _message = "";
					  if(k[a]["isErrOutputDevice"] == true){
						  flagCheck = true;
						 _message = this.getResourceBundle().getText("dialog.error.validation.OutputDevice");
					  }
					  if(k[a]["isErrUname"] == true){
						flagCheck = true;
						_message = this.getResourceBundle().getText("dialog.error.validation.Uname");
					}
					  if(flagCheck == true){
						
						  sap.m.MessageBox.show(_message, {
							  icon: sap.m.MessageBox.Icon.ERROR,
							  title: "Error"
							});
						  break;
					  } 
				  }; 
				  if(flagCheck == true){
					  return;
				  }
			  }			 
			  //this.oEditAction.setVisible(true);
			  var aTableItems = this.getModel("objectModel").getProperty("/RowsItems");
			  var aItemChangedData = aTableItems;
			  var _payload_deep_rt = [];
			  for(let k =0; k<aItemChangedData.length;k++)
			  {
			   _payload_deep_rt.push(aItemChangedData[k]); 
			  }
			 // debugger;
			  if(_payload_deep_rt.length>0)
			  {
				  this.setBusy(true);
				  this.batchObjectActive = true
				  this.getService().sendMultiAction("/xRB1MxTM_I_TNADU",_payload_deep_rt,"C").then(
					  function (aData) {
						 //debugger;
						 //this.setBusy(false);
						  //this._fnHandleSuccessExe();
						  }.bind(this),
						  function (oError) {
							 // debugger;
							  this.setBusy(false);
							 // this.batchMainActive = false
							  this._fnHandleErrorExe();
							  }.bind(this)
					  );
			  }
			  else{
				  MessageToast.show(this.getResourceBundle().getText("dialog.infor.nodata.change"));
			  }
		  },
		_fnHandleSuccessExe: function (_aMessage) {
			this.setBusy(false);
			var _message = "";
			if(_aMessage){
				_message = _aMessage;
			}
			else{
				_message = this.getResourceBundle().getText("dialog.success.save.complete");
			}			 
			 sap.m.MessageBox.show(_message, {
				 icon: sap.m.MessageBox.Icon.SUCCESS,
				 title: "Success"
			 }); 
			this.getModel("objectModel").setProperty("/isChanged",false);
			var aItemData = this.getModel("objectModel").getProperty("/RowsItems");
			var bIsMode = this.getModel("objectModel").getProperty("/ModeChange");	;
			this.getModel("objectModel").setProperty("/showFooter",false)
			this.getModel("objectModel").setProperty("/editEnable",false)
			this.getModel("objectModel").setProperty("/createEnable",false);
			this.showFooter(false);
			//this.oEditAction.setVisible(true);			
			this.getOwnerComponent().getEventBus().publish("MainViewTable", "ItemChange", {			
				aItem: aItemData,
				bIsMode: bIsMode
			});		
		},
		_fnHandleErrorExe:function(_aMessage) {
		   // MessageToast.show("Data cannot be saved!");
			this.setBusy(false);
			var _message = "";
			if(_aMessage){
				_message = this.getResourceBundle().getText("dialog.error.save.failed.existing");
				//_message = _message + "-" + _aMessage;
			}
			else{
				_message = this.getResourceBundle().getText("dialog.error.save.failed");
			}
			sap.m.MessageBox.show(_message, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: "Error"
			}); 
		},
		onCancel: function() {		
			//this.oDeleteAction.setVisible(true);
			var isChanged = this.getModel("objectModel").getProperty("/isChanged");
			var _mode = this.getModel("objectModel").getProperty("/operationMode")
			if(isChanged == true ){
				sap.m.MessageBox.warning("Do you want to cancel? You might lose your data.", {
					actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
					emphasizedAction: sap.m.MessageBox.Action.YES,
					onClose: function (sAction) {
						if (sAction === sap.m.MessageBox.Action.YES) {
							this.getModel("objectModel").setProperty("/showFooter",false)
							this.getModel("objectModel").setProperty("/editEnable",false)
							this.getModel("objectModel").setProperty("/createEnable",false);
							this.showFooter(false);
							//this.oEditAction.setVisible(true);											
							//Return Backdata for item table data.						  
							var unDoDataItems = JSON.parse(this.getModel("comboBoxModel").getProperty("/unDoDataItems"));	
							if(unDoDataItems){
								let arrFieldsSet = [];
								//debugger;
								for(let a=0; a<unDoDataItems.length; a++){
									let i = 0;							
									arrFieldsSet.push(unDoDataItems[a]);
								}
							   if(_mode != "C"){
								this.getModel("objectModel").setProperty("/dynamicForm",[])
								this.getModel("objectModel").setProperty("/dynamicForm",arrFieldsSet);	
								this.getModel("comboBoxModel").setProperty("/unDoDataItems",[]); 	
							   }
							   else{
									this.getModel("objectModel").setProperty("/RowsItems",[])
									this.getModel("comboBoxModel").setProperty("/unDoDataItems",[]); 
									this.onNavBack();
							   }
							}                               						   
						} else {
							return;
						}
					}.bind(this)
				});   
			}
			 else{
				this.getModel("objectModel").setProperty("/showFooter",false)
				this.getModel("objectModel").setProperty("/editEnable",false)
				this.getModel("objectModel").setProperty("/createEnable",false);
				this.showFooter(false);
				//this.oEditAction.setVisible(true);	
				//this.oDeleteAction.setVisible(true);
				if(_mode == "C"){
					this.getModel("objectModel").setProperty("/RowsItems",[])
					this.getModel("comboBoxModel").setProperty("/unDoDataItems",[]); 
					this.onNavBack();
				}
			 } 
		},		
		onAfterRendering: function (oEvent) {
			//debugger;
			this.fnGetOutputType();
		},		
		fnGetOutputDeviceSet: function (aFilter) {
			this.setBusy(true);    
				 this.getService().getOutputDeviceSet(aFilter).then(
					function (aData) {    
						this.getModel("comboBoxModel").setProperty("/OutputDevSet", aData.results);
						this.setBusy(false)  
					}.bind(this),
					function (oError) { this.setBusy(false) }.bind(this)
				); 
		},		
		onValueHelpRequestAuto: function(oEvent)
        {
            let aFilter = [];
            var oID = oEvent.getParameters().id;
            let oControlname = oID.split("--")[2];
            this.oControl= this.byId(oControlname);
            let _entityName = oEvent.oSource.mProperties.name;
            this.fnSetBusyIndicatorOnDetailControls(this.oControl,true)
            let arrayFieldsLabel = [];
            let arrayColumns = [];
            this._oSourceFieldIDF4 = oEvent.getSource();
            switch(oControlname) {
                case "_IDMulti_UNAME_2":

                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("user_id_txt")
                    data.Field2 = this.getResourceBundle().getText("first_name_txt")
                    data.Field3 = this.getResourceBundle().getText("last_name_txt")
                    data.Field4 = this.getResourceBundle().getText("full_name_txt")
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    data.Field1 = "Uname"
                    data.Field2 = "FirstName"
                    data.Field3 = "LastName"
                    data.Field4 = "FullName"
                    arrayColumns.push(data);
                    var arrFieldsSet = [];
                    var _inlineCount = 0
                    this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), true);
                    this.getService().getGetUname(aFilter).then(
                       function (oData) {
                            _inlineCount = oData.__count;
                            for( let i = 0; i<oData.results.length; i++)
                            {
                                arrFieldsSet.push(oData.results[i]);
                            }
                           this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false);
                           this.onValueHelpPopup(arrayFieldsLabel,arrayColumns,arrFieldsSet,this.oControl,this.getResourceBundle().getText("uname_txt"),_entityName,_inlineCount);
                       }.bind(this),
                       function (oError) { this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false); }.bind(this)
                   );
                  break;
                case "OUTPUT_DEVICE":
                    //for testing purpose.
                    var data = new Array();
                    data.Field1 = this.getResourceBundle().getText("out_device_txt")
                    data.Field2 = this.getResourceBundle().getText("description_txt")
                    arrayFieldsLabel.push(data);

                    data = new Array();
                    data.Field1 = "OutputDevice"
                    data.Field2 = "Padest"
                    arrayColumns.push(data);

                    var _inlineCount = 0;
                    var arrFieldsSet = [];
                    var data = new Array();
                    this.getService().getOutputDeviceSet(aFilter).then(
                        function (oData) {
                             _inlineCount = oData.__count;
                            for( let i = 0; i<oData.results.length; i++)
                            {
                                arrFieldsSet.push(oData.results[i]);
                            }
                            this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false);
                            this.onValueHelpPopup(arrayFieldsLabel,arrayColumns,arrFieldsSet,this.oControl,this.getResourceBundle().getText("out_device_txt"),_entityName,_inlineCount);
                        }.bind(this),
                        function (oError) { this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false); }.bind(this)
                    );
                    break;               
                default:
                  // code block
                  break;      
              }
        } ,
		fnOnDynamicTableUpdated: function (e) {
            //var oDataModel = this.getModel("dataModel").getData();
            var sTotal = " (" + e.getParameter("total") + ")";
            var sTitle = this.getResourceBundle().getText("headerrecords") + sTotal;
            this.getView().byId("dynamicTableTitleCrt").setText(sTitle);
            this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("itemsTable"), false);
        },
		onValueHelpPopup : async function (_oLabels,_oColumns,_oData1,oControl,_title,_entityName,_inlineCount) {      
			//debugger;
			this.fnSetBusyIndicatorOnDetailControls(oControl,true)
			var _ColumnFields = CusValueHelpDialog.fnCreateBindingColumn(_oLabels,_oColumns,"objectModel>");
			let arrFieldsSet = CusValueHelpDialog.fnReGenerateOdataSetF4(_oLabels,_oColumns,_oData1,"/ShipToPartySet"); 
			this.getModel("objectModel").setProperty("/ShipToPartySet", []);
			this.getModel("objectModel").setProperty("/ShipToPartySet", arrFieldsSet);
			let arrCols = _oColumns[0];
			let dataService = this.getService();
			let _arrPrefliter = {};
			let _tblPrefliter = [];
			if( this._oSourceFieldIDF4.getValue())
			{
			  let _f4Value = this._oSourceFieldIDF4.getValue();
			  if(_f4Value.length > 0){                   
				_arrPrefliter =  {
					path: arrCols["Field1"],
					operator: sap.ui.model.FilterOperator.Contains,
					values: [
						_f4Value
					]
				};
				_tblPrefliter.push(_arrPrefliter);
				}
			}
			this._valueHelpDialog = await CusValueHelpDialog.createValueHelp({
				title: _title,
				model: this.getModel("objectModel"),
				multiSelect: false,
				keyField: arrCols["Field1"],
				keyDescField: "",
				basePath: "objectModel>/ShipToPartySet",
				preFilters: _tblPrefliter,
				columns: _ColumnFields,
				modeQuery: 2,
				oService: dataService,
				entityName: _entityName,
				labelDefinition: _oLabels,
				columnDefiniton: _oColumns,
				inlineCount: _inlineCount,
				ok: function (selectedRow) {   
					let aTokens = [];                  
					for(var i =0; i<selectedRow.length; i++)
					{
						if(selectedRow[i])
						{
							var oToken1 = new Token({
								key: selectedRow[i][arrCols["Field1"]],
								text: selectedRow[i][arrCols["Field1"]]
							});  
							aTokens.push(oToken1);   
						}                         
						
					}
					this._oSourceFieldIDF4.setTokens(aTokens);					
					this._oSourceFieldIDF4.setValueState(sap.ui.core.ValueState.None);
					this._valueHelpDialog.close();
				}.bind(this),
				beforeOpen: function(oEvent){
					this.fnSetBusyIndicatorOnDetailControls(this.oControl,true)
				}.bind(this),
				afterOpen: function(oEvent){
					this.fnSetBusyIndicatorOnDetailControls(this.oControl,false)
				}.bind(this),
				afterClose : function(oEvent){
					this._valueHelpDialog.destroy()
					
				}.bind(this)
			});                 
			this.getView().addDependent(this._valueHelpDialog);
			this.fnSetBusyIndicatorOnDetailControls(this.oControl,false)
			let aTokens = []; 
			this._valueHelpDialog.setTokens(aTokens);
			this._valueHelpDialog.setTokens(this.oControl.getTokens());
			this._valueHelpDialog.update();
			this._valueHelpDialog.open();
		} ,  		
		handleChangeCbDevice:function(oEvent){
			var oValidatedComboBox = oEvent.getSource(),
			sSelectedKey = oValidatedComboBox.getSelectedKey(),
			sValue = oValidatedComboBox.getValue();
			this.getModel("objectModel").setProperty("/isChanged",true);
			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState(ValueState.Error);
				 if(oValidatedComboBox.sId.includes("OUTPUT_DEVICE")){

					oValidatedComboBox.setValueStateText(this.getResourceBundle().getText("dialog.error.validation.OutputDevice"));
				}		   
			} else {
				oValidatedComboBox.setValueState(ValueState.None);
			}
		},						
		onInputChange: function(oEvt){
			//debugger;
			if (oEvt.getParameter("escPressed")) {			   
			} else {
				//this._setUIChanges(true);
					this.getModel("objectModel").setProperty("/isChanged",true);
					var sPath = "/dynamicForm/0";
					var oValidatedComboBox = oEvt.getSource().sId;
						if (oEvt.getParameter("state")){
							if(oValidatedComboBox.includes("REL_AFTER_OUTPUT")){
								this.getModel("objectModel").setProperty(sPath + "/RelAfterOutput", true);
							}
							else if(oValidatedComboBox.includes("PRINT_IMMEDIATELY")){
								this.getModel("objectModel").setProperty(sPath + "/PrintImmediately", true);
							}					   
						} else {
							//this.getModel("objectModel").getProperty("/dynamicForm/0/REL_AFTER_OUTPUT")
							if(oValidatedComboBox.includes("REL_AFTER_OUTPUT")){
								 this.getModel("objectModel").setProperty(sPath + "/RelAfterOutput", false);
							}
							else if(oValidatedComboBox.includes("PRINT_IMMEDIATELY")){
								this.getModel("objectModel").setProperty(sPath + "/PrintImmediately", false);
							}
						}
						if(oValidatedComboBox.includes("OUTPUT_DEVICE")){

							this.onCheckOutputDevice(oEvt);
						  }
			}
		}, 
		onUnameChange:function (oEvent) {
			//  debugger;
			  //multiInputFOs
			  var sCurrTextValue = oEvent.getSource().getValue();
			  let aFilter = [];  
			  this.getModel("objectModel").setProperty("/isChanged",true);  
			  if(sCurrTextValue.length == 0){
				this.oMultiInput1.setValueState(sap.ui.core.ValueState.SUCCESS);
				this.oMultiInput1.setValueStateText("");
			  } 
			  if(sCurrTextValue.length >= 1)
			  {
				  sCurrTextValue = sCurrTextValue.trim();
				  let aFilter = [];   				  
				    aFilter.push(
							  //Shipping point
							  new sap.ui.model.Filter("Uname", sap.ui.model.FilterOperator.EQ, sCurrTextValue)
						  );
			   		this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDMulti_UNAME_2"), true);   		
					this.getService().getGetUname(aFilter).then(
					function (oData) {    
						if(oData.results.length > 0)
						{
							this.oMultiInput1.setValueState(sap.ui.core.ValueState.None);
						}		
						else{
							this.oMultiInput1.setValueState("Error");
							this.oMultiInput1.setShowValueStateMessage(true);
							var _message = this.getResourceBundle().getText("dialog.error.Uname.Invalid");
							this.oMultiInput1.setValueStateText(_message);
							sap.m.MessageBox.show(_message, {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Error"
							  });
						}
						this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDMulti_UNAME_2"), false);   
					}.bind(this),
					function (oError) { this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDMulti_UNAME_2"), false); }.bind(this)
				); 		  				
			} 
		  }, 
		  onCheckUname: function(oEvt){			
			var idx = oEvt.getSource().getParent().getBindingContextPath().split("/")[2];
           // var sPath = oEvt.getSource().getParent().getBindingContextPath();
			var sSelectedKey = oEvt.getSource().getValue();
			if(sSelectedKey.length < 1){
				return;
			}
			var oID = oEvt.getParameters().id;
			let oControlname = oID.split("--")[2];
			this.oControl= this.byId(oControlname);   
			this.fnSetBusyIndicatorOnDetailControls(this.oControl,true)
			var aFilter = {};
			var aFilters = [];
			aFilter =  new sap.ui.model.Filter({
				path: "Uname",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: sSelectedKey
			});
			aFilters.push(aFilter);
			this.getService().getGetUname(aFilters).then(
				function (oData) {    
					var b = new Array();
					 if(oData.results.length > 0)
						{
							this.oControl.setValueState(sap.ui.core.ValueState.None);
							
							this.getModel("objectModel").setProperty("/checkUname",true);
                                var a =  this.getModel("objectModel").getProperty("/itemsChangedError");                                     
                                    b.index = idx;
                                    b.isErrOutputDevice = false;
									b.isErrUname = false;
                                    let flagCheck = false;
                                    let i = 0;
                                    a.forEach(item => {                                      
                                        if(item.index == b.index ){
                                            flagCheck = true;
											b.isErrOutputDevice = a[i]["isErrOutputDevice"];
                                            a[i] = b;
                                        }
                                        i = i + 1;
                                    });
                                    if( flagCheck == false )
                                    {
                                        a.push(b);
                                    }
                                    if(a.length < 1){
                                        a.push(b);
                                    }
                                    this.getModel("objectModel").setProperty("/itemsChangedError", a);
						}  
						else{
							this.oControl.setValueState(sap.ui.core.ValueState.Error);
							this.getModel("objectModel").setProperty("/checkUname",false);
							var a =  this.getModel("objectModel").getProperty("/itemsChangedError");                                     
								b.index = idx;
								b.isErrOutputDevice = false;
								b.isErrUname = true;
								let flagCheck = false;
								let i = 0;
								a.forEach(item => {
									if(item.index == b.index ){
										flagCheck = true;
										b.isErrOutputDevice = a[i]["isErrOutputDevice"];
										a[i] = b;
									}
									i = i + 1;
								});
								if( flagCheck == false )
								{
									a.push(b);
								}
								if(a.length < 1){
									a.push(b);
								}
								this.getModel("objectModel").setProperty("/itemsChangedError", a);
							this.oControl.setValueStateText(this.getModel("i18n").getProperty("dialog.error.validation.Uname"));
						}
					 this.fnSetBusyIndicatorOnDetailControls(this.oControl,false)                        
				}.bind(this),
				function (oError) {   this.fnSetBusyIndicatorOnDetailControls(this.oControl,false); this.oControl.setValueState(sap.ui.core.ValueState.Error); }.bind(this)
			); 
		},
		onCheckOutputDevice: function(oEvt){
            var idx = oEvt.getSource().getParent().getBindingContextPath().split("/")[2];
            var sPath = oEvt.getSource().getParent().getBindingContextPath();
            var sSelectedKey = oEvt.getSource().getValue();
            var oID = oEvt.getParameters().id;
            let oControlname = oID.split("--")[2];
            this.oControl= this.byId(oControlname);         
            var aFilter = {};
            var aFilters = [];
            aFilter =  new sap.ui.model.Filter({
                path: "OutputDevice",
                operator: sap.ui.model.FilterOperator.EQ,
                value1: sSelectedKey
            });
            aFilters.push(aFilter);
            if(sSelectedKey.length >=1)
            {
                this.fnSetBusyIndicatorOnDetailControls(this.oControl,true)
                this.getService().getOutputDeviceSet(aFilters).then(
                    function (oData) {
                        var b = new Array();
                         if(oData.results.length > 0)
                            {
                                this.oControl.setValueState(sap.ui.core.ValueState.None);
                                this.getModel("objectModel").setProperty("/checkOutputDevice",true);
                                var a =  this.getModel("objectModel").getProperty("/itemsChangedError");                                     
                                    b.index = idx;
                                    b.isErrOutputDevice = false;
									b.isErrUname = false;
                                    let flagCheck = false;
                                    let i = 0;
                                    a.forEach(item => {                                      
                                        if(item.index == b.index ){
                                            flagCheck = true;
											b.isErrUname = a[i]["isErrUname"];
                                            a[i] = b;
                                        }
                                        i = i + 1;
                                    });
                                    if( flagCheck == false )
                                    {
                                        a.push(b);
                                    }
                                    if(a.length < 1){
                                        a.push(b);
                                    }
                                    this.getModel("objectModel").setProperty("/itemsChangedError", a);
                            }
                            else{
                                this.oControl.setValueState(sap.ui.core.ValueState.Error);
                                this.getModel("objectModel").setProperty("/checkOutputDevice",false);
                                var a =  this.getModel("objectModel").getProperty("/itemsChangedError");                                     
                                    b.index = idx;
                                    b.isErrOutputDevice = true;
									b.isErrUname = false;
                                    let flagCheck = false;
                                    let i = 0;
                                    a.forEach(item => {
                                        if(item.index == b.index ){
                                            flagCheck = true;
											b.isErrUname = a[i]["isErrUname"];
                                            a[i] = b;
                                        }
                                        i = i + 1;
                                    });
                                    if( flagCheck == false )
                                    {
                                        a.push(b);
                                    }
                                    if(a.length < 1){
                                        a.push(b);
                                    }
                                    this.getModel("objectModel").setProperty("/itemsChangedError", a);
                                this.oControl.setValueStateText(this.getModel("i18n").getProperty("dialog.error.validation.OutputDevice"));
                            }
                         this.fnSetBusyIndicatorOnDetailControls(this.oControl,false)
                    }.bind(this),
                    function (oError) {   this.fnSetBusyIndicatorOnDetailControls(this.oControl,false); this.oControl.setValueState(sap.ui.core.ValueState.Error); }.bind(this)
                );
            }          
        },
		onValueHelpRequest_Table: function(oEvent)
		{
			let aFilter = [];
			var oID = oEvent.getParameters().id;
			let oControlname = oID.split("--")[2];
			this.oControl= this.byId(oControlname);   
			let _entityName = oEvent.oSource.mProperties.name;
			this.fnSetBusyIndicatorOnDetailControls(this.oControl,true)
			let arrayFieldsLabel = [];
			let arrayColumns = [];       
			this._oSourceFieldIDF4 = oEvent.getSource(); 
			//var idx = oEvent.getSource().getParent().getBindingContextPath().slice(-1);
			var data = new Array();
			if(oControlname.includes(("comb_OUTPUT_DEVICE"))){
				 _entityName = "OutputDevice"
				data.Field1 = this.getResourceBundle().getText("out_device_txt")
				data.Field2 = this.getResourceBundle().getText("description_txt")
				arrayFieldsLabel.push(data);

				data.Field1 = "OutputDevice"
				data.Field2 = "Padest"
				arrayColumns.push(data);

				var arrFieldsSet = [];
				var _inlineCount = 0      
				this.getService().getOutputDeviceSet(aFilter).then(
				function (oData) {    
						_inlineCount = oData.__count;
						for( let i = 0; i<oData.results.length; i++)
						{

							arrFieldsSet.push(oData.results[i]);
						}   
						this.fnSetBusyIndicatorOnDetailControls(this.oControl,false)   
					this.onValueHelpInputPopup(arrayFieldsLabel,arrayColumns,arrFieldsSet,this.oControl,this.getResourceBundle().getText("out_device_txt"),_entityName,_inlineCount);
				}.bind(this),
				function (oError) {   this.fnSetBusyIndicatorOnDetailControls(this.oControl,false); }.bind(this)
				); 
			}else if(oControlname.includes(("UNAME_12_CRT"))){
				 _entityName = "Uname"
				data.Field1 = this.getResourceBundle().getText("user_id_txt")
				data.Field2 = this.getResourceBundle().getText("first_name_txt")
				data.Field3 = this.getResourceBundle().getText("last_name_txt")
				data.Field4 = this.getResourceBundle().getText("full_name_txt")
				arrayFieldsLabel.push(data);

				data = new Array();
				data.Field1 = "Uname"
				data.Field2 = "FirstName"
				data.Field3 = "LastName"
				data.Field4 = "FullName"
				arrayColumns.push(data);
				var arrFieldsSet = [];
				var _inlineCount = 0
				this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), true);
				this.getService().getGetUname(aFilter).then(
				   function (oData) {
						_inlineCount = oData.__count;
						for( let i = 0; i<oData.results.length; i++)
						{
							arrFieldsSet.push(oData.results[i]);
						}
					   this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false);
					   this.onValueHelpInputPopup(arrayFieldsLabel,arrayColumns,arrFieldsSet,this.oControl,this.getResourceBundle().getText("uname_txt"),_entityName,_inlineCount);
				   }.bind(this),
				   function (oError) { this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false); }.bind(this)
			   );

			}
		 },
		 onValueHelpInputPopup: async function (_oLabels,_oColumns,_oData1,oControl,_title,_entityName,_inlineCount) {      
			//debugger;
			this.fnSetBusyIndicatorOnDetailControls(oControl,true)
			var _ColumnFields = CusValueHelpDialog.fnCreateBindingColumn(_oLabels,_oColumns,"objectModel>");
			let arrFieldsSet = CusValueHelpDialog.fnReGenerateOdataSetF4(_oLabels,_oColumns,_oData1,"/ShipToPartySet"); 
			this.getModel("objectModel").setProperty("/ShipToPartySet", []);
			this.getModel("objectModel").setProperty("/ShipToPartySet", arrFieldsSet);
			let arrCols = _oColumns[0];
			let dataService = this.getService();
			//this._index = indx;
			let _arrPrefliter = {};
			let _tblPrefliter = [];
			if( this._oSourceFieldIDF4.getValue())
			{
			  let _f4Value = this._oSourceFieldIDF4.getValue();
			  if(_f4Value.length > 0){                   
				_arrPrefliter =  {
					path: arrCols["Field1"],
					operator: sap.ui.model.FilterOperator.Contains,
					values: [
						_f4Value
					]
				};
				_tblPrefliter.push(_arrPrefliter);
				}
			}
			this._valueHelpDialog = await CusValueHelpDialog.createValueHelp({
				title: _title,
				model: this.getModel("objectModel"),
				multiSelect: false,
				keyField: arrCols["Field1"],
				keyDescField: "",
				basePath: "objectModel>/ShipToPartySet",
				preFilters: _tblPrefliter,
				columns: _ColumnFields,
				modeQuery: 2,
				oService: dataService,
				entityName: _entityName,
				labelDefinition: _oLabels,
				columnDefiniton: _oColumns,
				inlineCount: _inlineCount,
				ok: function (selectedRow) {   
					let aTokens = [];                  
					for(var i =0; i<selectedRow.length; i++)
					{
						if(selectedRow[i])
						{						
							var keyValue = selectedRow[i][arrCols["Field1"]];
							this._oSourceFieldIDF4.setValue(keyValue);
							this._oSourceFieldIDF4.setValueState(sap.ui.core.ValueState.None);
							this._oSourceFieldIDF4.fireSubmit();
							this.getModel("objectModel").setProperty("/isChanged",true);													   
						}                         
						break;
					}
					this._valueHelpDialog.close();
				}.bind(this),
				beforeOpen: function(oEvent){
					this.fnSetBusyIndicatorOnDetailControls(oControl,true)
				}.bind(this),
				afterOpen: function(oEvent){
					this.fnSetBusyIndicatorOnDetailControls(oControl,false)
				}.bind(this),
				afterClose : function(oEvent){
					this._valueHelpDialog.destroy()
				}.bind(this),
				cancel: function(oEvent){
					this._valueHelpDialog.close()
				}.bind(this)
			});                 
			this.getView().addDependent(this._valueHelpDialog);
			this.fnSetBusyIndicatorOnDetailControls(oControl,false)
			var sKeyFieldName = "Field1";
			this._valueHelpDialog.setKey(sKeyFieldName);
			this._valueHelpDialog.update();
			this._valueHelpDialog.open();					 
		} 		
	});
});