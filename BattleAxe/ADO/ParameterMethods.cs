using System;
using System.Collections;
using System.Data;
using System.Data.SqlClient;
using System.Linq;

namespace BattleAxe
{
    public static class ParameterMethods
    {
        internal static void SetInputs<T>(T sourceForInputs, SqlCommand command, bool shipStructured = false)
            where T : class
        {
            if (sourceForInputs != null)
            {
                try
                {
                    foreach (SqlParameter parameter in command.Parameters)
                    {
                        if (parameter.SqlDbType != SqlDbType.Structured)
                        {
                            if (parameter.Direction == ParameterDirection.Input ||
                                parameter.Direction == ParameterDirection.InputOutput)
                            {
                                var value = sourceForInputs is IBattleAxe ? ((IBattleAxe)sourceForInputs)[parameter.SourceColumn] : sourceForInputs.GetValue(parameter.SourceColumn);
                                parameter.Value = value != null ? value : DBNull.Value;
                            }
                        }
                        else if (!shipStructured)
                        {
                            parameter.Value = GetDataTable(((IBattleAxe)sourceForInputs)[parameter.SourceColumn], command, parameter);
                        }
                    }
                }
                catch (Exception)
                {
                    throw;
                }
            }
        }

        //not ready for object that are not IBattleAxe
        internal static DataTable GetDataTable(object referenceObject, SqlCommand command, SqlParameter parameter)
        {
            DataTable ret = new System.Data.DataTable();
            if (referenceObject != null)
            {
                var reference = CommandMethods.structureFields.Where(i => i.Item1.CommandText == command.CommandText && i.Item1.Connection.ConnectionString == command.Connection.ConnectionString && i.Item2 == parameter.TypeName).ToList();
                foreach (var item in reference)
                {
                    ret.Columns.Add(item.Item3);
                }
                if (referenceObject is IBattleAxe)
                {
                    var ibattleAxe = (IBattleAxe)referenceObject;
                    DataRow row = ret.NewRow();
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
                            DataRow row = ret.NewRow();
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

        internal static void SetOutputs<T>(T targetForOutputs, IDbCommand command)
            where T : class
        {
            try
            {
                foreach (IDataParameter p in command.Parameters)
                {
                    if (p.Direction == ParameterDirection.Output || p.Direction == ParameterDirection.InputOutput)
                    {
                        object value = p.Value;
                        if (value == DBNull.Value)
                        {
                            value = null;
                        }
                        var field = !string.IsNullOrEmpty(p.SourceColumn) ? p.SourceColumn : p.ParameterName.Replace("@", "");
                        if (targetForOutputs is IBattleAxe)
                        {
                            ((IBattleAxe)targetForOutputs)[field] = value;
                        }
                        else
                        {
                            targetForOutputs.SetValue(field, value);
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
}
