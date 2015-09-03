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
    //export function HookWithCallBack(input: HTMLInputElement, callBack: (input: HTMLInputElement) => Array<any>, valueMember: string, displayMember: string, displayCount?: number){
    //    input["callBack"] = callBack;
    //    input["valuemember"] = valueMember;
    //    input["displaymember"] = displayMember;
    //    input["displaycount"] = displayCount ? displayCount : 8;
    //    hookEvents(input);
    //}
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