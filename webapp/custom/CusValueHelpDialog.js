sap.ui.define([
    "sap/base/util/uid",
    "sap/ui/mdc/FilterField",
    "sap/ui/model/FilterOperator",
    "sap/ui/comp/filterbar/FilterGroupItem",
    "sap/ui/comp/filterbar/FilterBar",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    'sap/ui/model/type/String',
    "sap/ui/core/library"
], function (uid,FilterField,FilterOperator,FilterGroupItem,
    FilterBar,ValueHelpDialog,TypeString,coreLibrary) {
	"use strict";
    
    const SortOrder = coreLibrary.SortOrder;
    ValueHelpDialog.prototype.cgAddFilters = function (filters) {
        for (let filter of filters) {
            let path = filter.path;
            const filterField = this.dialogMetadata.columns[path].filterField;
            if(filter){
                if(filter.values[0]){
                    const regex = /\*/g;
                    let a = filter.values[0];
                    a = a.replace(regex, "");
                    filter.values[0] = a;
                }
            }
            filterField.setConditions([filter]);
            this.dialogMetadata.columns[path].filterValues.push(filter);
            this.getFilterBar().fireSearch();
        }
    }

    return  {
        createValueHelp: async function (config) {
            const groupName = uid();
            const filterGroupItems = [];
            const dialogMetadata = {
                columnDefinition: config.columns,
                columns: {},
                filterId2ColId: {},
                modeQuery: config.modeQuery,
                keyFieldName: config.keyField,
                keyFieldName2: config.keyField2,
                oService: config.oService,
                entityName: config.entityName,
                oModel: config.model,
                labelDefinition: config.labelDefinition,
                columnName: config.columnDefiniton,
                inlineCount: config.inlineCount,
                _filterOperator: config._filterOperator
            }
            for (let colDef of config.columns) {
                const searchFieldId = groupName + colDef.name;
                dialogMetadata.columns[colDef.name] = {
                    searchFieldId: searchFieldId,
                    filterValues: [],
                };
                dialogMetadata.filterId2ColId[searchFieldId] = colDef.name;
                const oFilterField = new FilterField({
                    id: searchFieldId,
                    defaultOperator: dialogMetadata._filterOperator ? dialogMetadata._filterOperator : sap.ui.model.FilterOperator.Contains,
                    change: function (oEvent) {
                        const filterID = oEvent.getSource().getId();
                        const colId = dialogMetadata.filterId2ColId[filterID];
                        dialogMetadata.columns[colId].filterValues = oEvent.getParameter("conditions");
                       // console.log(dialogMetadata);
                    }
                });
                if(dialogMetadata._filterOperator)
                {
                    oFilterField.defaultOperator = dialogMetadata._filterOperator; 
                }
                filterGroupItems.push(new FilterGroupItem({
                    groupName: sap.ui.comp.filterbar.FilterBar.INTERNAL_GROUP,
                    name: colDef.name,
                    label: colDef.label,
                    control: oFilterField
                }));
                dialogMetadata.columns[colDef.name].filterField = oFilterField;
            }
            let dialog = await new ValueHelpDialog({
                draggable: false,
                title: config.title,
                supportMultiselect: config.multiSelect,
                supportRanges: false,                   
                key: config.keyField, // Specify the key field
                descriptionKey: "", // Specify the description field
                filterBar: new FilterBar({
                    isRunningInValueHelpDialog: false,
                    advancedMode: true,
                    filterBarExpanded: true,
                    filterGroupItems: filterGroupItems,
                    search: function (oEvent) {
                        dialog.setBusy(true);
                        var oBinding = dialog.getTable().getBinding();     
                        dialogMetadata.oModel.setProperty("/ShipToPartySet", []);                
                        const filter = [];
                        for (let columnId in dialogMetadata.columns) {
                            let conditions = dialogMetadata.columns[columnId].filterValues;
                            let _count = 0;
                            for (let cond of conditions) {
                                if (!cond.isEmpty) {
                                    filter.push(new sap.ui.model.Filter(columnId,
                                        FilterOperator[cond.operator],
                                        cond.values));
                                }
                            }
                        }
                        //debugger;
                       // if (filter.length > 0) {
                             if(dialogMetadata.modeQuery == 2)
                            {
                                 switch(dialogMetadata.entityName)
                                 {
                                     
                                    case "Uname":    
                                    dialogMetadata.oService.getGetUname(filter).then(
                                        function (oData) {   
                                           // debugger;
                                            dialogMetadata.oModel.setProperty("/ShipToPartySet", []);
                                            dialogMetadata.oModel.setProperty("/ShipToPartySet", oData.results);
                                            dialogMetadata.oModel.setProperty("/FieldsSetInlineCount",  0);     
                                            var p = oData.__count - 2;
                                            dialogMetadata.oModel.setProperty("/FieldsSetInlineCount",  p);  
                                            dialog.update();
                                            dialog.setBusy(false);
                                        }.bind(this),
                                        function (oError) {
                                            dialog.setBusy(false);
                                        }.bind(this)
                                        );  
                                        break;  
                                        case "OutputDevice":    
                                        dialogMetadata.oService.getOutputDeviceSet(filter).then(
                                            function (oData) {   
                                               // debugger;
                                                dialogMetadata.oModel.setProperty("/ShipToPartySet", []);
                                                dialogMetadata.oModel.setProperty("/ShipToPartySet", oData.results);
                                                dialogMetadata.oModel.setProperty("/FieldsSetInlineCount",  0);     
                                                var p = oData.__count - 2;
                                                dialogMetadata.oModel.setProperty("/FieldsSetInlineCount",  p);  
                                                dialog.update();
                                                dialog.setBusy(false);
                                            }.bind(this),
                                            function (oError) {
                                                dialog.setBusy(false);
                                            }.bind(this)
                                            );  
                                            break;       
                                            case "OutputType":    
                                            dialogMetadata.oService.getOutputType(filter).then(
                                                function (oData) {   
                                                   // debugger;
                                                    dialogMetadata.oModel.setProperty("/ShipToPartySet", []);
                                                    dialogMetadata.oModel.setProperty("/ShipToPartySet", oData.results);
                                                    dialogMetadata.oModel.setProperty("/FieldsSetInlineCount",  0);     
                                                    var p = oData.__count - 2;
                                                    dialogMetadata.oModel.setProperty("/FieldsSetInlineCount",  p);  
                                                    dialog.update();
                                                    dialog.setBusy(false);
                                                }.bind(this),
                                                function (oError) {
                                                    dialog.setBusy(false);
                                                }.bind(this)
                                                );  
                                            break;                                                                       
                                 }                                                                                                                           
                            }                                                        
                        //}                      
                    }.bind(this)
                }), ok: function (oEvent) {
                    var token = oEvent.getParameter("tokens");
                    if (token.length > 0) {
                        var selectedRows = token.map(item => item.data().row)
                        //console.log("Selected Row", selectedRows);                         
                        if (config.ok) {
                            config.ok(selectedRows);
                        }
                        dialog.close();                       
                    }
                    dialog.close();
                    // console.log(token);
                }, cancel: function (oEvent) {
                    // Handle the case when the user cancels the dialog
                    // You can add any specific logic or reset values here
                    dialog.setBusy(false);
                    dialog.close();
                }, afterClose: function (oEvent) {
                    dialog.setBusy(false);
                    //dialog.close();
                    dialog.destroy();
                }.bind(this),
                beforeOpen: function(oEvent){
                    let o_FilterBar = dialog.getFilterBar();
                    o_FilterBar.setBusyIndicatorDelay(2000);
                    let _timeout = jQuery.sap.delayedCall(500, this, function() {
                        dialog.setBusy(true);
                    });
                }.bind(this)
            });
                let o_FilterBar = dialog.getFilterBar();
                o_FilterBar.addEventDelegate({
                    onAfterRendering:   function() {
                        //debugger;
                       //console.log("load Filterbar");
                       setTimeout(function () {
                        //o_FilterBar.filterBarExpanded = true;
                       // o_FilterBar.setShowAllFilters(true);
                       //o_FilterBar.setBusy(true);
                       o_FilterBar.setBusyIndicatorDelay(500);
                        let _timeout = jQuery.sap.delayedCall(500, this, function() {
                            dialog.setBusy(false);
                        });
                       //o_FilterBar.setBusy(false);
                       }.bind(this), 500);
                    }})
                     var oTable = await dialog.getTableAsync();
                     
                    // oTable.setProperty("threshold", 15);
                    // oTable.setProperty("enableBusyIndicator", true);
                        oTable.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
                        oTable.setThreshold(15);
                        oTable.setEnableSelectAll(true);
                        oTable.setEnableBusyIndicator(true);
                        //oTable.attachRowsUpdated(this.fnOnFirstTableUpdated , this);                
                    setTimeout(function () {  
                       // debugger;
                          config.model.setProperty("/FieldsSetInlineCount",  0);     
                          config.model.setProperty("/FieldsSetInlineCount",  dialogMetadata.inlineCount);                  
                          oTable.setModel(config.model);
                           if (oTable.bindRows) {
                               //debugger;
                               let m = 0;
                               for (let colDef of config.columns) {
                                  m = m + 1;
                                let _oCol = new sap.ui.table.Column({label: colDef.label,  sortProperty: colDef.name,template: colDef.path});
                                    oTable.addColumn(_oCol);
                                  if(m == 1)
                                  {
                                    oTable.sort(_oCol, SortOrder.Ascending);
                                    this._sortKeyfield = _oCol;
                                  }  
                               }
                               oTable.bindRows(config.basePath);
                               oTable.sort(this._sortKeyfield , SortOrder.Ascending);
                               oTable.addEventDelegate( {
                                   dataReceived:  function() {
                                   // debugger;
                                    oTable.sort(this._sortKeyfield , SortOrder.Ascending);
                                    }.bind(this)
                                },this);
                           } else {
                               const cells = [];
                               for (let colDef of config.columns) {
                                   oTable.addColumn(new sap.m.Column({header: new sap.m.Label({text: colDef.label})}));
                                   cells.push(new sap.m.Text({text: `{${colDef.path}}`}));
                               }
                               //debugger;
                               oTable.bindItems(config.basePath, new sap.m.ColumnListItem({
                                   cells: cells
                               }));
                           }
                           dialog.dialogMetadata = dialogMetadata;
                            if (config.preFilters.length>0) {
                                dialog.cgAddFilters(config.preFilters);
                            }
                           dialog.update(); 
                    }.bind(this), 500);
                                         
            // dialog.setTable(oTable);
            return dialog; 
        },
        fnOnFirstTableUpdated: function (e) {			 
            if( e.oSource.getModel().getProperty("/FieldsSetInlineCount"))
            {
                var sTotal = e.oSource.getModel().getProperty("/FieldsSetInlineCount");         
                if(sTotal >= 100)
                {
                   var sTitle = "Items (More than 100)" ;
                   // e.oSource.setTitle(sTitle);
                 //  this.getView().byId("dynamicTableTitle").setText(sTitle);
                   //console.log("update table finished");
                }
            }
		}  ,
        fnCreateBindingColumn : function(_oLabels,_oColumns,oModel)
        {
            let _ColumnFields = [];
            let arrCols = [];
            const fieldName = "Field";
            let fullFieldName ="";
            let fullFieldNameMain ="";
            let pathFieldName ="";
            let yy = 0;
            let xx = 0;
            var aModel = "";
            if(!oModel){
                aModel = "dataModel>"
            }
            else{
                 aModel = oModel;
            }
            for(var k = 0; k<_oLabels.length; k++)
            {
                for(var l =0; l<11; l++)
                {      
                    xx = l ;
                    yy = xx + 1;  
                    fullFieldName =   fieldName + yy.toString();
                    if(!_oLabels[k][fullFieldName])
                    {
                        break;
                    }                         
                    arrCols = _oColumns[0];                       
                    fullFieldNameMain = arrCols[fullFieldName];     
                    pathFieldName = aModel + fullFieldNameMain;      
                    _ColumnFields.push({
                    label: _oLabels[k][fullFieldName], name: fullFieldNameMain  , path: pathFieldName
                    });
                }
                break;
            }   
            return _ColumnFields;          
        },

        fnReGenerateOdataSetF4 : function(_oLabels,_oColumns,aData,modelName){
            //let aData = pageModel.getProperty("/CommonFieldsSet")
            let arrFieldsSet = [];
            const fieldName = "Field";
            let fullFieldName ="";
            let yy = 0;
            let xx = 0;
            var arrLabels = _oLabels[0];
            for (var k=0; k<_oColumns.length; k++) 
            {
                for(var b=0; b<aData.length;b++)
                {
                    var data = new Array();
                    for(var l =0; l<11; l++)
                    {
                        xx = l ;
                        yy = xx + 1;  
                        fullFieldName =   fieldName + yy.toString();
                        if(!arrLabels[fullFieldName])
                        {
                        break;
                        }     
                        var a = _oColumns[k][fullFieldName];
                        data[a] = aData[b][a];
                    }
                    arrFieldsSet.push(data);
                }
                break;
            }
            return arrFieldsSet;
        }   ,
        fnReGenerateOdataSet : function(_oLabels,_oColumns,aData,modelName){
            //let aData = pageModel.getProperty("/CommonFieldsSet")
            let arrFieldsSet = [];
            const fieldName = "Field";
            let fullFieldName ="";
            let yy = 0;
            let xx = 0;
            var arrLabels = _oLabels[0];
            for (var k=0; k<_oColumns.length; k++) 
            {
                for(var b=0; b<aData.length;b++)
                {
                    var data = new Array();
                    for(var l =0; l<11; l++)
                    {
                        xx = l ;
                        yy = xx + 1;  
                        fullFieldName =   fieldName + yy.toString();
                        if(!arrLabels[fullFieldName])
                        {
                        break;
                        }     
                        var a = _oColumns[k][fullFieldName];
                        data[a] = aData[b][fullFieldName];
                    }
                    arrFieldsSet.push(data);
                }
                break;
            }
            return arrFieldsSet;
        }       
   }; 
});