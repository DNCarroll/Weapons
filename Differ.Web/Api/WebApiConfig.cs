using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace Differ.Web
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();

            //config.Routes.MapHttpRoute(
            //name: "ControllerActionObj",
            //routeTemplate: "Api/{controller}/{action}/{obj}",
            //defaults: new { obj = RouteParameter.Optional });

            //config.Routes.MapHttpRoute(
            //name: "ControllerObj",
            //routeTemplate: "Api/{controller}/{obj}",
            //defaults: new { obj = RouteParameter.Optional });

        }
    }
}