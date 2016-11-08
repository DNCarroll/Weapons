class ContentWithShowByUrlContainer extends ViewContainer {
    constructor() {
        super();
        this.ViewSegments.push(new ContentWithShowByUrlContent());
        this.ViewSegments.push(new ViewHeader());
        this.ViewSegments.push(new ViewFooter());        
    }
    DocumentTitle(route: ViewInstance) { return this.UrlTitle(route); }
    Url(route: ViewInstance) { return "ShowByUrl"; }
    UrlPattern() { return "contentByUrl"; }
    UrlTitle(route: ViewInstance) { return "Content with Show By URL"; }
}
ViewContainers.push(new ContentWithShowByUrlContainer());