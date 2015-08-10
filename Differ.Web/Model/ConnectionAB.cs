using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Differ.Web.Model
{
    public class ConnectionAB
    {

        private string m_A;
        public string A
        {
            get { return m_A; }
            set
            {
                m_A = value;
            }
        }


        private string m_B;
        public string B
        {
            get { return m_B; }
            set
            {
                m_B = value;
            }
        }
    }
}