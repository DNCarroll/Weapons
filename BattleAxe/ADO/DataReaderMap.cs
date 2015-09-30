using System.Collections.Generic;

namespace BattleAxe
{
    public class DataReaderMap
    {
        public static List<DataReaderMap> GetReaderMap(System.Data.IDataReader reader)
        {
            var ret = new List<DataReaderMap>();
            for (int i = 0; i < reader.FieldCount; i++)
            {
                var newMap = new DataReaderMap(i, reader);
                ret.Add(newMap);
            }
            return ret;
        }

        public static void Set<T>(System.Data.IDataReader reader, List<DataReaderMap> map, T obj)
            where T: class
        {
            foreach (var item in map)
            {
                item.SetFromReader(obj, reader);
            }
        }

        System.Data.SqlDbType sqlType(System.Data.IDataReader reader)
        {
            var name = reader.GetFieldType(this.Index).Name;
            switch (name)
            {
                case "Int32": return System.Data.SqlDbType.Int;
                case "DateTime": return System.Data.SqlDbType.DateTime;
                case "String":
                case "Xml": return System.Data.SqlDbType.VarChar;
                case "Boolean": return System.Data.SqlDbType.Bit;
                case "Byte": return System.Data.SqlDbType.TinyInt;
                case "Double": return System.Data.SqlDbType.Float;
                case "Int16": return System.Data.SqlDbType.SmallInt;
                case "Int64": return System.Data.SqlDbType.BigInt;
                case "FileStream":
                case "byte[]": return System.Data.SqlDbType.Binary;
                case "Guid": return System.Data.SqlDbType.UniqueIdentifier;
                case "Money":
                case "Decimal": return System.Data.SqlDbType.Decimal;
                case "Single": return System.Data.SqlDbType.Real;
                default:
                    return System.Data.SqlDbType.Variant;
            }
        }

        public DataReaderMap(int index, System.Data.IDataReader reader)
        {
            this.Index = index;
            this.FieldName = reader.GetName(this.Index);
            this.SqlType = sqlType(reader);
        }

        private string m_FieldName;
        public string FieldName
        {
            get { return m_FieldName; }
            set { m_FieldName = value; }
        }

        private System.Data.SqlDbType m_SqlType;
        public System.Data.SqlDbType SqlType
        {
            get { return m_SqlType; }
            set { m_SqlType = value; }
        }

        private int m_Index;
        public int Index
        {
            get { return m_Index; }
            set { m_Index = value; }
        }

        void setFromReader<T>(T obj, System.Data.IDataReader reader)
            where T : IBattleAxe
        {
            if (!reader.IsDBNull(this.Index))
            {
                switch (this.SqlType)
                {
                    case System.Data.SqlDbType.Int:
                        obj[FieldName] = reader.GetInt32(this.Index);
                        break;
                    case System.Data.SqlDbType.Text:
                    case System.Data.SqlDbType.NVarChar:
                    case System.Data.SqlDbType.NText:
                    case System.Data.SqlDbType.VarChar:
                    case System.Data.SqlDbType.NChar:
                        obj[FieldName] = reader.GetString(this.Index);
                        break;
                    case System.Data.SqlDbType.Bit:
                        obj[FieldName] = reader.GetBoolean(this.Index);
                        break;
                    case System.Data.SqlDbType.SmallDateTime:
                    case System.Data.SqlDbType.Date:
                    case System.Data.SqlDbType.DateTime:
                    case System.Data.SqlDbType.DateTime2:
                        obj[FieldName] = reader.GetDateTime(this.Index);
                        break;
                    case System.Data.SqlDbType.Float:
                        obj[FieldName] = reader.GetDouble(this.Index);
                        break;
                    case System.Data.SqlDbType.TinyInt:
                        obj[FieldName] = reader.GetByte(this.Index);
                        break;
                    case System.Data.SqlDbType.SmallInt:
                        obj[FieldName] = reader.GetInt16(this.Index);
                        break;
                    case System.Data.SqlDbType.Char:
                        obj[FieldName] = reader.GetChar(this.Index);
                        break;
                    case System.Data.SqlDbType.SmallMoney:
                    case System.Data.SqlDbType.Money:
                    case System.Data.SqlDbType.Decimal:
                        obj[FieldName] = reader.GetDecimal(this.Index);
                        break;
                    case System.Data.SqlDbType.Real:
                        obj[FieldName] = reader.GetFloat(this.Index);
                        break;
                    case System.Data.SqlDbType.UniqueIdentifier:
                        obj[FieldName] = reader.GetGuid(this.Index);
                        break;
                    case System.Data.SqlDbType.BigInt:
                        obj[FieldName] = reader.GetInt64(this.Index);
                        break;
                    case System.Data.SqlDbType.Image:
                    case System.Data.SqlDbType.VarBinary:
                    case System.Data.SqlDbType.Binary:
                        long size = reader.GetBytes(this.Index, 0, null, 0, 0);
                        byte[] values = new byte[size];
                        int bufferSize = 1024;
                        long bytesRead = 0;
                        int curPos = 0;
                        while (bytesRead < size)
                        {
                            bytesRead += reader.GetBytes(this.Index, curPos, values, curPos, bufferSize);
                            curPos += bufferSize;
                        }
                        obj[FieldName] = values;
                        break;   
                    default:
                        break;
                }
            }
            else
            {
                obj[FieldName] = null;
            }
        }

