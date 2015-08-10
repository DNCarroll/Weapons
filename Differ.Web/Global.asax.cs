using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;
using System.Web.Http;
using System.Web.Routing;


namespace Differ.Web
{
    public class Global : HttpApplication
    {
        void Application_Start(object sender, EventArgs e)
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);

            var routes = RouteTable.Routes;
            // Code that runs on application startup
            //GlobalConfiguration.Configure(WebApiConfig.Register);
            //RouteConfig.RegisterRoutes(RouteTable.Routes);
            //BundleConfig.RegisterBundles(BundleTable.Bundles);

            routes.Ignore("Images/{pathInfo}.svg");
            routes.Ignore("Images/{pathInfo}.png");
            routes.Ignore("Images/{pathInfo}.jpg");
            routes.Ignore("Views/{pathInfo}");
            routes.Ignore("Views/{pathInfo}/{Param1}");
            routes.Ignore("Views/{pathInfo}/{Param1}/{Param2}");
            routes.Ignore("Views/{pathInfo}/{Param1}/{Param2}/{Param3}");

            routes.MapPageRoute("Main", "", "~/Default.aspx");
            routes.MapPageRoute("Page", "{Page}", "~/Default.aspx");
            routes.MapPageRoute("SubPages", "{Page}/{SubPage}", "~/Default.aspx");
            routes.MapPageRoute("TertPages", "{Page}/{SubPage}/{TertPage}", "~/Default.aspx");
            routes.MapPageRoute("QuatPages", "{Page}/{SubPage}/{TertPage}/{QuatPages}", "~/Default.aspx");
            routes.MapPageRoute("QuinPages", "{Page}/{SubPage}/{TertPage}/{QuatPages}/{QuinPages}", "~/Default.aspx");
            routes.MapPageRoute("SexPages", "{Page}/{SubPage}/{TertPage}/{QuatPages}/{QuinPages}/{SexPages}", "~/Default.aspx");
        }
    }
}