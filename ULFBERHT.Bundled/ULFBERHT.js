var ActionEvent = (function () {
    function ActionEvent(actionType, obj, field, value) {
        this.Cancel = false;
        this.ActionType = actionType;
        this.Object = obj;
        this.Field = field;
        this.Value = value;
    }
    return ActionEvent;
})();
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
var DialogType;
(function (DialogType) {
    DialogType[DialogType["Modal"] = 0] = "Modal";
    DialogType[DialogType["Popup"] = 1] = "Popup";
    DialogType[DialogType["Quick"] = 2] = "Quick";
    DialogType[DialogType["Standard"] = 3] = "Standard";
})(DialogType || (DialogType = {}));
var DialogPosition;
(function (DialogPosition) {
    DialogPosition[DialogPosition["MiddleOfWindow"] = 0] = "MiddleOfWindow";
    DialogPosition[DialogPosition["Below"] = 1] = "Below";
    DialogPosition[DialogPosition["Above"] = 2] = "Above";
    DialogPosition[DialogPosition["Manual"] = 100] = "Manual";
})(DialogPosition || (DialogPosition = {}));
var DialogResult;
(function (DialogResult) {
    DialogResult[DialogResult["No"] = 0] = "No";
    DialogResult[DialogResult["Yes"] = 1] = "Yes";
    DialogResult[DialogResult["Ok"] = 2] = "Ok";
})(DialogResult || (DialogResult = {}));
var ButtonType;
(function (ButtonType) {
    ButtonType[ButtonType["InputButton"] = 0] = "InputButton";
    ButtonType[ButtonType["Anchor"] = 1] = "Anchor";
    ButtonType[ButtonType["ImageButton"] = 2] = "ImageButton";
})(ButtonType || (ButtonType = {}));
var DialogButton = (function () {
    function DialogButton(text, buttonType, className) {
        this.Text = text;
        this.ClassName = className;
        this.ButtonType = buttonType == null ? ButtonType.InputButton : buttonType;
        //        this.ImageSrc = imageSrc;
    }
    return DialogButton;
})();
var DialogProperties = (function () {
    function DialogProperties(container, dialogType, target, hideInterval, position, modalClass, offSetX, offsetY) {
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
        if (hideInterval == null) {
            if (this.DialogType == DialogType.Popup || this.DialogType == DialogType.Quick) {
                this.HideInterval = Dialog.DefaultHideInterval;
            }
            else {
                this.HideInterval = -1;
            }
        }
        else {
            this.HideInterval = hideInterval;
        }
        if (position != DialogPosition.Manual) {
            if (position == null && this.Target == null) {
                this.Position = DialogPosition.MiddleOfWindow;
            }
            else if (position == null && this.Target != null) {
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
    return DialogProperties;
})();
var Dialog;
(function (Dialog) {
    function Confirm(message, onclick, title, target, modalClass, yesButton, noButton, containerStyle, titleStyle, position) {
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
    Dialog.Confirm = Confirm;
    function Ok(message, title, target, modalClass, okButton, containerClass, titleClass) {
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
        divButton.appendChild(getDialogButton(function (r) { }, okButton, DialogResult.Ok, container));
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
    Dialog.Ok = Ok;
    function setUL(ul) {
        ul.style.display = "table";
        ul.style.borderCollapse = "collapse";
        ul.style.listStyleType = "none";
        ul.style.margin = "0px 0px";
        ul.style.padding = "0px 0px";
        ul.style.backgroundColor = "#fff";
    }
    function setLI(li) {
        li.style.display = "table-row";
        li.style.listStyle = "none";
    }
    function setDiv(div, textAlign, padding) {
        div.style.display = "table-cell";
        div.style.verticalAlign = "middle";
        div.style.textAlign = textAlign;
        div.style.padding = padding;
    }
    function getDialogButton(onclick, dialogButton, dialogResult, container, containerClass) {
        var button;
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
    Dialog.DefaultHideInterval = 1500;
    function Popup(elementToShow, target, position, hideInterval) {
        Show(elementToShow, DialogType.Popup, target, hideInterval, position);
    }
    Dialog.Popup = Popup;
    function Modal(elementToShow, modalClass, position, hideInterval, target) {
        Show(elementToShow, DialogType.Modal, target, hideInterval, position, modalClass);
    }
    Dialog.Modal = Modal;
    function Quick(elementToShow, target, position) {
        Show(elementToShow, DialogType.Quick, target, Dialog.DefaultHideInterval, position);
    }
    Dialog.Quick = Quick;
    function Standard(dialogProperties) {
        var elementToShow = dialogProperties.Container;
        if (dialogProperties.DialogType == DialogType.Modal) {
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
        if (dialogProperties.HideInterval > -1) {
            elementToShow.AddListener("onmouseover", function () { dialogProperties.IsActive = true; });
            elementToShow.AddListener("onmouseout", function () { dialogProperties.IsActive = false; });
            dialogProperties.Interval = setInterval(function () {
                if (!dialogProperties.IsActive) {
                    Dialog.Hide(elementToShow);
                }
            }, dialogProperties.HideInterval);
        }
    }
    Dialog.Standard = Standard;
    function Show(elementToShow, dialogType, target, hideInterval, position, modalClass) {
        var offsetx = elementToShow["OffSetX"] ? elementToShow["OffSetX"] : "0";
        var offsety = elementToShow["OffSetY"] ? elementToShow["OffSetY"] : "0";
        var dp = new DialogProperties(elementToShow, dialogType, target, hideInterval, position, modalClass, offsetx, offsety);
        Standard(dp);
    }
    Dialog.Show = Show;
    function SetPosition(elementToShow, dialogProperties) {
        var x = 0;
        var y = 0;
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
        if (dialogProperties.Position != DialogPosition.Manual) {
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
    Dialog.SetPosition = SetPosition;
    function Hide(obj) {
        var ele;
        if (Is.String(obj)) {
            var temp = obj;
            ele = temp.Element();
        }
        else if (Is.Element(obj)) {
            ele = obj;
        }
        if (ele) {
            var dp = ele["DialogProperties"];
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
    Dialog.Hide = Hide;
})(Dialog || (Dialog = {}));
var Route = (function () {
    function Route(key, parameters, view) {
        this.Key = key;
        this.Parameters = parameters;
        this.View = view;
    }
    Route.prototype.Show = function () {
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
    };
    Route.prototype.SetHTML = function (html, view, route) {
        view.Preload(this);
        view.Container.innerHTML = html;
        var elements = view.Container.Get(function (ele) {
            return !Is.NullOrEmpty(ele.getAttribute(Binding.Attributes.Auto));
        });
        for (var i = 0; i < elements.length; i++) {
            Binding.DataContainer.Auto(elements[i]);
        }
        if (view.Loaded) {
            view.Loaded(route);
        }
    };
    return Route;
})();
var ActionType;
(function (ActionType) {
    ActionType[ActionType["Deleted"] = 0] = "Deleted";
    ActionType[ActionType["Deleting"] = 1] = "Deleting";
    ActionType[ActionType["Inserted"] = 2] = "Inserted";
    ActionType[ActionType["Inserting"] = 3] = "Inserting";
    ActionType[ActionType["Updated"] = 4] = "Updated";
    ActionType[ActionType["Updating"] = 5] = "Updating";
})(ActionType || (ActionType = {}));
var Accordion;
(function (Accordion) {
    function Hook(ele, parentRule) {
        if (!parentRule) {
            parentRule = ".accordion";
        }
        var accordions = ele.Get(function (obj) {
            return !Is.NullOrEmpty(obj.getAttribute("data-accordion"));
        });
        accordions.forEach(function (a) {
            a.className = null;
            a.className = Accordion.MaximumClass(a, parentRule);
        });
    }
    Accordion.Hook = Hook;
    function MaximumClass(ele, parentRule) {
        var className = parentRule + " input:checked ~ article.Max" + ele.id;
        //find does it already exists
        //yes? then mod it to be like this one
        var style = null;
        var mysheet = Accordion.GetStyleSheet("mainSheet");
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
    Accordion.MaximumClass = MaximumClass;
    function GetStyleSheet(name) {
        for (var i = 0; i < document.styleSheets.length; i++) {
            var sheet = document.styleSheets[i];
            if (sheet.title == name) {
                return sheet;
            }
        }
    }
    Accordion.GetStyleSheet = GetStyleSheet;
    function GetStyleSheetRules(styleSheet) {
        var rules = document.all ? 'rules' : 'cssRules';
        return styleSheet[rules];
    }
    Accordion.GetStyleSheetRules = GetStyleSheetRules;
})(Accordion || (Accordion = {}));
var Ajax;
(function (Ajax) {
    Ajax.Host = "";
    Ajax.UseAsDateUTC = false;
    Ajax.AutoConvert = true;
    Ajax.ProgressElement = null;
    Ajax.DisableElement = null;
    Ajax.DefaultHeader;
    function Resolver() {
        var subDirectories = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            subDirectories[_i - 0] = arguments[_i];
        }
        var split = window.SplitPathName()[0].toLowerCase();
        var host = window.location.href.replace(window.location.pathname, "");
        for (var i = 0; i < subDirectories.length; i++) {
            if (subDirectories[i].toLowerCase() == split) {
                Ajax.Host = host + "/" + subDirectories[i], true;
                break;
            }
        }
    }
    Ajax.Resolver = Resolver;
    function ConvertProperties(object) {
        var keyMap;
        if (Is.Array(object)) {
            for (var i = 0; i < object.length; i++) {
                var obj = object[i];
                if (obj) {
                    try {
                        if (keyMap == null) {
                            keyMap = Ajax.getKeyMap(obj);
                        }
                    }
                    catch (e) {
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
    Ajax.ConvertProperties = ConvertProperties;
    function getKeyMap(obj) {
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
    Ajax.getKeyMap = getKeyMap;
    function HandleOtherStates(xmlhttp) {
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
    Ajax.HandleOtherStates = HandleOtherStates;
    function HideProgress() {
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
    Ajax.HideProgress = HideProgress;
    function setValues(obj, keyMap) {
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
                    if (Ajax.UseAsDateUTC) {
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
    Ajax.setValues = setValues;
    function ShowProgress() {
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
    Ajax.ShowProgress = ShowProgress;
    function Submit(method, url, parameters, returnMethod, contentType) {
        var tempUrl = url;
        Ajax.ShowProgress();
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
                    else {
                        xmlhttp.send(parameters);
                    }
                }
                else {
                    xmlhttp.send();
                }
            }
            catch (e) {
                Ajax.HideProgress();
                if (window.Exception) {
                    window.Exception(e);
                }
            }
        }
    }
    Ajax.Submit = Submit;
    function HttpAction(httpAction, url, parameters, successMethod, isRaw) {
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
    Ajax.HttpAction = HttpAction;
    function Html(url, callBack) {
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
    Ajax.Html = Html;
})(Ajax || (Ajax = {}));
var AutoSuggest;
(function (AutoSuggest) {
    function onKeyPress(e) {
        var key;
        var sender = null;
        var shiftKey = true;
        if (window.event) {
            key = e.keyCode;
            sender = window.event.srcElement;
            shiftKey = e.shiftKey;
        }
        else if (e) {
            key = e.which;
            sender = e.srcElement;
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
            input = window.event.srcElement;
        }
        else if (e) {
            input = e.srcElement;
        }
        onMouseOut(input);
        var datasource = input["datasource"];
        var tempObj = input.DataObject;
        var dataContainer = input.DataContainer;
        var value = input["SelectedValue"];
        var found = datasource.First(function (d) { return d[input["valuemember"]] == value; });
        var targetproperty = input.DataContainer.DataBindings.First(function (d) { return d.ElementBindingIndex == input.ElementBindingIndex && d.Target == Binding.Targets.Value; });
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
                                    found = datasource.First(function (d) { return d[input["valuemember"]] == value; });
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
                        var found = datasource.First(function (d) { return d[field] == tempObj[field]; });
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
            var found = datasource.First(function (d) { return d[input["valuemember"]] == tempObj[field]; });
            if (found) {
                value = found[input["displaymember"]];
                input.value = value;
            }
            dataContainer.Rebind(field, input);
        }
    }
    function onMouseOut(input) {
        input["hidelist"] = true;
        setTimeout(function () {
            if (input["hidelist"]) {
                var list = input["AutocompleteList"];
                input["AutocompleteList"] = null;
                if (list) {
                    list.Remove();
                }
            }
        }, 250);
    }
    function showList(sender, displayValue) {
        displayValue = displayValue.toLowerCase();
        var datasource = sender["datasource"];
        var displaymember = sender["displaymember"];
        var valuemember = sender["valuemember"];
        var displaycount = sender["displaycount"] ? sender["displaycount"] : 8;
        var list = sender["AutocompleteList"];
        if (!list) {
            list = "select".CreateElement({ position: "absolute" });
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
        var showItems = datasource.Where(function (o) {
            return o[displaymember].toLowerCase().indexOf(displayValue) > -1;
        }).Take(displaycount);
        if (showItems.length < displaycount) {
            showItems = datasource;
        }
        var firstFound = showItems.First(function (s) { return s[displaymember].toLowerCase() == displayValue || s[displaymember].toLowerCase().indexOf(displayValue) > -1; });
        showItems.forEach(function (s) { return list.options[list.options.length] = new Option(s[displaymember], s[valuemember], false, s == firstFound); });
        if (list.options.length > 0) {
            var diffAndPos = sender.DimAndOff();
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
    function hookEvents(input) {
        input.onkeydown = function (e) {
            var key;
            var sender = null;
            var shiftKey = true;
            if (window.event) {
                key = e.keyCode;
                sender = window.event.srcElement;
                shiftKey = e.shiftKey;
            }
            else if (e) {
                key = e.which;
                sender = e.srcElement;
                shiftKey = e.shiftKey;
            }
            var displaycount = sender["displaycount"];
            sender["hidelist"] = false;
            if (!shiftKey && sender) {
                var list = sender["AutocompleteList"];
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
                    else if (key == 38) {
                        if (list.selectedIndex > 0) {
                            list.options[list.selectedIndex - 1].selected = "selected";
                        }
                        else {
                            list.options[0].selected = "selected";
                        }
                    }
                    else if (key == 40) {
                        if (list.selectedIndex < list.options.length - 1) {
                            list.options[list.selectedIndex + 1].selected = "selected";
                        }
                        else {
                            list.options[0].selected = "selected";
                        }
                    }
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
            };
        }
    }
    function Hook(input, dataSource, valueMember, displayMember, displayCount) {
        input["datasource"] = dataSource;
        input["valuemember"] = valueMember;
        input["displaymember"] = displayMember;
        input["displaycount"] = displayCount ? displayCount : 8;
        hookEvents(input);
    }
    AutoSuggest.Hook = Hook;
    function setValue(input, list, selectedIndex) {
        selectedIndex = selectedIndex ? selectedIndex : list.selectedIndex;
        input.value = list.options[selectedIndex].text;
        input["SelectedValue"] = list.options[selectedIndex].value;
    }
})(AutoSuggest || (AutoSuggest = {}));
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
var Calendar;
(function (Calendar) {
    function DateCell(date, calendar) {
        var div = "div".CreateElement(this.Format.Cell);
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
    Calendar.DateCell = DateCell;
    function HeaderCell(elementArrayOrString, cellProps) {
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
    Calendar.HeaderCell = HeaderCell;
    Calendar.Format = {
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
    function MonthItem(monthName, index, onclickEvent) {
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
    Calendar.MonthItem = MonthItem;
    function YearItem(year, onclickEvent) {
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
    Calendar.YearItem = YearItem;
    function Create(element, selectedDateChanged, formatCellMethod, monthChangeEvent, headerClass, rowsClass, dayOfWeekClass, dateRowClass, monthClass, yearClass, navigateClass, defaultDateClass, monthPopupClass, yearPopupClass, calendarBuiltEvent) {
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
                years.forEach(function (y) { return ulYears.appendChild(Calendar.YearItem(y, element.YearNameClicked)); });
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
            headerRow.AddRange(Calendar.HeaderCell(left), Calendar.HeaderCell([month, year]), Calendar.HeaderCell(right));
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
            week.AddRange(Calendar.HeaderCell("Su"), Calendar.HeaderCell("M"), Calendar.HeaderCell("T"), Calendar.HeaderCell("W"), Calendar.HeaderCell("Th"), Calendar.HeaderCell("F"), Calendar.HeaderCell("Sa"));
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
    Calendar.Create = Create;
})(Calendar || (Calendar = {}));
var Convert;
(function (Convert) {
    function EmToFloat(value) {
        if (value && value.substring && value.indexOf("em")) {
            value = value.replace("em", "");
            value = parseFloat(value);
        }
        ;
        return value;
    }
    Convert.EmToFloat = EmToFloat;
    function EmValueToPixelValue(value) {
        if (value) {
            value = EmToFloat(value) * 16;
            return value;
        }
        return 0;
    }
    Convert.EmValueToPixelValue = EmValueToPixelValue;
})(Convert || (Convert = {}));
var Formatters;
(function (Formatters) {
    var DateTime;
    (function (DateTime) {
        DateTime.Token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g;
        DateTime.Timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
        DateTime.TimezoneClip = /[^-+\dA-Z]/g;
        DateTime.i18n = {
            dayNames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        };
        DateTime.Masks = {
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
        function Pad(val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len)
                val = "0" + val;
            return val;
        }
        DateTime.Pad = Pad;
        function Format(date, mask, utc) {
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }
            // Passing date through Date applies Date.parse, if necessary
            date = date ? new Date(date) : new Date();
            if (isNaN(date))
                throw SyntaxError("invalid date");
            mask = String(DateTime.Masks[mask] || mask || DateTime.Masks["default"]);
            // Allow setting the utc argument via the mask
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }
            var _ = utc ? "getUTC" : "get", d = date[_ + "Date"](), D = date[_ + "Day"](), m = date[_ + "Month"](), y = date[_ + "FullYear"](), H = date[_ + "Hours"](), M = date[_ + "Minutes"](), s = date[_ + "Seconds"](), L = date[_ + "Milliseconds"](), o = utc ? 0 : date.getTimezoneOffset(), flags = {
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
            };
            return mask.replace(DateTime.Token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        }
        DateTime.Format = Format;
    })(DateTime = Formatters.DateTime || (Formatters.DateTime = {}));
    var Number;
    (function (Number) {
        function Comma(stringOrNumber) {
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
        Number.Comma = Comma;
        function Pad(value, length) {
            var str = '' + value;
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        }
        Number.Pad = Pad;
    })(Number = Formatters.Number || (Formatters.Number = {}));
})(Formatters || (Formatters = {}));
var Is;
(function (Is) {
    function Array(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    Is.Array = Array;
    function Chrome() {
        var w = window;
        return w.chrome;
    }
    Is.Chrome = Chrome;
    function Element(value) {
        return value && value.tagName;
    }
    Is.Element = Element;
    function EmptyObject(obj) {
        for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }
        return true;
    }
    Is.EmptyObject = EmptyObject;
    function FireFox() {
        if (navigator) {
            return /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
        }
        return false;
    }
    Is.FireFox = FireFox;
    function Function(obj) {
        var getType = {};
        return obj && getType.toString.call(obj) === '[object Function]';
    }
    Is.Function = Function;
    function InternetExplorer() {
        //MSIE may be spoofed?
        //        var ua = window.navigator.userAgent;
        //        var msie = ua.indexOf("MSIE ");
        //        return msie > 0;
        return '\v' == 'v';
    }
    Is.InternetExplorer = InternetExplorer;
    function NullOrEmpty(value) {
        if (value == null) {
            return true;
        }
        else if (value.length == 0) {
            return true;
        }
    }
    Is.NullOrEmpty = NullOrEmpty;
    function Numeric(input) {
        var RE = /^-{0,1}\d*\.{0,1}\d+$/;
        return (RE.test(input));
    }
    Is.Numeric = Numeric;
    function Object(value) {
        return value && typeof value === 'object';
    }
    Is.Object = Object;
    function Property(property, inObject) {
        try {
            return typeof (inObject[property]) !== 'undefined';
        }
        catch (e) {
            if (window.Exception) {
                window.Exception(e);
            }
        }
        return false;
    }
    Is.Property = Property;
    function String(value) {
        return typeof value === 'string';
    }
    Is.String = String;
    function Style(value) {
        return value in document.body.style;
    }
    Is.Style = Style;
    function ValidDate(value) {
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
                if (objDate.getFullYear() != year)
                    return false;
                if (objDate.getMonth() != month - 1)
                    return false;
                if (objDate.getDate() != day)
                    return false;
                return true;
            }
        }
        catch (e) {
            if (window.Exception) {
                window.Exception(e);
            }
        }
        return false;
    }
    Is.ValidDate = ValidDate;
    function ValidEmail(address) {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(address) == false) {
            return false;
        }
        return true;
    }
    Is.ValidEmail = ValidEmail;
})(Is || (Is = {}));
var KeyPress;
(function (KeyPress) {
    KeyPress.ADCONTROL_ZERO = 48;
    KeyPress.ADCONTROL_ONE = 49;
    KeyPress.ADCONTROL_TWO = 50;
    KeyPress.ADCONTROL_THREE = 51;
    KeyPress.ADCONTROL_FOUR = 52;
    KeyPress.ADCONTROL_FIVE = 53;
    KeyPress.ADCONTROL_SIX = 54;
    KeyPress.ADCONTROL_SEVEN = 55;
    KeyPress.ADCONTROL_EIGHT = 56;
    KeyPress.ADCONTROL_NINE = 57;
    function GetZeroLengthString(value) {
        switch (value) {
            case 1:
            case 0:
                return String(value);
            default:
                return "0" + String(value) + "/";
        }
    }
    KeyPress.GetZeroLengthString = GetZeroLengthString;
    function GetOneLengthString(value, currentValue) {
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
    KeyPress.GetOneLengthString = GetOneLengthString;
    function GetThreeLengthString(value, currentValue) {
        if (value > 3) {
            return currentValue + "0" + String(value) + "/";
        }
        else {
            return currentValue + String(value);
        }
    }
    KeyPress.GetThreeLengthString = GetThreeLengthString;
    function GetFourLengthString(value, currentValue, previousValue) {
        if (previousValue == 3 &&
            value > 1) {
            return String(currentValue).substring(0, String(currentValue).length - 1) + "03/" + String(value);
        }
        else {
            return currentValue + value + "/";
        }
    }
    KeyPress.GetFourLengthString = GetFourLengthString;
    function NoBlanks(e, canSpecialCharacter) {
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
    KeyPress.NoBlanks = NoBlanks;
    function ShortDate(e) {
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
                    sender.value = KeyPress.GetZeroLengthString(value);
                    break;
                case 1:
                    ret = false;
                    sender.value = KeyPress.GetOneLengthString(value, sender.value);
                    break;
                case 3:
                    ret = false;
                    sender.value = KeyPress.GetThreeLengthString(value, sender.value);
                    break;
                case 4:
                    ret = false;
                    sender.value = KeyPress.GetFourLengthString(value, sender.value, sender.PreviousValue);
                    break;
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
                    var element = elements[i];
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
    KeyPress.ShortDate = ShortDate;
    function Number(e, allowDecimals, useTabForward) {
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
                    var element = elements[i];
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
                else if (document.getSelection) {
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
                ret = false;
            }
        }
        if (event) {
            event.returnValue = ret;
        }
        return ret;
    }
    KeyPress.Number = Number;
})(KeyPress || (KeyPress = {}));
var Local;
(function (Local) {
    function CanStore() {
        try {
            return localStorage ? true : false;
        }
        catch (e) {
            return false;
        }
    }
    Local.CanStore = CanStore;
    function Remove(key) {
        if (Local.CanStore()) {
            localStorage.removeItem(key);
        }
    }
    Local.Remove = Remove;
    function Clear() {
        if (Local.CanStore()) {
            localStorage.clear();
        }
    }
    Local.Clear = Clear;
    function Save(key, obj) {
        if (Local.CanStore()) {
            var json = JSON.stringify(obj);
            localStorage.setItem(key, json);
        }
    }
    Local.Save = Save;
    function Get(key, defaultObject) {
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
        }
        catch (e) {
            throw e;
        }
        return null;
    }
    Local.Get = Get;
})(Local || (Local = {}));
var RegularExpression;
(function (RegularExpression) {
    RegularExpression.StandardBindingWrapper = /{|}/g, RegularExpression.StandardBindingPattern = /{(\w+(\.\w+)*)}/g, RegularExpression.MethodPattern = /\w+(\.\w+)*\(/g, RegularExpression.ObjectAndMethod = /{(\w+(\.\w+)*)}\.\w+\(\)/g, RegularExpression.ObjectMethod = /\.\w+\(\)/g, RegularExpression.ParameterPattern = /\(.*(,\s*.*)*\)/g, RegularExpression.ZDate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, RegularExpression.UTCDate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/i;
    function Replace(patternToLookFor, sourceString, sourceObjectOrArray, trimFromResultPattern) {
        var matches = sourceString.match(patternToLookFor);
        if (matches) {
            var regMatches = new Array();
            matches.forEach(function (m) {
                regMatches.push({
                    Match: m,
                    PropertyName: m.replace(RegularExpression.StandardBindingWrapper, "")
                });
            });
            if (Is.Array(sourceObjectOrArray)) {
                regMatches.forEach(function (r) {
                    for (var j = 0; j < sourceObjectOrArray.length; j++) {
                        if (sourceObjectOrArray[j] &&
                            sourceObjectOrArray[j].hasOwnProperty(r.PropertyName)) {
                            sourceString = sourceString.replace(r.Match, sourceObjectOrArray[j][r.PropertyName]);
                            break;
                        }
                    }
                });
            }
            else {
                for (var i = 0; i < regMatches.length; i++) {
                    if (sourceObjectOrArray &&
                        sourceObjectOrArray.hasOwnProperty(regMatches[i].PropertyName)) {
                        sourceString = sourceString.replace(regMatches[i].Match, sourceObjectOrArray[regMatches[i].PropertyName]);
                    }
                }
            }
        }
        return sourceString;
    }
    RegularExpression.Replace = Replace;
})(RegularExpression || (RegularExpression = {}));
var Thing;
(function (Thing) {
    function Merge(object, into) {
        for (var prop in object) {
            var value = object[prop];
            if (value) {
                into[prop] = object[prop];
            }
        }
        return into;
    }
    Thing.Merge = Merge;
    function Clone(object) {
        var newobject = {};
        for (var prop in object) {
            newobject[prop] = object[prop];
        }
        return newobject;
    }
    Thing.Clone = Clone;
    function ToArray(object, nameColumn, valueColumn) {
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
    Thing.ToArray = ToArray;
    function Concat(object, properties) {
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
    Thing.Concat = Concat;
    function GetValueIn(object, forPropertyName, defaultValue) {
        if (object[forPropertyName]) {
            return object[forPropertyName];
        }
        else if (defaultValue) {
            return defaultValue;
        }
        return null;
    }
    Thing.GetValueIn = GetValueIn;
})(Thing || (Thing = {}));
var What;
(function (What) {
    var Is;
    (function (Is) {
        function EnumName(inObject, forValue) {
            for (var prop in inObject) {
                if (inObject[prop] == forValue) {
                    return prop;
                }
            }
            return null;
        }
        Is.EnumName = EnumName;
        function EnumValue(inObject, forName) {
            forName = forName.toLowerCase();
            for (var prop in inObject) {
                if (prop.toLowerCase() == forName) {
                    return inObject[prop];
                }
            }
            return null;
        }
        Is.EnumValue = EnumValue;
    })(Is = What.Is || (What.Is = {}));
})(What || (What = {}));
var ViewManager;
(function (ViewManager) {
    ViewManager.Routes = new Array();
    ViewManager.Views = new Array();
    function Initialize() {
        var views = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            views[_i - 0] = arguments[_i];
        }
        AddViews(views);
        window.addEventListener("popstate", ViewManager.BackEvent);
    }
    ViewManager.Initialize = Initialize;
    function CurrentRoute() {
        if (ViewManager.Routes != null && ViewManager.Routes.length > 0) {
            return ViewManager.Routes[ViewManager.Routes.length - 1];
        }
        return null;
    }
    ViewManager.CurrentRoute = CurrentRoute;
    function AddViews(views) {
        views.forEach(function (l) {
            ViewManager.Views.Remove(function (l2) { return l2.Key == l.Key; });
            ViewManager.Views.Add(l);
        });
    }
    ViewManager.AddViews = AddViews;
    function BackEvent(e) {
        if (ViewManager.Routes.length > 1) {
            ViewManager.Routes.splice(ViewManager.Routes.length - 1, 1);
        }
        if (ViewManager.Routes.length > 0) {
            var viewInfo = ViewManager.Routes[ViewManager.Routes.length - 1];
            var found = ViewManager.Views.First(function (o) {
                return o.Key == viewInfo.Key;
            });
            viewInfo.Show();
        }
        else {
        }
    }
    ViewManager.BackEvent = BackEvent;
    function Load(viewKey, parameters) {
        var found = ViewManager.Views.First(function (o) {
            return o.Key == viewKey;
        });
        if (found) {
            var route = new Route(viewKey, parameters, found);
            ViewManager.Routes.push(route);
            window.PushState(null, found.UrlTitle(this), found.Url(route));
            route.Show();
        }
    }
    ViewManager.Load = Load;
})(ViewManager || (ViewManager = {}));
Array.prototype.Return = function (func) {
    switch (this.length) {
        case 0:
            return func();
            ;
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
Array.prototype.Select = function (keySelector) {
    var ret = new Array();
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        var newObj = keySelector(obj);
        ret.push(newObj);
    }
    return ret;
};
Array.prototype.Ascend = function (keySelector) {
    return this.sort(function (a, b) {
        return keySelector(a) < keySelector(b) ? -1 :
            keySelector(a) > keySelector(b) ? 1 : 0;
    });
};
Array.prototype.Descend = function (keySelector) {
    return this.sort(function (a, b) {
        return keySelector(a) < keySelector(b) ? 1 :
            keySelector(a) > keySelector(b) ? -1 : 0;
    });
};
Array.prototype.First = function (func) {
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
Array.prototype.Last = function (func) {
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
Array.prototype.Remove = function (func) {
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
Array.prototype.Where = function (func) {
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
Array.prototype.Min = function (field) {
    var ret = null;
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        if (obj[field]) {
            if (ret == null) {
                ret = obj[field];
            }
            else if (ret > obj[field]) {
                ret = obj[field];
            }
        }
    }
    return ret;
};
Array.prototype.Max = function (field) {
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
Array.prototype.Take = function (count) {
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
Array.prototype.GroupBy = function () {
    var groupBy = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        groupBy[_i - 0] = arguments[_i];
    }
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
Array.prototype.Insert = function (obj, position) {
    if (position == undefined) {
        position = 0;
    }
    if (position > this.length) {
        position = this.length;
    }
    this.splice(position, 0, obj);
};
Array.prototype.Sum = function (field) {
    var ret = 0;
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        if (obj[field]) {
            ret += obj[field];
        }
    }
    return ret;
};
Array.prototype.ToArray = function (property) {
    var ret = new Array();
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (item[property]) {
            ret.push(item[property]);
        }
    }
    return ret;
};
Date.prototype.Year = function () {
    return this.getFullYear();
};
Date.prototype.Month = function () {
    return this.getMonth() + 1;
};
Date.prototype.Date = function () {
    return this.getDate();
};
Date.prototype.DayOfWeek = function () {
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
};
Date.prototype.Clone = function () {
    return this.AddDays(0);
};
Date.prototype.format = function (mask, utc) {
    return Formatters.DateTime.Format(this, mask, utc);
};
Date.prototype.ShortDate = function () {
    return this.format("mm/dd/yyyy");
};
Date.prototype.SmallDate = function () {
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
Date.prototype.Add = function (years, months, days, hours, minutes, seconds) {
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
    var diff = Math.abs(this - subtractDate);
    return diff / 1000 / 60 / 60 / 24;
};
Date.prototype.MinuteDiff = function (subtractDate) {
    var diff = Math.abs(this - subtractDate);
    return diff / 1000 / 60 / 60;
};
HTMLElement.prototype.Get = function (predicate, notRecursive, nodes) {
    if (nodes == null) {
        nodes = new Array();
    }
    var that = this;
    var children = that.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1
            && children[i].tagName.toLowerCase() != "svg") {
            var child = children[i];
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
HTMLElement.prototype.First = function (predicate) {
    var that = this;
    var children = that.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1
            && children[i].tagName.toLowerCase() != "svg") {
            var child = children[i];
            if (predicate(child)) {
                return child;
            }
        }
    }
    var found = null;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1 && children[i].tagName.toLowerCase() != "svg") {
            var c = children[i];
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
HTMLElement.prototype.Parent = function (predicate) {
    var el = this;
    while (el && el.parentNode) {
        el = el.parentNode;
        if (predicate(el)) {
            return el;
        }
    }
    return null;
};
HTMLElement.prototype.Delete = function (predicate) {
    var that = this;
    var found = that.First(predicate);
    if (found) {
        found.Remove();
    }
};
HTMLElement.prototype.Clear = function (predicate, notRecursive) {
    var that = this;
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
                var child = children[pos];
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
HTMLElement.prototype.AddRange = function () {
    var elements = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        elements[_i - 0] = arguments[_i];
    }
    var that = this;
    elements.forEach(function (e) { return that.appendChild(e); });
    return that;
};
HTMLElement.prototype.Remove = function () {
    this.parentNode.removeChild(this);
};
HTMLElement.prototype.AddHtml = function (value) {
    var ret = value.CreateElementFromHtml();
    this.appendChild(ret);
    return ret;
};
HTMLElement.prototype.SetClass = function (className) {
    this.className = null;
    this.className = className;
};
HTMLElement.prototype.OffSet = function () {
    var _x = 0;
    var _y = 0;
    var el = this;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        //may not work
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
};
HTMLElement.prototype.Dimensions = function () {
    var ret = { width: 0, height: 0 };
    ret.width = this.offsetWidth;
    ret.height = this.offsetHeight;
    return ret;
};
HTMLElement.prototype.DimAndOff = function () {
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
    var that = this;
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
    var ret = new Array();
    if (this["dataset"]) {
        var dataset = this["dataset"];
        for (var prop in dataset) {
            ret.Add({ name: prop, value: dataset[prop] });
        }
    }
    return ret;
};
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
HTMLInputElement.prototype.AutoSuggest = function (dataSource, valueMember, displayMember, displayCount) {
    AutoSuggest.Hook(this, dataSource, valueMember, displayMember, displayCount);
};
HTMLLIElement.prototype.Rebind = function () {
    var row = this;
    Binding.DataContainer.DataBind(row.DataContainer, row, row.DataObject);
    return row;
};
HTMLSelectElement.prototype.AddOptions = function (arrayOrObject, valueProperty, displayProperty, selectedValue) {
    var select = this;
    if (Is.Array(arrayOrObject)) {
        var tempArray = arrayOrObject;
        if (displayProperty && valueProperty) {
            tempArray.forEach(function (t) {
                select["options"][select.options.length] = new Option(t[displayProperty], t[valueProperty]);
                if (selectedValue &&
                    t[valueProperty] == selectedValue) {
                    select["options"][select.options.length - 1].selected = "true";
                }
            });
        }
        else if (tempArray.length > 1 && Is.String(tempArray[0])) {
            tempArray.forEach(function (t) {
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
HTMLSelectElement.prototype.AddOptionsViaObject = function (obj, selectedValue, orderedAsIs) {
    var select = this;
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
            if (Is.Numeric(obj[prop])) {
                tempArray.push(prop);
            }
        }
        tempArray = tempArray.sort();
        tempArray.forEach(function (t) {
            select["options"][select.options.length] = new Option(t, obj[t]);
            if (selectedValue != undefined && selectedValue == obj[t]) {
                select["options"][select.options.length - 1].selected = "selected";
            }
        });
    }
};
HTMLUListElement.prototype.Dispose = function () {
    Binding.DataContainer.Dispose(this);
};
HTMLUListElement.prototype.Bind = function (data) {
    var that = this;
    if (!that.AlreadySetup) {
        that.AlreadySetup = true;
        Binding.DataContainer.Setup(that);
        Binding.DataContainer.SetupUl(that);
    }
    var tempArray;
    if (Is.Array(data)) {
        tempArray = data;
    }
    else {
        tempArray = new Array();
        tempArray.push(data);
    }
    that.DataObject = tempArray;
    that.Clear();
    Ajax.ShowProgress();
    if (that.style.display == "none") {
        that.style.display = "table";
    }
    if (that.HeaderHtml) {
        that.HeaderHtml.forEach(function (h) {
            var header = that.AddHtml(h);
            header.DataContainer = that;
            header.TemplateType = "header";
            Binding.DataContainer.LookForInsert(header);
        });
    }
    that.AsyncPosition = 0;
    var endAsync = function () {
        if (that.FooterHtml) {
            that.FooterHtml.forEach(function (f) {
                var footer = that.AddHtml(f);
                footer.DataContainer = that;
                footer.TemplateType = "footer";
                Binding.DataContainer.LookForInsert(footer);
                if (that.DataObject && that.DataObject.length > 0) {
                    that.SetSelected(that.DataObject[0], that.First(function (e) { return e.DataObject == that.DataObject[0]; }));
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
HTMLUListElement.prototype.Rebind = function (field, sender) {
    Binding.DataContainer.Rebind(this, sender, field);
};
HTMLUListElement.prototype.InsertRow = function (row, beforeElement) {
    if (beforeElement) {
        this.insertBefore(row, beforeElement);
    }
    else {
        this.appendChild(row);
    }
};
HTMLUListElement.prototype.InsertAndBind = function (dataObject, beforeElement) {
    var that = this;
    var row = that.RowHtml.CreateElementFromHtml();
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
HTMLUListElement.prototype.AddRow = function (dataObject, beforeElement) {
    var that = this;
    that.DataObject.Add(dataObject);
    var row = that.RowHtml.CreateElementFromHtml();
    row.DataObject = dataObject;
    row.DataContainer = that;
    row.OriginalClass = row.className ? row.className : null;
    row.TemplateType = "row";
    row.onclick = function () {
        that.SetSelected(row.DataObject, row);
    };
    if (!beforeElement) {
        var elements = that.Get(function (e) { return e.tagName == "LI"; });
        var pos = elements.length - 1;
        var lookForFooter = true;
        while (lookForFooter) {
            var li = elements[pos];
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
HTMLUListElement.prototype.SetSelected = function (obj, sender) {
    var that = this;
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
String.prototype.Element = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.Form = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.List = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.Input = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.DropDown = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.CreateElement = function (objectProperties) {
    var obj = document.createElement(this);
    if (objectProperties) {
        obj.Set(objectProperties);
    }
    return obj;
};
String.prototype.CreateElementFromHtml = function () {
    var ret = new Array();
    var div = "div".CreateElement({ innerHTML: this });
    while (div.children.length > 0) {
        var child = div.children[div.children.length - 1];
        return child;
    }
};
String.prototype.Put = function (parameters, success) {
    Ajax.HttpAction("PUT", this, parameters, success);
};
String.prototype.Delete = function (parameters, success) {
    Ajax.HttpAction("DELETE", this, parameters, success);
};
String.prototype.Post = function (parameters, success) {
    Ajax.HttpAction("POST", this, parameters, success);
};
String.prototype.Get = function (parameters, success, isRaw) {
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
Window.prototype.Exception = function () {
    var parameters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parameters[_i - 0] = arguments[_i];
    }
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
Window.prototype.Show = function (viewKey, parameters) {
    ViewManager.Load(viewKey, parameters);
};
Window.prototype.Dimensions = function () {
    var ret = { Height: 0, Width: 0 };
    var temp = window;
    if (typeof temp.innerWidth != 'undefined') {
        ret.Width = temp.innerWidth,
            ret.Height = temp.innerHeight;
    }
    else if (typeof document.documentElement != 'undefined'
        && typeof document.documentElement.clientWidth !=
            'undefined' && document.documentElement.clientWidth != 0) {
        ret.Width = document.documentElement.clientWidth,
            ret.Height = document.documentElement.clientHeight;
    }
    else {
        ret.Width = document.getElementsByTagName('body')[0].clientWidth,
            ret.Height = document.getElementsByTagName('body')[0].clientHeight;
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
Window.prototype.SplitPathName = function () {
    var ret = new Array();
    var pathName = window.location.pathname;
    pathName = pathName.substring(1);
    var lastCharacter = pathName.charAt(pathName.length - 1);
    if (lastCharacter == "/") {
        pathName = pathName.substring(0, pathName.length - 1);
    }
    var split = pathName.split("/");
    return split;
};
Window.prototype.PageLoaded = function (postLoadFuntion, e) {
    if (document.readyState === "complete") {
        postLoadFuntion();
    }
    else {
        if (window.onload) {
            var curronload = window.onload;
            var newonload = function () {
                curronload(e);
                postLoadFuntion();
            };
            window.onload = newonload;
        }
        else {
            window.onload = function () {
                postLoadFuntion();
            };
        }
    }
};
function autoBindForms() {
    var elements = document.body.Get(function (ele) {
        return !Is.NullOrEmpty(ele.getAttribute(Binding.Attributes.Auto));
    });
    for (var i = 0; i < elements.length; i++) {
        Binding.DataContainer.Auto(elements[i]);
    }
}
;
function WindowLoad(e) {
    if (document.readyState === "complete") {
        var pg = document.getElementById("progress");
        if (pg != null && Ajax) {
            Ajax.ProgressElement = pg;
        }
        autoBindForms();
    }
    else {
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
        }
        else {
            window.onload = function () {
                var pg = document.getElementById("progress");
                if (pg != null && Ajax) {
                    Ajax.ProgressElement = pg;
                }
                autoBindForms();
            };
        }
    }
}
;
WindowLoad();
//# sourceMappingURL=ULFBERHT.js.map