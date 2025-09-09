sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "../controller/modules/Base",
    "../custom/CusValueHelpDialog",
    "sap/m/Token",
    "sap/m/MessageToast",
    'sap/ui/core/library',
    'com/bosch/rb1m/tm/tmtnadu/util/Formatter',
    'sap/ui/model/Sorter',
    'sap/ui/core/Fragment',
    'sap/ui/core/mvc/Controller'
], 
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function(JSONModel,Base,CusValueHelpDialog,Token
    , MessageToast,coreLibrary,Formatter,Sorter,Fragment) 
    {
    "use strict";
    var ValueState = coreLibrary.ValueState;
    return Base.extend("com.bosch.rb1m.tm.tmtnadu.controller.Main", {
        formatter: Formatter,
        onInit() {
            Base.prototype.onInit.apply(this);
            this.oFilterBar = this.getView().byId("filterbar");
            this.oSemanticPage = this.byId("dynamicPageId");
            this.oEditAction = this.byId("_IDBtnEdit");
            this.oDeleteAction = this.byId("_IDBtnDelete");
            this.oCreateAction = this.byId("_IDBtnCreate");
            this.showFooter(false);
            this.fnInitializeSettingsModel();
            var oModel = this.getOwnerComponent().getModel("mainService");    
            this.batchMainActive = false;          
			let that = this;
            this.getModel("dataModel").setProperty("/bOnCreate",true);
            this.getModel("dataModel").setProperty("/bDataFound",false);
			oModel.attachBatchRequestCompleted(function(oEvent) {         
				
				// request completed
				//debugger;
				that.setBusy(false);
				// check oEvent.getParameters("success") ...
				// ... whether the request was successful and the data was loaded
				if(oEvent.getParameters("success").requests && that.batchMainActive == true){
                   
					for(let i=0;i<oEvent.getParameters("success").requests.length;i++){
                        var checkID = that.getOwnerComponent().getModel("oBatchCompleted").getData().oBatchCompleted;						
                        var oModelObjectDetail = new JSONModel({ oBatchCompleted : oEvent.getParameters("success")["ID"] });
                        that.getOwnerComponent().setModel(oModelObjectDetail, "oBatchCompleted");  
						let oObj = oEvent.getParameters("success").requests[i];
						var _response1 = oObj["response"];
						if(oObj["method"] == "POST" || oObj["method"] == "MERGE"){		
                            that.batchMainActive = false				
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
                                       let c = JSON.parse(_response1.headers["sap-message"])
                                       if(c.severity=="success"){
                                        if(c.message){
                                            if(checkID!=oEvent.getParameters("success")["ID"]){
                                                that._fnHandleSuccessExe(c.message);
                                            }                                         
                                        }                                      
                                       }                                        
                                    }
							}
						}
						else if(oObj["method"] == "DELETE"){
                            that.batchMainActive = false
							if(_response1.statusCode > 300){
								var b = JSON.parse(_response1.responseText)		
                                    if(b.error.message.value){
                                         
                                        if(checkID!=oEvent.getParameters("success")["ID"]){
                                            that._fnHandleErrorExe(b.error.message.value);
                                        }
                                    }						
							}
							else{
                                if(_response1.headers["sap-message"])
                                    {
                                       let c = JSON.parse(_response1.headers["sap-message"])
                                       if(c.severity=="success"){
                                        if(c.message){
                                            //that._fnHandleSuccessExe(c.message);
                                            if(checkID!=oEvent.getParameters("success")["ID"]){
												that._fnHandleSuccessExe(c.message);
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
            // Keeps reference to any of the created sap.m.ViewSettingsDialog-s in this sample
            this._mViewSettingsDialogs = {};
            this._mDialogs = {};
            this.oMultiUNAME = this.getView().byId("_IDMulti_UNAME");
            this.oMultiUNAME.setValue("");
            this.oMultiUNAME.removeAllTokens();
            this.oMultiUNAME.addValidator(function(args){
                //debugger;
                var text = args.text;
                var text1 = "*" + args.text + "*";
                return new Token({key: text, text: text1}).data("range", {
                    "include": true,
                    "operation": sap.ui.model.FilterOperator.Contains,
                    "keyField": "UNAME",
                    "value1": text,
                    "value2": ""
                });
            });
            this.oMultiOUTPUT_DEVICE = this.getView().byId("_IDMulti_OUTPUT_DEVICE");
            this.oMultiOUTPUT_DEVICE.setValue("");
            this.oMultiOUTPUT_DEVICE.removeAllTokens();
            this.oMultiOUTPUT_DEVICE.addValidator(function(args){
                //debugger;
                var text = args.text;
                var text1 = "*" + args.text + "*";
                return new Token({key: text, text: text1}).data("range", {
                    "include": true,
                    "operation": sap.ui.model.FilterOperator.Contains,
                    "keyField": "OUTPUT_DEVICE",
                    "value1": text,
                    "value2": ""
                });
            });
            this.getOwnerComponent().getEventBus().subscribe("MainViewTable", "ItemChange", function (sChannel, sEvent, oData) {
                var aToUpdateItem = oData.aItem;
                var bIsMode = oData.bIsMode;
                that.fnHandleChangeItem(aToUpdateItem,bIsMode);
               // debugger;
                }
            )
        },
          /* Settings Model */
          fnInitializeSettingsModel: function () {
            var oSettingsModel = new JSONModel({
            UnameSet: [],        
            languages: [],
            seltablename: "",
            seloutputtype: "",
            outputTypeDescription: "",
            editEnable: false,
            operationMode: "",
            coEnable: true,
            dynamicTableTitle: "",
            bOnCreate: false,
            bDataSelected: false,
            bDataUpload: false,
            bDataFound: false,
            showFooter: false,
            FieldsSetInlineCount:[],
            ShipToPartySet:[],
            dynamicTableData:[],
            itemTableDataSet:[],
            tableDescription: "",
            itemsChanged:[],
            ModeChange:"",
            currSortKey: "",
            checkOutputDevice: true,
            itemsChangedError:[]
        });
           this.setModel(oSettingsModel, "dataModel");
           // comboBoxModel
           var ocomboBoxModel = new JSONModel({
             AfterReleaseSet:[],
             OutputDevSet:[],
             OutputTypeSet: []
           });
           this.setModel(ocomboBoxModel, "comboBoxModel");
           var oBatch = new JSONModel({
            batchIDCompleted:"",
          });
          this.getOwnerComponent().setModel(oBatch, "oBatchCompleted");    
        },
        fnHandleChangeItem: function(aToUpdateItem,bIsMode){
            debugger;
            var aTableItems = this.getModel("dataModel").getProperty("/itemTableDataSet");
            var aKeyDataUpdate = {};
            var aKeyDataUpdateArr = [];
            var aKeyDataCurrent = {};
            var aItemDeleteIndex=[];
            for(var i = 0; i < aToUpdateItem.length; i ++ ){
                aKeyDataUpdate = {};
                aKeyDataUpdate["OutputType"] = aToUpdateItem[i]["OutputType"];
                aKeyDataUpdate["Uname"] = aToUpdateItem[i]["Uname"];
                aKeyDataUpdateArr.push(aKeyDataUpdate);
            }
            let isExisted = false;
            for(var a = 0; a < aTableItems.length; a ++ ){
                aKeyDataCurrent["OutputType"] = aTableItems[a]["OutputType"];
                aKeyDataCurrent["Uname"] = aTableItems[a]["Uname"];
                if(bIsMode == "U"){
                    var b = false;
                    for(let i =0;i<aKeyDataUpdateArr.length;i++){
                        b = this.fnCheckArrDuplicates(aKeyDataCurrent,aKeyDataUpdateArr[i]);
                        //debugger;
                        if(b == true){
                            //update data
                            aToUpdateItem.forEach((oUpdItem,oIndex)=>{
                                if(aKeyDataUpdateArr[i]["OutputType"] == oUpdItem.OutputType && aKeyDataUpdateArr[i]["Uname"] == oUpdItem.Uname){
                                    aTableItems[a] = oUpdItem;
                                    this.getModel("dataModel").setProperty("/itemTableDataSet",aTableItems);
                                }
                           })  
                        }
                    }         
                }
                else if(bIsMode == "C"){
                    var c = false;
                    for(let i =0;i<aKeyDataUpdateArr.length;i++){
                        c = this.fnCheckArrDuplicates(aKeyDataCurrent,aKeyDataUpdateArr[i]);
                        //debugger;
                        if(c == true){
                            //insert data
                            isExisted = true;
                            break;
                        }
                    }                               
                }
                else if(bIsMode == "D"){
                    var c = false;
                    for(let i =0;i<aKeyDataUpdateArr.length+1;i++){
                        c = this.fnCheckArrDuplicates(aKeyDataCurrent,aKeyDataUpdateArr[i]);
                        // debugger;
                        if(c == true){
                            //insert data
                            //aTableItems.splice(a, 1)
                            var h = {};
                            h.OutputType = aKeyDataCurrent["OutputType"];
                            h.Uname = aKeyDataCurrent["Uname"];
                            aItemDeleteIndex.push(h);
                        }
                    }                  
                }
            }
            if(bIsMode == "C"){
                if( isExisted == false){
                    if(aToUpdateItem)
                    {
                        for(var i = 0; i < aToUpdateItem.length; i ++ ){
                            aTableItems.push(aToUpdateItem[i]);
                        }                     
                    }
                    this.getModel("dataModel").setProperty("/itemTableDataSet",aTableItems);
                    var oTable = this.getView().byId("dynamicTable");
                    var aItems = oTable.getItems();
                    if(aItems.length > 0){
                        aItems.forEach(oItem => {
                            oTable.setSelectedItem(oItem,false)
                        });
                    }
                }
            }
            else if(bIsMode == "D"){
                var oTable = this.getView().byId("dynamicTable");
                 if(aItemDeleteIndex){
                    aItemDeleteIndex.forEach(oDelItem => {
                       // aTableItems.splice(oDelItem.indx, 1)
                       aTableItems.forEach((oAItem,oIndex)=>{
                            if(oDelItem.OutputType == oAItem.OutputType && oDelItem.Uname == oAItem.Uname){
                                aTableItems.splice(oIndex, 1)
                            }
                       })
                    });
                } 
                this.getModel("dataModel").setProperty("/itemTableDataSet",aTableItems)
                var aItems = oTable.getItems();                                  
                if(aItems.length > 0){
                    aItems.forEach(oItem => {
                        oTable.setSelectedItem(oItem,false)
                    });
                    this.getView().byId("_IDBtnDelete").setEnabled(false);
                    this.getView().byId("_IDBtnCreate").setEnabled(true);
                    this.getView().byId("_IDBtnEdit").setEnabled(true);
                    this.getModel("dataModel").setProperty("/ModeChange","");
                }
            }
        },
        fnCheckArrDuplicates: function(array_a,array_b) {
            let a = false;
            if(JSON.stringify(array_a) === JSON.stringify(array_b))
            {
                a = true;
            }
            return a;
          } ,
        onItemPress: function(oEvent)
        {
            if(this.oEditAction.getVisible() == false){
                return;
            }
            var oSelectedItem = oEvent.getParameter("listItem");
            var idx = oSelectedItem.getBindingContextPath().split("/")[2];
            var itemTable = this.getModel("dataModel").getProperty("/itemTableDataSet");
            if (idx !== -1) {
                var oRouter = this.getOwnerComponent().getRouter();
                var oCurrentRowData = {
                                header: {},
                                pageTitle:"",
                                itemDetailTitle:"",
                                rows: {},
                                mode: "R"
                    };
                oCurrentRowData.rows = itemTable[idx];
                oCurrentRowData.pageTitle = this.getModel("i18n").getProperty("displayItemTitle");
                oCurrentRowData.itemDetailTitle = this.getModel("i18n").getProperty("itemDetails");
                this.getModel("dataModel").setProperty("/ModeChange","");
                var oJsonObj = JSON.stringify(oCurrentRowData);
                var oModelObjectDetail = new JSONModel({ objectDetail : oJsonObj });
                this.getOwnerComponent().setModel(oModelObjectDetail, "objectDetail");            
                oRouter.navTo("objectDetail");
            }
        },
        onCreate : function()
        {
            var oRouter = this.getOwnerComponent().getRouter();
            var oCurrentRowData = {
                tableDescription: "",
                pageTitle:"",
                itemDetailTitle:"",
                header: [],
                rows: {},
                mode: "C"
            };
            var oTable = this.getView().byId("dynamicTable");
            var aItems = oTable.getSelectedItems();
            var data1 = new Array();
            if(aItems.length == 0){       
                data1 = {};     
                data1["OutputType"] = this.getModel("dataModel").getProperty("/seloutputtype");
                data1["Uname"] = "";
                data1["OutputDevice"] = "";
                data1["PrintImmediately"] = false;
                data1["RelAfterOutput"] = true;
                oCurrentRowData.rows = data1;
                oCurrentRowData.pageTitle = this.getModel("i18n").getProperty("createNewOneItemTitle");
                oCurrentRowData.itemDetailTitle = this.getModel("i18n").getProperty("itemDetailsRef");
                var oJsonObj_c = JSON.stringify(oCurrentRowData);  
                var oModelObjectDetail = new JSONModel({ objectDetail : oJsonObj_c });
                this.getOwnerComponent().setModel(oModelObjectDetail, "objectDetail");
                this.getModel("dataModel").setProperty("/ModeChange","");
                oRouter.navTo("objectDetail");
            }else if(aItems.length > 1){
                var itemTable = this.getModel("dataModel").getProperty("/itemTableDataSet");                                    
                oCurrentRowData = {
                    tableDescription: "",
                    pageTitle:"",
                    itemDetailTitle:"",
                    header: [],
                    rows: [],
                    mode: "C"
                };
                 data1 = {};
                 var indx = 0;
                 for(let a = 0 ; a < aItems.length; a++) {
                    data1 = {};
                    indx = aItems[a].getBindingContextPath().split("/")[2];
                   // var idx = aItems[a].getBindingContextPath().slice(-1);
                    data1["OutputType"] = itemTable[indx]["OutputType"];
                    data1["Uname"] = itemTable[indx]["Uname"];
                    data1["OutputDevice"] = itemTable[indx]["OutputDevice"];
                    data1["PrintImmediately"] = itemTable[indx]["PrintImmediately"];
                    data1["RelAfterOutput"] = true;
                    oCurrentRowData.rows.push(data1);
                }    
                oCurrentRowData.pageTitle = this.getModel("i18n").getProperty("createMultiItemTitle");   
                oCurrentRowData.itemDetailTitle = this.getModel("i18n").getProperty("itemDetailsRef");       
                var oJsonObj_c = JSON.stringify(oCurrentRowData);  
                var oModelObjectDetail = new JSONModel({ oItemDetail : oJsonObj_c });
                this.getOwnerComponent().setModel(oModelObjectDetail, "oItemDetail");
                this.getModel("dataModel").setProperty("/ModeChange","");
                oRouter.navTo("CreateMultiItemsDetail");
            }
            else{
                var itemTable = this.getModel("dataModel").getProperty("/itemTableDataSet");                                    
                oCurrentRowData = {
                    tableDescription: "",
                    pageTitle: "",
                    itemDetailTitle:"",
                    header: [],
                    rows: {},
                    mode: "C"
                };
                 data1 = {};
                 var indx = 0;
                 for(let a = 0 ; a < aItems.length; a++) {
                    indx = aItems[a].getBindingContextPath().split("/")[2];
                    break;
                }
                data1["OutputType"] = itemTable[indx]["OutputType"];
                data1["Uname"] = itemTable[indx]["Uname"];
                data1["OutputDevice"] = itemTable[indx]["OutputDevice"];
                data1["PrintImmediately"] = itemTable[indx]["PrintImmediately"];
                data1["RelAfterOutput"] = true;

                oCurrentRowData.rows = data1;
                oCurrentRowData.pageTitle = this.getModel("i18n").getProperty("createItemRefernceTitle");
                oCurrentRowData.itemDetailTitle = this.getModel("i18n").getProperty("itemDetailsRef"); 
                var oJsonObj_c = JSON.stringify(oCurrentRowData);  
                var oModelObjectDetail = new JSONModel({ objectDetail : oJsonObj_c });
                this.getOwnerComponent().setModel(oModelObjectDetail, "objectDetail");
                this.getModel("dataModel").setProperty("/ModeChange","");
                oRouter.navTo("objectDetail");
            }      
          
        }  ,
        onAfterRendering: function (oEvent) {
           this.fnGetOutputType();
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
            this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), true);
                 this.getService().getOutputType(aFilters).then(
                    function (aData) {
                        //debugger;
                        this.getModel("comboBoxModel").setProperty("/OutputTypeSet", aData.results);
                        this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false);
                    }.bind(this),
                    function (oError) { this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false); }.bind(this)
                );
        },
        onOutputTypeChange : function(oEvent)
            {
                debugger;
                var isSelected = oEvent.getParameter("selected");

                //var oValidatedComboBox = oEvent.getSource(),
                //sSelectedKey = oValidatedComboBox.getSelectedKey(),
                //sValue = oValidatedComboBox.getValue();
                //var sSelectedKey = "";
                this.getModel("dataModel").setProperty("/itemTableDataSet",[]);
                this.getModel("dataModel").setProperty("/itemsChanged", [])
                this.getModel("dataModel").setProperty("/itemsChangedError", []);
                if(isSelected==true)
                {
                    //this.fnResetDynamicTableComponent("dynamicTable");
                    //this.getModel("dataModel").setProperty("/outputTypeDescription",sValue);
                    this.getModel("dataModel").setProperty("/bOnCreate",true);
                    this.getModel("dataModel").setProperty("/bDataFound",false);
                }
            },
        showFooter: function(bShow) {
            this.oSemanticPage.setShowFooter(bShow);
        },

        onSearchGo: function(oEvent)
        {
            var aSelectionSet = oEvent.getParameter("selectionSet");
            this.getModel("dataModel").setProperty("/itemTableDataSet",[]);
            this.getModel("dataModel").setProperty("/itemsChanged", [])
            this.getModel("dataModel").setProperty("/itemsChangedError", []);
            /* var checkFlag = this.fnCheckGoQueryPara();
            if(checkFlag == false)
            {
                return;
            } */
            var aFilters = [];
            let aFilter = {};
            let aTokens = [];
            for(var b=0;b<aSelectionSet.length;b++ )
                {
                    let oControl = aSelectionSet[b];
                     aFilter = {};
                     aTokens = [];
                    switch(oControl.mProperties.name)
                    {
                        case "OutputType":    
                                    var selectedItems = oControl.getSelectedKeys();
                                    if(selectedItems.length > 0){
                                        selectedItems.forEach(ocbItem => {
                                            aFilter = new sap.ui.model.Filter({
                                                path: oControl.getName(),
                                                operator: sap.ui.model.FilterOperator.Contains,
                                                value1: ocbItem
                                            });	 
                                            aFilters.push(aFilter);
                                        });
                                       
                                    }
                                   
                          break;
                        case "Uname":

                            aTokens =  oControl.getTokens();
                           
                            for(let i=0;i<aTokens.length;i++)
                                {
                                    let oToken = aTokens[i];
                                    if(oToken.data("range")) {
                                        var oRange = oToken.data("range");
                                         aFilter =  new sap.ui.model.Filter({
                                            path: oControl.getName(),
                                            operator: oRange.exclude? "NE" : oRange.operation,
                                            value1: oRange.value1,
                                            value2: oRange.value2
                                        });                                      
                                    }
                                    else{
                                        aFilter = new sap.ui.model.Filter({
                                            path: oControl.getName(),
                                            operator: sap.ui.model.FilterOperator.Contains,
                                            value1: oToken.getKey()
                                        });	 
                                    }
                                    aFilters.push(aFilter);
                                }
                            break;
                        case "OutputDevice":
                            aTokens =  oControl.getTokens();
                           
                            for(let i=0;i<aTokens.length;i++)
                                {
                                    let oToken = aTokens[i];
                                    if(oToken.data("range")) {
                                        var oRange = oToken.data("range");
                                         aFilter =  new sap.ui.model.Filter({
                                            path: oControl.getName(),
                                            operator: oRange.exclude? "NE" : oRange.operation,
                                            value1: oRange.value1,
                                            value2: oRange.value2
                                        });                                      
                                    }
                                    else{
                                        aFilter = new sap.ui.model.Filter({
                                            path: oControl.getName(),
                                            operator: sap.ui.model.FilterOperator.Contains,
                                            value1: oToken.getKey()
                                        });	 
                                    }
                                    aFilters.push(aFilter);
                                }
                            break;
                    }
                }
            //debugger;
            this.setBusy(true);                     
            this.getService().getTNADUSet(aFilters).then(
                function (aData) {
                    this.getModel("dataModel").setProperty("/itemTableDataSet", aData.results);
                    //if Data found
                    this.getModel("dataModel").setProperty("/bDataFound",true);
                    this.getModel("dataModel").setProperty("/bOnCreate",true); 
                    this.setBusy(false);     
                     // perform sort default.
                     var oTable = this.getView().byId("dynamicTable");     
                    var  aSorters = [],
                    oBinding = oTable.getBinding("items");
                    var sPath = "Description";
                    var bDescending = false;
                    aSorters.push(new Sorter(sPath, bDescending));
                    oBinding.sort(aSorters); 
                }.bind(this),
                function (oError) {  this.setBusy(false); }.bind(this)
            );
        },
        fnCheckGoQueryPara: function()
        {
            var a = true,
                b = "";
            var seloutputtype = this.getModel("dataModel").getProperty("/seloutputtype");
            //var tokensUname = this.fnGetTokensUname();
            if(seloutputtype.length < 1)
            {
                a = false;
                b =  this.getModel("i18n").getProperty("seloutputType");
            }
            if(a==false)
            {
                sap.m.MessageBox.show(b, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error"
                })
            }
            return a;
        },
        fnGetTokensUname: function(){     
            return  this.oMultiUNAME.getTokens();
        },
        onSave: function() {
          //  debugger;
            var k = this.getModel("dataModel").getProperty("/itemsChangedError");  
            let flagCheck = false;
            if(k.length >0){
                for(let a =0; a < k.length; a ++ )
                {
                    flagCheck = false;
                    if(k[a]["isErrOutputDevice"] == true){
                        flagCheck = true;
                    }
                    if(flagCheck == true){
                        let _message = this.getResourceBundle().getText("dialog.error.validation.OutputDevice");
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
            this.getModel("dataModel").setProperty("/showFooter",false)
            this.getModel("dataModel").setProperty("/editEnable",false)
            this.oCreateAction.setVisible(true);
            this.showFooter(false);
            this.oEditAction.setVisible(true);
            var aTableItems = this.getModel("dataModel").getProperty("/itemTableDataSet");
            var aItemChangedIndx = this.getModel("dataModel").getProperty("/itemsChanged");
            var aItemChangedData = [];
            var _payload_deep_rt = [];
            if(aItemChangedIndx.length>0)
            {
                for(let j =0; j<aItemChangedIndx.length;j++)
                {
                   var d = aTableItems[aItemChangedIndx[j]["index"]];
                   if(d){
                    aItemChangedData.push(d);
                   }
                }
            }
            for(let k =0; k<aItemChangedData.length;k++)
            {
             _payload_deep_rt.push(aItemChangedData[k]);

            }
           // debugger;
            if(_payload_deep_rt.length>0)
            {
                this.setBusy(true);
                this.batchMainActive = true
                this.getService().sendMultiAction("/xRB1MxTM_I_TNADU",_payload_deep_rt,"U").then(
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
        onRowSelectionChange: function(oEvent){
            if (oEvent.getSource().getSelectedItems().length == 1) {
                this.getView().byId("_IDBtnDelete").setEnabled(true);
                this.getModel("dataModel").setProperty("/bOnCreate",true);
                this.getView().byId("_IDBtnCreate").setEnabled(true);                  
                this.getView().byId("_IDBtnEdit").setEnabled(true);
            }  
            else if (oEvent.getSource().getSelectedItems().length > 1) {
                this.getView().byId("_IDBtnDelete").setEnabled(true);
                this.getModel("dataModel").setProperty("/bOnCreate",true);
                this.getView().byId("_IDBtnCreate").setEnabled(true);                 
                this.getView().byId("_IDBtnEdit").setEnabled(true);
            } 
            else {
                this.getView().byId("_IDBtnDelete").setEnabled(false);
                this.getModel("dataModel").setProperty("/bOnCreate",true);
                this.getView().byId("_IDBtnCreate").setEnabled(true);                  
                this.getView().byId("_IDBtnEdit").setEnabled(true);
            }
        },
        _fnHandleSuccessExe: function (_aMessage) {
            debugger;
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
             this.getModel("comboBoxModel").setProperty("/unDoDataItems", []);
             if( this.getModel("dataModel").getProperty("/ModeChange") == "D"){
                var aItemData = this.getModel("dataModel").getProperty("/aItemDeletedData");
                this.getOwnerComponent().getEventBus().publish("MainViewTable", "ItemChange", {
                    aItem: aItemData,
                    bIsMode: this.getModel("dataModel").getProperty("/ModeChange")
                });
             }
        },
        _fnHandleErrorExe:function(_aMessage) {
           // MessageToast.show("Data cannot be saved!");
            this.setBusy(false);
            var _message = "";
            if(_aMessage){
                _message = _aMessage;
            }
            else{
                _message = this.getResourceBundle().getText("dialog.error.save.failed");
            }
            sap.m.MessageBox.show(_message, {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error"
            });
        },
        onCancel: function(){
            var aItemschange = this.getModel("dataModel").getProperty("/itemsChanged");
            if(aItemschange.length > 0){
                sap.m.MessageBox.warning(this.getResourceBundle().getText("dialog.warning.Cancelation.confirmation"), {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.YES,
                    onClose: function (sAction) {
                        if (sAction === sap.m.MessageBox.Action.YES) {
                            this.getModel("dataModel").setProperty("/showFooter",false)
                            this.getModel("dataModel").setProperty("/editEnable",false)
                            this.showFooter(false);
                            this.oEditAction.setVisible(true);
                            this.oCreateAction.setVisible(true);
                            //Return Backdata for item table data.
                            //var unDoDataItems =  this.getModel("comboBoxModel").getProperty("/unDoDataItems");
                            var unDoDataItems_1 = localStorage.getItem("/unDoDataItems");
                            var unDoDataItems = JSON.parse(unDoDataItems_1);
                            if(unDoDataItems){
                                let arrFieldsSet = [];
                                var data  = new Array();
                                //debugger;
                                for(let a=0; a<unDoDataItems.length; a++){
                                    let i = 0;
                                    data = new Array();
                                    data = unDoDataItems[a];
                                    arrFieldsSet.push(data);
                                }
                                this.getModel("dataModel").setProperty("/itemTableDataSet",[])
                                this.getModel("dataModel").setProperty("/itemTableDataSet",arrFieldsSet);
                                this.getModel("comboBoxModel").setProperty("/unDoDataItems",[]);
                                localStorage.clear();
                            }

                        } else {
                            return;
                        }
                    }.bind(this)
                });
            }
             else{
                this.getModel("dataModel").setProperty("/showFooter",false)
                this.getModel("dataModel").setProperty("/editEnable",false)
                this.showFooter(false);
                this.oEditAction.setVisible(true);
                this.oCreateAction.setVisible(true);
             }

        },
        onDelete : function()
        {
           // debugger;
           var oTable = this.getView().byId("dynamicTable");
           var aItems = oTable.getSelectedItems();
           let countItem = aItems.length;
           var messText = this.getResourceBundle().getText("dialog.warning.confirmation.delete");
           let newMessage = messText.replace("&1", countItem);
            sap.m.MessageBox.warning(newMessage, {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.CANCEL],
                    emphasizedAction: sap.m.MessageBox.Action.YES,
                    onClose: function (sAction) {
                        if (sAction === sap.m.MessageBox.Action.YES) {
                        this.fnDeleteItemsData();
                        } else {
                        return;
                        }
            }.bind(this)
            });
        } ,
        fnDeleteItemsData: function(){
            var oTable = this.getView().byId("dynamicTable");
            var aItems = oTable.getSelectedItems();
            if(aItems.length < 1){
                return;
            }
            var _payload_deep_rt = [];
            var aItemsDeleted = [];
            for(let a = 0 ; a < aItems.length; a++) {
                var indx = aItems[a].getBindingContextPath().split("/")[2];
                var oItemDel = {};
                oItemDel.Index =  indx;
                aItemsDeleted.push(oItemDel);
            }
            var aTableItems = this.getModel("dataModel").getProperty("/itemTableDataSet")
            var aItemChangedData = [];
            if(aItemsDeleted.length>0)
            {
                this.getModel("dataModel").setProperty("/ModeChange","D");
                for(let j =0; j<aItemsDeleted.length;j++)
                {
                    var d = aTableItems[aItemsDeleted[j]["Index"]];
                    if(d){
                    aItemChangedData.push(d);
                    }
                }
                for(let k =0; k<aItemChangedData.length;k++)
                {
                    _payload_deep_rt.push(aItemChangedData[k]);
                }
                if(_payload_deep_rt.length>0)
                {
                    //aItemDeletedData
                    this.getModel("dataModel").setProperty("/aItemDeletedData",aItemChangedData);
                    this.setBusy(true);
                    //this.batchObjectActive = true
                    this.batchMainActive = true;     
                    this.getService().sendMultiAction("/xRB1MxTM_I_TNADU",_payload_deep_rt,"D").then(
                        function (aData) {
                           //debugger;
                            //this.setBusy(false);
                            //this._fnHandleSuccessExe();
                            }.bind(this),
                            function (oError) {
                               // debugger;
                                this.setBusy(false);
                              //  this.batchMainActive = false
                                this._fnHandleErrorExe();
                                }.bind(this)
                        );
                }
            }  
            else{
                MessageToast.show(this.getResourceBundle().getText("dialog.error.no_selection.delete"));
            }
        },
        onValueHelpRequestAuto: function(oEvent)
        {
            let aFilter = [];
            let aFilters=[];
            var oID = oEvent.getParameters().id;
            let oControlname = oID.split("--")[2];
            this.oControl= this.byId(oControlname);
            let _entityName = oEvent.oSource.mProperties.name;
            this.fnSetBusyIndicatorOnDetailControls(this.oControl,true)
            let arrayFieldsLabel = [];
            let arrayColumns = [];
            this._oSourceFieldIDF4 = oEvent.getSource();
            switch(oControlname) {
                case "_IDMulti_UNAME":
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
                           this.onValueHelpPopupAuto(arrayFieldsLabel,arrayColumns,arrFieldsSet,this.oControl,this.getResourceBundle().getText("uname_txt"),_entityName,_inlineCount);
                       }.bind(this),
                       function (oError) { this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false); }.bind(this)
                   );
                  break;
                case "_IDMulti_OUTPUT_DEVICE":
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
                            //this.getModel("dataModel").setProperty("/ShippingPointSet", aData);
                             _inlineCount = oData.__count;
                            for( let i = 0; i<oData.results.length; i++)
                            {
                                arrFieldsSet.push(oData.results[i]);
                            }
                            this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false);
                            this.onValueHelpPopupAuto(arrayFieldsLabel,arrayColumns,arrFieldsSet,this.oControl,this.getResourceBundle().getText("out_device_txt"),_entityName,_inlineCount);
                        }.bind(this),
                        function (oError) { this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false); }.bind(this)
                    );
                    break;   
                    case "_IDMulti_OutputType":
                        var data = new Array();
                        data.Field1 = this.getResourceBundle().getText("output_type_txt")
                        //data.Field2 = this.getResourceBundle().getText("description_txt")
                        arrayFieldsLabel.push(data);
    
                        data = new Array();
                        data.Field1 = "OutputType"
                        data.Field2 = "Description"
                        arrayColumns.push(data);
    
                        var _inlineCount = 0;
                        var arrFieldsSet = [];
                        var data = new Array();
                        var aFilter1 = {};           
                        if(aFilters.length>1){
                        }else{
                            aFilter1 = {};
                            aFilters=[];
                            aFilter1 =  new sap.ui.model.Filter({
                                path: "OutputType",
                                operator: sap.ui.model.FilterOperator.NotContains,
                                value1: "_ASN_"
                            });
                            aFilters.push(aFilter1);
                        }
                        this.getService().getOutputType(aFilters).then(
                            function (oData) {
                                //this.getModel("dataModel").setProperty("/ShippingPointSet", aData);
                                 _inlineCount = oData.__count;
                                for( let i = 0; i<oData.results.length; i++)
                                {
                                    arrFieldsSet.push(oData.results[i]);
                                }
                                this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false);
                                this.onValueHelpPopupAuto(arrayFieldsLabel,arrayColumns,arrFieldsSet,this.oControl,this.getResourceBundle().getText("output_type_txt"),_entityName,_inlineCount);
                            }.bind(this),
                            function (oError) { this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("_IDGenDynamicPageHeader"), false); }.bind(this)
                        );
                        break;                  
                default:
                  // code block
                  break;      
              }
        } ,
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
            var idx = oEvent.getSource().getParent().getBindingContextPath().split("/")[2];
            var data = new Array();
            var arrFieldsSet = [];
            var _inlineCount = 0
            if(oControlname.includes(("comb_OUTPUT_DEVICE"))){
                _entityName = "OutputDevice"
                data.Field1 = this.getResourceBundle().getText("out_device_txt")
                data.Field2 = this.getResourceBundle().getText("description_txt")
                arrayFieldsLabel.push(data);

                data = new Array();
                data.Field1 = "OutputDevice"
                data.Field2 = "Padest"
                arrayColumns.push(data);
                this.getService().getOutputDeviceSet(aFilter).then(
                    function (oData) {
                        //this.getModel("dataModel").setProperty("/ShippingPointSet", aData);
                         _inlineCount = oData.__count;
                         for( let i = 0; i<oData.results.length; i++)
                         {
                             arrFieldsSet.push(oData.results[i]);
                         }
                         this.fnSetBusyIndicatorOnDetailControls(this.oControl,false)
                        this.onValueHelpInputPopup(arrayFieldsLabel,arrayColumns,arrFieldsSet,this.oControl,this.getResourceBundle().getText("out_device_txt"),_entityName,_inlineCount,idx);
                    }.bind(this),
                    function (oError) {   this.fnSetBusyIndicatorOnDetailControls(this.oControl,false); }.bind(this)
                );
            }          
         },
         onValueHelpInputPopup: async function (_oLabels,_oColumns,_oData1,oControl,_title,_entityName,_inlineCount,indx) {
            //debugger;
            this.fnSetBusyIndicatorOnDetailControls(oControl,true)
            var _ColumnFields = CusValueHelpDialog.fnCreateBindingColumn(_oLabels,_oColumns);
            let arrFieldsSet = CusValueHelpDialog.fnReGenerateOdataSetF4(_oLabels,_oColumns,_oData1,"/ShipToPartySet");
            this.getModel("dataModel").setProperty("/ShipToPartySet", []);
            this.getModel("dataModel").setProperty("/ShipToPartySet", arrFieldsSet);
            let arrCols = _oColumns[0];
            let dataService = this.getService();
            this._index = indx;
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
                model: this.getModel("dataModel"),
                multiSelect: false,
                keyField: arrCols["Field1"],
                keyDescField: "",
                basePath: "dataModel>/ShipToPartySet",
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
                            var a =  this.getModel("dataModel").getProperty("/itemsChanged");
                            var b = new Array();
                            b.index = this._index;
                            let flagCheck = false;
                            a.forEach(item => {
                              if(item.index == b.index ){
                                 flagCheck = true;
                              }
                           });
                           if( flagCheck == false )
                           {
                             a.push(b);
                           }
                           if(a.length < 1){
                             a.push(b);
                           }
                            this.getModel("dataModel").setProperty("/itemsChanged", a);
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
        } ,
        onInputChange: function(oEvt){
            //debugger;
             if (oEvt.getParameter("escPressed")) {

             } else {
                 //this._setUIChanges(true);
                 if (oEvt.getSource().getParent().getBindingContextPath()) {
                     var idx = oEvt.getSource().getParent().getBindingContextPath().split("/")[2];
                     var sPath = oEvt.getSource().getParent().getBindingContextPath();
                     var oValidatedComboBox = oEvt.getSource().sId;
                     if (idx !== -1) {
                         if (oEvt.getParameter("state")){
                             if(oValidatedComboBox.includes("REL_AFTER_OUTPUT")){
                                 this.getModel("dataModel").setProperty(sPath + "/RelAfterOutput", true);
                             }
                             else if(oValidatedComboBox.includes("PRINT_IMMEDIATELY")){
                                 this.getModel("dataModel").setProperty(sPath + "/PrintImmediately", true);
                             }
                         } else {
                             if(oValidatedComboBox.includes("REL_AFTER_OUTPUT")){
                                  this.getModel("dataModel").setProperty(sPath + "/RelAfterOutput", false);
                             }
                             else if(oValidatedComboBox.includes("PRINT_IMMEDIATELY")){
                                 this.getModel("dataModel").setProperty(sPath + "/PrintImmediately", false);
                             }
                         }
                        var a =  this.getModel("dataModel").getProperty("/itemsChanged");
                        var b = new Array();
                        b.index = idx;
                        let flagCheck = false;
                        a.forEach(item => {
                          if(item.index == b.index ){
                             flagCheck = true;
                          }
                       });
                       if( flagCheck == false )
                       {
                         a.push(b);
                       }
                       if(a.length < 1){
                         a.push(b);
                       }
                        this.getModel("dataModel").setProperty("/itemsChanged", a);
                     }
                    // debugger;
                    if(oValidatedComboBox.includes("OUTPUT_DEVICE")){
                      this.onCheckOutputDevice(oEvt);
                    }
                 }
             }
         },
         handleChangeCbDevice:function(oEvent){
             var oValidatedComboBox = oEvent.getSource(),
             sSelectedKey = oValidatedComboBox.getSelectedKey(),
             sValue = oValidatedComboBox.getValue();
             if (!sSelectedKey && sValue) {
                 oValidatedComboBox.setValueState(ValueState.Error);             
                if(oValidatedComboBox.sId.includes("OUTPUT_DEVICE")){
                     this.getModel("dataModel").setProperty("/checkOutputDevice",false);
                     oValidatedComboBox.setValueStateText(this.getModel("i18n").getProperty("dialog.error.validation.OutputDevice"));
                 }
             } else {

                     if(oValidatedComboBox.sId.includes("OUTPUT_DEVICE")){
                         this.getModel("dataModel").setProperty("/checkOutputDevice",true);
                     }
                     oValidatedComboBox.setValueState(ValueState.None);
                 }                 
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
                                this.getModel("dataModel").setProperty("/checkOutputDevice",true);
                                var a =  this.getModel("dataModel").getProperty("/itemsChangedError");                                     
                                    b.index = idx;
                                    b.isErrOutputDevice = false;
                                    let flagCheck = false;
                                    let i = 0;
                                    a.forEach(item => {                                      
                                        if(item.index == b.index ){
                                            flagCheck = true;
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
                                    this.getModel("dataModel").setProperty("/itemsChangedError", a);
                            }
                            else{
                                this.oControl.setValueState(sap.ui.core.ValueState.Error);
                                this.getModel("dataModel").setProperty("/checkOutputDevice",false);
                                var a =  this.getModel("dataModel").getProperty("/itemsChangedError");                                     
                                    b.index = idx;
                                    b.isErrOutputDevice = true;
                                    let flagCheck = false;
                                    let i = 0;
                                    a.forEach(item => {
                                        if(item.index == b.index ){
                                            flagCheck = true;
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
                                    this.getModel("dataModel").setProperty("/itemsChangedError", a);
                                this.oControl.setValueStateText(this.getModel("i18n").getProperty("dialog.error.validation.OutputDevice"));
                            }
                         this.fnSetBusyIndicatorOnDetailControls(this.oControl,false)
                    }.bind(this),
                    function (oError) {   this.fnSetBusyIndicatorOnDetailControls(this.oControl,false); this.oControl.setValueState(sap.ui.core.ValueState.Error); }.bind(this)
                );
            }          
        },
         onEdit: function(){
             this.getModel("dataModel").setProperty("/itemsChanged", []);
             this.getModel("dataModel").setProperty("/itemsChangedError", []);
             this.getModel("dataModel").setProperty("/showFooter",true)
             this.getModel("dataModel").setProperty("/editEnable",true)
             this.showFooter(true);
             this.oEditAction.setVisible(false);
             this.oCreateAction.setVisible(false);
             //Keep Original data before change. - unDoDataItems
             localStorage.clear();
             const itemTableDataOrg =   this.getModel("dataModel").getProperty("/itemTableDataSet");
             //var oTableModel = this.getModel("dataModel").getProperty("/dynamicTableData")
             if(itemTableDataOrg)
             {
                 var data1 = {};
                 data1 = {};
                 var aData = [];
                 for(let i = 0; i<itemTableDataOrg.length; i++){
                     data1 = {};
                     data1 = itemTableDataOrg[i];
                     aData.push(data1)  ;
                 }
                 this.getModel("comboBoxModel").setProperty("/unDoDataItems", []);
                 this.getModel("comboBoxModel").setProperty("/unDoDataItems",  aData);
                 localStorage.setItem("/unDoDataItems", JSON.stringify(aData));
             }
         },
         onValueHelpPopupAuto: async function (_oLabels,_oColumns,_oData1,oControl,_title,_entityName,_inlineCount) {
            //debugger;
            this.fnSetBusyIndicatorOnDetailControls(oControl,true)
            var _ColumnFields = CusValueHelpDialog.fnCreateBindingColumn(_oLabels,_oColumns);
            let arrFieldsSet = CusValueHelpDialog.fnReGenerateOdataSetF4(_oLabels,_oColumns,_oData1,"/ShipToPartySet");
            this.getModel("dataModel").setProperty("/ShipToPartySet", []);
            this.getModel("dataModel").setProperty("/ShipToPartySet", arrFieldsSet);
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
                model: this.getModel("dataModel"),
                multiSelect: true,
                keyField: arrCols["Field1"],
                keyDescField: "",
                basePath: "dataModel>/ShipToPartySet",
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

                            if(arrCols["Field1"] =="OutputType"){
                                var text = selectedRow[i][arrCols["Field2"]] ;
                                oToken1 = new Token({
                                    key: selectedRow[i][arrCols["Field1"]],
                                    text: text
                                });
                            }
                            aTokens.push(oToken1);
                        }
                    }
                    this._oSourceFieldIDF4.setValue("");
                    this._oSourceFieldIDF4.setTokens(aTokens);
                    this._oSourceFieldIDF4.setValueState(sap.ui.core.ValueState.None);
                   // this._oSourceFieldIDF4.fireSubmit();
					this._valueHelpDialog.close();
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
            let aTokens = [];
            this._valueHelpDialog.setTokens(aTokens);
            this._valueHelpDialog.setTokens(oControl.getTokens());
            this._valueHelpDialog.update();
            this._valueHelpDialog.open();
        } ,
        fnOnDynamicTableUpdated: function (e) {
            //var oDataModel = this.getModel("dataModel").getData();
            var sTotal = " (" + e.getParameter("total") + ")";
            var sTitle = this.getResourceBundle().getText("headerrecords") + sTotal;
            this.getView().byId("dynamicTableTitle").setText(sTitle);
            this.fnSetBusyIndicatorOnDetailControls(this.getView().byId("dynamicTable"), false);
        },
        handleSortButtonPressed: function () {
            this._openDialog("SortDialog", "sort", this._presetSettingsItems);
        },

         // View Setting Dialog opener SortDialog
        _openDialog: function (sName, sPage, fInit) {
                var oView = this.getView();
                var oThis = this;
        
                // creates requested dialog if not yet created
                if (!this._mDialogs[sName]) {
                        this.getModel("dataModel").setProperty("/currSortKey","");
                this._mDialogs[sName] = Fragment.load({
                    id: oView.getId(),
                    name: "com.bosch.rb1m.tm.tmtnadu.view." + sName,
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    if (fInit) {
                    fInit(oDialog, oThis);
                    }
                    return oDialog;
                });
            }
            else{
                this._presetSettingsItems(this._mDialogs[sName], this);
            }
            this._mDialogs[sName].then(function (oDialog) {
            // opens the requested dialog
            oDialog.open(sPage);
            //fInit(oDialog, oThis);
            });
      },
      _presetSettingsItems: function (oDialog, oThis) {
        //oThis._presetFiltersInit(oDialog, oThis);
        oThis._presetSortsInit(oDialog, oThis);
        //oThis._presetGroupsInit(oDialog, oThis);
      },
      _presetSortsInit: function(oDialog, oThis) {
        // debugger;
         oDialog = oThis.byId("_IDGenViewSettingsDialog");
         let oDialogParent = oDialog.getParent(),
             oTable = oDialogParent.byId("dynamicTable"),
             oColumns = oTable.getColumns();
         var oItem = {};
         var aSortItem = oDialog.getSortItems();
         if(aSortItem.length > 0){
             oDialog.destroySortItems();
         }
         // Loop every column of the table
         let a =  this.getModel("dataModel").getProperty("/currSortKey");
         let _sortDesc = false 
         let _sortUname = false 
         let _sortOutDev = false 
         if(a.length == 0){
            _sortDesc = true;
         }
         else{
            if(a=="Description")
                {
                   _sortDesc = true;
                }   
                else if(a=="Uname"){
                   _sortUname = true ;
                }
                else if(a=="OutputDevice"){
                   _sortOutDev = true;
                }
         }
       
         oItem = new sap.m.ViewSettingsItem({
            key: "Description",
            text: this.getModel("i18n").getProperty("output_type_txt"),
            selected: _sortDesc
        });
        oDialog.addSortItem(oItem);       

        oItem = new sap.m.ViewSettingsItem({
            key: "Uname",
            text:  this.getModel("i18n").getProperty("uname_txt"),
            selected: _sortUname
        });
        oDialog.addSortItem(oItem);      

        oItem = new sap.m.ViewSettingsItem({
            key: "OutputDevice",
            text: this.getModel("i18n").getProperty("out_device_txt"),
            selected: _sortOutDev
        });
        oDialog.addSortItem(oItem);    

     },
     handleSortDialogConfirm: function (oEvent) {
        var oTable = this.byId("dynamicTable"),
            mParams = oEvent.getParameters(),
            oBinding = oTable.getBinding("items"),
            sPath,
            bDescending,
            aSorters = [];
        sPath = mParams.sortItem.getKey();
        bDescending = mParams.sortDescending;
        aSorters.push(new Sorter(sPath, bDescending));
        // apply the selected sort and group settings
        this.getModel("dataModel").setProperty("/currSortKey",sPath);
        oBinding.sort(aSorters);
    },
    });
});