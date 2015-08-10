using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace BattleAxe
{
    public static class WebApi
    {
        private static long m_MaxBuffer = 266000;
        public static long MaxResponseContentBufferSize
        {
            get { return m_MaxBuffer; }
            set { m_MaxBuffer = value; }
        }


        static HttpClient getClient(Action<HttpClient> forClientSetup = null){
            HttpClient _client = new HttpClient();
            if (forClientSetup != null)
            {
                forClientSetup(_client);
            }
            return _client;
        }

        public static async Task<T> Get<T>(this string url, Action<HttpClient> forClientSetup, params object[] objs)
            where T : class
        {
            if (objs != null && objs.Length > 0)
            {
                var query = string.Join("/", objs.Select(o => o.ToString()));
                url = url + (url.EndsWith("/") ? "" : "/") + query;

            }
            return await url.Get<T>(forClientSetup);
        }

        public static async Task<T> Get<T>(this string url, Action<HttpClient> forClientSetup = null)
            where T : class
        {
            return await execute<T>(Action.Get, url, null, forClientSetup);
        }

        public static async Task<T> Delete<T>(this string url, Action<HttpClient> forClientSetup = null)
            where T : class
        {
            return await execute<T>(Action.Delete, url, null, forClientSetup);
        }
        
        public static async Task<T> Put<T>(this string url, T obj, Action<HttpClient> forClientSetup = null)
            where T : class
        {
            return await execute<T>(Action.Put, url, obj, forClientSetup);
        }

        public static async Task<T> Post<T>(this string url, T obj, Action<HttpClient> forClientSetup = null)
            where T : class
        {
            return await execute<T>(Action.Post, url, obj, forClientSetup);
        }


        static async Task<T> execute<T>(Action action, string url, T obj, Action<HttpClient> forClientSetup)
            where T : class
        {
            HttpClient client = new HttpClient();
            if (forClientSetup != null)
            {
                forClientSetup(client);
            }
            T ret = null;
            StringContent content = null;
            HttpResponseMessage result = null;
            //this called keys
            if (obj != null && action != Action.Get && action != Action.Delete)
            {
                var jsonString = JsonConvert.SerializeObject(obj);
                content = new StringContent(jsonString, Encoding.UTF8, "application/json");
            }
            //not sure need this:
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            //may need to adjust this:
            client.MaxResponseContentBufferSize =MaxResponseContentBufferSize;
            switch (action)
            {
                case Action.Get:
                    result = await client.GetAsync(url);
                    break;
                case Action.Post:
                    result = await client.PostAsync(url, content);
                    break;
                case Action.Put:
                    result = await client.PutAsync(url, content);
                    break;
                case Action.Delete:
                    result = await client.DeleteAsync(url);
                    break;
                default:
                    break;
            }
            if (result != null)
            {
                var json = await result.Content.ReadAsStringAsync();
                try
                {
                    ret = JsonConvert.DeserializeObject<T>(json);
                }
                catch
                {
                    throw;
                }
            }
            return ret;
        }

    }
    enum Action
    {
        Get, 
        Post,
        Put,
        Delete
    }
}
