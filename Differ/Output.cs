using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Differ
{

    public enum CompareResult { 
        New,
        Differs,
        ExistsOnlyOnA,
        ExistsOnlyOnB,
        ExistsOnBoth,
        Matches
    }

    //as async?
    public class ComparisonOutput
    {

        private string m_AConnection;
        [JsonIgnore]
        public string AConnection
        {
            get { return m_AConnection; }
            set { m_AConnection = value; }
        }

        private string m_BConnection;
        [JsonIgnore]
        public string BConnection
        {
            get { return m_BConnection; }
            set { m_BConnection = value; }
        }       

        private string m_ObjectName;
        public string ObjectName
        {
            get { return m_ObjectName; }
            set { m_ObjectName = value; }
        }

        private string m_SchemaName;
        public string SchemaName
        {
            get { return m_SchemaName; }
            set { m_SchemaName = value; }
        }
                
        
        private string m_FullName;
        public string FullName
        {
            get {
                return m_FullName; }
            set { m_FullName = value; }
        }
                

        private List<DiffPiece> m_SourceALines;
        [JsonIgnore]
        public List<DiffPiece> ALines
        {
            get { return m_SourceALines; }
            set { m_SourceALines = value; }
        }

        private List<DiffPiece> m_SourceBLines;
        [JsonIgnore]
        public List<DiffPiece> BLines
        {
            get { return m_SourceBLines; }
            set { m_SourceBLines = value; }
        }


        private List<Line> m_Lines = new List<Line>();
        public List<Line> Lines
        {
            get { return m_Lines; }
            set { m_Lines = value; }
        }
                

        private CompareResult m_Result = CompareResult.New;
        public CompareResult Result
        {
            get { return m_Result; }
            set { m_Result = value; }
        }

        private string m_RawA;
        public string ARaw
        {
            get { return m_RawA; }
            set
            {
                m_RawA = value;
                if (this.Result == CompareResult.New && !string.IsNullOrEmpty(value))
                {
                    this.Result = CompareResult.ExistsOnlyOnA;
                }
                else if (this.Result == CompareResult.ExistsOnlyOnB && !string.IsNullOrEmpty(value))
                {
                    this.Result = value.Trim() == BRaw.Trim() ? CompareResult.Matches : CompareResult.ExistsOnBoth;
                }
            }
        }

        private string m_RawB;
        public string BRaw
        {
            get { return m_RawB; }
            set
            {
                m_RawB = value;
                if (this.Result == CompareResult.New && !string.IsNullOrEmpty(value))
                {
                    this.Result = CompareResult.ExistsOnlyOnB;
                }
                else if (this.Result == CompareResult.ExistsOnlyOnA && !string.IsNullOrEmpty(value))
                {
                    this.Result = value.Trim() == ARaw.Trim() ? CompareResult.Matches : CompareResult.ExistsOnBoth;
                }
            }
        }

        public ComparisonOutput() { }
        public ComparisonOutput(string schemaName, string objectName, string aRaw, string bRaw) {
            this.ObjectName = objectName;
            this.SchemaName = schemaName;
            this.FullName = this.SchemaName + "." + this.ObjectName;
            this.ARaw = aRaw;
            this.BRaw = bRaw;
            this.Process();
        }

        public void Process()
        {   
            if (this.Result != CompareResult.Matches)
            {
                var sideBySide = new Differ.SideBySideDiffBuilder(new Differ.DiffObject());                
                Differ.SideBySideDiffModel sideBySideOutput = sideBySide.BuildDiffModel(ARaw, BRaw);
                this.ALines = sideBySideOutput.OldText.Lines;
                this.BLines = sideBySideOutput.NewText.Lines;
                this.Result = this.ALines.Where(a => a.Type == ChangeType.Modified).Count() > 0 || this.BLines.Where(a => a.Type == ChangeType.Modified).Count() > 0 ?
                    CompareResult.Differs : CompareResult.Matches;
            }
            //merge up lines

            
        }

        public void Merge()
        {
            if (this.ALines != null)
            {
                for (var i = 0; i < this.ALines.Count; i++)
                {
                    var a = this.ALines[i];
                    var b = this.BLines[i];
                    this.Lines.Add(new Line(a, b, a.Type, i));
                }
                this.ALines.Clear();
                this.BLines.Clear();
            }
        }

    }
}
