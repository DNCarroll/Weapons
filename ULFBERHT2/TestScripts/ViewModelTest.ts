class DefaultContentManager extends ViewContainer {
    constructor() {
        super();
        this.ViewSegments.push(new ViewContent());
        this.ViewSegments.push(new ViewHeader());
        this.ViewSegments.push(new ViewFooter());
        this.IsDefault = true;
    }    
    DocumentTitle(route: ViewInstance) { return "Default content"; }
    Url(route: ViewInstance) { return "Default"; }
    UrlPattern() { return "default"; }
    UrlTitle(route: ViewInstance) { return "Default Page"; }
}
ViewContainers.push(new DefaultContentManager());
