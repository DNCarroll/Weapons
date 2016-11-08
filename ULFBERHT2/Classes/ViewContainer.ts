//nothing to add as of 2016-11-08
var ViewContainers: Array<IViewContainer> = new Array<IViewContainer>();
abstract class ViewContainer implements IViewContainer {    
    constructor() { }        
    abstract DocumentTitle(route: ViewInstance): string;
    IsDefault: boolean = false;
    Show(route: ViewInstance) {
        this.ViewSegments.forEach(s => {
            s.Show(route)
        });
    }
    abstract Url(route: ViewInstance): string;
    abstract UrlPattern(): string;  
    abstract UrlTitle(route: ViewInstance): string;  
    ViewSegments: Array<IView> = new Array<IView>();    
}