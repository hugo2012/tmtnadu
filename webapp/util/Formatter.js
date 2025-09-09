sap.ui.define([

], function () {
	"use strict";
    return {
            fnAfterRelease :function(sTextData)
            {        
                let a = "";     
                if(sTextData == "")
                {
                    a = "No";               
                }
                else if(sTextData == "X") {
                    a = "Yes";                  
                 }
                 return a; 
            }             
   }; 
});