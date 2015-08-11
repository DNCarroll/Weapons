interface HTMLLIElement extends HTMLElement{
    OriginalClass: string;
    TemplateType: string;
    Rebind();
} 
HTMLLIElement.prototype.Rebind = function () {
    var row = <HTMLLIElement>this;    
    Binding.DataContainer.DataBind(row.DataContainer, row, row.DataObject);
    return row;
}