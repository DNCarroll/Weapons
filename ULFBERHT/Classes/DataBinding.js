var DataBinding = (function () {
    function DataBinding(dataContainer, elementBindingIndex, attribute, attributeValue) {
        this.IsEventBinding = false;
        this.returnParameters = new Array();
        this.Target = null;
        this.ElementBindingIndex = elementBindingIndex;
        this.DataContainer = dataContainer;
        this.Fields = new Array();
        this.Target = attribute;
        if (this.Target && attributeValue) {
            attributeValue = attributeValue.Trim();
            if (this.Target == Binding.Targets.Formatting ||
                this.Target == Binding.Targets.DataSource) {
                attributeValue = attributeValue.indexOf("return") == -1 ? "return " + attributeValue : attributeValue;
            }
            else if (this.Target == Binding.Targets.OnFocus ||
                this.Target == Binding.Targets.OnClick ||
                this.Target == Binding.Targets.OnMouseOut ||
                this.Target == Binding.Targets.OnMouseOver) {
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
    Object.defineProperty(DataBinding.prototype, "DataContainer", {
        get: function () {
            return this._dataContainer;
        },
        set: function (value) {
            this._dataContainer = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataBinding.prototype, "Target", {
        get: function () {
            return this._target;
        },
        set: function (value) {
            this._target = value;
        },
        enumerable: true,
        configurable: true
    });
    DataBinding.prototype.Dispose = function () {
        this.DataContainer = null;
        this.ElementBindingIndex = null;
        this.Bind = null;
        this.Target = null;
        this.Fields = null;
        this.returnParameters = null;
        this.return = null;
    };
    DataBinding.prototype.ExecuteReturn = function (element) {
        if (this.return) {
            var arrayOfObjects = new Array();
            var value;
            this.returnParameters.forEach(function (r) {
                if (r == "obj") {
                    arrayOfObjects.push(element.DataObject);
                }
                else if (r == "sender") {
                    arrayOfObjects.push(element);
                }
                else {
                    arrayOfObjects.push(element.DataObject[r]);
                }
            });
            return arrayOfObjects.Return(this.return);
        }
        return null;
    };
    DataBinding.prototype.HookUpEvent = function (element) {
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
                        var datasource = element["datasource"];
                        var displayMember = this.DataContainer.DataBindings.First(function (d) { return d.Target == Binding.Targets.DisplayMember && d.ElementBindingIndex == element.ElementBindingIndex; });
                        var valueMember = this.DataContainer.DataBindings.First(function (d) { return d.Target == Binding.Targets.ValueMember && d.ElementBindingIndex == element.ElementBindingIndex; });
                        var displayCountBinding = this.DataContainer.DataBindings.First(function (d) { return d.Target == Binding.Targets.DisplayCount && d.ElementBindingIndex == element.ElementBindingIndex; });
                        var displayCount = 8;
                        if (displayCountBinding) {
                            displayCount = parseInt(displayCountBinding.Fields[0]);
                        }
                        AutoSuggest.Hook(element, datasource, valueMember.Fields[0], displayMember.Fields[0], displayCount);
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
    };
    DataBinding.prototype.returnBinding = function (attributeValue) {
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
            this.Bind = function (element) {
                var arrayOfObjects = new Array();
                var value;
                this.returnParameters.forEach(function (rp) {
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
                        };
                    }
                }
                else {
                    if (this.Target == Binding.Targets.DataSource && this.DataSource != null) {
                        this.setAttribute(this.DataSource, element);
                    }
                    else {
                        value = arrayOfObjects.Return(this.return);
                        if (this.Target == Binding.Targets.DataSource) {
                            this.DataSource = value;
                        }
                        this.setAttribute(value, element);
                    }
                }
            };
        }
    };
    DataBinding.prototype.easyBinding = function () {
        this.Bind = function (element) {
            var value = element.DataObject[this.Fields[0]];
            this.setAttribute(value, element);
            this.HookUpEvent(element);
        };
    };
    DataBinding.prototype.setAttribute = function (value, element) {
        switch (this.Target) {
            case Binding.Targets.Value:
                if (element.tagName == "INPUT" && element["type"] == "text") {
                    var displayMember = this.DataContainer.DataBindings.First(function (d) { return d.Target == Binding.Targets.DisplayMember && d.ElementBindingIndex == element.ElementBindingIndex; });
                    var valueMember = this.DataContainer.DataBindings.First(function (d) { return d.Target == Binding.Targets.ValueMember && d.ElementBindingIndex == element.ElementBindingIndex; });
                    if (valueMember) {
                        var input = element;
                        var datasource = element["datasource"];
                        var displayMember = this.DataContainer.DataBindings.First(function (d) { return d.Target == Binding.Targets.DisplayMember && d.ElementBindingIndex == element.ElementBindingIndex; });
                        var valueMember = this.DataContainer.DataBindings.First(function (d) { return d.Target == Binding.Targets.ValueMember && d.ElementBindingIndex == element.ElementBindingIndex; });
                        if (datasource && displayMember && valueMember) {
                            var found = datasource.First(function (o) { return o[valueMember.Fields[0]] == value; });
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
                var displayMember = this.DataContainer.DataBindings.First(function (d) { return d.Target == Binding.Targets.DisplayMember && d.ElementBindingIndex == element.ElementBindingIndex; });
                var valueMember = this.DataContainer.DataBindings.First(function (d) { return d.Target == Binding.Targets.ValueMember && d.ElementBindingIndex == element.ElementBindingIndex; });
                if (element.tagName == "SELECT") {
                    var select = element;
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
                var input = element;
                input.checked = value ? true : false;
                break;
            case Binding.Targets.Radio:
                var input = element;
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
                if (this.Target.indexOf("-") > -1) {
                    var split = this.Target.split("-");
                    if (split.length > 1) {
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
    };
    return DataBinding;
})();
