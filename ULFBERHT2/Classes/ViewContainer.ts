//nothing to add as of 2016-11-08
var ViewContainers: Array<IViewContainer> = new Array<IViewContainer>();
abstract class ViewContainer implements IViewContainer {    
    constructor() { }        
    ViewSegments: Array<IView> = new Array<IView>();    
    IsDefault: boolean = false;
    Show(route: ViewInstance) {
        this.ViewSegments.forEach(s => {
            s.Show(route)
        });
    }
    IsUrlPatternMatch(url: string) {
        var pattern = this.UrlPattern();
        if (pattern) {
            var regex = new RegExp(pattern, 'i');
            return url.match(regex) ? true : false;
        }
        return false;
    }
    abstract DocumentTitle(route: ViewInstance): string;
    abstract Url(route: ViewInstance): string;
    abstract UrlPattern(): string;  
    abstract UrlTitle(route: ViewInstance): string;      
}