using System.Data;
using System.Data.SqlClient;

namespace BattleAxe
{
    public static class DataReaderMethods
    {
        internal static T GetFirst<T>(SqlCommand command) where T : class, new()
        {
            T newObject = new T();
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    setValuesFromReader(newObject, reader);
                    break;
                }
            }
            return newObject;
        }

        private static void setValuesFromReader<T>(T obj, IDataReader reader)
            where T : class
        {
            for (int i = 0; i < reader.FieldCount; i++)
            {
                var fieldName = reader.GetName(i);
                if (reader.GetFieldType(i) == typeof(byte[]))
                {
                    long size = reader.GetBytes(i, 0, null, 0, 0);
                    byte[] values = new byte[size];
                    int bufferSize = 1024;
                    long bytesRead = 0;
                    int curPos = 0;
                    while (bytesRead < size)
                    {
                        bytesRead += reader.GetBytes(i, curPos, values, curPos, bufferSize);
                        curPos += bufferSize;
                    }
                    setObjectProperty(obj, fieldName, values);
                }
                else
                {
                    if (reader.IsDBNull(i))
                    {
                        setObjectProperty(obj, fieldName, null);
                    }
                    else
                    {
                        var value = reader.GetValue(i);
                        setObjectProperty(obj, fieldName, value);
                    }
                }
            }
        }

        private static void setObjectProperty<T>(T obj, string fieldName, object value) where T : class
        {
            if (obj is IBattleAxe)
            {
                ((IBattleAxe)obj)[fieldName] = value;
            }
            else
            {
                obj.SetValue(fieldName, value);
            }
        }
    }
}
