//jobs
//1. supply parameters to viewContainers,  the nature of viewcontainers is mostly singleton so this object 
//      provides for variables via the parameters
class ViewInstance {    
    Parameters: Array<any>;
    ViewContainer: IViewContainer;    
    constructor(parameters: Array<any>, viewContainer: IViewContainer) {
        this.Parameters = parameters;        
        this.ViewContainer = viewContainer;
    }
}
