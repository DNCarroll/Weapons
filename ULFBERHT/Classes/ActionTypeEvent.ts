class ActionEvent {
    ActionType: ActionType;
    Cancel: boolean;
    Object: any;
    Field: string;
    Value: any;
    constructor(actionType: ActionType, obj: any, field:string, value:any) {
        this.Cancel = false;
        this.ActionType = actionType;
        this.Object = obj;
        this.Field = field;
        this.Value = value;
    }
}
