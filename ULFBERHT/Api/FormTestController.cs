using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace ULFBERHT.Api
{
    [Route("Api/FormTest")]
    public class FormTestController : ApiController
    {
        [Route("Api/FormTest/{id}/{name}")]
        public FormObject Get(int id, string name)
        {
            var formObject = new FormObject();
            formObject.ID = id;
            formObject.Name = name;
            formObject.Value = "with a value";
            formObject.Selected = true;
            return formObject;
        }

        public FormObject Get([FromUri] FormObject obj)
        {
            var formObject = new FormObject();
            formObject.ID = obj.ID;
            formObject.Name = obj.Name;
            formObject.Value = "with a value";
            formObject.Selected = true;
            return formObject;
        }

        // POST api/<controller>
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }


    public class FormObject
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

    }
}