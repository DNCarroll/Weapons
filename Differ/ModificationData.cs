﻿namespace Differ
{
    public class ModificationData
    {
        public int[] HashedPieces { get; set; }

        public string RawData { get; private set; }

        public bool[] Modifications { get; set; }

        public string[] Pieces { get; set; }

        public ModificationData(string str)
        {
            RawData = str;
        }
    }
}