using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ULFBERHT.Bundler
{
    public class TypeScriptFile
    {        
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
        
        public string Name { get; set; }
        public string JavaScriptFile { get; set; }
        public bool Selected { get; set; } = true;
    }
}
