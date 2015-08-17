var ActionType;
(function (ActionType) {
    ActionType[ActionType["Deleted"] = 0] = "Deleted";
    ActionType[ActionType["Deleting"] = 1] = "Deleting";
    ActionType[ActionType["Inserted"] = 2] = "Inserted";
    ActionType[ActionType["Inserting"] = 3] = "Inserting";
    ActionType[ActionType["Updated"] = 4] = "Updated";
    ActionType[ActionType["Updating"] = 5] = "Updating";
})(ActionType || (ActionType = {}));
