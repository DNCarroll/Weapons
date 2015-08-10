using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections.ObjectModel;

namespace BattleAxe
{
    public static class Forge
    {
        public static Dictionary<string, T> KeyValueEnumItemsSource<T>()
        {
            var itemssource = new Dictionary<string, T>();
            try
            {
                var values = Enum.GetValues(typeof(T));
                foreach (var value in values)
                {
                    itemssource.Add(Enum.GetName(typeof(T), value), (T)value);
                }

            }
            catch
            {
            }
            return itemssource;
        }

        public static ObservableCollection<EnumObj<T>> EnumList<T>()
        {
            ObservableCollection<EnumObj<T>> itemssource = new ObservableCollection<EnumObj<T>>();
            try
            {
                var values = Enum.GetValues(typeof(T));
                foreach (var value in values)
                {
                    itemssource.Add(new EnumObj<T>((T)value, Enum.GetName(typeof(T), value)));
                }

            }
            catch
            {
            }
            return itemssource;
        }



    }

    public class EnumObj<T>
    {

        private string m_Name;
        public string Name
        {
            get { return m_Name; }
            set
            {
                m_Name = value;
            }
        }
        private T m_Value;
        public T Value
        {
            get { return m_Value; }
            set
            {
                m_Value = value;
            }
        }
        public EnumObj(T value, string name)
        {
            this.Name = name;
            this.Value = value;
        }
    }
}
