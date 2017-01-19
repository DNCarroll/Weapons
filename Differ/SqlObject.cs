using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Differ
{
    public enum DataBaseType
    { 
        Unknown = 0,
        Function = 1,
        InlineFunction = 2,
        Procedure = 3,
        TableFunction = 4,
        Trigger = 5
    }

    public class SqlObject 
    {

        private string m_SchemaName;
        public string SchemaName
        {
            get { return m_SchemaName; }
            set { m_SchemaName = value; }
        }

        private string m_ObjectName;
        public string ObjectName
        {
            get { return m_ObjectName; }
            set { m_ObjectName = value; }
        }       

        private int m_ID;
        public int ID
        {
            get { return m_ID; }
            set { m_ID = value; }
        }

        private DataBaseType m_Type;
        public DataBaseType DataBaseType
        {
            get { return m_Type; }
            set { m_Type = value; }
        }


        private string m_Body;
        public string Body
        {
            get { return m_Body; }
            set { m_Body = value; }
        }


        private bool m_Pulled = false;
        public bool Pulled
        {
            get { return m_Pulled; }
            set { m_Pulled = value; }
        }                
    }
}
