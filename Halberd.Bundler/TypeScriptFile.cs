using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Halberd.Bundler
{
    public class TypeScriptFile
    {

        private bool m_Selected = true;
        public bool Selected
        {
            get { return m_Selected; }
            set { m_Selected = value; }
        }
                

        private string m_FullName;
        public string FullName
        {
            get { return m_FullName; }
            set {
                this.Name = value.Substring(value.LastIndexOf("\\") + 1);
                this.JavaScriptFile = value.Replace(".ts", ".js");
                m_FullName = value; 
            }
        }       

        private string m_Name;
        public string Name
        {
            get { return m_Name; }
            set { m_Name = value; }
        }


        private string m_JavaScriptFile;
        public string JavaScriptFile
        {
            get { return m_JavaScriptFile; }
            set { m_JavaScriptFile = value; }
        }
                
                
    }
}
