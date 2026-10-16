sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(Controller, MessageBox,Fragment,MessageToast,Filter, FilterOperator){
    "use strict";

    return Controller.extend("customviewbookshop.controller.View1", {
        onInit() {
        },
        submit:function(){
          var title = this.getView().byId("title").getValue();
          var author = this.getView().byId("author").getValue();
          var price = this.getView().byId("price").getValue();
          var stock = this.getView().byId("stock").getValue();
          var oModel=this.getView().getModel();
          var oContext = oModel.bindList("/Books").create({
            "title":title,
            "author":author,
            "price":price,
            "stock":stock,
          });
          oContext.created().then(()=>{
            MessageBox.success("Products Added");
            this.getView().byId("title").setValue(null);
            this.getView().byId("author").setValue(null);
            this.getView().byId("price").setValue(null);
            this.getView().byId("stock").setValue(null);
          }).catch((err) => {
            MessageBox.error("error adding new products");
          });
        },
        	onCollapseExpandPress() {
			const oSideNavigation = this.byId("sideNavigation"),
				bExpanded = oSideNavigation.getExpanded();

			oSideNavigation.setExpanded(!bExpanded);
		},
        onAddBookPressed(){
         this.hideAllPanels();
         var oPanel=this.byId("Panel1");
         oPanel.setVisible(true);
        },
        onViewDetailsBookPressed(){
         this.hideAllPanels();
         var oPanel=this.byId("Panel2");
         oPanel.setVisible(true);
        },

        onEditBookPressed(){
         this.hideAllPanels();
         var oPanel=this.byId("Panel3");
         oPanel.setVisible(true);
        },

        hideAllPanels(){
            this.byId("Panel1").setVisible(false);
            this.byId("Panel2").setVisible(false);
            this.byId("Panel3").setVisible(false);
        },
        onActionPressed:function(oEvent){
          var oButton=oEvent.getSource();
          var oContext=oButton.getBindingContext();
          this._oSelectionContext=oContext;

          if(!this._oActionSheet){
            Fragment.load({
              id:this.getView().getId(),
              name:"customviewbookshop.view.ActionSheet",
              controller:this

            }).then(function(oActionSheet){
              this._oActionSheet=oActionSheet;
              this.getView().addDependent(this._oActionSheet);
              this._oActionSheet.openBy(oButton);
            }.bind(this));
          }
          else{
            this._oActionSheet.openBy(oButton);
          }
        },
        onDeletePress:function(){
          var oContext=this._oSelectionContext;
          var sBookId= oContext.getProperty("ID");
          MessageBox.confirm("Are you sure?" +sBookId+ "?",{
            actions:[MessageBox.Action.YES, MessageBox.Action.NO],
            onClose:function(oAction){
              if(oAction===MessageBox.Action.YES){
                oContext.delete("$direct").then(function(){
                  MessageBox.success("Book Id"+sBookId+"deleted successfully");
                }).catch(function(oError){
                  MessageBox.error("Error"+sBookId+oError);
                })
              }
            }
          })
        },

        onEditPress:function(){
          var oData=this._oSelectionContext.getObject();
          MessageToast.show("Edit action for Item ID:" + oData.ID);
          this.hideAllPanels();

          // Show Edit panel
          this.byId("Panel3").setVisible(true);
          var product_model=this.getOwnerComponent().getModel();
          let aFilters=[
             new Filter("ID",FilterOperator.EQ,oData.ID)
          ];
          let oBinding=product_model.bindList("/Books");
          oBinding.filter(aFilters);
          oBinding.requestContexts().then((aContexts)=>{
            if(aContexts.length>0){
              aContexts.forEach((oContext)=>{
                let oUser=oContext.getObject();
                this.getView().byId("titleUpdate").setValue(oUser.title);
                this.getView().byId("authorUpdate").setValue(oUser.author);
                this.getView().byId("priceUpdate").setValue(oUser.price);
                this.getView().byId("stockUpdate").setValue(oUser.stock);
                this.getView().byId("itemCode").setValue(oUser.ID);
              });
            }
            else{
              MessageBox.error("No Books found");
            }
          }).catch((oError)=>{
                MessageBox.error("Error while retriving books"+oError);
          });
        },
        updateItem:function(){
          var itemCode = this.getView().byId("itemCode").getValue();
          var title = this.getView().byId("titleUpdate").getValue();
          var author = this.getView().byId("authorUpdate").getValue();
          var price = this.getView().byId("priceUpdate").getValue();
          var stock = this.getView().byId("stockUpdate").getValue();
          var update_oModel=this.getView().getModel();
          var sPath="/Books('"+itemCode+"')";
          var oContext=update_oModel.bindContext(sPath).getBoundContext();

          var oView=this.getView();
          function resetBusy(){
            oView.setBusy(false);
          }
          oView.setBusy(true);
          oContext.setProperty("title",title);
          oContext.setProperty("author",author);
          oContext.setProperty("price",price);
          oContext.setProperty("stock",stock);

          update_oModel.submitBatch("auto").then(function(){
            resetBusy();
            MessageBox.success("Item Details updated");
          }).catch(function(err){
            resetBusy();
            MessageBox.error("An error occured"+err);
          });
          },
    });
});