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
