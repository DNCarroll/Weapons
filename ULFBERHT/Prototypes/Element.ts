interface Element {
    Popup(target?: HTMLElement, hideInterval?: number, position?: DialogPosition);
    Modal(modalClass: string, position?: DialogPosition, hideInterval?: number, target?: HTMLElement);
    Quick(target?: HTMLElement, hideInterval?: number, position?: DialogPosition);
    Dialog(dialogProperties:any);
}
Element.prototype.Popup = function (target?: HTMLElement, position?: DialogPosition, hideInterval?: number) {
    Dialog.Popup(this, target, position, hideInterval);
};
Element.prototype.Modal = function (modalClass: string, position?: DialogPosition, hideInterval?: number, target?: HTMLElement) {
    Dialog.Modal(this, modalClass, position, hideInterval, target);
};
Element.prototype.Quick = function (target?: HTMLElement, position?: DialogPosition, hideInterval?: number) {
    Dialog.Quick(this, target, position);
};
Element.prototype.Dialog = function (dialogProperties: any) {
    var dp = new DialogProperties(this,
        Thing.GetValueIn(dialogProperties, "DialogType", DialogType.Standard),
        Thing.GetValueIn(dialogProperties, "Target"),
        Thing.GetValueIn(dialogProperties, "HideInterval"),
        Thing.GetValueIn(dialogProperties, "Position", DialogPosition.MiddleOfWindow),
        Thing.GetValueIn(dialogProperties, "ModalClass"),
        Thing.GetValueIn(dialogProperties, "OffSetX"),
        Thing.GetValueIn(dialogProperties, "OffSetY"));
    Dialog.Standard(dp);
};