using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Routing;

namespace ULFBERHT
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            //var routes = RouteTable.Routes;
            //routes.MapPageRoute("Main/SomePage", "", "~/Default.html");
            GlobalConfiguration.Configure(WebApiConfig.Register);
        }
    }
}
