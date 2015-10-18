using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BattleAxe
{
    public class SqlExceptionsThatCauseRederivingSqlCommand
    {

        private static List<int> _Values = new List<int> { 201, 8144 };
        public static List<int> Values
        {
            get { return _Values; }
            set
            {
                _Values = value;
            }
        }
    }
}
