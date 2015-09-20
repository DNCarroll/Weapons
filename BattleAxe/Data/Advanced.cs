﻿using System;
using System.Collections.Generic;
using d = System.Data;
using System.Linq;
using System.Collections;

namespace BattleAxe
{
    public static class Advanced
    {
        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. IBattleAxe assumes that the object is controlling
        /// all the value setting through the Indexer
        /// beware this has no error trapping so make sure to trap your errors
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="command"></param>
        /// <param name="parameter"></param>
        /// <returns></returns>
        public static T FirstOrDefault<T>(this d.SqlClient.SqlCommand command, T parameter)
            where T : class, IBattleAxe, new()
        {
            T newObj = null;
            try
            {
                if (connectionOpened(command))
                {
                    setCommandParameterValues(parameter, command);
                    newObj = getFirstFromReader<T>(command);
                    setOutputParameters(parameter, command);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                command.Connection.Close();
            }
            return newObj;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. IBattleAxe assumes that the object is controlling
        /// all the value setting through the Indexer
        /// beware this has no error trapping so make sure to trap your errors
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="command"></param>
        /// <param name="parameter"></param>
        /// <returns></returns>
        public static T FirstOrDefault<T>(this d.SqlClient.SqlCommand command, IBattleAxe parameter)
            where T : class, IBattleAxe, new()
        {
            T newObj = null;
            try
            {
                if (connectionOpened(command))
                {
                    setCommandParameterValues(parameter, command);
                    newObj = getFirstFromReader<T>(command);
                    setOutputParameters(parameter, command);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                command.Connection.Close();
            }
            return newObj;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// beware this has no error trapping so make sure to trap your errors
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="command"></param>
        /// <returns></returns>
        public static T FirstOrDefault<T>(this d.SqlClient.SqlCommand command)
            where T : class, IBattleAxe, new()
        {
            T newObj = null;
            try
            {
                if (connectionOpened(command))
                {
                    newObj = getFirstFromReader<T>(command);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                command.Connection.Close();
            }
            return newObj;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// beware this has no error trapping so make sure to trap your errors
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="command"></param>
        /// <returns></returns>
        public static T FirstOrDefault<T>(this T obj, d.SqlClient.SqlCommand command)
            where T : class, IBattleAxe, new()
        {
            return command.FirstOrDefault(obj);
        }

        private static T getFirstFromReader<T>(d.SqlClient.SqlCommand command) where T : class, IBattleAxe, new()
        {
            T newObj = null;
            using (var reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    newObj = new T();
                    setValuesFromReader(newObj, reader);
                    break;
                }
            }
            return newObj;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. IBattleAxe assumes that the object is controlling
        /// all the value setting through the Indexer
        /// beware this has no error trapping so make sure to trap your errors
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="command"></param>
        /// <param name="parameter"></param>
        /// <returns></returns>
        public static List<T> ToList<T>(this d.SqlClient.SqlCommand command, T parameter)
            where T : class, IBattleAxe, new()
        {
            List<T> ret = new List<T>();
            try
            {
                if (connectionOpened(command))
                {
                    setCommandParameterValues(parameter, command);
                    executeReaderAndFillList(command, ret);
                    setOutputParameters(parameter, command);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                command.Connection.Close();
            }
            return ret;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. IBattleAxe assumes that the object is controlling
        /// all the value setting through the Indexer
        /// beware this has no error trapping so make sure to trap your errors
        /// </summary>
        /// <typeparam name="T">the return type</typeparam>
        /// <param name="command"></param>
        /// <param name="parameter">IBattle axe so can find parameter values from it using indexer</param>
        /// <returns></returns>
        public static List<T> ToList<T>(this d.SqlClient.SqlCommand command, IBattleAxe parameter)
            where T : class, IBattleAxe, new()
        {
            List<T> ret = new List<T>();
            try
            {
                if (connectionOpened(command))
                {
                    setCommandParameterValues(parameter, command);
                    executeReaderAndFillList(command, ret);
                    setOutputParameters(parameter, command);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                command.Connection.Close();
            }
            return ret;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// beware this has no error trapping so make sure to trap your errors
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="command"></param>
        /// <returns></returns>
        public static List<T> ToList<T>(this d.SqlClient.SqlCommand command)
            where T : class, IBattleAxe, new()
        {
            List<T> ret = new List<T>();
            try
            {
                if (connectionOpened(command))
                {
                    executeReaderAndFillList(command, ret);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                command.Connection.Close();
            }
            return ret;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. 
        /// beware this has no error trapping so make sure to trap your errors
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="command"></param>
        /// <returns></returns>
        public static List<T> ToList<T>(this T obj, d.SqlClient.SqlCommand command)
            where T : class, IBattleAxe, new()
        {
            return command.ToList<T>(obj);
        }

        private static void executeReaderAndFillList<T>(d.SqlClient.SqlCommand command, List<T> ret) where T : class, IBattleAxe, new()
        {
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
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. IBattleAxe assumes that the object is controlling
        /// all the value setting through the Indexer. 
        /// beware this has no error trapping so make sure to trap your errors
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <param name="command"></param>
        /// <returns></returns>
        public static T Execute<T>(this T obj, d.SqlClient.SqlCommand command)
            where T : class, IBattleAxe, new()
        {
            return command.Execute(obj);
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. IBattleAxe assumes that the object is controlling
        /// all the value setting through the Indexer.
        /// beware this has no error trapping so make sure to trap your errors 
        /// </summary>
        /// <param name="command"></param>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static T Execute<T>(this d.SqlClient.SqlCommand command, T obj)
            where T : class, IBattleAxe, new()
        {
            try
            {                
                if (connectionOpened(command))
                {
                    setCommandParameterValues(obj, command);
                    command.ExecuteNonQuery();
                    setOutputParameters(obj, command);
                }
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

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. IBattleAxe assumes that the object is controlling
        /// all the value setting through the Indexer.
        /// beware this has no error trapping so make sure to trap your errors 
        /// </summary>
        /// <param name="command"></param>
        /// <param name="objs"></param>
        /// <returns></returns>
        public static List<IBattleAxe> Update(this d.SqlClient.SqlCommand command, List<IBattleAxe> objs)            
        {
            try
            {             
                if (connectionOpened(command))
                {
                    foreach (var obj in objs)
                    {
                        setCommandParameterValues(obj, command);
                        command.ExecuteNonQuery();
                        setOutputParameters(obj, command);
                    }
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
            return objs;
        }

        /// <summary>
        /// the command should have the connections string set,  doesnt have to be open but
        /// the string should be set. IBattleAxe assumes that the object is controlling
        /// all the value setting through the Indexer.
        /// beware this has no error trapping so make sure to trap your errors 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="objs">the objects that you want to update with the provided command</param>
        /// <param name="command"></param>
        public static void Update(this List<IBattleAxe> objs, d.SqlClient.SqlCommand command)            
        {
            command.Update(objs);
        }

        internal static void setValuesFromReader<T>(T obj, d.IDataReader reader)
            where T : IBattleAxe
        {
            //reader.FieldCount
            for (int i = 0; i < reader.FieldCount; i++)
            {
                var fieldName = reader.GetName(i);
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
                    obj[fieldName] = values;
                }
                else
                {
                    var value = reader.GetValue(i);
                    if (reader.IsDBNull(i))
                    {
                        obj[fieldName] = null;
                    }
                    else
                    {
                        obj[fieldName] = value;
                    }
                }
            }
        }

        internal static bool connectionOpened(d.SqlClient.SqlCommand command)
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

        internal static void setOutputParameters<T>(T obj, d.SqlClient.SqlCommand command)
            where T : IBattleAxe
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
                        obj[!string.IsNullOrEmpty(p.SourceColumn) ? p.SourceColumn : p.ParameterName.Replace("@", "")] = value;
                    }
                }
            }
            catch (Exception)
            {

                throw;
            }
        }

        internal static void setCommandParameterValues<T>(T obj, d.SqlClient.SqlCommand command, bool shipStructured = false)
            where T : IBattleAxe
        {
            if (obj != null)
            {
                try
                {
                    foreach (d.SqlClient.SqlParameter parameter in command.Parameters)
                    {
                        if (parameter.SqlDbType != d.SqlDbType.Structured)
                        {
                            if (parameter.Direction == d.ParameterDirection.Input ||
                                parameter.Direction == d.ParameterDirection.InputOutput)
                            {
                                var value = obj[parameter.SourceColumn];
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
                        else if (!shipStructured)
                        {
                            parameter.Value = GetDataTable(obj[parameter.SourceColumn], command, parameter);
                        }
                    }
                }
                catch (Exception)
                {
                    throw;
                }
            }
        }

        public static void SetStructuredParameterValue<T>(this d.SqlClient.SqlCommand command, string parameterName, List<T> data)
        {
            var parameter = command.Parameters[parameterName];
            if (parameter != null)
            {
                d.DataTable ret = new System.Data.DataTable();
                var reference = Common.structureFields.Where(i => i.Item1.CommandText == command.CommandText && i.Item1.Connection.ConnectionString == command.Connection.ConnectionString && i.Item2 == parameter.TypeName).ToList();
                foreach (var item in reference)
                {
                    ret.Columns.Add(item.Item3);
                }
                foreach (var obj in data)
                {
                    IBattleAxe ibattleAxe = (IBattleAxe)obj;
                    d.DataRow row = ret.NewRow();
                    foreach (var item in reference)
                    {
                        var value = ibattleAxe[item.Item3];
                        if (value is Enum)
                        {
                            row[item.Item3] = (int)value;
                        }
                        else
                        {
                            row[item.Item3] = value;
                        }
                    }
                    ret.Rows.Add(row);
                }
                parameter.Value = ret;
            }
        }

        public static void SetSimpleParameterValues<T>(this d.SqlClient.SqlCommand command, T obj)
            where T : IBattleAxe
        {
            setCommandParameterValues(obj, command, true);
        }
        internal static d.DataTable GetDataTable(object referenceObject, d.SqlClient.SqlCommand command, d.SqlClient.SqlParameter parameter)
        {
            d.DataTable ret = new System.Data.DataTable();
            if (referenceObject != null)
            {
                var reference = Common.structureFields.Where(i => i.Item1.CommandText == command.CommandText && i.Item1.Connection.ConnectionString == command.Connection.ConnectionString && i.Item2 == parameter.TypeName).ToList();
                foreach (var item in reference)
                {
                    ret.Columns.Add(item.Item3);
                }
                if (referenceObject is IBattleAxe)
                {
                    var ibattleAxe = (IBattleAxe)referenceObject;
                    d.DataRow row = ret.NewRow();
                    foreach (var item in reference)
                    {
                        row[item.Item3] = ibattleAxe[item.Item3];
                    }
                    ret.Rows.Add(row);
                }
                else
                {
                    var type = referenceObject.GetType();
                    if (type.Name == "List`1")
                    {
                        IList data = (IList)referenceObject;
                        foreach (var obj in data)
                        {
                            IBattleAxe ibattleAxe = (IBattleAxe)obj;
                            d.DataRow row = ret.NewRow();
                            foreach (var item in reference)
                            {
                                var value = ibattleAxe[item.Item3];
                                if (value is Enum)
                                {
                                    row[item.Item3] = (int)value;
                                }
                                else
                                {
                                    row[item.Item3] = value;
                                }
                            }
                            ret.Rows.Add(row);
                        }
                    }
                }
            }
            return ret;
        } 
    }
}
