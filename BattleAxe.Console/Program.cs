using Microsoft.CSharp;
using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using BattleAxe;
using System.Dynamic;

namespace BattleAxe.Console
{
    class Program
    {
        static void Main(string[] args)
        {
            //Compiler2.SetValue(new Test(), "asdf", "asdf");
            //var line = "y";
            
            //while(line =="y")
            //{
            //    Compiler.TestMethod();
            //    System.Console.WriteLine("Test again (y/n)?");
            //    line = System.Console.ReadLine();
            //}
            //var getSet = Compiler.Get<Test>();
            //var test = new Test();
            var line = "y";
            //test.Prop2 = 2;
            //test.Prop3 = 3;
            //System.Console.WriteLine(test.Prop2);
            //getSet.SetValue(test, "Prop2", 4);
            //getSet.SetValue(test, "Prop3", 6);

            //System.Console.WriteLine(test.Prop2);
            //System.Console.WriteLine(test.Prop3);

            //its slow,  try dictionary? instead of tuple?
            while (line == "y")
            {
                TestMethod2();
                System.Console.WriteLine("Test again (y/n)?");
                line = System.Console.ReadLine();
            }
        }

        public static void TestMethod2()
        {
           // var getSet = Compiler.Get<Test>();
            var test = new Test();
            var test1 = new Test();
            var test2 = new Test();
            test2["StringCheck"] = "string check";
            var getstringCHeck = test2["StringCheck"];
            var vlaue = test2.GetValue("StringCheck");
            var test3 = new Test();
            var bytes = new byte[] { 123, 78 };
            test2["BytesCheck"] = bytes;
            DateTime start;
            DateTime stop;
            int repetitions = 10000;
            byte zero = 0;
            byte one = 1;
            start = DateTime.Now;
            for (int i = 0; i < repetitions; i++)
            {
                test.IntCheck = i;
                test.StringCheck = i.ToString();
                test.DecimalCheck = (decimal)i / (decimal)repetitions;
                test.BoolCheck = !test.BoolCheck;
                test.ByteCheck = test.ByteCheck >= byte.MaxValue ? zero : (byte)(test.ByteCheck + one);
                test.CharCheck = i.ToString().ToCharArray()[0];
                test.DateTime = DateTime.Now;
                test.DoubleCheck = (double)i / (double)repetitions;
                test.EnumCheck = test.EnumCheck == EnumCheckValue.Value0 ? EnumCheckValue.Value1 : EnumCheckValue.Value0;
                test.GuidCheck = new Guid();
                test.LongCheck = (long)i;
                test.ShortCheck = (short)test.ByteCheck;
                test.SingleCheck = (Single)test.ByteCheck;
            }
            test.StringCheck = "Test";
            stop = DateTime.Now;
            var ts = stop.Subtract(start);
            System.Console.WriteLine("Original - time: {0} ms, Name: {1}", ts.TotalMilliseconds, test.StringCheck);
            //start = DateTime.Now;
            //for (int i = 0; i < repetitions; i++)
            //{

            //    test1.SetValue("Prop3", i);
            //    test1.SetValue("Name", i.ToString());
            //    test1.SetValue("DecimalCheck", (decimal)i / (decimal)repetitions);

            //    //getSet.SetValue(test1, "Prop3", i);
            //    //getSet.SetValue(test1, "Name", i.ToString());
            //    //getSet.SetValue(test1, "DecimalCheck", (decimal)i / (decimal)repetitions);
            //}
      //      getSet.SetValue(test1, "Name", "Test1");
            //stop = DateTime.Now;
            //ts = stop.Subtract(start);
            //System.Console.WriteLine("BattleAxe - time: {0} ms, Name: {1}", ts.TotalMilliseconds, test1.StringCheck);
            start = DateTime.Now;
            for (int i = 0; i < repetitions; i++)
            {
                test2["IntCheck"] = i;
                test2["StringCheck"] = i.ToString();
                test2["DecimalCheck"] = (decimal)i / (decimal)repetitions;
                test2["BoolCheck"] = !test2.BoolCheck;
                test2["ByteCheck"] = i < 254 ? (byte)i : 254;
                test2["CharCheck"] = i.ToString().ToCharArray()[0];
                test2["DateTime"] = DateTime.Now;
                test2["DoubleCheck"] = test2.DecimalCheck;
                test2["EnumCheck"] = test2.EnumCheck == EnumCheckValue.Value0 ? EnumCheckValue.Value1 : EnumCheckValue.Value0;
                test2["GuidCheck"] = Guid.NewGuid();
                test2["LongCheck"] = i;
                test2["ShortCheck"] = i > 16000 ? 16000 : i;
                test2["SingleCheck"] = i;

            }
            test2["StringCheck"] = "Test2";
            stop = DateTime.Now;
            ts = stop.Subtract(start);
            System.Console.WriteLine("BattleAxe w/Indexer - time: {0} ms, Name: {1}", ts.TotalMilliseconds, test2.StringCheck);


            //GetSetMap<Test> typedGetSet = (GetSetMap<Test>)getSet;
            //Ext.nameSet = typedGetSet.Sets["Name"];
            //Ext.prop3Set = typedGetSet.Sets["Prop3"];
            //Ext.decimalSet = typedGetSet.Sets["DecimalCheck"];
            //start = DateTime.Now;
            //for (int i = 0; i < repetitions; i++)
            //{
            //    test3.SetTestValue("Name", i.ToString());
            //    test3.SetTestValue("Prop3", i);
            //    test3.SetTestValue("DecimalCheck",(decimal)i / (decimal)repetitions);
            //    //dtest3.DynamicSet("Prop3", i);
            //    //dtest3.DynamicSet("Name", i.ToString());
            //    //dtest3.DynamicSet("DecimalCheck", (decimal)i / (decimal)repetitions);
            //}
            //getSet.SetValue(test3, "Name", "Test3");
            //stop = DateTime.Now;
            //ts = stop.Subtract(start);
            //System.Console.WriteLine("BattleAxe with Dynamic - time: {0} ms, Name: {1}", ts.TotalMilliseconds, test3.Name);


        }

    }

