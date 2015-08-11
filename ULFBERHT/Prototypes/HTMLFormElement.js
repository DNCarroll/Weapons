HTMLFormElement.prototype.Dispose = function () {
    Binding.DataContainer.Dispose(this);
};
HTMLFormElement.prototype.Bind = function (data) {
    var cont = this;
    var elements;
    this.DataObject = data;
    if (Binding.DataContainer.Setup(this)) {
        if (this.DataBindings == null) {
            Binding.DataContainer.SetupDataBindings(cont);
            elements = cont.Get(function (e) { return e.HasDataSet(); });
        }
        else {
            elements = cont.Get(function (e) { return e.ElementBindingIndex != null; });
        }
        elements.forEach(function (e) {
            e.DataObject = data;
            cont.DataBindings.Where(function (d) { return d.ElementBindingIndex == e.ElementBindingIndex; }).forEach(function (b) { return b.Bind(e); });
        });
        elements = null;
        if (Binding.Happened) {
            Binding.Happened(cont);
        }
    }
};
HTMLFormElement.prototype.Rebind = function (field, sender) {
    Binding.DataContainer.Rebind(this, sender, field);
};
//# sourceMappingURL=HTMLFormElement.js.map