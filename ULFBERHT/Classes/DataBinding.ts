class DataBinding {
    private _dataContainer: IDataContainer;
    get DataContainer(): IDataContainer {
        return this._dataContainer;
    }
    set DataContainer(value: IDataContainer) {
        this._dataContainer = value;
    }
    private _target: string;
    get Target(): string {
        return this._target;
    }
    set Target(value: string) {
        this._target = value;
    }
    ElementBindingIndex: number;
    Bind: (element: HTMLElement) => void;    
    Fields: Array<string>;
    DataSource: Array<any>;
    IsEventBinding: boolean;
    private returnParameters: Array<string>;
    private return: (...objs: any[]) => any;
    
    constructor(
        dataContainer: IDataContainer,
        elementBindingIndex: number,
        attribute: string,
        attributeValue: string
        ) {
        this.IsEventBinding = false;
        this.returnParameters = new Array<string>();
        this.Target = null;
        this.ElementBindingIndex = elementBindingIndex;
        this.DataContainer = dataContainer;
        this.Fields = new Array<string>();
        this.Target = attribute;
        if (this.Target && attributeValue) {
            attributeValue = attributeValue.Trim();
            if (this.Target == Binding.Targets.Formatting ||
                this.Target == Binding.Targets.DataSource) {
                attributeValue = attributeValue.indexOf("return") == -1 ? "return " + attributeValue : attributeValue;
            }
            else if (
                this.Target == Binding.Targets.OnFocus ||
                this.Target == Binding.Targets.OnClick ||                
                this.Target == Binding.Targets.OnMouseOut ||
                this.Target == Binding.Targets.OnMouseOver               
            ) {
                attributeValue = attributeValue.indexOf("return") == -1 ? "return " + attributeValue : attributeValue;
                this.IsEventBinding = true;
            }
            if (attributeValue.indexOf("return ") == 0) {                
                this.returnBinding(attributeValue);              
            }            
            else {
                this.Fields.Add(attributeValue);
                this.easyBinding();           
            }
        }        
    }
    Dispose() {
        this.DataContainer = null;
        this.ElementBindingIndex = null;
        this.Bind = null;
        this.Target = null;

        this.Fields = null;
        this.returnParameters = null;
        this.return = null;
    }
    ExecuteReturn(element: HTMLElement): any {
        if (this.return) {
            var arrayOfObjects = new Array<any>();
            var value;
            this.returnParameters.forEach(r=> {
                if (r == "obj") {
                    arrayOfObjects.push(element.DataObject);
                }
                else if (r == "sender") {
                    arrayOfObjects.push(element);
                }
                else {
                    arrayOfObjects.push(element.DataObject[r]);
                }
            })
            return arrayOfObjects.Return(this.return);
        }
        return null;
    }
    HookUpEvent(element:HTMLElement) {        
        switch (this.Target) {
            case Binding.Targets.Checked:
                Binding.Events.Checked(element, this.DataContainer, this, this.Fields[0]);
                break;
            case Binding.Targets.Radio:
                Binding.Events.Radio(element, this.DataContainer, this, this.Fields[0]);
                break;
            case Binding.Targets.Value:
                if (element.tagName == "INPUT" && element["type"] == "text") {
                    if (element["datasource"]) {
                        var datasource = <Array<any>>element["datasource"];
                        var displayMember = this.DataContainer.DataBindings.First(d=> d.Target == Binding.Targets.DisplayMember && d.ElementBindingIndex == element.ElementBindingIndex);
                        var valueMember = this.DataContainer.DataBindings.First(d=> d.Target == Binding.Targets.ValueMember && d.ElementBindingIndex == element.ElementBindingIndex);
                        var displayCountBinding = this.DataContainer.DataBindings.First(d=> d.Target == Binding.Targets.DisplayCount && d.ElementBindingIndex == element.ElementBindingIndex);
                        var displayCount = 8;
                        if (displayCountBinding) {
                            displayCount = parseInt(displayCountBinding.Fields[0]);
                        }
                        AutoSuggest.Hook(<HTMLInputElement>element, datasource, valueMember.Fields[0], displayMember.Fields[0], displayCount);
                    }
                    else {
                        Binding.Events.OnChange(element, this.DataContainer, this, this.Fields[0]);
                    }
                }
                else {
                    Binding.Events.OnChange(element, this.DataContainer, this, this.Fields[0]);
                }
                break;
            case Binding.Targets.Action:
                if (this.Fields[0] == "delete") {
                    Binding.Events.Delete(element, this.DataContainer, this, this.DataContainer.Pks[0]);
                }
                break;            
            default:
                break;
        }        
    }
    private returnBinding(attributeValue: string) {

        var inlineMatches = attributeValue.match(RegularExpression.StandardBindingPattern);
        var method = attributeValue;
        if (method.substring(method.length - 1) != ";") {
            method += ";";
        }
        if (inlineMatches) {
            for (var i = 0; i < inlineMatches.length; i++) {
                if (inlineMatches[i] == "{obj}") {
                    method = method.replace("{obj}", "obj" + i.toString());
                    this.returnParameters.push("obj");
                }
                else if (inlineMatches[i] == "{sender}") {
                    method = method.replace("{sender}", "obj" + i.toString());
                    this.returnParameters.push("sender");
                }
                else {
                    var tempParameter = inlineMatches[i].replace("{", "").replace("}", "");
                    method = method.replace(inlineMatches[i], "obj" + i.toString());
                    this.returnParameters.push(tempParameter);
                    this.Fields.push(tempParameter);
                }
            }
        }

        this.return = Binding.Return(method, this.returnParameters.length);
        if (this.Target != Binding.Targets.Formatting) {
            this.Bind = function (element: HTMLElement): void {                
                var arrayOfObjects = new Array<any>();
                var value;
                this.returnParameters.forEach(rp=> {
                    if (rp == "obj") {
                        arrayOfObjects.push(element.DataObject);
                    }
                    else if (rp == "sender") {
                        arrayOfObjects.push(element);
                    }
                    else {
                        arrayOfObjects.push(element.DataObject[rp]);
                    }
                });
                if (this.IsEventBinding) {
                    if (!element[this.Target]) {
                        var func = this.return;
                        element[this.Target] = function () {
                            arrayOfObjects.Return(func);
                        }
                    }
                }
                else {
                    if (this.Target == Binding.Targets.DataSource && this.DataSource != null) {
                        this.setAttribute(this.DataSource, element);
                    }
                    else {
                        value = arrayOfObjects.Return(this.return);
                        if (this.Target == Binding.Targets.DataSource) {
                            this.DataSource = <Array<any>>value;
                        }
                        this.setAttribute(value, element);
                    }
                }
            };
        }
    }  
    private easyBinding() {
        this.Bind = function (element: HTMLElement): void {
            var value = element.DataObject[this.Fields[0]];
            this.setAttribute(value, element);
            this.HookUpEvent(element);
        };
    }
    private setAttribute(value: any, element:HTMLElement) {
        switch (this.Target) {
            case Binding.Targets.Value:
                if (element.tagName == "INPUT" && element["type"] == "text") {
                    var displayMember = this.DataContainer.DataBindings.First(d=> d.Target == Binding.Targets.DisplayMember && d.ElementBindingIndex == element.ElementBindingIndex);
                    var valueMember = this.DataContainer.DataBindings.First(d=> d.Target == Binding.Targets.ValueMember && d.ElementBindingIndex == element.ElementBindingIndex);
                    if (valueMember) {
                        var input = <HTMLInputElement>element;                        
                        var datasource = <Array<any>>element["datasource"];
                        var displayMember = this.DataContainer.DataBindings.First(d=> d.Target == Binding.Targets.DisplayMember && d.ElementBindingIndex == element.ElementBindingIndex);
                        var valueMember = this.DataContainer.DataBindings.First(d=> d.Target == Binding.Targets.ValueMember && d.ElementBindingIndex == element.ElementBindingIndex);
                        if (datasource && displayMember && valueMember) {
                            var found = datasource.First(o => o[valueMember.Fields[0]] == value);
                            if (found) {
                                input.value = found[displayMember.Fields[0]];
                            }
                        }
                        break;
                    }
                }
                element[this.Target] = value;
                break;
            case Binding.Targets.DataSource:
                var displayMember = this.DataContainer.DataBindings.First(d=> d.Target == Binding.Targets.DisplayMember && d.ElementBindingIndex == element.ElementBindingIndex);
                var valueMember = this.DataContainer.DataBindings.First(d=> d.Target == Binding.Targets.ValueMember && d.ElementBindingIndex == element.ElementBindingIndex);
                if (element.tagName == "SELECT") {
                    var select = <HTMLSelectElement>element;
                    select.Clear();
                    if (displayMember != null && valueMember != null) {
                        select.AddOptions(value, valueMember.Fields[0], displayMember.Fields[0], null);
                    }
                    else {
                        select.AddOptionsViaObject(value, null);
                    }
                }
                else if (element.tagName == "INPUT" && element["type"] == "text") {
                    element["datasource"] = value;
                }
                break;
            case Binding.Targets.ClassName:                
                    element.className = null;
                    element.className = value;
                break;
            case Binding.Targets.For:
                element.setAttribute("for", value);                
                break;
            case Binding.Targets.InnerHtml:
                element.innerHTML = value;                
                break;
            case Binding.Targets.Checked:
                var input = <HTMLInputElement>element;
                input.checked = value ? true : false;                
                break;
            case Binding.Targets.Radio:
                var input = <HTMLInputElement>element;
                if (input.value == value) {
                    input.checked = true;
                }
                else {
                    input.checked = null;
                }
                break;
            case Binding.Targets.Href:
            case Binding.Targets.Src:
            case Binding.Targets.ID:
                element[this.Target] = value;
                break;
            case Binding.Targets.Formatting:   
            case Binding.Targets.OnMouseOut:
            case Binding.Targets.OnMouseOver:
            case Binding.Targets.OnClick:
            case Binding.Targets.Action:
            case Binding.Targets.DisplayMember:
            case Binding.Targets.ValueMember:            
                break;  
            default:
                if (this.Target.indexOf("style") == 0) {
                    this.Target = this.Target.replace("style", "");
                }
                var styleProperty = Convert.ToStyleProperty(this.Target);
                if (styleProperty) {
                    element.style[styleProperty] = value;
                }
                else {
                    element[this.Target] = value;
                }
                break;
        }
    }
}