        public void SetFromReader<T>(T obj, System.Data.IDataReader reader)
            where T : class
        {
            if (obj is IBattleAxe)
            {
                setFromReader((IBattleAxe)obj, reader);
            }
            else
            {
                if (!reader.IsDBNull(this.Index))
                {
                    switch (this.SqlType)
                    {
                        case System.Data.SqlDbType.BigInt:
                            obj.SetValue(FieldName, reader.GetInt64(this.Index));
                            break;
                        case System.Data.SqlDbType.Image:
                        case System.Data.SqlDbType.VarBinary:
                        case System.Data.SqlDbType.Binary:
                            long size = reader.GetBytes(this.Index, 0, null, 0, 0);
                            byte[] values = new byte[size];
                            int bufferSize = 1024;
                            long bytesRead = 0;
                            int curPos = 0;
                            while (bytesRead < size)
                            {
                                bytesRead += reader.GetBytes(this.Index, curPos, values, curPos, bufferSize);
                                curPos += bufferSize;
                            }
                            obj.SetValue(FieldName, values);
                            break;
                        case System.Data.SqlDbType.Bit:
                            obj.SetValue(FieldName, reader.GetBoolean(this.Index));
                            break;
                        case System.Data.SqlDbType.Char:
                            obj.SetValue(FieldName, reader.GetChar(this.Index));
                            break;
                        case System.Data.SqlDbType.SmallDateTime:
                        case System.Data.SqlDbType.Date:
                        case System.Data.SqlDbType.DateTime:
                        case System.Data.SqlDbType.DateTime2:
                            obj.SetValue(FieldName, reader.GetDateTime(this.Index));
                            break;
                        case System.Data.SqlDbType.SmallMoney:
                        case System.Data.SqlDbType.Money:
                        case System.Data.SqlDbType.Decimal:
                            obj.SetValue(FieldName, reader.GetDecimal(this.Index));
                            break;
                        case System.Data.SqlDbType.Float:
                            obj.SetValue(FieldName, reader.GetDouble(this.Index));
                            break;
                        case System.Data.SqlDbType.Int:
                            obj.SetValue(FieldName, reader.GetInt32(this.Index));
                            break;
                        case System.Data.SqlDbType.Text:
                        case System.Data.SqlDbType.NVarChar:
                        case System.Data.SqlDbType.NText:
                        case System.Data.SqlDbType.VarChar:
                        case System.Data.SqlDbType.NChar:
                            obj.SetValue(FieldName, reader.GetString(this.Index));
                            break;
                        case System.Data.SqlDbType.Real:
                            obj.SetValue(FieldName, reader.GetFloat(this.Index));
                            break;
                        case System.Data.SqlDbType.SmallInt:
                            obj.SetValue(FieldName, reader.GetInt16(this.Index));
                            break;
                        case System.Data.SqlDbType.TinyInt:
                            obj.SetValue(FieldName, reader.GetByte(this.Index));
                            break;
                        case System.Data.SqlDbType.UniqueIdentifier:
                            obj.SetValue(FieldName, reader.GetGuid(this.Index));
                            break;
                        default:
                            break;
                    }
                }
                else
                {
                    obj.SetValue(FieldName, null);
                }
            }
        }
    }

}
