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
            if (container.Pks == null) {
                var webApi = container.getAttribute(Binding.Attributes.WebApi);
                var pks = container.getAttribute(Binding.Attributes.Pks);
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
                Binding.DataContainer.SetUpBindingAttributes(dataContainer, e, i);
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
                Binding.DataContainer.SetUpBindingAttributes(dataContainer, e, i);
                i++;
            });
        }
        export function SetUpBindingAttributes(dataContainer: IDataContainer, element: HTMLElement, index: number) {
            var bindingAttributes = element.GetDataSetAttributes().Ascend(x=> x.name);
            bindingAttributes.forEach(ba=> dataContainer.DataBindings.Add(new DataBinding(dataContainer, index, ba.name, ba.value)));
            element.DataContainer = dataContainer;
            element.ElementBindingIndex = index;
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
                                        Events.OnRebindAndActionEvent(dataContainer, field, tempElement, tempElement.value);
                                    }
                                });
                            }
                            else {
                                Events.OnRebindAndActionEvent(dataContainer, field, tempElement, tempElement.value);
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
        export function OnRebindAndActionEvent(dataContainer:IDataContainer, field:string, element:any, value:any) {
            dataContainer.Rebind(field, element);
            var actionEvent = new ActionEvent(ActionType.Updated, element.DataObject, field, value);
            dataContainer.ActionEvent(actionEvent);
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
                                        Events.OnRebindAndActionEvent(dataContainer, field, input, checked);
                                    }
                                });
                            }
                            else {
                                Events.OnRebindAndActionEvent(dataContainer, field, input, checked);
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
                                    Events.OnRebindAndActionEvent(dataContainer, field, input, input.value);
                                }
                            });
                        }
                        else {
                            Events.OnRebindAndActionEvent(dataContainer, field, input, input.value);
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