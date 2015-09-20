using System;
using System.Collections.Generic;
using d = System.Data;

namespace BattleAxe
{
    public static class Regular
    {
        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="command"></param>
        /// <param name="parameter"></param>
        /// <returns></returns>       
        public static T FirstOrDefault<T>(d.SqlClient.SqlCommand command, T parameter = null)
            where T : class, new()
        {
            T newObj = null;
            try
            {
                if (command.IsConnectionOpen())
                {
                    setCommandParameters(parameter, command);
                    newObj = getFirstFromDataReader<T>(command);
                    setOutputParameters(parameter, command);                    
                }
            }
            catch
            {
                throw;
            }
            finally
            {
                command.CloseConnection();
            }
            return newObj;
        }

        private static T getFirstFromDataReader<T>(d.SqlClient.SqlCommand command) where T : class, new()
        {
            T newObj = new T();
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    setValuesFromReader(newObj, reader);
                    break;
                }
            }

            return newObj;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="command"></param>
        /// <param name="parameter"></param>
        /// <returns></returns>
        public static List<T> ToList<T>(d.SqlClient.SqlCommand command, T parameter = null)
            where T : class, new()
        {
            List<T> ret = new List<T>();
            try
            {
                if (command.IsConnectionOpen())
                {
                    setCommandParameters(parameter, command);
                    using (var reader = command.ExecuteReader())
                    {
                        var map = DataReaderMap.GetReaderMap(reader);
                        while (reader.Read())
                        {
                            T newObj = new T();
                            DataReaderMap.Set(reader, map, newObj);
                            ret.Add(newObj);
                        }
                    }
                    setOutputParameters(parameter, command);
                }
            }
            catch
            {
                throw;
            }
            finally { command.CloseConnection(); }
            return ret;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// </summary>
        /// <param name="command"></param>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static T Execute<T>(d.SqlClient.SqlCommand command, T obj = null)
            where T : class
        {
            try
            {
                setCommandParameters(obj, command);
                if (command.IsConnectionOpen())
                {
                    command.ExecuteNonQuery();
                    setOutputParameters(obj, command);
                }
                command.Connection.Close();
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                command.Connection.Close();
            }
            return obj;
        }

        internal static void setValuesFromReader<T>(T obj, d.IDataReader reader)
            where T : class
        {
            //reader.FieldCount
            for (int i = 0; i < reader.FieldCount; i++)
            {
                var fieldName = reader.GetName(i);
                //this might be slow this is where some mapper would be handy
                //if considering larger results sets
                //which are mostly not existing                
                if (reader.GetFieldType(i) == typeof(byte[]))
                {
                    //reader all bytes
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
                    obj.SetValue(fieldName, values);
                }
                else
                {
                    if (reader.IsDBNull(i))
                    {
                        obj.SetValue(fieldName, null);
                    }
                    else
                    {
                        var value = reader.GetValue(i);
                        obj.SetValue(fieldName, value);
                    }
                }
            }
        }

        internal static void setOutputParameters<T>(T obj, d.IDbCommand command)
            where T : class
        {
            if (obj != null)
            {
                try
                {
                    foreach (d.IDataParameter p in command.Parameters)
                    {
                        if (p.Direction == d.ParameterDirection.Output || p.Direction == d.ParameterDirection.InputOutput)
                        {
                            object value = p.Value;
                            if (value == DBNull.Value)
                            {
                                value = null;
                            }
                            obj.SetValue(!string.IsNullOrEmpty(p.SourceColumn) ? p.SourceColumn : p.ParameterName.Replace("@", ""), value);
                        }
                    }
                }
                catch (Exception)
                {
                    throw;
                }
            }
        }

        internal static void setCommandParameters<T>(T obj, d.IDbCommand command)
            where T : class
        {
            if (obj != null)
            {
                try
                {
                    foreach (d.IDbDataParameter parameter in command.Parameters)
                    {
                        if (parameter.Direction == d.ParameterDirection.Input ||
                            parameter.Direction == d.ParameterDirection.InputOutput)
                        {

                            var value = obj.GetValue(parameter.SourceColumn);
                            if (value != null)
                            {
                                parameter.Value = value;
                            }
                            else
                            {
                                parameter.Value = DBNull.Value;
                            }
                        }
                    }
                }
                catch (Exception)
                {
                    throw;
                }
            }
        }

        public static bool IsConnectionOpen(this d.SqlClient.SqlCommand command)
        {
            var ret = false;
            if (command.Connection.State == System.Data.ConnectionState.Closed)
            {
                command.CommandTimeout = Common.Timeout;
                command.Connection.Open();
                ret = true;
            }
            else
            {
                ret = command.Connection.State == System.Data.ConnectionState.Open;
            }
            return ret;
        }

        public static void CloseConnection(this d.SqlClient.SqlCommand command)
        {
            if (command.Connection != null)
            {
                command.Connection.Close();
            }
        }
    }
}
