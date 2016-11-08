//nothing to add as of 2016-11-08
class ViewInstance {    
    Parameters: Array<any>;
    ViewContainer: IViewContainer;    
    constructor(parameters: Array<any>, viewContainer: IViewContainer) {
        this.Parameters = parameters;        
        this.ViewContainer = viewContainer;
    }
    static FormatUrl(url: string) {
        url = url.replace(/[^A-z0-9/]/g, "");
        return url;
    }
}