    //public class Test2 : DynamicSword
    //{

    //    public override void SetValue(string property, object value)
    //    {
    //        switch (property)
    //        {
    //            case "Prop3":
    //                this.Prop3 = value is int ? (int)value : value != null ? Convert.ToInt32(value) : 0; break;
    //            default:
    //                break;
    //        }
    //    }
    //    private int m_Prope1;

    //    public int Prope1
    //    {
    //        get { return m_Prope1; }
    //        set { m_Prope1 = value; }
    //    }

    //    private int m_Prop2;

    //    public int Prop2
    //    {
    //        get { return m_Prop2; }
    //        set { m_Prop2 = value; }
    //    }

    //    private int prop3;
    //    public int Prop3
    //    {
    //        get { return prop3; }
    //        set { prop3 = value; }
    //    }


    //}

    public class Test : IBattleAxe
    {
        static SetValue<Test> SetMethod;
        static GetValue<Test> GetMethod;
        //public override string[] GetStaticallyTypedPropertyNames()
        //{
        //    return new string[]{"Name", "Prop3", "DecimalCheck"};
        //}
        //public override void SetValue(string property, object value)
        //{
        //    switch (property)
        //    {
        //        case "Prop3":
        //            this.Prop3 = value is int ? (int)value : value != null ? Convert.ToInt32(value) : 0; break;
        //        case "Name":
        //            this.Name = value is string ? (string)value : value != null ? value.ToString() : String.Empty; break;
        //        case "DecimalCheck":
        //            this.DecimalCheck = value is decimal ? (decimal)value : value != null ? Convert.ToDecimal(value) : 0;break;
        //        default:
        //            break;
        //    }
        //}

        //if dynamic then you may need to handle those first
        //will need to know what are the regular properties
        public object this[string property]
        {
            get
            {
                if (Test.GetMethod == null)
                {
                    Test.GetMethod = Compiler.GetHelper.Value<Test>(this.GetType());
                }
                if(Test.GetMethod !=null)
                {
                    return GetMethod(this, property);
                }
                return null;
            }
            set
            {
                if (Test.SetMethod == null)
                {
                    Test.SetMethod = Compiler.SetHelper.Value<Test>(this.GetType());
                }
                if (Test.SetMethod != null)
                {
                    Test.SetMethod(this, property, value);
                }
                //var properties = this.GetStaticallyTypedPropertyNames();
                //if (properties != null && properties.FirstOrDefault(p => p == property) != null)
                //{
                //    this.SetValue(property, value);
                //}
                //else
                //{
                //    dictionary[property] = value;
                //}
            }
        }

        private int m_Prope1;

        public int IntCheck
        {
            get { return m_Prope1; }
            set { m_Prope1 = value; }
        }

        private string m_name;
        public string StringCheck
        {
            get { return m_name; }
            set { m_name = value; }
        }

        private decimal m_DecimalCheck;
        public decimal DecimalCheck
        {
            get { return m_DecimalCheck; }
            set { m_DecimalCheck = value; }
        }

        private bool m_boolCHeck;
        public bool BoolCheck
        {
            get { return m_boolCHeck; }
            set { m_boolCHeck = value; }
        }

        private double m_doubleCheck;

        public double DoubleCheck
        {
            get { return m_doubleCheck; }
            set { m_doubleCheck = value; }
        }

        private byte m_byteCheck;

        public byte ByteCheck
        {
            get { return m_byteCheck; }
            set { m_byteCheck = value; }
        }

        private short m_shortCheck;

        public short ShortCheck
        {
            get { return m_shortCheck; }
            set { m_shortCheck = value; }
        }

        private long m_longCheck;

        public long LongCheck
        {
            get { return m_longCheck; }
            set { m_longCheck = value; }
        }

        private Single m_singleCheck;

        public Single SingleCheck
        {
            get { return m_singleCheck; }
            set { m_singleCheck = value; }
        }

        private char m_char;

        public char CharCheck
        {
            get { return m_char; }
            set { m_char = value; }
        }

        private Guid m_GUid;

        public Guid GuidCheck
        {
            get { return m_GUid; }
            set { m_GUid = value; }
        }

        private DateTime m_Datetime;
        public DateTime DateTime
        {
            get { return m_Datetime; }
            set { m_Datetime = value; }
        }

        private EnumCheckValue m_enumCHeck;
        public EnumCheckValue EnumCheck
        {
            get { return m_enumCHeck; }
            set { m_enumCHeck = value; }
        }

        private object m_objecthekc;
        public object ObjectCheck
        {
            get { return m_objecthekc; }
            set { m_objecthekc = value; }
        }

        private byte[] m_bytecheck;

        public byte[] BytesCheck
        {
            get { return m_bytecheck; }
            set { m_bytecheck = value; }
        }




    }


    
    public enum EnumCheckValue
    {
        Value0 =0,
        Value1 =1
    }
}




