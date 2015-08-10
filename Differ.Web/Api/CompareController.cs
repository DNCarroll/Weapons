using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web;
using BattleAxe;
using p = Differ.TSql.Procedures;

namespace Differ.Web.Api
{
    
    [RoutePrefix("Api/Compare")]
    public class CompareController : ApiController
    {

        [Route("{sqlConnectionStringA}/{sqlConnectionStringB}")]
        public List<Differ.ComparisonOutput> Get(string sqlConnectionStringA, string sqlConnectionStringB)
        {            
            DataCache.Outputs.Remove(o => o.AConnection == sqlConnectionStringA && o.BConnection == sqlConnectionStringB);
            var temp = new List<ComparisonOutput>();
            var aObjects = p.GetObjectCommand(sqlConnectionStringA).ToList<Differ.SqlObject>();
            var bObjects = p.GetObjectCommand(sqlConnectionStringB).ToList<Differ.SqlObject>();
            foreach (var item in aObjects)
            {
                string bBody = null;
                item.Pulled = true;
                var found = bObjects.FirstOrDefault(o => o.SchemaName == item.SchemaName && o.ObjectName == item.ObjectName);
                if (found != null)
                {
                    bBody = found.Body;
                    found.Pulled = true;
                }
                temp.Add(new ComparisonOutput(item.SchemaName, item.ObjectName, item.Body, bBody));
            }

            var remainder = bObjects.Where(o => !o.Pulled).ToList();
            foreach (var item in remainder)
            {
                DataCache.Outputs.Add(new ComparisonOutput(item.SchemaName, item.ObjectName, null, item.Body));
            }
            temp.Remove(o => o.Result == CompareResult.Matches);            
            DataCache.Outputs.AddRange(temp);
            temp.ForEach(o => o.Merge());            
            return temp;
        }
                
        [Route]
        public List<Differ.ComparisonOutput> Get([FromUri]Model.ConnectionAB obj)
        {
            var sqlConnectionStringA = obj.A;
            var sqlConnectionStringB = obj.B;
            //DataCache.Outputs.Remove(o => o.AConnection == sqlConnectionStringA && o.BConnection == sqlConnectionStringB);
            var temp = new List<ComparisonOutput>();
            var aObjects = p.GetObjectCommand(sqlConnectionStringA).ToList<Differ.SqlObject>();
            var bObjects = p.GetObjectCommand(sqlConnectionStringB).ToList<Differ.SqlObject>();
            foreach (var item in aObjects)
            {
                string bBody = null;
                item.Pulled = true;
                var found = bObjects.FirstOrDefault(o => o.SchemaName == item.SchemaName && o.ObjectName == item.ObjectName);
                if (found != null)
                {
                    bBody = found.Body;
                    found.Pulled = true;
                }
                temp.Add(new ComparisonOutput(item.SchemaName, item.ObjectName, item.Body, bBody));
            }

            var remainder = bObjects.Where(o => !o.Pulled).ToList();
            foreach (var item in remainder)
            {
                temp.Add(new ComparisonOutput(item.SchemaName, item.ObjectName, null, item.Body));
            }
            temp.Remove(o => o.Result == CompareResult.Matches);
            //DataCache.Outputs.AddRange(temp);
            temp.ForEach(o => o.Merge());
            return temp.OrderBy(t=>t.FullName).ToList();
        }
        //[Route("{sqlConnectionStringA}/{sqlConnectionStringB}/{ID}")]
        //public string Get(string sqlConnectionStringA, string sqlConnectionStringB, int ID)
        //{
        //    return "value";
        //}

        // POST: api/Compare
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/Compare/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Compare/5
        public void Delete(int id)
        {
        }
    }
}
