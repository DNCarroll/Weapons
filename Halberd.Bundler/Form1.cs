using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Windows.Forms;

namespace Halberd.Bundler
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void ButtonExecute_Click(object sender, EventArgs e)
        {
            List<TypeScriptFile> data = ((List<TypeScriptFile>)this.TypeScripts.DataSource).Where(f => f.Selected).ToList();
            List<string> output = new List<string>();
            foreach (var item in data)
            {
                using (var sr = new System.IO.StreamReader(item.FullName))
                {
                    while (sr.Peek() > -1)
                    {
                        var line = sr.ReadLine();
                        if (line.Trim().IndexOf("/// <reference path") != 0 && line.Trim() != "")
                        {
                            output.Add(line);
                        }
                    }
                }
            }
            if (!System.IO.Directory.Exists(@"C:\ProgramData\ULFBERHT"))
            {
                System.IO.Directory.CreateDirectory(@"C:\ProgramData\ULFBERHT");
            }
            string path = @"C:\ProgramData\ULFBERHT\ULFBERHT.ts";            
            using (var sw = new System.IO.StreamWriter(path))
            {
                foreach (var item in output)
                {
                    sw.WriteLine(item);
                }
            }
            try
            {
                if (Environment.MachineName.ToUpper() == "TECH028")
                {
                    System.Diagnostics.Process.Start(@"C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.4", @"--declaration " + path);
                }
                else
                {
                    System.Diagnostics.Process.Start(@"C:\Program Files (x86)\Microsoft SDKs\TypeScript\1.4", @"--declaration " + path);                    
                }
            }
            catch (Exception)
            {
                throw;
            }

        }

        private void ButtonRetrieve_Click(object sender, EventArgs e)
        {
            List<TypeScriptFile> files = new List<TypeScriptFile>();
            string pathToRetrieve = System.Reflection.Assembly.GetExecutingAssembly().Location;
            pathToRetrieve = pathToRetrieve.Substring(0, pathToRetrieve.IndexOf("Bundler"));            
            if (!string.IsNullOrEmpty(pathToRetrieve))
            {
                var filePaths = System.IO.Directory.GetFiles(pathToRetrieve, "*.ts", System.IO.SearchOption.AllDirectories);

                foreach (var item in filePaths)
                {

                    files.Add(new TypeScriptFile
                    {
                        FullName = item
                    });

                }
            }
            this.TypeScripts.DataSource = null;
            this.TypeScripts.DataSource = files;
        }
    }
}
