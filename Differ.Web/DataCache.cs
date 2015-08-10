using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Differ.Web
{
    public static class DataCache
    {
        private static List<ComparisonOutput> m_Outputs = new List<ComparisonOutput>();
        public static List<ComparisonOutput> Outputs
        {
            get { return m_Outputs; }
            set { m_Outputs = value; }
        }
                
    }
}