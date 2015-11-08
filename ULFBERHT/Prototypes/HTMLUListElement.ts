interface HTMLUListElement extends HTMLElement, IDataContainer {  
    InsertRow(row: HTMLLIElement, beforeElement?: HTMLLIElement);
    InsertAndBind(dataObject: any, beforeElement?: HTMLLIElement): HTMLLIElement;
    AddRow(dataObject: any, beforeElement?: HTMLLIElement): HTMLLIElement;
    SetSelected(obj: any, sender: HTMLLIElement);
    AsyncPosition: number;
    SelectedElement: HTMLLIElement;
    AlreadySetup: boolean;
    Rebind(field: string, sender: HTMLElement);
}
HTMLUListElement.prototype.Dispose = function () {
    Binding.DataContainer.Dispose(this);
};
HTMLUListElement.prototype.Bind = function (data?) {
    var that = <HTMLUListElement>this;
    if (!that.AlreadySetup) {        
        that.AlreadySetup = true;
        Binding.DataContainer.Setup(that);
        Binding.DataContainer.SetupUl(that);
    }
    var tempArray: Array<any>;
    if (Is.Array(data)) {
        tempArray = <Array<any>>data;
    }
    else {
        tempArray = new Array<any>();
        tempArray.push(data);
    }
    that.DataObject = tempArray;
    that.Clear();
    Ajax.ShowProgress();
    if (that.style.display == "none") {
        that.style.display = "table";
    }
    if (that.HeaderHtml) {
        that.HeaderHtml.forEach(h=> {
            var header = <HTMLLIElement>that.AddHtml(h);
            header.DataContainer = that;
            header.TemplateType = "header";
            Binding.DataContainer.LookForInsert(header);
        });
    }
    that.AsyncPosition = 0;
    var endAsync = function () {
        if (that.FooterHtml) {
            that.FooterHtml.forEach(f => {
                var footer = <HTMLLIElement>that.AddHtml(f);
                footer.DataContainer = that;
                footer.TemplateType = "footer";
                Binding.DataContainer.LookForInsert(footer);
                if (that.DataObject && that.DataObject.length > 0) {
                    that.SetSelected(that.DataObject[0], <HTMLLIElement>that.First(e=> e.DataObject == that.DataObject[0]));
                }
            });
        }
        Ajax.HideProgress();
        if (that.ActionEvent != null) {
            that.ActionEvent(new ActionEvent(ActionType.Bound, that.DataObject, null, null));
        }
        if (Binding.Happened) {
            Binding.Happened(that);
        }
    };
    var async = function () {
        var dataObject = that.DataObject[that.AsyncPosition];
        that.InsertAndBind(dataObject);
        that.AsyncPosition = that.AsyncPosition + 1;
        if (that.AsyncPosition == that.DataObject.length) {
            setTimeout(endAsync, 0);
        }
        else {
            setTimeout(async, 0);
        }
    };
    if (data &&
        data.length &&
        that.RowHtml) {
        setTimeout(async, 0);
    }
    else {
        endAsync();
    }
};
HTMLUListElement.prototype.Rebind = function (field: string, sender: HTMLElement) {
    Binding.DataContainer.Rebind(<IDataContainer>this, sender, field);    
};
HTMLUListElement.prototype.InsertRow = function (row: HTMLLIElement, beforeElement?: HTMLLIElement) {
    if (beforeElement) {
        this.insertBefore(row, beforeElement);
    }
    else {
        this.appendChild(row);
    }
};
HTMLUListElement.prototype.InsertAndBind = function (dataObject: any, beforeElement?: HTMLLIElement): HTMLLIElement {
    var that = <HTMLUListElement>this;
    var row = HTMLHelper.UL.CreateRow(that, dataObject);
    that.InsertRow(row, beforeElement);
    Binding.DataContainer.DataBind(that, row, dataObject);
    return row;
};
HTMLUListElement.prototype.AddRow = function (dataObject: any, beforeElement?: HTMLLIElement): HTMLLIElement {
    var that = <HTMLUListElement>this;
    that.DataObject.Add(dataObject);
    var row = HTMLHelper.UL.CreateRow(that, dataObject);
    if (!beforeElement) {
        var elements = that.Get(e=> e.tagName == "LI");
        var pos = elements.length - 1;
        var lookForFooter = true;
        while (lookForFooter) {
            var li = <HTMLLIElement>elements[pos];
            if (li.TemplateType == "footer") {
                beforeElement = li;
            }
            else {
                lookForFooter = false;
            }
            pos--;
            if (pos == 0) {
                lookForFooter = false;
            }
        }
    }
    that.InsertRow(row, beforeElement);
    Binding.DataContainer.DataBind(that, row, dataObject);
    if (Binding.Happened) {
        Binding.Happened(that);
    }
    return row;
};
HTMLUListElement.prototype.SetSelected = function (obj: any, sender: HTMLLIElement) {
    var that = <HTMLUListElement>this;
    if (that.DataObject) {
        if (that.SelectedElement) {
            that.SelectedElement.className = null;
            if (that.SelectedElement.OriginalClass) {
                that.SelectedElement.className = that.SelectedElement.OriginalClass;
            }
        }
        that.SelectedElement = sender;
        if (that.SelectedItemClass) {
            that.SelectedElement.className = null;
            that.SelectedElement.className = that.SelectedItemClass;
        }
        if (that.SelectedItemChanged) {
            that.SelectedItemChanged(obj, that.SelectedElement);
        }
        if (that.Form) {
            that.Form.Bind(obj);
        }
    }
};
