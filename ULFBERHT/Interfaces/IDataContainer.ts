interface IDataContainer extends HTMLElement {
    WebApi: string;
    Pks: Array<string>;
    ActionEvent: (actionTypeEvent: ActionEvent) => void;
    Bind(data?, appendData?: boolean);
    DataBindings: Array<DataBinding>;
    Rebind(field: string, sender: HTMLElement);
    Dispose();

    HeaderHtml: string[];
    FooterHtml: string[];
    RowHtml: string;
    Form: HTMLFormElement;
    SelectedItemChanged: (obj: any, sender:HTMLElement) => void;
    SelectedItemClass: string;
    AsyncBinding: boolean;
    AlternatingRowClass: string;
    //just add the UL specific stuff here for ease and clean code allowing the form and ul to use the same setup method?
} 