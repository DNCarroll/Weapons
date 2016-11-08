//Jobs for this code
//1. supply information for history and spa like functionality for history
//2. call all of its views to be shown
//3. when initial page has loaded determine if this is the container to be used
//4. if coming in from ShowByUrl subsequent window load use IsUrlPatternMatch to determin if it is correct view
var ViewContainers: Array<IViewContainer> = new Array<IViewContainer>();
abstract class ViewContainer implements IViewContainer {    
    constructor() { }        
    Views: Array<IView> = new Array<IView>();    
    IsDefault: boolean = false;
    Show(route: ViewInstance) {
        this.Views.forEach(s => {
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
    //use the toString to identify it?
    //would indicated that we can instantiate it
}