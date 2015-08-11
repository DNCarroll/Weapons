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


