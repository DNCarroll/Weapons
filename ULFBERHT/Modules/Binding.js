var Binding;
(function (Binding) {
    var Targets;
    (function (Targets) {
        //for select and auto suggest input
        Targets.DataSource = "datasource";
        Targets.DisplayMember = "displaymember";
        Targets.DisplayCount = "displaycount";
        Targets.ValueMember = "valuemember";
        Targets.Checked = "checked";
        Targets.Radio = "radio";
        Targets.OnMouseOver = "onmouseover";
        Targets.OnMouseOut = "onmouseout";
        Targets.OnFocus = "onfocus";
        Targets.Formatting = "formatting";
        Targets.ClassName = "classname";
        Targets.InnerHtml = "innerhtml";
        Targets.Value = "value";
        Targets.For = "for";
        Targets.ID = "id";
        Targets.OnClick = "onclick";
        Targets.Src = "src";
        Targets.Href = "href";
        Targets.Style = "style";
        Targets.Action = "action"; //insert, delete, push, unshift
        //future
        Targets.Sort = "sort";
    })(Targets = Binding.Targets || (Binding.Targets = {}));
    var Attributes;
    (function (Attributes) {
        Attributes.WebApi = "data-webapi";
        Attributes.Pks = "data-pks";
        Attributes.Action = "data-action";
        Attributes.SelectedItemChanged = "data-selecteditemchanged";
        Attributes.SelectedItemClass = "data-selecteditemclass";
        Attributes.FormID = "data-formid";
        Attributes.Template = "data-template";
        //these should only ever be used once
        //right when the autoload window method occurs
        Attributes.Auto = "data-auto";
        Attributes.AutoParameter = "data-autoparameter";
    })(Attributes = Binding.Attributes || (Binding.Attributes = {}));
    var DataContainer;
    (function (DataContainer) {
        function Auto(element) {
            var dataContainter = element;
            if (dataContainter.dataset["webapi"] && dataContainter.dataset["pks"]) {
                var webApi = dataContainter.dataset["webapi"];
                var parameter = null;
                if (element.dataset["autoparameter"]) {
                    var returnLine = element.dataset["autoparameter"].toString().Trim();
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
        DataContainer.Auto = Auto;
        function Rebind(cont, sender, field) {
            var elements = document.body.Get(function (e) { return e.DataObject == sender.DataObject && e != sender && e.DataContainer != null; });
            elements.forEach(function (e) {
                var bindings = e.DataContainer.DataBindings.Where(function (d) { return d.ElementBindingIndex == e.ElementBindingIndex && d.Fields.First(function (f) { return f == field; }) != null; });
                if (bindings.length > 0) {
                    bindings.forEach(function (b) { return b.Bind(e); });
                }
            });
        }
        DataContainer.Rebind = Rebind;
        function LookForInsert(li) {
            var elements = li.Get(function (e) { return e.HasDataSet(); });
            var possibleInsert = elements.First(function (e) { return e.dataset[Binding.Targets.Action] != null; });
            if (possibleInsert) {
                var value = possibleInsert.dataset[Binding.Targets.Action].toLowerCase();
                if (["push", "insert", "unshift"].indexOf(value) > -1) {
                    possibleInsert.dataset[Binding.Targets.Action] = value;
                    Binding.Events.Insert(possibleInsert);
                }
            }
        }
        DataContainer.LookForInsert = LookForInsert;
        function Setup(container) {
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
                    container.Pks = new Array();
                    pks.split(";").forEach(function (pk) { return container.Pks.Add(pk.Trim()); });
                }
                var action = container.getAttribute(Binding.Attributes.Action);
                if (action) {
                    action += "(obj0);";
                    var fun = Binding.Return(action, 1);
                    container.ActionEvent = function (actionEvent) {
                        [actionEvent].Return(fun);
                    };
                }
                else {
                    container.ActionEvent = function (actionEvent) {
                    };
                }
                var formID = container.getAttribute(Binding.Attributes.FormID);
                if (formID) {
                    container.Form = formID.Element();
                }
                container.SelectedItemClass = container.getAttribute(Binding.Attributes.SelectedItemClass);
                var selecteditemchanged = container.getAttribute(Binding.Attributes.SelectedItemChanged);
                if (selecteditemchanged) {
                    container.SelectedItemChanged = new Function("obj", "sender", "return " + selecteditemchanged + "(obj, sender);");
                }
            }
            return ret;
        }
        DataContainer.Setup = Setup;
        function SetupUl(ul) {
            var ret = true;
            var lis = ul.Get(function (e) { return e.tagName == "LI"; });
            ul.HeaderHtml = new Array();
            ul.FooterHtml = new Array();
            lis.forEach(function (li) {
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
                            var tempLi = li;
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
        DataContainer.SetupUl = SetupUl;
        function SetupDataBindingsFromLi(dataContainer, li) {
            dataContainer.DataBindings = new Array();
            var elements = li.Get(function (d) { return d.HasDataSet(); });
            var i = 0;
            elements.forEach(function (e) {
                var bindingAttributes = e.GetDataSetAttributes().Ascend(function (x) { return x.name; });
                bindingAttributes.forEach(function (ba) { return dataContainer.DataBindings.Add(new DataBinding(dataContainer, i, ba.name, ba.value)); });
                e.DataContainer = dataContainer;
                e.ElementBindingIndex = i;
                i++;
            });
        }
        DataContainer.SetupDataBindingsFromLi = SetupDataBindingsFromLi;
        function SetupDataBindings(dataContainer, filter) {
            dataContainer.DataBindings = new Array();
            if (!filter) {
                filter = function (d) { return d.HasDataSet(); };
            }
            var elements = dataContainer.Get(filter);
            var i = 0;
            elements.forEach(function (e) {
                var bindingAttributes = e.GetDataSetAttributes().Ascend(function (x) { return x.name; });
                bindingAttributes.forEach(function (ba) { return dataContainer.DataBindings.Add(new DataBinding(dataContainer, i, ba.name, ba.value)); });
                e.DataContainer = dataContainer;
                e.ElementBindingIndex = i;
                i++;
            });
        }
        DataContainer.SetupDataBindings = SetupDataBindings;
        function DataBind(dataContainer, target, data) {
            var elements = target.Get(function (d) { return d.HasDataSet(); });
            var i = 0;
            elements.forEach(function (e) {
                e.DataContainer = dataContainer;
                e.ElementBindingIndex = i;
                e.DataObject = data;
                dataContainer.DataBindings.Where(function (d) { return d.ElementBindingIndex == i; }).forEach(function (b) { return b.Bind(e); });
                i++;
            });
        }
        DataContainer.DataBind = DataBind;
        function Dispose(dataContainer) {
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
        DataContainer.Dispose = Dispose;
    })(DataContainer = Binding.DataContainer || (Binding.DataContainer = {}));
    var Events;
    (function (Events) {
        function SetObjectValue(obj, property, newValue) {
            var currentValue = obj[property];
            var tempString = newValue;
            if (typeof currentValue === "number") {
                obj[property] = parseFloat(tempString);
            }
            else {
                obj[property] = tempString;
            }
        }
        Events.SetObjectValue = SetObjectValue;
        function OnChange(element, dataContainer, dataBind, field) {
            var tempElement = element;
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
                                        var formatting = element.DataContainer.DataBindings.First(function (o) { return o.Target == Binding.Targets.Formatting; });
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
        Events.OnChange = OnChange;
        function Checked(element, dataContainer, dataBind, field) {
            var input = element;
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
                };
            }
        }
        Events.Checked = Checked;
        function Radio(element, dataContainer, dataBind, field) {
            var input = element;
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
        Events.Radio = Radio;
        function Delete(element, dataContainer, dataBind, field) {
            if (!element.onclick) {
                element.onclick = function () {
                    var parameter = {};
                    if (dataContainer.Pks) {
                        dataContainer.Pks.forEach(function (pk) { return parameter[pk] = element.DataObject[pk]; });
                    }
                    var actionEvent = new ActionEvent(ActionType.Deleting, element.DataObject, field, null);
                    dataContainer.ActionEvent(actionEvent);
                    if (!actionEvent.Cancel) {
                        if (dataContainer.WebApi) {
                            dataContainer.WebApi.Delete(parameter, function (result) {
                                actionEvent = new ActionEvent(ActionType.Deleted, element.DataObject, field, null);
                                dataContainer.ActionEvent(actionEvent);
                                var ul = element.Parent(function (p) { return p.tagName == "UL"; });
                                var li = ul.First(function (l) { return l.tagName == "LI" && l.DataObject == element.DataObject; });
                                var array = ul.DataObject;
                                var index = array.indexOf(element.DataObject);
                                li.Remove();
                                array.Remove(function (o) { return o == element.DataObject; });
                                if (dataContainer.Form != null && array.length > 0) {
                                    if (index >= array.length) {
                                        index = array.length - 1;
                                    }
                                    var selectByObject = array[index];
                                    li = ul.First(function (e) { return e.tagName == "LI" && e.DataObject == selectByObject; });
                                    ul.SetSelected(selectByObject, li);
                                }
                            });
                        }
                        actionEvent = null;
                    }
                };
            }
        }
        Events.Delete = Delete;
        function Insert(element) {
            if (!element.onclick) {
                element.onclick = function () {
                    var li = element.Parent(function (p) { return p.tagName == "LI"; });
                    var ul = li.Parent(function (p) { return p.tagName == "UL"; });
                    var array = ul.DataObject;
                    var direction = element.dataset[Binding.Targets.Action];
                    var newObject = {};
                    var boundElements = li.Get(function (e) { return e.HasDataSet() && e != element; });
                    boundElements.forEach(function (e) {
                        var bindingAttributes = e.GetDataSetAttributes();
                        bindingAttributes.forEach(function (b) {
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
                                var missingPK = ul.Pks.First(function (pk) { return !newObject[pk]; });
                                if (missingPK) {
                                    alert("Missing primary keys from: " + JSON.stringify(newObject));
                                }
                                else {
                                    var before = null;
                                    if (element.dataset[Binding.Targets.Action] == "unshift") {
                                        array.unshift(newObject);
                                        before = ul.First(function (e) { return e.tagName == "LI" && e["TemplateType"] != "header"; });
                                    }
                                    else {
                                        array.push(newObject);
                                        before = ul.First(function (e) { return e.tagName == "LI" && e["TemplateType"] == "footer"; });
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
        Events.Insert = Insert;
    })(Events = Binding.Events || (Binding.Events = {}));
    function Return(returnLine, length) {
        var parameters = new Array();
        var pos = 0;
        while (length > 0) {
            parameters.Add("obj" + pos.toString());
            pos++;
            length--;
        }
        parameters.Add(returnLine);
        return Function.apply(null, parameters);
    }
    Binding.Return = Return;
    Binding.Happened;
})(Binding || (Binding = {}));
