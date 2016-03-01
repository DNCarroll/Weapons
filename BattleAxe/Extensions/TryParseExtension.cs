using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BattleAxe
{
    public delegate bool TryConvertDelegate<T>(string value, out T returnValue);
    public static class TryParseExtension
    {
        public static T GetValue<T>(this object valueToConvert, TryConvertDelegate<T> tryConvertDelegate, T defaultValue = default(T))
        {
            T returnValue = defaultValue;
            if(valueToConvert!= null && valueToConvert!=DBNull.Value && tryConvertDelegate(valueToConvert.ToString(), out returnValue)) { }
            else
            {
                returnValue = defaultValue;
            }
            return returnValue;
        }
    }
}
