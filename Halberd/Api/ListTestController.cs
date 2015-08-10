using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Halberd.Api
{
    [Route("Api/ListTest")]
    public class ListTestController : ApiController
    {
        public List<ListObject> Get([FromUri] ListObject obj)
        {
            var listObject = new List<ListObject>();

            for (int i = 0; i < 30; i++)
            {
                listObject.Add(new ListObject
                {
                    ID = i,
                    Name = "Name" + i.ToString(),
                    Value = "Value" + i.ToString(),
                    Selected = i % 2 == 0,
                    Suggestion = i % 5 == 0 ? "Fifth" : i % 4 == 0 ? "Fourth" : i % 3 == 0 ? "Third" : i % 2 == 0 ? "Even" : "Indivisible"
                });
            }
            return listObject;
        }

        // POST: api/ListTest
        public ListObject Post([FromBody]ListObject value)
        {
            value.ID = 100;
            return value;
        }

        // PUT: api/ListTest/5
        public ListObject Put([FromBody]ListObject value)
        {
            string temp = value.Name;
            return value;
        }

        // DELETE: api/ListTest/5
        public bool Delete([FromBody]ListObject value)
        {
            string temp = value.Name;
            return true;
        }
    }


    public class ListObject
    {

        private int m_RadioValue;
        public int RadioValue
        {
            get { return m_RadioValue; }
            set { m_RadioValue = value; }
        }

        private bool m_Selected;
        public bool Selected
        {
            get { return m_Selected; }
            set { m_Selected = value; }
        }

        private string m_Value;
        public string Value
        {
            get { return m_Value; }
            set { m_Value = value; }
        }

        private string m_Name;
        public string Name
        {
            get { return m_Name; }
            set { m_Name = value; }
        }

        private int m_ID;
        public int ID
        {
            get { return m_ID; }
            set { m_ID = value; }
        }


        private string m_Suggestion;
        public string Suggestion
        {
            get { return m_Suggestion; }
            set { m_Suggestion = value; }
        }
                

    }
}
