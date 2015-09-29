﻿using System.Data;
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

        private static void setValuesFromReader<T>(T objectAcceptingValuesFromReader, IDataReader reader)
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
                    setObjectPropertyValue(objectAcceptingValuesFromReader, fieldName, values);
                }
                else
                {
                    if (reader.IsDBNull(i))
                    {
                        setObjectPropertyValue(objectAcceptingValuesFromReader, fieldName, null);
                    }
                    else
                    {
                        var value = reader.GetValue(i);
                        setObjectPropertyValue(objectAcceptingValuesFromReader, fieldName, value);
                    }
                }
            }
        }

        private static void setObjectPropertyValue<T>(T objWithPropertyToSet, string propertyName, object propertyValue) where T : class
        {
            if (objWithPropertyToSet is IBattleAxe)
            {
                ((IBattleAxe)objWithPropertyToSet)[propertyName] = propertyValue;
            }
            else
            {
                objWithPropertyToSet.SetValue(propertyName, propertyValue);
            }
        }
    }
}
