class ActionEvent {
    ActionType: ActionType;
    Cancel: boolean;
    Object: any;
    Field: string;
    Value: any;
    constructor(actionType: ActionType, obj: any, field:string, value:any) {
        this.Cancel = false;
        this.ActionType = actionType;
        this.Object = obj;
        this.Field = field;
        this.Value = value;
    }
}
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
            //is it complex?
            //yes then its return 
            //other wise its easy
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
                if (this.Target.indexOf("-")>-1)
                {
                    var split = this.Target.split("-");
                    if (split.length > 1)
                    {
                        element.style[split[0]][split[1]] = value;
                    }
                }
                else if (Is.Style(this.Target)) {
                    element.style[this.Target] = value;                    
                    break;
                }
                else {                    
                    element[this.Target] = value;
                }
                break;
        }
    }
}
enum DialogType { Modal, Popup, Quick, Standard }
enum DialogPosition { MiddleOfWindow, Below, Above, Manual = 100 }
enum DialogResult { No, Yes, Ok }
enum ButtonType { InputButton, Anchor, ImageButton }
class DialogButton {
    Text: string;
    ClassName: string;
    ButtonType: ButtonType;
    ImageSrc: string;
    constructor(text: string, buttonType?: ButtonType, className?: string) {
        this.Text = text;
        this.ClassName = className;
        this.ButtonType = buttonType == null ? ButtonType.InputButton : buttonType;
//        this.ImageSrc = imageSrc;
    }
}
class DialogProperties {
    DialogType: DialogType;
    Target: HTMLElement;
    HideInterval: number;
    Position: DialogPosition;
    ModalClass: string;
    Container: HTMLElement;
    OffSetY: number;
    OffSetX: number;
    IsActive: boolean;
    Interval: any;
    Modal: HTMLElement;
    constructor(container: HTMLElement, dialogType: DialogType, target?: HTMLElement,
        hideInterval?: number, position?: DialogPosition, modalClass?: string,
        offSetX?: string, offsetY?: string) {
        this.DialogType = dialogType;
        this.Target = target;
        this.Container = container;
        this.Container["DialogProperties"] = this;
        this.OffSetX = Convert.EmValueToPixelValue(offSetX);
        this.OffSetY = Convert.EmValueToPixelValue(offsetY);
        this.IsActive = false;
        this.Interval = null;
        this.Modal = null;
        this.ModalClass = modalClass;
        if (hideInterval == null)
        {
            if (this.DialogType == DialogType.Popup || this.DialogType == DialogType.Quick)
            {
                this.HideInterval = Dialog.DefaultHideInterval;
            }
            else
            {
                this.HideInterval = -1;
            }
        }
        else {
            this.HideInterval = hideInterval;
        }
        if (position != DialogPosition.Manual)
        {
            if (position == null && this.Target == null)
            {
                this.Position = DialogPosition.MiddleOfWindow;
            }
            else if (position == null && this.Target != null)
            {
                this.Position = DialogPosition.Below;
            }
            else {
                this.Position = position;
            }
        }
        else {
            this.Position = DialogPosition.Manual;
        }
    }
}
module Dialog {
    export function Confirm(message: string,
        onclick: (dialogResult: DialogResult) => void,
        title?: string,
        target?: HTMLElement,
        modalClass?: string,
        yesButton?: DialogButton,
        noButton?: DialogButton,
        containerStyle?: any,
        titleStyle?: any,
        position?: DialogPosition) {
        yesButton = yesButton == null ? new DialogButton("Yes", ButtonType.InputButton) : yesButton;
        noButton = noButton == null ? new DialogButton("No", ButtonType.InputButton) : noButton;
        title = title == null ? "&nbsp;" : title;
        var container = "ul".CreateElement();
        var liTitle = "li".CreateElement();
        var divTitle = "div".CreateElement({ innerHTML: title });
        divTitle.Set(titleStyle);
        liTitle.appendChild(divTitle);
        var liMessage = "li".CreateElement();
        var divMessage = "div".CreateElement({ innerHTML: message });
        liMessage.appendChild(divMessage);
        var liDialog = "li".CreateElement();
        var divDialog = "div".CreateElement();
        var ulDialogContainer = "ul".CreateElement({ width: "100%" });
        divDialog.appendChild(ulDialogContainer);
        liDialog.appendChild(divDialog);
        var liSubDialog = "li".CreateElement();
        var divButton = "div".CreateElement();
        liSubDialog.appendChild(divButton);
        ulDialogContainer.appendChild(liSubDialog);
        divButton.appendChild(getDialogButton(onclick, noButton, DialogResult.No, container));
        divButton.appendChild(getDialogButton(onclick, yesButton, DialogResult.Yes, container));
        setUL(container);
        setUL(ulDialogContainer);
        setLI(liTitle);
        setDiv(divTitle, "left", ".25em .25em");
        divTitle.style.borderBottom = "1px solid #999";
        divTitle.style.backgroundColor = "#C0C0C0";
        setLI(liMessage);
        setDiv(divMessage, "center", "1em 1em");
        setLI(liDialog);
        setDiv(divDialog, "left", "0em 0em");
        container.style.border = "1px solid #999";
        container.Set(containerStyle);
        container.appendChild(liTitle);
        container.appendChild(liMessage);
        container.appendChild(liDialog);
        if (position == null) {
            position = target == null ? DialogPosition.MiddleOfWindow : DialogPosition.Below;
        }
        if (modalClass == null) {
            Dialog.Show(container, DialogType.Standard, target, null, position);
        }
        else {
            Dialog.Modal(container, modalClass, position, null, target);
        }
    }
    export function Ok(message: string,
        title?: string,
        target?: HTMLElement,
        modalClass?: string,
        okButton?: DialogButton,
        containerClass?: string,
        titleClass?: string) {
        okButton = okButton == null ? new DialogButton("Ok", ButtonType.InputButton) : okButton;
        title = title == null ? "&nbsp;" : title;
        var container = "ul".CreateElement();
        var liTitle = "li".CreateElement();
        var divTitle = "div".CreateElement({ innerHTML: title });
        if (titleClass != null) {
            divTitle.className = titleClass;
        }
        liTitle.appendChild(divTitle);
        var liMessage = "li".CreateElement();
        var divMessage = "div".CreateElement({ innerHTML: message });
        liMessage.appendChild(divMessage);
        var liDialog = "li".CreateElement();
        var divDialog = "div".CreateElement();
        var ulDialogContainer = "ul".CreateElement({ width: "100%" });
        divDialog.appendChild(ulDialogContainer);
        liDialog.appendChild(divDialog);
        var liSubDialog = "li".CreateElement();
        var divButton = "div".CreateElement();
        liSubDialog.appendChild(divButton);
        ulDialogContainer.appendChild(liSubDialog);
        divButton.appendChild(getDialogButton((r: DialogResult) => { }, okButton, DialogResult.Ok, container));
        if (containerClass != null) {
            container.className = containerClass;
        }
        else {
            setUL(container);
            setUL(ulDialogContainer);
            setLI(liTitle);
            setDiv(divTitle, "left", ".25em .25em");
            divTitle.style.borderBottom = "1px solid #999";
            divTitle.style.backgroundColor = "#C0C0C0";
            setLI(liMessage);
            setDiv(divMessage, "center", "1em 1em");
            setLI(liDialog);
            setDiv(divDialog, "left", "0em 0em");
            container.style.border = "1px solid #999";
        }
        container.appendChild(liTitle);
        container.appendChild(liMessage);
        container.appendChild(liDialog);
        if (modalClass == null) {
            Dialog.Show(container, DialogType.Standard, target, null, target == null ? DialogPosition.MiddleOfWindow : DialogPosition.Below);
        }
        else {
            Dialog.Modal(container, modalClass, target == null ? DialogPosition.MiddleOfWindow : DialogPosition.Below, null, target);
        }
    }
    function setUL(ul: HTMLElement) {
        ul.style.display = "table";
        ul.style.borderCollapse = "collapse";
        ul.style.listStyleType = "none";
        ul.style.margin = "0px 0px";
        ul.style.padding = "0px 0px";
        ul.style.backgroundColor = "#fff";
    }
    function setLI(li: HTMLElement) {
        li.style.display = "table-row";
        li.style.listStyle = "none";
    }
    function setDiv(div: HTMLElement, textAlign: string, padding: string) {
        div.style.display = "table-cell";
        div.style.verticalAlign = "middle";
        div.style.textAlign = textAlign;
        div.style.padding = padding;
    }
    function getDialogButton(onclick: (dialogResult: DialogResult) => void, dialogButton: DialogButton, dialogResult: DialogResult, container: HTMLElement, containerClass?: string) {
        var button: HTMLElement;
        switch (dialogButton.ButtonType) {
            case ButtonType.Anchor:
                button = "a".CreateElement({ innerHTML: dialogButton.Text.toString() });
                break;
            //case ButtonType.ImageButton:
            //    break;
            case ButtonType.InputButton:
                button = "input".CreateElement({ type: "button", value: dialogButton.Text.toString() });
                break;
        }
        if (dialogButton.ClassName) {
            button.className = dialogButton.ClassName.toString();
        }
        dialogButton = null;
        button.onclick = function () {
            onclick(dialogResult);
            Dialog.Hide(container);
        };
        if (containerClass == null) {
            button.style.margin = ".5em .5em";
            if (dialogResult == DialogResult.No) {
                button.style.cssFloat = "left";
            }
            else {
                button.style.cssFloat = "right";
            }
        }
        return button;
    }
    export var DefaultHideInterval = 1500;
    export function Popup(elementToShow: HTMLElement, target?: HTMLElement, position?: DialogPosition, hideInterval?: number) {
        Show(elementToShow, DialogType.Popup, target, hideInterval, position);
    }    
    export function Modal(elementToShow: HTMLElement, modalClass: string, position?: DialogPosition, hideInterval?: number, target?: HTMLElement) {
        Show(elementToShow, DialogType.Modal, target, hideInterval, position, modalClass);
    }    
    export function Quick(elementToShow: HTMLElement, target?: HTMLElement, position?: DialogPosition) {
        Show(elementToShow, DialogType.Quick, target, Dialog.DefaultHideInterval, position);
    }    
    export function Standard(dialogProperties: DialogProperties) {               
        var elementToShow = dialogProperties.Container;
        if (dialogProperties.DialogType == DialogType.Modal)
        {
            var winDim = window.Dimensions();
            dialogProperties.Modal = "div".CreateElement({ cls: dialogProperties.ModalClass });
            dialogProperties.Modal.style.height = winDim.Height.toString() + "px";
            dialogProperties.Modal.style.display = "block";
            dialogProperties.Modal.style.left = "0px";
            dialogProperties.Modal.style.top = "0px";
            dialogProperties.Modal.style.width = winDim.Width.toString() + "px";
            dialogProperties.Modal.style.position = "absolute";
            document.body.appendChild(dialogProperties.Modal);
        }
        document.body.appendChild(elementToShow);
        SetPosition(elementToShow, dialogProperties);
        if (dialogProperties.HideInterval > -1)
        {
            elementToShow.AddListener("onmouseover", function () { dialogProperties.IsActive = true; });
            elementToShow.AddListener("onmouseout", function () { dialogProperties.IsActive = false; });
            dialogProperties.Interval = setInterval(function () {
                if (!dialogProperties.IsActive) {
                    Dialog.Hide(elementToShow);
                }
            }, dialogProperties.HideInterval);
        }
    }   
    export function Show(elementToShow: HTMLElement, dialogType: DialogType, target?: HTMLElement, hideInterval?: number, position?: DialogPosition, modalClass?: string) {
        var offsetx = elementToShow["OffSetX"] ? elementToShow["OffSetX"] : "0";
        var offsety = elementToShow["OffSetY"] ? elementToShow["OffSetY"] : "0";
        var dp = new DialogProperties(elementToShow, dialogType, target, hideInterval, position, modalClass, offsetx, offsety);
        Standard(dp);
    }
    export function SetPosition(elementToShow: HTMLElement, dialogProperties: DialogProperties) {
        var x: number = 0;
        var y: number = 0;
        var dim = elementToShow.Dimensions();
        switch (dialogProperties.Position) {
            case DialogPosition.MiddleOfWindow:
                var winDim = window.Dimensions();                
                y = (winDim.Height - dim.height) / 2;
                x = (winDim.Width - dim.width) / 2;
                break;            
            case DialogPosition.Below:
                var targetDetails = dialogProperties.Target.DimAndOff();
                y = targetDetails.Top + targetDetails.Height;
                x = targetDetails.Left;
                break;
            case DialogPosition.Above:
                var targetDetails = dialogProperties.Target.DimAndOff();
                y = targetDetails.Top - dim.height;
                x = targetDetails.Left;
                break;
            case DialogPosition.Manual:
            default:
                break;
        }
        if (dialogProperties.Position != DialogPosition.Manual)
        {
            if (dialogProperties.OffSetX) {
                x += dialogProperties.OffSetX;
            }
            if (dialogProperties.OffSetY) {
                y += dialogProperties.OffSetY;
            }
            elementToShow.style.left = x.toString() + "px";
            elementToShow.style.top = y.toString() + "px";
            elementToShow.style.position = "absolute";
        }
    }
    export function Hide(obj) {
        var ele: HTMLElement;        
        if (Is.String(obj))
        {
            var temp = <string>obj;
            ele = temp.Element();
        }
        else if (Is.Element(obj))
        {
            ele = <HTMLElement>obj;
        }  
        if (ele)
        {
            var dp = <DialogProperties>ele["DialogProperties"];
            if (dp != null) {
                if (dp.HideInterval > -1) {
                    clearInterval(dp.Interval);
                }
                if (dp.Modal) {
                    dp.Modal.Remove();
                }
            }
            ele.Remove();
        }
    }
}
class Route {
    Key: any;
    Parameters: Array<any>;
    View: IView;
    constructor(key: any, parameters: Array<any>, view: IView) {
        this.Key = key;
        this.Parameters = parameters;
        this.View = view;        
    }
    Show() {
        //get the html 
        //set the ViewContainer inner html
        var url = "RouteKey" + this.Key.toString();
        var found = sessionStorage.getItem(url);
        var callback = this.SetHTML;
        var view = this.View;
        var router = this;
        if (!found || window["IsDebug"]) {            
            Ajax.Html(this.View.ViewUrl, function (result) {
                if (result) {
                    view.Preload(this);
                    sessionStorage.setItem(url, result);
                    callback(result, view, router);
                }
            });
        }
        else {
            this.SetHTML(found, this.View, this);
        }
    }
    SetHTML(html: string, view: IView, route: Route) {
        view.Preload(this);
        view.Container.innerHTML = html;
        var elements = view.Container.Get(ele=> {
            return !Is.NullOrEmpty(ele.getAttribute(Binding.Attributes.Auto));
        });
        for (var i = 0; i < elements.length; i++) {
            Binding.DataContainer.Auto(elements[i]);
        }
        if (view.Loaded) {
            view.Loaded(route);
        }
    }
}
enum ActionType {
    Deleted,
    Deleting,
    Inserted,
    Inserting,
    Updated,
    Updating
}
interface IDataContainer extends HTMLElement {
    WebApi: string;
    Pks: Array<string>;
    ActionEvent: (actionTypeEvent: ActionEvent) => void;
    Bind(data?, appendData?: boolean);
    DataBindings: Array<DataBinding>;
    Rebind(field: string, sender: HTMLElement);
    Dispose();
    HeaderHtml: string[];
    FooterHtml: string[];
    RowHtml: string;
    Form: HTMLFormElement;
    SelectedItemChanged: (obj: any, sender:HTMLElement) => void;
    SelectedItemClass: string;
    //just add the UL specific stuff here for ease and clean code allowing the form and ul to use the same setup method?
} 
interface IView {
    Key: any;
    Url: (route: Route) => string;
    UrlTitle: (route: Route) => string;    
    Preload: (route: Route) => void;
    Loaded: (route: Route) => void;
    ViewUrl: string;
    Container: HTMLElement;
}
module Accordion {
    export function Hook(ele: HTMLElement, parentRule?) {
        if (!parentRule) {
            parentRule = ".accordion";
        }
        var accordions = ele.Get(function (obj) {
            return !Is.NullOrEmpty(obj.getAttribute("data-accordion"));
        });
        accordions.forEach(a=> {
            a.className = null;
            a.className = Accordion.MaximumClass(a, parentRule);
        });
    }
    export function MaximumClass (ele:HTMLElement, parentRule?) {
        var className = parentRule + " input:checked ~ article.Max" + ele.id;
        //find does it already exists
        //yes? then mod it to be like this one
        var style = null;
        var mysheet = <CSSStyleSheet>Accordion.GetStyleSheet("mainSheet");
        var rules = Accordion.GetStyleSheetRules(mysheet);
        for (var i = 0; i < rules.length; i++) {
            var r = rules[i];
            if (r.selectorText.indexOf(className) > -1) {
                style = r.style;
                style.height = ele.style.maxHeight;
            }
        }
        if (!style) {
            mysheet.insertRule(className + "{ height:" + ele.style.maxHeight + "}", 0);
        }
        return "Max" + ele.id;
    }
    export function GetStyleSheet(name) {        
        for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i];
            if (sheet.title == name) {
                return sheet;
            }
        }
    }
    export function GetStyleSheetRules (styleSheet) : Array<any> {
        var rules = document.all ? 'rules' : 'cssRules';
        return <Array<any>>styleSheet[rules];
    }
}
module Ajax {
    export var Host: string = "";
    export var UseAsDateUTC = false;
    export var AutoConvert: boolean = true;
    export var ProgressElement: HTMLElement = null;
    export var DisableElement: any = null;
    export var DefaultHeader: (url: string) => any; 
    export function Resolver(...subDirectories: string[]) {
        var split = window.SplitPathName()[0].toLowerCase();
        var host = window.location.href.replace(window.location.pathname, "");
        for (var i = 0; i < subDirectories.length; i++) {
            if (subDirectories[i].toLowerCase() == split) {
                Ajax.Host = host + "/" + subDirectories[i], true; break;
            }
        }
    }   
    export function ConvertProperties(object) {
        var keyMap: Array<any>;
        if (Is.Array(object)) {
            for (var i = 0; i < object.length; i++) {
                var obj = object[i];
                if (obj) {
                    try {
                        if (keyMap == null) {
                            keyMap = Ajax.getKeyMap(obj);
                        }
                    } catch (e) {
                        if (window.Exception) {
                            window.Exception(e);
                        }                        
                    }
                    Ajax.setValues(obj, keyMap);
                }
                for (var prop in obj) {
                    Ajax.ConvertProperties(obj[prop]);
                }
            }
        }
        else if (Is.Object(object)) {
            var keyMap = getKeyMap(object);
            setValues(object, keyMap);
            for (var prop in object) {
                ConvertProperties(object[prop]);
            }
        }
    }
    export function getKeyMap(obj): Array<any> {
        var keyMap = new Array();
        for (var prop in obj) {
            var val = obj[prop];
            if (val && Is.String(val)) {
                val = val.Trim();
                if (val.indexOf("/Date(") == 0 || val.indexOf("Date(") == 0) {
                    keyMap.push({ Key: prop, Type: "Date" });
                }
                else if (val.match(RegularExpression.UTCDate)) {
                    keyMap.push({ Key: prop, Type: "UTCDate" });
                }
                else if (val.match(RegularExpression.ZDate)) {
                    keyMap.push({ Key: prop, Type: "ZDate" });
                }
            }
        }
        return keyMap;
    }
    export function HandleOtherStates(xmlhttp) {
        if (xmlhttp.readyState == 4) {
            Ajax.HideProgress();
            if (xmlhttp.status == 404) {
                if (window.Exception) {
                    window.Exception("404 file not found.", xmlhttp);
                }
            }
            else if (xmlhttp.status == 500) {
                if (window.Exception) {
                    window.Exception("500 error.", xmlhttp);
                }
            }
            else {
                if (window.Exception) {
                    window.Exception("Unhandled status:" + xmlhttp.status, xmlhttp);
                }
            }
        }
    }
    export function HideProgress() {
        if (Ajax.ProgressElement != null) {
            Ajax.ProgressElement.style.display = "none";
        }
        if (Ajax.DisableElement) {
            if (Is.Array(Ajax.DisableElement)) {                
                for (var i = 0; i < Ajax.DisableElement.length; i++) {
                    Ajax.DisableElement[i].removeAttribute("disabled");
                }
            }
            else {
                Ajax.DisableElement.removeAttribute("disabled");
            }
        }
    }
    export function setValues(obj, keyMap: Array<any>) {
        for (var j = 0; j < keyMap.length; j++) {
            var key = keyMap[j].Key;
            var type = keyMap[j].Type;
            var val = obj[key];
            switch (type) {
                case "Date":
                    if (val) {
                        val = val.substring(6);
                        val = val.replace(")/", "");
                        val = parseInt(val);
                        if (val > -62135575200000) {
                            val = new Date(val);
                            obj[key] = val;
                        }
                        else {
                            delete obj[key];
                        }
                    }
                    else {
                        obj[key] = new Date();
                    }
                    break;
                case "UTCDate":
                case "ZDate":
                    var tempDate = new Date(val);
                    if (UseAsDateUTC) {
                        tempDate = new Date(tempDate.getUTCFullYear(), tempDate.getUTCMonth(), tempDate.getUTCDate());
                    }
                    else if (Is.Chrome()) {
                        var offset = new Date().getTimezoneOffset();
                        tempDate = tempDate.Add(0, 0, 0, 0, offset);
                    }
                    obj[key] = tempDate;
                    break;
                default:
                    break;
            }
        }
    }
    export function ShowProgress() {
        if (Ajax.ProgressElement) {
            Ajax.ProgressElement.style.display = "inline";
        }
        if (Ajax.DisableElement) {
            if (Is.Array(Ajax.DisableElement)) {
                for (var i = 0; i < Ajax.DisableElement.length; i++) {
                    Ajax.DisableElement[i].setAttribute("disabled", "disabled");
                }
            }
            else {
                Ajax.DisableElement.setAttribute("disabled", "disabled");
            }
        }
    }
    export function Submit(method, url, parameters, returnMethod, contentType) {
        var tempUrl = url;
        Ajax.ShowProgress()
        if (url.indexOf("http") == -1 && Ajax.Host != "") {
            tempUrl = Ajax.Host + (url.indexOf("/") == 0 ? url : "/" + url);
        }
        // code for IE7+, Firefox, Chrome, Opera, Safari
        var xmlhttp = new XMLHttpRequest();
        if (xmlhttp) {
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && (xmlhttp.status == 200 || xmlhttp.status == 204)) {
                    Ajax.HideProgress();
                    returnMethod(xmlhttp.responseText);
                }
                else {
                    Ajax.HandleOtherStates(xmlhttp);
                }
            };
            xmlhttp.open(method, tempUrl, true);
            if (contentType) {
                xmlhttp.setRequestHeader("content-type", !Is.FireFox() ? contentType : "application/json;q=0.9");
            }
            if (Ajax.DefaultHeader != null) {
                var header = Ajax.DefaultHeader(tempUrl);
                if (header) {
                    for (var prop in header) {
                        xmlhttp.setRequestHeader(prop, header[prop]);
                    }
                }
            }
            try {
                if (parameters) {
                    if (contentType == "application/json; charset=utf-8") {
                        var json = JSON.stringify(parameters);
                        json = json.replace(/\\\"__type\\\"\:\\\"[\w+\.?]+\\\"\,/g, "");
                        json = json.replace(/\"__type\"\:\"[\w+\.?]+\"\,/g, "");
                        json = json.replace(/<script/ig, "");
                        json = json.replace(/script>/ig, "");
                        xmlhttp.send(json);
                    }
                    //handles file uploads
                    else {
                        xmlhttp.send(parameters);
                    }
                }
                else {
                    xmlhttp.send();
                }
            } catch (e) {
                Ajax.HideProgress()
                if (window.Exception) {
                    window.Exception(e);
                }
            }
        }
    }
    export function HttpAction(httpAction, url, parameters, successMethod?, isRaw?: boolean) {
        var returnMethod = function (response) {
            if (successMethod) {
                var ret = response;
                if (!isRaw && !Is.NullOrEmpty(ret)) {
                    try {
                        ret = JSON.parse(ret);
                        if (ret.d) {
                            ret = ret.d;
                        }
                        if (Ajax.AutoConvert) {
                            Ajax.ConvertProperties(ret);
                        }
                    }
                    catch (e) {                        
                        if (window.Exception) {
                            window.Exception(e);
                        }
                    }
                }
                successMethod(ret);
            }
        };
        Ajax.Submit(httpAction, url, parameters, returnMethod, "application/json; charset=utf-8");
    }
    export function Html(url, callBack: (result: any) => void) {
        var stored = sessionStorage.getItem(url);
        if (!stored) {
            Ajax.HttpAction("GET", url, {}, function (result) {
                sessionStorage.setItem(url, result);
                callBack(result);
            }, true);
        }
        else {
            callBack(stored);
        }
    }
} 
module AutoSuggest {
    function onKeyPress(e) {
        var key;
        var sender = null;
        var shiftKey = true;
        if (window.event) {
            key = e.keyCode;
            sender = <HTMLInputElement>window.event.srcElement;
            shiftKey = e.shiftKey;
        }
        else if (e) {
            key = e.which;
            sender = <HTMLInputElement>e.srcElement;
            shiftKey = e.shiftKey;
        }
        sender["hidelist"] = false;
        var value = sender.value ? sender.value : "";
        if (key != 13) {                    
            if (key != 8) {
                value += String.fromCharCode(key);
            }
            else {
                value = value.substring(0, value.length - 1);
            }
        }
        if (!shiftKey && sender) {
            showList(sender, value);
        }
    }
    function onChange(e) {
        var input = null;
        if (window.event) {            
            input = <HTMLInputElement>window.event.srcElement;            
        }
        else if (e) {            
            input = <HTMLInputElement>e.srcElement;            
        }
        onMouseOut(input);
        var datasource = <Array<any>>input["datasource"];
        var tempObj = input.DataObject;
        var dataContainer = input.DataContainer;
        var value = input["SelectedValue"];
        var found = datasource.First(d=> d[input["valuemember"]] == value);
        var targetproperty = input.DataContainer.DataBindings.First(d => d.ElementBindingIndex == input.ElementBindingIndex && d.Target == Binding.Targets.Value);
        var field = targetproperty.Fields[0];
        if (value) {
            if (targetproperty) {
                if (tempObj) {
                    var actionEvent = new ActionEvent(ActionType.Updating, tempObj, field, value);
                    dataContainer.ActionEvent(actionEvent);
                    if (!actionEvent.Cancel) {
                        Binding.Events.SetObjectValue(tempObj, field, value);
                        if (dataContainer.WebApi) {
                            dataContainer.WebApi.Put(tempObj, function (result) {
                                if (result && Is.Property(field, result)) {
                                    value = result[field];
                                    found = datasource.First(d=> d[input["valuemember"]] == value);
                                    if (found) {
                                        value = found[input["displaymember"]];
                                        input.value = value;
                                    }
                                    Binding.Events.SetObjectValue(tempObj, field, result[field].toString());
                                    Thing.Merge(result, tempObj);
                                    dataContainer.Rebind(field, input);
                                    actionEvent = new ActionEvent(ActionType.Updated, tempObj, field, tempObj[field]);
                                    dataContainer.ActionEvent(actionEvent);
                                }
                            }, function (result) {
                                    if (window.Exception) {
                                        window.Exception(result, "WebApi Post:" + dataContainer.WebApi, "Field:" + field);
                                    }
                                });
                        }
                    }
                    else {
                        var found = datasource.First(d=> d[field] == tempObj[field]);
                        if (found) {
                            value = found[input["displaymember"]];
                            input.value = value;
                        }
                        dataContainer.Rebind(field, input);
                    }
                    actionEvent = null;
                }
            }
        }
        else {
            var found = datasource.First(d=> d[input["valuemember"]] == tempObj[field]);
            if (found) {
                value = found[input["displaymember"]];
                input.value = value;
            }
            dataContainer.Rebind(field, input);
        }
    }
    function onMouseOut(input: HTMLInputElement) {
        input["hidelist"] = true;
        setTimeout(function () {
            if (input["hidelist"]) {
                var list = <HTMLSelectElement>input["AutocompleteList"];
                input["AutocompleteList"] = null;
                if (list) {
                    list.Remove();
                }
            }
        }, 250);
    }
    function showList(sender: HTMLInputElement, displayValue: string) {       
        displayValue = displayValue.toLowerCase(); 
        var datasource = <Array<any>>sender["datasource"];
        var displaymember = <string>sender["displaymember"];
        var valuemember = <string>sender["valuemember"]        
        var displaycount = sender["displaycount"] ? <number>sender["displaycount"] : 8;
        var list = <HTMLSelectElement>sender["AutocompleteList"];
        if (!list) {
            list = <HTMLSelectElement>"select".CreateElement({ position: "absolute" });
            sender["AutocompleteList"] = list;
            document.body.appendChild(list);
            list.onchange = function () {
                setValue(sender, list);
                sender["hidelist"] = true;
                sender["AutocompleteList"] = null;
                list.Remove();
            };
            list.onmouseover = function () {
                sender["hidelist"] = false;
            };
            list.onmouseout = function () {
                onMouseOut(sender);
            };
        }
        list.options.length = 0;
        var showItems = datasource.Where((o) => {
            return o[displaymember].toLowerCase().indexOf(displayValue) > -1;
        }).Take(displaycount);
        if (showItems.length < displaycount) {
            showItems = datasource;
        }
        var firstFound = showItems.First(s=> s[displaymember].toLowerCase() == displayValue || s[displaymember].toLowerCase().indexOf(displayValue) > -1);        
        showItems.forEach(s=> list.options[list.options.length] = new Option(s[displaymember], s[valuemember], false, s == firstFound));
        if (list.options.length > 0) {
            var diffAndPos = (<HTMLElement>sender).DimAndOff();
            var height = sender.offsetHeight;
            list.style.width = (sender.offsetWidth + 16) + "px";
            list.style.top = (diffAndPos.Top + height) + "px";
            list.style.left = diffAndPos.Left + "px";
            list.style.display = "block";
            list.size = list.options.length < displaycount ? list.options.length : displaycount;
            list.style.display = "block";
        }
        else {
            list.style.display = "none";
        }
    }
    function hookEvents(input: HTMLInputElement) {
        input.onkeydown = function (e) {
            var key;
            var sender = null;
            var shiftKey = true;
            if (window.event) {
                key = e.keyCode;
                sender = <HTMLInputElement>window.event.srcElement;
                shiftKey = e.shiftKey;
            }
            else if (e) {
                key = e.which;
                sender = <HTMLInputElement>e.srcElement;
                shiftKey = e.shiftKey;
            }
            var displaycount = <number>sender["displaycount"];
            sender["hidelist"] = false;
            if (!shiftKey && sender) {
                var list = <HTMLSelectElement>sender["AutocompleteList"];
                if (list) {
                    if (key == 13 ||
                        (key == 9 && list.options.length > 0 && list.value.length >= sender.value.length)) {
                        var index = list.selectedIndex > -1 ? list.selectedIndex : 0;
                        if (list.options.length > 0) {
                            setValue(sender, list, index);
                            sender["AutocompleteList"] = null;
                            list.Remove();
                        }
                        if (window.event && key == 13) {
                            window.event.returnValue = false;
                        }
                        else {
                            return; // false;
                        }
                        return;
                    }
                    //up arrow
                    else if (key == 38) {
                        if (list.selectedIndex > 0) {
                            list.options[list.selectedIndex - 1].selected = "selected";
                        }
                        else {
                            list.options[0].selected = "selected";
                        }
                    }
                    //down arrow
                    else if (key == 40) {
                        if (list.selectedIndex < list.options.length - 1) {
                            list.options[list.selectedIndex + 1].selected = "selected";
                        }
                        else {
                            list.options[0].selected = "selected";
                        }
                    }
                    //backspace?
                    else if (key == 8) {
                        onKeyPress(e);
                    }
                }
            }
        };
        input.onkeypress = function (e) {
            onKeyPress(e);
        };
        input.onmouseout = function (e) {
            onMouseOut(input);
        };
        input.onmouseover = function (e) {
            input["hidelist"] = false;
            showList(input, input.value);
        };
        if (input.DataContainer && input.DataObject) {
            input.onblur = function (e) {
                onChange(e);
            }
        }
    }
    export function Hook(input: HTMLInputElement, dataSource: Array<any>, valueMember: string, displayMember: string, displayCount?: number) {        
        input["datasource"] = dataSource;
        input["valuemember"] = valueMember;
        input["displaymember"] = displayMember;        
        input["displaycount"] = displayCount ? displayCount : 8;
        hookEvents(input);
    }
    function setValue(input: HTMLInputElement, list: HTMLSelectElement, selectedIndex?: number) {
        selectedIndex = selectedIndex ? selectedIndex : list.selectedIndex;
        input.value = list.options[selectedIndex].text;
        input["SelectedValue"] = list.options[selectedIndex].value;       
    }
}
module Binding {   
    export module Targets {          
        //for select and auto suggest input
        export var DataSource = "datasource";        
        export var DisplayMember = "displaymember";
        export var DisplayCount = "displaycount";
        export var ValueMember = "valuemember";
        export var Checked = "checked";
        export var Radio = "radio";  
        export var OnMouseOver = "onmouseover";
        export var OnMouseOut = "onmouseout";
        export var OnFocus = "onfocus";
        export var Formatting = "formatting";        
        export var ClassName = "classname";
        export var InnerHtml = "innerhtml";
        export var Value = "value";
        export var For = "for";
        export var ID = "id";
        export var OnClick = "onclick";
        export var Src = "src";
        export var Href = "href";
        export var Style = "style";
        export var Action = "action";  //insert, delete, push, unshift
        //future
        export var Sort = "sort";
    }
    export module Attributes {
        export var WebApi = "data-webapi";
        export var Pks = "data-pks";        
        export var Action = "data-action";
        export var SelectedItemChanged = "data-selecteditemchanged";
        export var SelectedItemClass = "data-selecteditemclass";               
        export var FormID = "data-formid";
        export var Template = "data-template";      
        //these should only ever be used once
        //right when the autoload window method occurs
        export var Auto = "data-auto";
        export var AutoParameter = "data-autoparameter";        
    }
    export module DataContainer {
        export function Auto(element: HTMLElement) {
            var dataContainter = <IDataContainer>element;
            if (dataContainter.dataset["webapi"] && dataContainter.dataset["pks"]) {
                var webApi = <string>dataContainter.dataset["webapi"];
                var parameter = null;
                if (element.dataset["autoparameter"]) {
                    var returnLine = <string>element.dataset["autoparameter"].toString().Trim();
                    if (returnLine.indexOf("return") == -1) {
                        returnLine = "return " + returnLine;
                    }
                    if (returnLine.indexOf(";") == -1) {
                        returnLine += ";";
                    }
                    var fun = Binding.Return(returnLine, 0);
                    parameter = fun();
                }
                webApi.Get(parameter, function (result) {
                    dataContainter.Bind(result);
                });
            }
        }
        export function Rebind(cont: IDataContainer, sender: HTMLElement, field: string) {
            var elements = document.body.Get(e=> e.DataObject == sender.DataObject && e != sender && e.DataContainer != null);
            elements.forEach(e=> {
                var bindings = e.DataContainer.DataBindings.Where(d=> d.ElementBindingIndex == e.ElementBindingIndex && d.Fields.First(f=> f == field) != null);
                if (bindings.length > 0) {
                    bindings.forEach(b=> b.Bind(e));
                }
            });
        }
        export function LookForInsert(li: HTMLElement) {
            var elements = li.Get(e=> e.HasDataSet());
            var possibleInsert = elements.First(e=> e.dataset[Binding.Targets.Action] != null);                
            if (possibleInsert) {
                var value = possibleInsert.dataset[Binding.Targets.Action].toLowerCase();
                if (["push", "insert", "unshift"].indexOf(value) > -1) {
                    possibleInsert.dataset[Binding.Targets.Action] = value;
                    Binding.Events.Insert(possibleInsert);
                }
            }
        }
        export function Setup(container: IDataContainer): boolean {
            var ret = true;
            //if (container.WebApi == null || container.Pks == null) {
            if (container.Pks == null) {
                var webApi = container.getAttribute(Binding.Attributes.WebApi);
                var pks = container.getAttribute(Binding.Attributes.Pks);
                //if (!webApi) {
                //    alert("data-webapi must be supplied to use Halberd binding");
                //    return false;
                //}
                //else {
                container.WebApi = webApi;
                if (!pks) {
                    alert("data-pks must be supplied to use Halberd binding");
                    return false;
                }
                else {
                    container.Pks = new Array<string>();
                    pks.split(";").forEach(pk=> container.Pks.Add(pk.Trim()));
                }
                var action = container.getAttribute(Binding.Attributes.Action);
                if (action) {
                    action += "(obj0);";
                    var fun = Binding.Return(action, 1);
                    container.ActionEvent = function (actionEvent: ActionEvent) {
                        [actionEvent].Return(fun);
                    };
                }
                else {
                    container.ActionEvent = function (actionEvent: ActionEvent) {
                    }
                }
                var formID = container.getAttribute(Binding.Attributes.FormID);
                if (formID) {
                    container.Form = <HTMLFormElement>formID.Element();
                }
                container.SelectedItemClass = container.getAttribute(Binding.Attributes.SelectedItemClass);
                var selecteditemchanged = container.getAttribute(Binding.Attributes.SelectedItemChanged);
                if (selecteditemchanged) {
                    container.SelectedItemChanged = <(obj: any, sender: HTMLElement) => void>new Function("obj", "sender", "return " + selecteditemchanged + "(obj, sender);");
                }
                //}
            }
            return ret;
        }
        export function SetupUl(ul: HTMLUListElement): boolean {
            var ret = true;
            var lis = ul.Get(e=> e.tagName == "LI");
            ul.HeaderHtml = new Array<string>();
            ul.FooterHtml = new Array<string>();
            lis.forEach(li=> {
                var template = li.getAttribute(Binding.Attributes.Template);
                if (template) {
                    template = template.toLowerCase();
                    switch (template) {
                        case "header":
                            ul.HeaderHtml.push(li.outerHTML);
                            break;
                        case "footer":
                            ul.FooterHtml.push(li.outerHTML);
                            break;
                        case "row":
                            var tempLi = <HTMLLIElement>li;
                            if (tempLi.className) {
                                tempLi.OriginalClass = tempLi.className;
                            }                 
                            SetupDataBindingsFromLi(ul, tempLi);
                            ul.RowHtml = li.outerHTML;
                            break;
                    }
                }
            });
            return ret;
        }
        export function SetupDataBindingsFromLi(dataContainer: IDataContainer, li: HTMLLIElement) {
            dataContainer.DataBindings = new Array<DataBinding>();
            var elements = li.Get((d) => d.HasDataSet());
            var i = 0;
            elements.forEach(e=> {
                var bindingAttributes = e.GetDataSetAttributes().Ascend(x=> x.name);
                bindingAttributes.forEach(ba=> dataContainer.DataBindings.Add(new DataBinding(dataContainer, i, ba.name, ba.value)));
                e.DataContainer = dataContainer;
                e.ElementBindingIndex = i;
                i++;
            });
        }
        export function SetupDataBindings(dataContainer: IDataContainer, filter?: (d: IDataContainer) => boolean) {            
            dataContainer.DataBindings = new Array<DataBinding>();
            if (!filter) {
                filter = (d) => d.HasDataSet();
            }
            var elements = dataContainer.Get(filter);
            var i = 0;
            elements.forEach(e=> {
                var bindingAttributes = e.GetDataSetAttributes().Ascend(x=> x.name);
                bindingAttributes.forEach(ba=> dataContainer.DataBindings.Add(new DataBinding(dataContainer, i, ba.name, ba.value)));
                e.DataContainer = dataContainer;
                e.ElementBindingIndex = i;
                i++;
            });
        }
        export function DataBind(dataContainer: IDataContainer, target: HTMLElement, data:any) {
            var elements = target.Get((d) => d.HasDataSet());
            var i = 0;
            elements.forEach(e=> {               
                e.DataContainer = dataContainer;
                e.ElementBindingIndex = i;
                e.DataObject = data;
                dataContainer.DataBindings.Where(d=> d.ElementBindingIndex == i).forEach(b=> b.Bind(e));
                i++;
            });
        }
        export function Dispose(dataContainer: IDataContainer) {
            if (dataContainer.DataBindings) {
                while (dataContainer.DataBindings.length > 0) {
                    var db = dataContainer.DataBindings.pop();
                    db.Dispose();
                    db = null;
                }
                dataContainer.DataBindings = null;
            }
            if (dataContainer.Pks) {
                while (dataContainer.Pks.length > 0) {
                    var pk = dataContainer.Pks.pop();
                    pk = null;
                }
                dataContainer.Pks = null;
            }
            dataContainer.ActionEvent = null;
            dataContainer.WebApi = null;
            dataContainer.SelectedItemChanged = null;
            dataContainer.SelectedItemClass = null;
            dataContainer.Form = null;
            dataContainer.HeaderHtml = null;
            dataContainer.FooterHtml = null;
            dataContainer.RowHtml = null;
        }
    }    
    export module Events {
        export function SetObjectValue(obj, property, newValue) {
            var currentValue = obj[property];
            var tempString = <string>newValue;
            if (typeof currentValue === "number")
            {
                obj[property] = parseFloat(tempString);
            }
            else {
                obj[property] = tempString;
            }
        }
        export function OnChange(element: HTMLElement, dataContainer: IDataContainer, dataBind:DataBinding, field:string) {
            var tempElement = <any>element;
            if (!tempElement.onchange) {
                tempElement.onchange = function () { 
                    if (element.DataObject) {
                        var actionEvent = new ActionEvent(ActionType.Updating, element.DataObject, field, tempElement.value);
                        dataContainer.ActionEvent(actionEvent);
                        if (!actionEvent.Cancel) {
                            SetObjectValue(element.DataObject, field, tempElement.value);
                            if (dataContainer.WebApi) {
                                dataContainer.WebApi.Put(element.DataObject, function (result) {
                                    if (result && Is.Property(field, result)) {
                                        tempElement.value = result[field];
                                        SetObjectValue(element.DataObject, field, result[field].toString());
                                        Thing.Merge(result, element.DataObject);
                                        var formatting = element.DataContainer.DataBindings.First((o) => { return o.Target == Binding.Targets.Formatting; });
                                        if (formatting) {
                                            var formattedValue = formatting.ExecuteReturn(element);
                                            tempElement.value = formattedValue;
                                        }
                                        dataContainer.Rebind(field, element);
                                        actionEvent = new ActionEvent(ActionType.Updated, element.DataObject, field, tempElement.value);
                                        dataContainer.ActionEvent(actionEvent);
                                    }
                                });
                            }
                            else {
                                dataContainer.Rebind(field, element);
                                actionEvent = new ActionEvent(ActionType.Updated, element.DataObject, field, tempElement.value);
                                dataContainer.ActionEvent(actionEvent);
                            }
                        }
                        else {
                            tempElement.value = element.DataObject[field];
                        }
                        actionEvent = null;
                    }
                };
            }
        }
        export function Checked(element: HTMLElement, dataContainer: IDataContainer, dataBind: DataBinding, field: string) {            
            var input = <HTMLInputElement>element;  
            if (!input.onclick) {
                input.onclick = function () {
                    var checked = input.checked ? true : false;                                     
                    if (input.DataObject[field] != checked) {
                        var actionEvent = new ActionEvent(ActionType.Updating, input.DataObject, field, checked);
                        dataContainer.ActionEvent(actionEvent);
                        if (!actionEvent.Cancel) {
                            input.DataObject[field] = checked;
                            if (dataContainer.WebApi) {
                                dataContainer.WebApi.Put(input.DataObject, function (result) {
                                    if (result && Is.Property(field, result)) {
                                        input.checked = result[field] ? true : false;
                                        input.DataObject[field] = result[field];
                                        Thing.Merge(result, input.DataObject);
                                        dataContainer.Rebind(field, input);
                                        actionEvent = new ActionEvent(ActionType.Updated, input.DataObject, field, checked);
                                        dataContainer.ActionEvent(actionEvent);
                                    }
                                });
                            }
                            else {
                                dataContainer.Rebind(field, input);
                                actionEvent = new ActionEvent(ActionType.Updated, input.DataObject, field, checked);
                                dataContainer.ActionEvent(actionEvent);
                            }
                        }
                        else {
                            input.checked = !checked;
                        }
                        actionEvent = null;
                    }
                }
            }
        }
        export function Radio(element: HTMLElement, dataContainer: IDataContainer, dataBind: DataBinding, field: string) {
            var input = <HTMLInputElement>element;
            if (!input.onclick) {
                input.onclick = function () {
                    var checked = input.checked ? true : false;
                    var actionEvent = new ActionEvent(ActionType.Updating, input.DataObject, field, input.value);
                    dataContainer.ActionEvent(actionEvent);
                    if (!actionEvent.Cancel) {
                        SetObjectValue(input.DataObject, field, input.value);
                        if (dataContainer.WebApi) {
                            dataContainer.WebApi.Put(input.DataObject, function (result) {
                                if (result && Is.Property(field, result)) {
                                    input.DataObject[field] = result[field];
                                    if (input.DataObject[field] != input.value) {
                                        input.checked = false;
                                    }
                                    Thing.Merge(result, input.DataObject);
                                    dataContainer.Rebind(field, input);
                                    actionEvent = new ActionEvent(ActionType.Updated, input.DataObject, field, input.value);
                                    dataContainer.ActionEvent(actionEvent);
                                }
                            });
                        }
                        else {
                            dataContainer.Rebind(field, input);
                            actionEvent = new ActionEvent(ActionType.Updated, input.DataObject, field, input.value);
                            dataContainer.ActionEvent(actionEvent);
                        }
                    }
                    else {
                        input.checked = !checked;
                    }
                    actionEvent = null;
                };
            }
        }
        export function Delete(element: HTMLElement, dataContainer: IDataContainer, dataBind: DataBinding, field: string) {
            if (!element.onclick) {
                element.onclick = function () {
                    var parameter = {};
                    if (dataContainer.Pks) {
                        dataContainer.Pks.forEach(pk=> parameter[pk] = element.DataObject[pk]);
                    }
                    var actionEvent = new ActionEvent(ActionType.Deleting, element.DataObject, field, null);
                    dataContainer.ActionEvent(actionEvent);
                    if (!actionEvent.Cancel) {
                        if (dataContainer.WebApi) {
                            dataContainer.WebApi.Delete(parameter, function (result) {
                                actionEvent = new ActionEvent(ActionType.Deleted, element.DataObject, field, null);
                                dataContainer.ActionEvent(actionEvent);
                                var ul = <HTMLUListElement>element.Parent(p => p.tagName == "UL");
                                var li = <HTMLLIElement>ul.First(l => l.tagName == "LI" && l.DataObject == element.DataObject);
                                var array = <Array<any>>ul.DataObject;
                                var index = array.indexOf(element.DataObject);
                                li.Remove();
                                array.Remove(o=> o == element.DataObject);
                                if (dataContainer.Form != null && array.length > 0) {
                                    if (index >= array.length) {
                                        index = array.length - 1;
                                    }
                                    var selectByObject = array[index];
                                    li = <HTMLLIElement>ul.First(e=> e.tagName == "LI" && e.DataObject == selectByObject);
                                    ul.SetSelected(selectByObject, li);
                                }
                            });
                        }
                        actionEvent = null;
                    }
                };
            }
        }
        export function Insert(element: HTMLElement) {
            if (!element.onclick) {
                element.onclick = function() {
                    var li = element.Parent(p=> p.tagName == "LI");
                    var ul = <HTMLUListElement>li.Parent(p=> p.tagName == "UL");
                    var array = <Array<any>>ul.DataObject;
                    var direction = element.dataset[Binding.Targets.Action];
                    var newObject = {};
                    var boundElements = li.Get(e=> e.HasDataSet() && e != element);
                    boundElements.forEach(e=> {
                        var bindingAttributes = e.GetDataSetAttributes();
                        bindingAttributes.forEach(b=> {
                            var value;
                            if (Is.Style(b.name)) {
                                value = e.style[b.name];
                            }
                            else {
                                value = e[b.name];                                
                            }
                            if (value) {
                                newObject[b.value] = value;
                            }
                        });
                    });
                    var actionEvent = new ActionEvent(ActionType.Inserting, newObject, "insert", null);
                    ul.ActionEvent(actionEvent);
                    if (!actionEvent.Cancel) {
                        if (ul.WebApi) {
                            ul.WebApi.Post(newObject, function (result) {
                                Thing.Merge(result, newObject);
                                var missingPK = ul.Pks.First(pk => !newObject[pk]);
                                if (missingPK) {
                                    alert("Missing primary keys from: " + JSON.stringify(newObject));
                                }
                                else {
                                    var before = null;
                                    if (element.dataset[Binding.Targets.Action] == "unshift") {
                                        array.unshift(newObject);
                                        before = ul.First(e=> e.tagName == "LI" && e["TemplateType"] != "header");
                                    }
                                    else {
                                        array.push(newObject);
                                        before = ul.First(e=> e.tagName == "LI" && e["TemplateType"] == "footer");
                                    }
                                    var row = ul.InsertAndBind(newObject, before);
                                    ul.SetSelected(newObject, row);
                                    actionEvent = new ActionEvent(ActionType.Inserted, newObject, "insert", null);
                                    ul.ActionEvent(actionEvent);
                                }
                            });
                        }
                    }
                };
            }
        }
    }
    export function Return(returnLine: string, length: number): (...objs: any[]) => any {
        var parameters = new Array<string>();
        var pos = 0;
        while (length > 0) {
            parameters.Add("obj" + pos.toString());
            pos++;
            length--;
        }
        parameters.Add(returnLine);
        return Function.apply(null, parameters);
    }
    export var Happened: (boundElement: IDataContainer) => void;
}
module Calendar {
    export function DateCell(date, calendar) {
        var div = <any>"div".CreateElement(this.Format.Cell);
        div.Date = date;
        div.title = date.format("mmmm dd, yyyy");
        if (date != null) {
            var a = "a".CreateElement({ innerHTML: date.getDate(), href: "javascript:" });
            a.onclick = function () {
                if (calendar.SelectedDate.getMonth() == div.Date.getMonth() || !calendar.MonthChangeEvent) {
                    var previousDate = calendar.SelectedDateControl;
                    calendar.Set(div.Date);
                    if (calendar.SelectedDateControl && calendar.FormatCellMethod) {
                        var format = calendar.FormatCellMethod(div.Date);
                        div.className = format;
                    }
                    if (previousDate && calendar.FormatCellMethod) {
                        var format = calendar.FormatCellMethod(previousDate.Date);
                        previousDate.className = format;
                    }
                    calendar.SelectedDateControl = div;
                }
                else {
                    calendar.RequestedDate = div.Date;
                    calendar.MonthChanged = true;
                    calendar.MonthChangeEvent(div.Date, calendar.MonthChangedCallBack);
                }
            };
            div.appendChild(a);
            if (date.Equals(calendar.SelectedDate)) {
                calendar.SelectedDateControl = div;
            }
            if (calendar.FormatCellMethod) {
                var format = calendar.FormatCellMethod(div.Date);
                if (format) {
                    div.className = format;
                }
            }
        }
        return div;
    }
    export function HeaderCell(elementArrayOrString, cellProps?) {
        var div = "div".CreateElement(this.Format.Cell);
        Thing.Merge(cellProps, div);
        if (elementArrayOrString && elementArrayOrString.substring) {
            div.innerHTML = elementArrayOrString;
        }
        else if (Is.Array(elementArrayOrString)) {
            for (var i = 0; i < elementArrayOrString.length; i++) {
                var sub = elementArrayOrString[i];
                if (Is.String(sub)) {
                    div.appendChild("span".CreateElement({ innerHTML: sub }));
                }
                else if (Is.Element(sub)) {
                    div.appendChild(sub);
                }
            }
        }
        else if (Is.Element(elementArrayOrString)) {
            div.appendChild(elementArrayOrString);
        }
        return div;
    }
    export var Format = {
        Table: {
            display: "table",
            borderCollapse: "collapse",
            listStyleType: "none",
            margin: "0px 0px",
            padding: "0px 0px",
            width: "100%"
        },
        Row: {
            display: "table-row",
            listStyle: "none"
        },
        Cell: {
            display: "table-cell",
            textAlign: "center"
        }
    };
    export function MonthItem(monthName, index, onclickEvent) {
        var li = "li".CreateElement();
        var div = "div".CreateElement();
        li.appendChild(div);
        var a = "a".CreateElement({ innerHTML: monthName, href: "javascript:" });
        div.appendChild(a);
        a.onclick = function () {
            onclickEvent(index);
        };
        return li;
    }
    export function YearItem(year, onclickEvent) {
        var li = "li".CreateElement();
        var div = "div".CreateElement();
        li.appendChild(div);
        var a = "a".CreateElement({ innerHTML: year, href: "javascript:" });
        div.appendChild(a);
        a.onclick = function () {
            onclickEvent(year);
        };
        return li;
    }
    export function Create(element, selectedDateChanged, formatCellMethod,
        monthChangeEvent, headerClass, rowsClass, dayOfWeekClass,
        dateRowClass, monthClass, yearClass, navigateClass, defaultDateClass,
        monthPopupClass, yearPopupClass, calendarBuiltEvent) {
        if (!element.SelectedDate) {
            element.SelectedDate = new Date().SmallDate();
        }
        element.MonthClass = monthClass;
        element.YearClass = yearClass;
        element.NavigateClass = navigateClass;
        element.DefaultDateClass = defaultDateClass;
        element.MonthChangeEvent = monthChangeEvent;
        element.HeaderClass = headerClass;
        element.DateRowClass = dateRowClass;
        element.RowsClass = rowsClass;
        element.DayOfWeekClass = dayOfWeekClass;
        element.RequestedDate = new Date();
        element.SelectedDateChanged = selectedDateChanged;
        element.FormatCellMethod = formatCellMethod;
        element.MonthPopupClass = monthPopupClass;
        element.YearPopupClass = yearPopupClass;
        element.SelectedDateControl = null;
        element.PreviousDateControl = null;
        element.CalendarBuiltEvent = calendarBuiltEvent;
        element.MonthChanged = false;
        element.MonthChangedCallBack = function (allow) {
            if (allow) {
                //need to reset formatting?
                element.Set(element.RequestedDate);
                element.MonthChanged = false;
            }
        };
        element.Set = function (selectedDate) {
            var rebuild = selectedDate.getMonth() != element.SelectedDate.getMonth() ||
                selectedDate.getFullYear() != element.SelectedDate.getFullYear();
            element.SelectedDate = selectedDate;
            if (rebuild) {
                element.Build();
            }
            else {
                var selectedDateControl = element.First(function (obj) {
                    return obj.tagName.toLowerCase() == "div" && obj.Date && obj.Date.Equals(selectedDate);
                });
                if (selectedDateControl) {
                    element.SelectedDateControl = selectedDateControl;
                }
            }
            if (element.SelectedDateChanged) {
                element.SelectedDateChanged(element.SelectedDate);
            }
        };
        element.MonthNameClicked = function (month) {
            if (month != element.SelectedDate.getMonth()) {
                var requestmonth = month;
                var requestyear = element.SelectedDate.getFullYear();
                var testDate = new Date(requestyear, requestmonth, 1);
                element.RequestedDate = new Date(requestyear, requestmonth, element.SelectedDate.getDate());
                while (element.RequestedDate.getMonth() > testDate) {
                    element.RequestedDate = element.RequestedDate.AddDays(-1);
                }
                if (element.MonthChangeEvent) {
                    element.MonthChanged = true;
                    element.MonthChangeEvent(element.RequestedDate, element.MonthChangedCallBack);
                }
                else {
                    element.Set(element.RequestedDate);
                }
            }
            Dialog.Hide("workoutMonthpopup".Element());
        };
        element.YearNameClicked = function (year) {
            if (year != element.SelectedDate.getFullYear()) {
                var requestyear = year;
                var requestmonth = element.SelectedDate.getMonth();
                element.RequestedDate = new Date(requestyear, requestmonth, element.SelectedDate.getDate());
                while (element.RequestedDate.getMonth() > element.SelectedDate.getMonth()) {
                    element.RequestedDate = element.RequestedDate.AddDays(-1);
                }
                if (element.MonthChangeEvent) {
                    element.MonthChanged = true;
                    element.MonthChangeEvent(element.RequestedDate, element.MonthChangedCallBack);
                }
                else {
                    element.Set(element.RequestedDate);
                }
            }
            Dialog.Hide("workoutYearpopup".Element());
        };
        element.Build = function () {
            element.Clear();
            var header = "ul".CreateElement(Calendar.Format.Table);
            if (element.HeaderClass) {
                header.className = element.HeaderClass;
            }
            var left = "a".CreateElement({ innerHTML: "&lt;", href: "javascript:" });
            left.onclick = function () {
                var requestmonth = element.SelectedDate.getMonth();
                var requestyear = element.SelectedDate.getFullYear();
                if (requestmonth == 0) {
                    requestyear--;
                    requestmonth = 11;
                }
                else {
                    requestmonth--;
                }
                element.RequestedDate = new Date(requestyear, requestmonth, element.SelectedDate.getDate());
                while (element.RequestedDate.getMonth() == element.SelectedDate.getMonth()) {
                    element.RequestedDate = element.RequestedDate.AddDays(-1);
                }
                if (element.MonthChangeEvent) {
                    element.MonthChanged = true;
                    element.MonthChangeEvent(element.RequestedDate, element.MonthChangedCallBack);
                }
                else {
                    element.Set(element.RequestedDate);
                }
            };
            var right = "a".CreateElement({ innerHTML: "&gt;", href: "javascript:" });
            right.onclick = function () {
                var requestmonth = element.SelectedDate.getMonth();
                var requestyear = element.SelectedDate.getFullYear();
                if (requestmonth == 11) {
                    requestmonth = 0;
                    requestyear++;
                }
                else {
                    requestmonth++;
                }
                element.RequestedDate = new Date(requestyear, requestmonth, element.SelectedDate.getDate());
                while (element.RequestedDate.getMonth() > element.SelectedDate.getMonth() + 1) {
                    element.RequestedDate = element.RequestedDate.AddDays(-1);
                }
                if (element.MonthChangeEvent) {
                    element.MonthChanged = true;
                    element.MonthChangeEvent(element.RequestedDate, element.MonthChangedCallBack);
                }
                else {
                    element.Set(element.RequestedDate);
                }
            };
            if (element.NavigateClass) {
                left.className = element.NavigateClass;
                right.className = element.NavigateClass;
            }
            var month = "a".CreateElement({ innerHTML: element.SelectedDate.MonthName(), marginRight: ".25em", href: "javascript:" });
            month.onclick = function () {
                var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                var ulMonths = "ul".CreateElement({ id: "workoutMonthpopup", Target: month });
                if (element.MonthPopupClass) {
                    ulMonths.className = element.MonthPopupClass;
                }
                else {
                    ulMonths.Set(Calendar.Format.Table);
                }                                
                for (var i = 0; i < months.length; i++) {
                    ulMonths.appendChild(Calendar.MonthItem(months[i], i, element.MonthNameClicked));
                }
                Dialog.Popup(ulMonths);
            };
            var year = "a".CreateElement({ innerHTML: element.SelectedDate.getFullYear(), marginLeft: ".25em", href: "javascript:" });
            year.onclick = function () {
                //dont move beyond current year
                //this needs to be dynamic
                //if now == current year do one thing else do something else
                var years = new Array();
                var currentyear = (new Date()).getFullYear();
                var selectedYear = element.SelectedDate.getFullYear();
                if (selectedYear >= currentyear) {
                    years.push(currentyear - 4);
                    years.push(currentyear - 3);
                    years.push(currentyear - 2);
                    years.push(currentyear - 1);
                    years.push(currentyear - 0);
                }
                else {
                    var diff = currentyear - selectedYear;
                    if (diff > 1) {
                        years.push(selectedYear - 2);
                        years.push(selectedYear - 1);
                        years.push(selectedYear);
                        years.push(selectedYear + 1);
                        years.push(selectedYear + 2);
                    }
                    else {
                        years.push(selectedYear - 3);
                        years.push(selectedYear - 2);
                        years.push(selectedYear - 1);
                        years.push(selectedYear);
                        years.push(selectedYear + 1);
                    }
                }
                var ulYears = "ul".CreateElement({ id: "workoutYearpopup", Target: year });
                if (element.YearPopupClass) {
                    ulYears.className = element.YearPopupClass;
                }
                else {
                    ulYears.Set(Calendar.Format.Table);
                }
                years.forEach(y=>ulYears.appendChild(Calendar.YearItem(y, element.YearNameClicked)));
                Dialog.Popup(ulYears);
            };
            if (element.MonthClass) {
                month.className = element.MonthClass;
            }
            if (element.YearClass) {
                year.className = element.YearClass;
            }
            var headerRow = "li".CreateElement(Calendar.Format.Row);
            header.appendChild(headerRow);
            headerRow.AddRange(                
                    Calendar.HeaderCell(left),
                    Calendar.HeaderCell([month, year]),
                    Calendar.HeaderCell(right)
                );
            element.appendChild(header);
            var daysContainer = "ul".CreateElement(Calendar.Format.Table);
            if (element.RowsClass) {
                daysContainer.className = element.RowsClass;
            }
            element.appendChild(daysContainer);
            var pos = 0;
            var daysInMonth = element.SelectedDate.DaysInMonth();
            var startDate = new Date(element.SelectedDate.getFullYear(), element.SelectedDate.getMonth(), 1);
            var week = "li".CreateElement(Calendar.Format.Row);
            daysContainer.appendChild(week);
            if (element.DayOfWeekClass) {
                week.className = element.DayOfWeekClass;
            }
            week.AddRange(
                    Calendar.HeaderCell("Su"),
                    Calendar.HeaderCell("M"),
                    Calendar.HeaderCell("T"),
                    Calendar.HeaderCell("W"),
                    Calendar.HeaderCell("Th"),
                    Calendar.HeaderCell("F"),
                    Calendar.HeaderCell("Sa")                
                );
            week = "li".CreateElement(Calendar.Format.Row);
            var dow = startDate.getDay();
            if (dow != 0) {
                startDate = startDate.AddDays(dow * -1);
            }
            var breakCalendar = false;
            while (!breakCalendar) {
                if (pos == 0) {
                    if (element.DateRowClass) {
                        week.className = element.DateRowClass;
                    }
                    daysContainer.appendChild(week);
                }
                var dow = startDate.getDay();
                if (dow == 6 && ((startDate.getMonth() > element.SelectedDate.getMonth() || startDate.getFullYear() > element.SelectedDate.getFullYear()) || startDate.getDate() == daysInMonth)) {
                    breakCalendar = true;
                }
                if (pos == dow) {
                    week.appendChild(Calendar.DateCell(startDate, element));
                    startDate = startDate.AddDays(1);
                }
                pos++;
                if (pos == 7) {
                    week = "li".CreateElement(Calendar.Format.Row);
                    pos = 0;
                }
            }
            if (element.CalendarBuiltEvent) {
                element.CalendarBuiltEvent();
            }
        };
        element.Build();
        if (element.SelectedDateChanged) {
            element.SelectedDateChanged(element.SelectedDate);
        }
    }
}
module Convert {
    export function EmToFloat(value) {
        if (value && value.substring && value.indexOf("em")) {
            value = value.replace("em", "");
            value = parseFloat(value);
        };
        return value;
    }
    export function EmValueToPixelValue(value: any) {
        if (value)
        {
            value = EmToFloat(value) * 16;
            return value;
        }
        return 0;
    }
}
module Formatters {
    export module DateTime {
        export var Token: any = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
        export var Timezone: any = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
        export var TimezoneClip: any = /[^-+\dA-Z]/g;
        export var i18n: any = {
            dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        };
        export var Masks: any = {
            "default": "ddd mmm dd yyyy HH:MM:ss",
            shortDate: "m/d/yy",
            mediumDate: "mmm d, yyyy",
            longDate: "mmmm d, yyyy",
            fullDate: "dddd, mmmm d, yyyy",
            shortTime: "h:MM TT",
            mediumTime: "h:MM:ss TT",
            longTime: "h:MM:ss TT Z",
            isoDate: "yyyy-mm-dd",
            isoTime: "HH:MM:ss",
            isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
            isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
        };
        export function Pad(val: any, len?: number) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        }
        export function Format(date: any, mask?: string, utc?: boolean) {
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }
            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date)) throw SyntaxError("invalid date");
            mask = String(DateTime.Masks[mask] || mask || DateTime.Masks["default"]);
            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }
            var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d: d,
                dd: DateTime.Pad(d),
                ddd: DateTime.i18n.dayNames[D],
                dddd: DateTime.i18n.dayNames[D + 7],
                m: m + 1,
                mm: DateTime.Pad(m + 1),
                mmm: DateTime.i18n.monthNames[m],
                mmmm: DateTime.i18n.monthNames[m + 12],
                yy: String(y).slice(2),
                yyyy: y,
                h: H % 12 || 12,
                hh: DateTime.Pad(H % 12 || 12),
                H: H,
                HH: DateTime.Pad(H),
                M: M,
                MM: DateTime.Pad(M),
                s: s,
                ss: DateTime.Pad(s),
                l: DateTime.Pad(L, 3),
                L: DateTime.Pad(L > 99 ? Math.round(L / 10) : L),
                t: H < 12 ? "a" : "p",
                tt: H < 12 ? "am" : "pm",
                T: H < 12 ? "A" : "P",
                TT: H < 12 ? "AM" : "PM",
                Z: utc ? "UTC" : (String(date).match(DateTime.Timezone) || [""]).pop().replace(DateTime.TimezoneClip, ""),
                o: (o > 0 ? "-" : "+") + DateTime.Pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4)
                //,
                //S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };
            return mask.replace(DateTime.Token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        }
    }
    export module Number {
        export function Comma(stringOrNumber: any) {
            stringOrNumber += '';
            var x = stringOrNumber.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }
        export function Pad(value: any, length: number) {
            var str = '' + value;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        }
    }
}
module Is {
    export function Array(value): boolean {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    export function Chrome(): boolean {
        var w = <any>window;
        return w.chrome;
    }
    export function Element(value: any) {
        return value && value.tagName;
    }
    export function EmptyObject(obj): boolean {
        for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }
        return true;
    }
    export function FireFox(): boolean {
        if (navigator) {
            return /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
        }
        return false;
    }
    export function Function(obj): boolean {
        var getType = {};
        return obj && getType.toString.call(obj) === '[object Function]';
    }
    export function InternetExplorer(): boolean {
        //MSIE may be spoofed?
        //        var ua = window.navigator.userAgent;
        //        var msie = ua.indexOf("MSIE ");
        //        return msie > 0;
        return '\v' == 'v';
    }
    export function NullOrEmpty(value): boolean {
        if (value == null) {
            return true;
        }
        else if (value.length == 0) {
            return true;
        }
    }
    export function Numeric(input: string): boolean {
        var RE = /^-{0,1}\d*\.{0,1}\d+$/;
        return (RE.test(input));
    }
    export function Object(value) {
        return value && typeof value === 'object';
    }
    export function Property(property, inObject): boolean {
        try {
            return typeof (inObject[property]) !== 'undefined';
        } catch (e) {
            if (window.Exception) {
                window.Exception(e);
            }
        }
        return false;
    }
    export function String(value) {
        return typeof value === 'string';
    }
    export function Style(value: string) {
        return value in document.body.style;
    }
    export function ValidDate(value) {
        try {
            if (Object.prototype.toString.call(value) === "[object Date]") {
                if (isNaN(value.getTime())) {
                    return false;
                }
                else {
                    return true;
                }
            }
            else if (String(value)) {
                var objDate = new Date(value);
                //what was doing
                //var objDate = new Date(Date.parse(value));
                var parts = value.split("/");
                var year = parseInt(parts[2]);
                var month = parseInt(parts[0].indexOf("0") == 0 ? parts[0].substring(1) : parts[0]);
                var day = parseInt(parts[1].indexOf("0") == 0 ? parts[1].substring(1) : parts[1]);
                if (objDate.getFullYear() != year) return false;
                if (objDate.getMonth() != month - 1) return false;
                if (objDate.getDate() != day) return false;
                return true;
            }
        } catch (e) {
            if (window.Exception) {
                window.Exception(e);
            }
        }
        return false;
    }
    export function ValidEmail(address: string) {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(address) == false) {
            return false;
        }
        return true;
    }
} 
module KeyPress {
    export var ADCONTROL_ZERO: number = 48;
    export var ADCONTROL_ONE: number = 49;
    export var ADCONTROL_TWO: number = 50;
    export var ADCONTROL_THREE: number = 51;
    export var ADCONTROL_FOUR: number = 52;
    export var ADCONTROL_FIVE: number = 53;
    export var ADCONTROL_SIX: number = 54;
    export var ADCONTROL_SEVEN: number = 55;
    export var ADCONTROL_EIGHT: number = 56;
    export var ADCONTROL_NINE: number = 57;
    export function GetZeroLengthString(value: number): string {
        switch (value) {
            case 1:
            case 0:
                return String(value);
            default:
                return "0" + String(value) + "/";
        }
    }
    export function GetOneLengthString(value: number, currentValue: number): string {
        if (currentValue == 0) {
            return "0" + String(value) + "/";
        }
        else {
            if (value > 3) {
                return "01/0" + String(value) + "/";
            }
            else if (value == 3) {
                return "01/3";
            }
            else {
                return "1" + String(value) + "/";
            }
        }
    }
    export function GetThreeLengthString(value: number, currentValue: number): string {
        if (value > 3) {
            return currentValue + "0" + String(value) + "/";
        }
        else {
            return currentValue + String(value);
        }
    }
    export function GetFourLengthString(value: number, currentValue: number, previousValue: number): string {
        if (previousValue == 3 &&
                value > 1) {
            return String(currentValue).substring(0, String(currentValue).length - 1) + "03/" + String(value);
        }
        else {
            return currentValue + value + "/";
        }
    }
    export function NoBlanks(e: any, canSpecialCharacter?: boolean): boolean {
        var ret = true;
        var KeyID = null;
        var sender = null;
        var shiftKey = true;
        if (window.event) {
            KeyID = e.keyCode;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
            e = window.event;
        }
        else if (e) {
            KeyID = e.which;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
        }
        var keyChar = String.fromCharCode(KeyID);
        if (!canSpecialCharacter) {
            var regex = /[a-z0-9]/gi;
            var test = regex.test(keyChar);
            if (!test) {
                ret = false;
                e.cancel = true;
            }
        }
        else if (keyChar == " ") {
            ret = false;
            e.cancel = true;
        }
        if (window.event) {
            e.returnValue = ret;
        }
        return ret;
    }
    export function ShortDate(e: any): boolean {
        var KeyID = null;
        var sender = null;
        var shiftKey = true;
        if (window.event) {
            KeyID = e.keyCode;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
        }
        else if (e) {
            KeyID = e.which;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
        }
        //hook up events to it
        if (!sender.onclick) {
            sender.onclick = function (e) {
                sender.focus();
                sender.select();
            };
        }
        if (!sender.onfocus) {
            sender.onfocus = function () {
                sender.select();
            };
        }
        if (!sender.onblur) {
            sender.onblur = function () {
                if (sender.value.length == 0)
                    return;
                if (sender.value.length == 8) {
                    var lastTwo = sender.value.substring(6, 8);
                    if (lastTwo.indexOf("9") == 0) {
                        sender.value = sender.value.substring(0, 6) + "19" + lastTwo;
                    }
                    else {
                        sender.value = sender.value.substring(0, 6) + "20" + lastTwo;
                    }
                }
                if (!Is.ValidDate(sender.value)) {
                    alert("Please enter a valid date.");
                    sender.focus();
                }
            };
        }
        var keyChar = String.fromCharCode(KeyID);
        var ret = true;
        var length = sender.value.length;
        if (KeyID >= KeyPress.ADCONTROL_ZERO && KeyID <= KeyPress.ADCONTROL_NINE) {
            if (sender.value.length == 10) {
                sender.value = "";
            }
            var value = parseInt(keyChar);
            switch (length) {
                case 0:
                    ret = false;
                    sender.value = KeyPress.GetZeroLengthString(value); break;
                case 1:
                    ret = false;
                    sender.value = KeyPress.GetOneLengthString(value, sender.value); break;
                case 3:
                    ret = false;
                    sender.value = KeyPress.GetThreeLengthString(value, sender.value); break;
                case 4:
                    ret = false;
                    sender.value = KeyPress.GetFourLengthString(value, sender.value, sender.PreviousValue); break;
                default:
                    break;
            }
            sender.PreviousValue = value;
            if (event) {
                event.returnValue = ret;
            }
            return ret;
        }
        else if (KeyID == 13) {
            if (sender.tabIndex) {
                var ti = parseInt(sender.tabIndex) + 1;
                var elements = document.getElementsByTagName('*');
                for (var i = 0; i < elements.length; i++) {
                    var element = <HTMLInputElement>elements[i];
                    if (element.tabIndex == ti) {
                        element.focus();
                        if (element.type && element.type == "text") {
                            element.select();
                        }
                        break;
                    }
                }
            }
        }
        else {
            return false;
        }
    }
    export function Number(e: any, allowDecimals?: boolean, useTabForward?: boolean): boolean {
        var key = null;
        var sender = null;
        var shiftKey = true;
        if (window.event) {
            key = e.keyCode;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
        }
        else if (e) {
            key = e.which;
            sender = e.srcElement;
            shiftKey = e.shiftKey;
        }
        var keyChar = String.fromCharCode(key);
        var ret = true;
        var length = sender.value.length;
        var containsDecimal = sender.value.indexOf(".") > -1;
        if (key == 13) {
            if (sender.tabIndex && useTabForward) {
                var ti = parseInt(sender.tabIndex) + 1;
                var elements = document.getElementsByTagName('*');
                for (var i = 0; i < elements.length; i++) {
                    var element = <HTMLInputElement>elements[i];
                    if (element.tabIndex == ti) {
                        element.focus();
                        if (element.type && element.type == "text") {
                            element.select();
                        }
                        break;
                    }
                }
            }
        }
        else if (key >= 48 && key <= 57) {
            ret = true;
        }
        else if (keyChar == "." && allowDecimals) {
            if (sender.value.indexOf(".") > -1) {
                var txt = '';
                if (window.getSelection) {
                    txt = window.getSelection().toString();
                }
                else if (document.getSelection) // FireFox
                {
                    txt = document.getSelection().toString();
                }
                if (txt.length != sender.value.length) {
                    ret = false;
                }
            }
        }
        else if (keyChar == "." && !allowDecimals) {
            ret = false;
        }
        else {
            if (keyChar == "-") {
                if (sender.value != "") {
                    ret = false;
                }
            }
            else {
                ret = false
            }
        }
        if (event) {
            event.returnValue = ret;
        }
        return ret;
    }
}
module Local {    
    export function CanStore(): boolean {
        try {
            return localStorage ? true : false;
        } catch (e) {
            return false;
        }
    }
    export function Remove(key: string): void {
        if (Local.CanStore()) {
            localStorage.removeItem(key);            
        }
    }
    export function Clear(): void {
        if (Local.CanStore()) {
            localStorage.clear();            
        }
    }
    export function Save(key: string, obj: any): void {        
        if (Local.CanStore()) {
            var json = JSON.stringify(obj);
            localStorage.setItem(key, json);
        }
    }
    export function Get(key: string, defaultObject?: any) {
        try {
            var temp = null;
            if (!temp && Local.CanStore()) {
                if (Is.Property(key, localStorage)) {
                    temp = localStorage.getItem(key);
                }
                if (Is.String(temp)) {
                    temp = JSON.parse(temp);
                    Ajax.ConvertProperties(temp);
                    return temp;
                }
            }
            return temp;
        } catch (e) {
            throw e;
        }
        return null;
    }
} 
module RegularExpression {
    export var StandardBindingWrapper: RegExp = /{|}/g,
        StandardBindingPattern: RegExp = /{(\w+(\.\w+)*)}/g,
        MethodPattern: RegExp = /\w+(\.\w+)*\(/g,
        ObjectAndMethod: RegExp = /{(\w+(\.\w+)*)}\.\w+\(\)/g,
        ObjectMethod: RegExp = /\.\w+\(\)/g,
        ParameterPattern: RegExp = /\(.*(,\s*.*)*\)/g,
        ZDate: RegExp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g,
        UTCDate: RegExp = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/i;
    export function Replace(patternToLookFor: RegExp, sourceString: string, sourceObjectOrArray?: any, trimFromResultPattern?: boolean) {
        var matches = sourceString.match(patternToLookFor);
        if (matches) {
            var regMatches = new Array();
            matches.forEach(m=> {
                regMatches.push({
                    Match: m,
                    PropertyName: m.replace(RegularExpression.StandardBindingWrapper, "")
                });
            });
            if (Is.Array(sourceObjectOrArray)) {
                regMatches.forEach(r=> {
                    for (var j = 0; j < sourceObjectOrArray.length; j++) {
                        if (sourceObjectOrArray[j] &&
                            sourceObjectOrArray[j].hasOwnProperty(r.PropertyName)) {
                            sourceString = sourceString.replace(r.Match, sourceObjectOrArray[j][r.PropertyName])
                            break;
                        }
                    }
                });
            }
            else {
                for (var i = 0; i < regMatches.length; i++) {
                    if (sourceObjectOrArray &&
                        sourceObjectOrArray.hasOwnProperty(regMatches[i].PropertyName)) {
                        sourceString = sourceString.replace(regMatches[i].Match, sourceObjectOrArray[regMatches[i].PropertyName])
                    }
                }
            }
        }
        return sourceString;
    }
}
module Thing {   
    export function Merge(object, into) : any {
        for (var prop in object) {
            var value = object[prop];
            if (value)
            {
                into[prop] = object[prop];
            }
        }        
        return into;
    }
    export function Clone(object) {
        var newobject = {
        };
        for (var prop in object) {
            newobject[prop] = object[prop];
        }
        return newobject;
    }
    export function ToArray(object, nameColumn?: string, valueColumn?: string): any[] {
        var ret = new Array();
        if (!nameColumn) {
            nameColumn = "Name";
        }
        if (!valueColumn) {
            valueColumn = "Value";
        }
        for (var prop in object) {
            var localObj = {};
            localObj[nameColumn] = prop;
            localObj[valueColumn] = object[prop];
            ret.push(localObj);
        }
        return ret;
    }
    export function Concat(object, properties: string[]): string {
        var ret = "";        
        for (var i = 0; i < properties.length; i++) {
            if (Is.Property(properties[i], object)) {
                var value = object[properties[i]];
                if (value) {
                    ret += value.toString();
                }
            }
        }
        return ret;
    }
    export function GetValueIn(object, forPropertyName, defaultValue?) {
        if (object[forPropertyName])
        {
            return object[forPropertyName];
        }
        else if (defaultValue)
        {
            return defaultValue;
        }
        return null;
    }
}
module What {
    export module Is {
        export function EnumName(inObject, forValue): string {
            for (var prop in inObject) {
                if (inObject[prop] == forValue) {
                    return <string>prop;
                }                
            }
            return null;
        }
        export function EnumValue(inObject, forName: string): any {
            forName = forName.toLowerCase();
            for (var prop in inObject) {
                if (prop.toLowerCase() == forName) {
                    return inObject[prop];
                }
            }
            return null;
        }
    }
}
module ViewManager {
    export var Routes = new Array<Route>();
    export var Views = new Array<IView>();
    export function Initialize(...views: Array<IView>) {
        AddViews(views);
        window.addEventListener("popstate", ViewManager.BackEvent);
    }
    export function CurrentRoute(): Route {
        if (ViewManager.Routes != null && ViewManager.Routes.length > 0) {
            return ViewManager.Routes[ViewManager.Routes.length - 1];
        }
        return null;
    }
    export function AddViews(views: Array<IView>) {
        views.forEach(l=> {
            Views.Remove(l2=> l2.Key == l.Key);
            Views.Add(l);
        });
    }
    export function BackEvent(e) {
        if (ViewManager.Routes.length > 1) {
            ViewManager.Routes.splice(ViewManager.Routes.length - 1, 1);
        }
        if (ViewManager.Routes.length > 0) {
            var viewInfo = ViewManager.Routes[ViewManager.Routes.length - 1];
            var found = <IView>Views.First(function (o) {
                return o.Key == viewInfo.Key;
            });
            viewInfo.Show();
        }
        else {
            //do nothing?
        }
    }
    export function Load(viewKey, parameters?: Array<string>) {
        var found = <IView>Views.First(function (o) {
            return o.Key == viewKey;
        });
        if (found) {
            var route = new Route(viewKey, parameters, found);
            Routes.push(route);
            window.PushState(null, found.UrlTitle(this), found.Url(route));
            route.Show();
        }
    }
}
//reviewed and updated NC - 2015-04-01
interface Array<T> {
    GroupBy(...groupBy: string[]): any[];
    Insert(obj, position: number);
    Sum(field: string): number;
    Max(field: string): number;
    Min(field: string): number;
    ToArray(property: string): any[];
    Take(count: number): any[];
    Add(obj: any);
    IndexOf(func: (obj: T) => Number): T;
    //IndexOf(obj: T)=> Number: T;
    First(func?: (obj: T) => boolean): T;
    Last(func: (obj: T) => boolean): T;
    Remove(func: (obj: T) => boolean): T[];
    Where(func: (obj: T) => boolean): T[];
    Add(obj: T[]);
    Add(obj: T);
    Select<U>(keySelector: (element: T) => U): Array<U>;
    Ascend(keySelector: (element: T) => any): T[];
    Descend(keySelector: (element: T) => any): T[];   
    Return(func: (...objs: any[]) => any): any;
}
Array.prototype.Return = function (func: (...objs: any[]) => any): any {
    switch (this.length) {
        case 0:
            return func();;
        case 1:
            return func(this[0]);
        case 2:
            return func(this[0], this[1]);
        case 3:
            return func(this[0], this[1], this[2]);
        case 4:
            return func(this[0], this[1], this[2], this[3]);
        case 5:
            return func(this[0], this[1], this[2], this[3], this[4]);
        case 6:
            return func(this[0], this[1], this[2], this[3], this[4], this[5]);
        case 7:
            return func(this[0], this[1], this[2], this[3], this[4], this[5], this[6]);
        default:
            return null;
    }
    return null;
};
Array.prototype.Select = function (keySelector: (element: any) => any): Array<any> {
    var ret = new Array<any>();    
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        var newObj = keySelector(obj);
        ret.push(newObj);
    }
    return ret;
};
Array.prototype.Ascend = function (keySelector: (element: any) => any): Array<any> {
    return this.sort((a, b) => {
        return keySelector(a) < keySelector(b) ? -1 :
            keySelector(a) > keySelector(b) ? 1 : 0;
    });
};
Array.prototype.Descend = function (keySelector: (element: any) => any): Array<any> {
    return this.sort((a, b) => {
        return keySelector(a) < keySelector(b) ? 1 :
            keySelector(a) > keySelector(b) ? -1 : 0;
    });
};
Array.prototype.First = function (func?: (obj) => boolean) {    
    if (func) {
        for (var i = 0; i < this.length; i++) {
            var currentObject = this[i];
            var match = func(currentObject);
            if (match) {
                return this[i];
            }
        }
    }
    else if (this.length > 0) {
        return this[0];
    }
    return null;
};
Array.prototype.Last = function (func?: (obj) => boolean): any {
    if (func) {
        if (this.length > 0) {
            var pos = this.length - 1;
            while (pos > 0) {
                var currentObject = this[pos];
                var match = func(currentObject);
                if (match) {
                    return this[pos];
                }
                pos--;
            }
        }
    }
    else {
        if (this.length > 0) {
            return this[this.length - 1];
        }
    }
    return null;
};
Array.prototype.Remove = function (func: (obj) => boolean): Array<any> {
    if (func) {        
        if (this.length > 0) {
            var pos = this.length - 1;
            while (pos > 0) {
                var match = func(this[pos]);
                if (match) {
                    this.splice(pos, 1);
                }
                pos--;
            }
        }
    }
    return this;
};
Array.prototype.Where = function (func: (obj) => boolean):Array<any> {
    var matches = new Array();
    for (var i = 0; i < this.length; i++) {
        var currentObject = this[i];
        var match = func(currentObject);
        if (match) {
            matches.push(currentObject);
        }
    }
    return matches;
};
Array.prototype.Min = function (field: string): number {
    var ret = null;
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        if (obj[field]) {
            if (ret == null) {
                ret = obj[field]
            }
            else if (ret > obj[field]) {
                ret = obj[field];
            }
        }
    }
    return ret;
};
Array.prototype.Max = function (field: string): number {
    var ret = 0;
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        if (obj[field]) {
            if (ret < obj[field]) {
                ret = obj[field];
            }
        }
    }
    return ret;
};
Array.prototype.Take = function (count: number): Array<any> {
    var ret = new Array();
    for (var i = 0; i < count; i++) {
        if (this.length > i) {
            ret.push(this[i]);
        }
        else {
            break;
        }
    }
    return ret;
};
Array.prototype.Add = function (objectOrObjects) {
    if (!Is.Array(objectOrObjects)) {
        objectOrObjects = [objectOrObjects];
    }
    for (var i = 0; i < objectOrObjects.length; i++) {
        this.push(objectOrObjects[i]);
    }
};
Array.prototype.GroupBy = function (...groupBy: string[]) {
    var ret = new Array();
    for (var i = 0; i < this.length; i++) {
        var that = this[i];
        var found = ret.First(function (obj) {
            var f = true;
            for (var i = 0; i < groupBy.length; i++) {
                if (obj[groupBy[i]] != that[groupBy[i]]) {
                    f = false;
                    break;
                }
            }
            return f;
        });
        if (!found) {
            var newObj = {
                Grouping: new Array()
            };
            for (var field in that) {
                newObj[field] = that[field];
            }
            newObj.Grouping.push(that);
            ret.push(newObj);
        }
        else {
            found["Grouping"].push(that);
        }
    }
    return ret;
};
Array.prototype.IndexOf = function (funcOrObj) {
    var i = -1;
    var isFunction = Is.Function(funcOrObj);
    if (isFunction) {
        for (var i = 0; i < this.length; i++) {
            if (funcOrObj(this[i])) {
                return i;
            }
        }
    }
    else {
        for (var i = 0; i < this.length; i++) {
            var match = true;
            for (var prop in funcOrObj) {
                if (funcOrObj[prop] != this[i][prop]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                return i;
            }
        }
    }
    return i;
};
Array.prototype.Insert = function (obj, position: number) {
    if (position == undefined) {
        position = 0;
    }
    if (position > this.length) {
        position = this.length;
    }
    this.splice(position, 0, obj);
};
Array.prototype.Sum = function (field: string): number {
    var ret = 0;
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        if (obj[field]) {
            ret += obj[field];
        }
    }
    return ret;
};
Array.prototype.ToArray = function (property: string) {
    var ret = new Array();
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (item[property]) {
            ret.push(item[property]);
        }
    }
    return ret;
};
//reviewed and updated NC - 2015-04-02
interface Date {
    format(mask: string, utc?: boolean): string;
    ShortDate(): any;
    SmallDate(): Date;
    Equals(date: Date): boolean;
    AddDays(days: number): Date;
    Add(years?:number, months?:number, days?:number, hours?:number, minutes?: number, seconds?:number): Date;
    DaysInMonth(): number;
    MonthName(): string;
    DaysDiff(subtractDate: Date): number;
    MinuteDiff(subtractDate: Date): number;
    Clone(): Date;
    DayOfWeek(): string;
    Date(): number;
    Month(): number;
    Year(): number;
}
Date.prototype.Year = function (): number {
    return this.getFullYear();
}
Date.prototype.Month = function (): number {
    return this.getMonth() + 1;
}
Date.prototype.Date = function (): number {
    return this.getDate();
}
Date.prototype.DayOfWeek = function (): string {
    var day = this.getDay();
    switch (day) {
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
        default:
            return "Saturday";
    }
}
Date.prototype.Clone = function (): Date {
    return this.AddDays(0);
};
Date.prototype.format = function (mask: string, utc?: boolean) {
    return Formatters.DateTime.Format(this, mask, utc);
};
Date.prototype.ShortDate = function () {
    return this.format("mm/dd/yyyy");
};
Date.prototype.SmallDate = function (): Date {
    var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0, 0);
    return now;
};
Date.prototype.Equals = function (date) {
    var ret = this.getMonth() == date.getMonth() && this.getFullYear() == date.getFullYear() && this.getDate() == date.getDate();
    return ret;
};
Date.prototype.AddDays = function (days) {
    return this.Add(0, 0, days);
};
Date.prototype.Add = function (years?: number, months?: number, days?: number, hours?: number, minutes?: number, seconds?: number): Date {
    years = years ? years : 0;
    months = months ? months : 0;
    days = days ? days : 0;
    hours = hours ? hours : 0;
    minutes = minutes ? minutes : 0;
    seconds = seconds ? seconds : 0;
    var y = this.getFullYear() + years;
    var m = this.getMonth() + months;
    var d = this.getDate() + days;
    var h = this.getHours() + hours;
    var mm = this.getMinutes() + minutes;
    var s = this.getSeconds() + seconds;
    var ms = this.getMilliseconds();
    return new Date(y, m, d, h, mm, s, ms);
};
Date.prototype.DaysInMonth = function () {
    return 32 - new Date(this.getFullYear(), this.getMonth(), 32).getDate();
};
Date.prototype.MonthName = function () {
    switch (this.getMonth()) {
        case 0:
            return "January";
        case 1:
            return "February";
        case 2:
            return "March";
        case 3:
            return "April";
        case 4:
            return "May";
        case 5:
            return "June";
        case 6:
            return "July";
        case 7:
            return "August";
        case 8:
            return "September";
        case 9:
            return "October";
        case 10:
            return "November";
        case 11:
            return "December";
        default:
            return "Unknown";
    }
};
Date.prototype.DaysDiff = function (subtractDate) {
    var diff = Math.abs(<any>this - <any>subtractDate);
    return diff / 1000 / 60 / 60 / 24;
};
Date.prototype.MinuteDiff = function (subtractDate) {
    var diff = Math.abs(<any>this - <any>subtractDate);
    return diff / 1000 / 60 / 60;
};
interface HTMLElement extends Element {
    Get(predicate: (element: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[]
    First(predicate: (element: HTMLElement) => boolean): HTMLElement;
    Parent(predicate: (element: HTMLElement) => boolean): HTMLElement;
    Delete(predicate: (element: HTMLElement) => boolean);
    Clear(predicate?: (element: HTMLElement) => boolean, notRecursive?: boolean);
    AddRange(...elements: HTMLElement[]): HTMLElement;
    Remove();
    AddHtml: (html: string) => HTMLElement;
    SetClass(className: string);    
    OffSet(): { top: number; left: number; };
    Dimensions(): { width: number; height: number; };
    DimAndOff(): { Height: number; Width: number; Top: number; Left: number; };
    AddListener(eventName, method);
    Set(objectProperties): HTMLElement;
    HasDataSet: () => boolean;
    GetDataSetAttributes: () => { name: string; value: any; }[];
    DataObject: any;
    DataContainer: IDataContainer;
    ElementBindingIndex: number;
}
HTMLElement.prototype.Get = function (predicate: (element: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[] {
    if (nodes == null) {
        nodes = new Array<HTMLElement>();
    }
    var that = <HTMLElement>this;
    var children = that.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1
            && children[i].tagName.toLowerCase() != "svg") {
            var child = <HTMLElement>children[i]
            var fmatch = predicate(child);
            if (fmatch) {
                nodes.push(child);
            }
            if (!notRecursive && child.Get) {
                child.Get(predicate, notRecursive, nodes);
            }
        }
    }
    return nodes;
};
HTMLElement.prototype.First = function (predicate: (element: HTMLElement) => boolean): HTMLElement {
    var that = <HTMLElement>this;
    var children = that.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1
            && children[i].tagName.toLowerCase() != "svg") {
            var child = <HTMLElement>children[i];
            if (predicate(child)) {
                return child;
            }
        }
    }
    var found = null;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1 && children[i].tagName.toLowerCase() != "svg") {
            var c = <HTMLElement>children[i];
            if (c.First) {
                found = c.First(predicate);
                if (found) {
                    return found;
                }
            }
        }
    }
    return null;
};
HTMLElement.prototype.Parent = function (predicate: (element: HTMLElement) => boolean): HTMLElement {
    var el = this;
    while (el && el.parentNode) {
        el = el.parentNode;
        if (predicate(el)) {
            return el;
        }
    }
    return null;
};
HTMLElement.prototype.Delete = function (predicate: (element: HTMLElement) => boolean) {
    var that = <HTMLElement>this;
    var found = that.First(predicate);
    if (found) {
        found.Remove();
    }
};
HTMLElement.prototype.Clear = function (predicate?: (element: HTMLElement) => boolean, notRecursive?: boolean) {
    var that = <HTMLElement>this;
    var children = that.childNodes;
    if (!predicate) {
        while (children.length > 0) {
            that.removeChild(children[0]);
        }
    }
    else {
        var pos = children.length - 1;
        while (pos > 0) {
            if (children[pos].nodeType == 1) {
                var child = <HTMLElement>children[pos];
                if (predicate(child)) {
                    that.removeChild(child);
                }
                else if (!notRecursive && child.Clear) {
                    child.Clear(predicate, notRecursive);
                }
            }
            else {
                that.removeChild(children[pos]);
            }
            pos--;
        }
    }
};
HTMLElement.prototype.AddRange = function (...elements: HTMLElement[]): HTMLElement {
    var that = <HTMLElement>this;
    elements.forEach(e=> that.appendChild(e));
    return that;
};
HTMLElement.prototype.Remove = function () {
    this.parentNode.removeChild(this);
};
HTMLElement.prototype.AddHtml = function (value: string): HTMLElement{
    var ret = value.CreateElementFromHtml();
    this.appendChild(ret);
    return ret;
};
HTMLElement.prototype.SetClass = function (className: string) {
    this.className = null;
    this.className = className;
};
HTMLElement.prototype.OffSet = function (): { top: number; left: number; } {
    var _x = 0;
    var _y = 0;
    var el = <HTMLElement>this;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        //may not work
        el = <HTMLElement>el.offsetParent;
    }
    return { top: _y, left: _x };
};
HTMLElement.prototype.Dimensions = function (): { width: number; height: number; } {
    var ret = { width: 0, height: 0 };
    ret.width = this.offsetWidth;
    ret.height = this.offsetHeight;
    return ret;
};
HTMLElement.prototype.DimAndOff = function (): { Height: number; Width: number; Top: number; Left: number; } {
    var ret = {
        Height: 0,
        Width: 0,
        Top: 0,
        Left: 0
    };
    var dim = this.Dimensions();
    var pos = this.OffSet();
    ret.Height = dim.height;
    ret.Width = dim.width;
    ret.Top = pos.top;
    ret.Left = pos.left;
    return ret;
};
HTMLElement.prototype.AddListener = function (eventName, method) {
    if (this.addEventListener) {
        this.addEventListener(eventName, method);
    }
    else {
        this.attachEvent(eventName, method);
    }
};
HTMLElement.prototype.Set = function (objectProperties) {
    var that = <HTMLElement>this;
    if (objectProperties) {
        for (var prop in objectProperties) {
            var tempPropName = prop;
            if (tempPropName != "cls" && tempPropName != "className") {
                var isStyleProp = Is.Style(tempPropName);
                if (isStyleProp) {
                    that.style[tempPropName] = objectProperties[prop];
                }
                else if (prop == "style") {
                    if (objectProperties.style.cssText) {
                        that.style.cssText = objectProperties.style.cssText;
                    }
                }
                else {
                    that[tempPropName] = objectProperties[prop];
                }
            }
            else {
                that.SetClass(objectProperties[prop]);
            }
        }
    }
    return that;
};
HTMLElement.prototype.HasDataSet = function () {
    if (this["dataset"]) {
        var dataset = this["dataset"];
        for (var prop in dataset) {
            return true;
        }
    }
    return false;
};
HTMLElement.prototype.GetDataSetAttributes = function () {
    var ret = new Array< { name: string; value: any; }>();
    if (this["dataset"]) {
        var dataset = this["dataset"];
        for (var prop in dataset) {
            ret.Add({ name: prop, value: dataset[prop] });
        }
    }
    return ret;
};
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
interface HTMLInputElement {    
    AutoSuggest(dataSource: Array<any>,
        valueMember: string,
        displayMember: string,
        displayCount?: number);
} 
HTMLInputElement.prototype.AutoSuggest = function (dataSource: Array<any>,
    valueMember: string,
    displayMember: string,
    displayCount?: number) {
    AutoSuggest.Hook(this, dataSource, valueMember, displayMember, displayCount);
};
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
interface HTMLSelectElement {
    AddOptions(arrayOrObject, valueProperty?: string, displayProperty?: string, selectedValue?): HTMLSelectElement;
    AddOptionsViaObject(obj, selectedValue?, orderedAsIs?);
}
HTMLSelectElement.prototype.AddOptions= function(arrayOrObject, valueProperty ? : string, displayProperty?: string, selectedValue?): HTMLSelectElement {
    var select = <HTMLSelectElement>this;
    if (Is.Array(arrayOrObject)) {
        var tempArray = <Array<any>>arrayOrObject;
        if (displayProperty && valueProperty) {
            tempArray.forEach(t=> {                
                select["options"][select.options.length] = new Option(t[displayProperty], t[valueProperty]);
                if (selectedValue &&
                    t[valueProperty] == selectedValue) {
                    select["options"][select.options.length - 1].selected = "true";
                }
            });                        
        }
        else if (tempArray.length > 1 && Is.String(tempArray[0])) {
            tempArray.forEach(t => {
                select["options"][select.options.length] = new Option(t, t);
                if (selectedValue &&
                    t == selectedValue) {
                    select["options"][select.options.length - 1].selected = "true";
                }
            });
        }
    }
    else if (arrayOrObject) {
        //if its a object prop
        for (var prop in arrayOrObject) {
            if (Is.Function(prop)) {
                select["options"][select.options.length] = new Option(prop, prop);
                if (selectedValue && selectedValue == prop) {
                    select["options"][select.options.length - 1].selected = "selected";
                }
            }
        }
    }    
    return select;
};
HTMLSelectElement.prototype.AddOptionsViaObject = function (obj, selectedValue?, orderedAsIs?) {
    var select = <HTMLSelectElement>this;
    if (orderedAsIs) {
        for (var prop in obj) {
            select["options"][select.options.length] = new Option(prop, obj[prop]);
            if (selectedValue && selectedValue == obj[prop]) {
                select["options"][select.options.length - 1].selected = "selected";
            }
        }
    }
    else {
        var tempArray = new Array();
        for (var prop in obj) {
            if (Is.Numeric(obj[prop]))
            {
                tempArray.push(prop);
            }
        }
        tempArray = tempArray.sort();
        tempArray.forEach(t=> {            
            select["options"][select.options.length] = new Option(t, obj[t]);
            if (selectedValue != undefined && selectedValue == obj[t]) {
                select["options"][select.options.length - 1].selected = "selected";
            }
        });
    }
};
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
HTMLUListElement.prototype.InsertAndBind = function (dataObject: any, beforeElement?: HTMLLIElement):HTMLLIElement {
    var that = <HTMLUListElement>this;
    var row = <HTMLLIElement>that.RowHtml.CreateElementFromHtml();
    row.DataObject = dataObject;
    row.DataContainer = that;
    row.OriginalClass = row.className ? row.className : null;
    row.TemplateType = "row";
    row.onclick = function () {
        that.SetSelected(row.DataObject, row);
    };
    that.InsertRow(row, beforeElement);
    Binding.DataContainer.DataBind(that, row, dataObject);
    return row;
};
HTMLUListElement.prototype.AddRow = function (dataObject: any, beforeElement?: HTMLLIElement): HTMLLIElement {
    var that = <HTMLUListElement>this;
    that.DataObject.Add(dataObject);
    var row = <HTMLLIElement>that.RowHtml.CreateElementFromHtml();
    row.DataObject = dataObject;
    row.DataContainer = that;
    row.OriginalClass = row.className ? row.className : null;
    row.TemplateType = "row";
    row.onclick = function () {
        that.SetSelected(row.DataObject, row);
    };
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
interface String {
    Trim(): string;
    TrimCharacters(characterAtZero: string, characterAtEnd: string): string;
    Element(): HTMLElement;
    Form(): HTMLFormElement;
    List(): HTMLUListElement;
    Input(): HTMLInputElement;
    DropDown(): HTMLSelectElement;
    CreateElement(objectProperties?): HTMLElement;    
    CreateElementFromHtml(): HTMLElement;
    Post(parameters, success?);
    Put(parameters, success?);
    Get(parameters, success?, isRaw?: boolean);
    Delete(parameters, success?);
}
String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.TrimCharacters = function (characterAtZero, characterAtEnd) {
    var ret = this;
    if (characterAtZero) {
        if (ret.indexOf(characterAtZero) == 0) {
            ret = ret.substring(1);
        }
    }
    if (characterAtEnd) {
        var lastCharacter = ret.substring(ret.length - 1);
        if (lastCharacter == characterAtEnd) {
            //not sure about that
            ret = ret.substring(0, ret.length - 1);
        }
    }
    return ret;
};
String.prototype.Element = function (): HTMLElement {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLElement>obj;
    }
    return null;
};
String.prototype.Form = function (): HTMLFormElement {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLFormElement>obj;
    }
    return null;
};
String.prototype.List = function (): HTMLUListElement {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLUListElement>obj;
    }
    return null;
};
String.prototype.Input = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLInputElement>obj;
    }
    return null;
};
String.prototype.DropDown = function (): HTMLSelectElement {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLSelectElement>obj;
    }
    return null;
};
String.prototype.CreateElement = function (objectProperties?): HTMLElement {
    var obj = document.createElement(this);
    if (objectProperties) {
        obj.Set(objectProperties);
    }
    return obj;
};
String.prototype.CreateElementFromHtml = function (): HTMLElement {
    var ret = new Array<HTMLElement>();
    var div = "div".CreateElement({ innerHTML: this });
    while (div.children.length > 0) {
        var child = div.children[div.children.length - 1];
        return <HTMLElement>child;
    }    
};
String.prototype.Put = function (parameters?, success?) {
    Ajax.HttpAction("PUT", this, parameters, success);
};
String.prototype.Delete = function (parameters?, success?) {
    Ajax.HttpAction("DELETE", this, parameters, success);
};
String.prototype.Post = function (parameters?, success?) {
    Ajax.HttpAction("POST", this, parameters, success);
};
String.prototype.Get = function (parameters?, success?, isRaw?: boolean) {
    var url = this;
    if (parameters) {
        if (Is.Array(parameters)) {
            for (var i = 0; i < parameters.length; i++) {
                url += "/" + parameters[i].toString();
            }
            Ajax.HttpAction("GET", url, null, success, isRaw);
        }
        else {
            url += "/";
            var queryIndicator = "?";
            for (var prop in parameters) {
                if (parameters[prop]) {
                    url += queryIndicator + prop + "=" + parameters[prop].toString();
                    queryIndicator = "&";
                }
            }
            Ajax.HttpAction("GET", url, null, success, isRaw);
        }
    }
    else {
        Ajax.HttpAction("GET", url, null, success, isRaw);
    }
};
interface Window {
    SplitPathName(): Array<string>;
    PageLoaded(postLoadFuntion, e?);
    PushState(stateobj, title, url);
    Dimensions(): { Height: number; Width: number; };
    Show(viewKey, parameters?: Array<any>);
    Exception(...parameters: any[]);
}
Window.prototype.Exception = function (...parameters: any[]) {
    if (parameters.length == 1) {
        var obj = {};
        for (var i = 0; i < parameters.length; i++) {
            obj["parameter" + i] = parameters[i];
        }
        alert(JSON.stringify(obj));
    }
    else if (parameters.length > 1) {
        alert(JSON.stringify(parameters[0]));
    }
    else {
        alert("Unknown error");
    }
};
Window.prototype.Show = function (viewKey, parameters?: Array<any>) {
    ViewManager.Load(viewKey, parameters);
};
Window.prototype.Dimensions = function (): { Height: number; Width: number; } {
    var ret = { Height: 0, Width: 0 };
    var temp = <any>window;
    if (typeof temp.innerWidth != 'undefined') {
        ret.Width = temp.innerWidth,
        ret.Height = temp.innerHeight
    }
    else if (typeof document.documentElement != 'undefined'
        && typeof document.documentElement.clientWidth !=
        'undefined' && document.documentElement.clientWidth != 0) {
        ret.Width = document.documentElement.clientWidth,
        ret.Height = document.documentElement.clientHeight
    }
    else {
        ret.Width = document.getElementsByTagName('body')[0].clientWidth,
        ret.Height = document.getElementsByTagName('body')[0].clientHeight
    }
    return ret;
};
Window.prototype.PushState = function (stateobj, title, url) {
    if (history && history.pushState) {
        if (Is.Array(url)) {
            url = "/" + url.join("/");
        }
        else if (!url) {
            url = "/";
        }
        else if (url.indexOf("/") != 0) {
            url = "/" + url;
        }
        history.pushState(stateobj, title, url);
    }
};
Window.prototype.SplitPathName = function (): Array<string> {
    var ret = new Array<string>();
    var pathName = window.location.pathname;
    pathName = pathName.substring(1);
    var lastCharacter = pathName.charAt(pathName.length - 1);
    if (lastCharacter == "/") {
        pathName = pathName.substring(0, pathName.length - 1);
    }
    var split = pathName.split("/");
    return split;
};
Window.prototype.PageLoaded = function (postLoadFuntion, e?) {    
    if (document.readyState === "complete") {
        postLoadFuntion();        
    }
    else {
        if (window.onload) {
            var curronload = window.onload;
            var newonload = function () {
                curronload(<Event>e);
                postLoadFuntion();                
            };
            window.onload = newonload;
        } else {
            window.onload = function () {
                postLoadFuntion();                
            }
        }
    }
};
function autoBindForms() {
    var elements = document.body.Get(ele=> {
        return !Is.NullOrEmpty(ele.getAttribute(Binding.Attributes.Auto));
    });
    for (var i = 0; i < elements.length; i++) {
        Binding.DataContainer.Auto(elements[i]);
    }
};
function WindowLoad(e?) {
    if (document.readyState === "complete") {
        var pg = document.getElementById("progress");
        if (pg != null && Ajax) {
            Ajax.ProgressElement = pg;
        }
        autoBindForms();
    } else {
        if (window.onload) {
            var curronload = window.onload;
            var newonload = function () {
                var pg = document.getElementById("progress");
                if (pg != null && Ajax) {
                    Ajax.ProgressElement = pg;
                }
                curronload(e);
                autoBindForms();
            };
            window.onload = newonload;
        } else {
            window.onload = function () {
                var pg = document.getElementById("progress");
                if (pg != null && Ajax) {
                    Ajax.ProgressElement = pg;
                }
                autoBindForms();
            };
        }
    }
};
WindowLoad();
