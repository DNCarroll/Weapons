Element.prototype.Popup = function (target, position, hideInterval) {
    Dialog.Popup(this, target, position, hideInterval);
};
Element.prototype.Modal = function (modalClass, position, hideInterval, target) {
    Dialog.Modal(this, modalClass, position, hideInterval, target);
};
Element.prototype.Quick = function (target, position, hideInterval) {
    Dialog.Quick(this, target, position);
};
Element.prototype.Dialog = function (dialogProperties) {
    var dp = new DialogProperties(this, Thing.GetValueIn(dialogProperties, "DialogType", 3 /* Standard */), Thing.GetValueIn(dialogProperties, "Target"), Thing.GetValueIn(dialogProperties, "HideInterval"), Thing.GetValueIn(dialogProperties, "Position", 0 /* MiddleOfWindow */), Thing.GetValueIn(dialogProperties, "ModalClass"), Thing.GetValueIn(dialogProperties, "OffSetX"), Thing.GetValueIn(dialogProperties, "OffSetY"));
    Dialog.Standard(dp);
};
//# sourceMappingURL=Element.js.map