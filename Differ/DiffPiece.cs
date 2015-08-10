using System.Collections.Generic;

namespace Differ
{
    public enum ChangeType
    {
        Unchanged,
        //Deleted,
        //Inserted,
        //Imaginary,
        Modified
    }

    public class DiffPiece
    {
        public ChangeType Type { get; set; }
        public int? Position { get; set; }
        public string Text { get; set; }
        public List<DiffPiece> SubPieces { get; set; }

        public DiffPiece(string text, ChangeType type, int? position)
        {
            Text = text;
            Position = position;
            Type = type;
            SubPieces = new List<DiffPiece>();
        }

        public DiffPiece(string text, ChangeType type)
            : this(text, type, null)
        {
        }

        public DiffPiece()
            : this(null, ChangeType.Unchanged)
        {
        }
    }

    public class Line
    {
        public ChangeType Type { get; set; }
        public int Position { get; set; }
        public string AText { get; set; }
        public string BText { get; set; }
        public List<DiffPiece> SubPieces { get; set; }


        private string m_BackGroundColor = "#fff";
        public string BackGroundColor
        {
            get { return m_BackGroundColor; }
            set { m_BackGroundColor = value; }
        }
                

        public Line(DiffPiece a, DiffPiece b, ChangeType type, int position)
        {
            AText = a.Text;
            BText = b.Text;
            Position = position + 1;
            Type = type;
            this.BackGroundColor = type == ChangeType.Modified ? "#D3D3D3" : "#fff";
        }
    }
}