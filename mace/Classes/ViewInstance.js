//jobs
//1. supply parameters to viewContainers,  the nature of viewcontainers is mostly singleton so this object 
//      provides for variables via the parameters
var ViewInstance = (function () {
    function ViewInstance(parameters, viewContainer) {
        this.Parameters = parameters;
        this.ViewContainer = viewContainer;
    }
    return ViewInstance;
}());
//# sourceMappingURL=ViewInstance.js.map