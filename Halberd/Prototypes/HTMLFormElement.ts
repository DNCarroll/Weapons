interface HTMLFormElement extends HTMLElement, IDataContainer {       
}
HTMLFormElement.prototype.Dispose = function () {
    Binding.DataContainer.Dispose(this);
};
HTMLFormElement.prototype.Bind = function (data) {
    var cont = <HTMLFormElement>this;
    var elements: Array<HTMLElement>;
    this.DataObject = data;    
    if (Binding.DataContainer.Setup(this)) {
        if (this.DataBindings == null) {
            Binding.DataContainer.SetupDataBindings(cont);
            elements = cont.Get(e=> e.HasDataSet());
        }
        else {
            elements = cont.Get(e=> e.ElementBindingIndex != null);
        }
        elements.forEach(e=> {
            e.DataObject = data;            
            cont.DataBindings.Where(d=> d.ElementBindingIndex == e.ElementBindingIndex).forEach(b=> b.Bind(e));
        });
        elements = null;        
        if (Binding.Happened) {
            Binding.Happened(cont);
        }
    }
};
HTMLFormElement.prototype.Rebind = function (field: string, sender: HTMLElement) {
    Binding.DataContainer.Rebind(<IDataContainer>this, sender, field);
};