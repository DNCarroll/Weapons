interface HTMLInputElement {    
    AutoSuggest(dataSource: Array<any>,
        valueMember: string,
        displayMember: string,
        displayCount?: number);
} 
HTMLInputElement.prototype.AutoSuggest = function (dataSource: Array<any>,
    valueMember: string,
    displayMember: string,
    displayCount?: number) {
    AutoSuggest.Hook(this, dataSource, valueMember, displayMember, displayCount);
};