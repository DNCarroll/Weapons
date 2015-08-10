namespace Halberd.Bundler
{
    partial class Form1
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.panel1 = new System.Windows.Forms.Panel();
            this.button1 = new System.Windows.Forms.Button();
            this.PathToBundle = new System.Windows.Forms.Label();
            this.panel2 = new System.Windows.Forms.Panel();
            this.ButtonRetrieve = new System.Windows.Forms.Button();
            this.ButtonExecute = new System.Windows.Forms.Button();
            this.TypeScripts = new System.Windows.Forms.DataGridView();
            this.selectedDataGridViewCheckBoxColumn = new System.Windows.Forms.DataGridViewCheckBoxColumn();
            this.nameDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.fullNameDataGridViewTextBoxColumn = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.typeScriptFileBindingSource = new System.Windows.Forms.BindingSource(this.components);
            this.panel1.SuspendLayout();
            this.panel2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.TypeScripts)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.typeScriptFileBindingSource)).BeginInit();
            this.SuspendLayout();
            // 
            // panel1
            // 
            this.panel1.Controls.Add(this.button1);
            this.panel1.Controls.Add(this.PathToBundle);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Top;
            this.panel1.Location = new System.Drawing.Point(0, 0);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(786, 44);
            this.panel1.TabIndex = 0;
            // 
            // button1
            // 
            this.button1.Location = new System.Drawing.Point(678, 13);
            this.button1.Name = "button1";
            this.button1.Size = new System.Drawing.Size(96, 23);
            this.button1.TabIndex = 1;
            this.button1.Text = "Path To Bundle";
            this.button1.UseVisualStyleBackColor = true;
            // 
            // PathToBundle
            // 
            this.PathToBundle.Location = new System.Drawing.Point(13, 13);
            this.PathToBundle.Name = "PathToBundle";
            this.PathToBundle.Size = new System.Drawing.Size(659, 23);
            this.PathToBundle.TabIndex = 0;
            this.PathToBundle.Text = "C:\\Users\\Nathan\\Documents\\GitHub\\BattleAxe\\Halberd";
            // 
            // panel2
            // 
            this.panel2.Controls.Add(this.ButtonRetrieve);
            this.panel2.Controls.Add(this.ButtonExecute);
            this.panel2.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.panel2.Location = new System.Drawing.Point(0, 679);
            this.panel2.Name = "panel2";
            this.panel2.Size = new System.Drawing.Size(786, 49);
            this.panel2.TabIndex = 2;
            // 
            // ButtonRetrieve
            // 
            this.ButtonRetrieve.Location = new System.Drawing.Point(19, 15);
            this.ButtonRetrieve.Name = "ButtonRetrieve";
            this.ButtonRetrieve.Size = new System.Drawing.Size(114, 23);
            this.ButtonRetrieve.TabIndex = 1;
            this.ButtonRetrieve.Text = "Retrieve Files";
            this.ButtonRetrieve.UseVisualStyleBackColor = true;
            this.ButtonRetrieve.Click += new System.EventHandler(this.ButtonRetrieve_Click);
            // 
            // ButtonExecute
            // 
            this.ButtonExecute.Location = new System.Drawing.Point(699, 15);
            this.ButtonExecute.Name = "ButtonExecute";
            this.ButtonExecute.Size = new System.Drawing.Size(75, 23);
            this.ButtonExecute.TabIndex = 0;
            this.ButtonExecute.Text = "Execute";
            this.ButtonExecute.UseVisualStyleBackColor = true;
            this.ButtonExecute.Click += new System.EventHandler(this.ButtonExecute_Click);
            // 
            // TypeScripts
            // 
            this.TypeScripts.AutoGenerateColumns = false;
            this.TypeScripts.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.TypeScripts.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.selectedDataGridViewCheckBoxColumn,
            this.nameDataGridViewTextBoxColumn,
            this.fullNameDataGridViewTextBoxColumn});
            this.TypeScripts.DataSource = this.typeScriptFileBindingSource;
            this.TypeScripts.Dock = System.Windows.Forms.DockStyle.Fill;
            this.TypeScripts.Location = new System.Drawing.Point(0, 44);
            this.TypeScripts.Name = "TypeScripts";
            this.TypeScripts.Size = new System.Drawing.Size(786, 635);
            this.TypeScripts.TabIndex = 3;
            // 
            // selectedDataGridViewCheckBoxColumn
            // 
            this.selectedDataGridViewCheckBoxColumn.DataPropertyName = "Selected";
            this.selectedDataGridViewCheckBoxColumn.HeaderText = "Selected";
            this.selectedDataGridViewCheckBoxColumn.Name = "selectedDataGridViewCheckBoxColumn";
            // 
            // nameDataGridViewTextBoxColumn
            // 
            this.nameDataGridViewTextBoxColumn.DataPropertyName = "Name";
            this.nameDataGridViewTextBoxColumn.HeaderText = "Name";
            this.nameDataGridViewTextBoxColumn.Name = "nameDataGridViewTextBoxColumn";
            this.nameDataGridViewTextBoxColumn.Width = 200;
            // 
            // fullNameDataGridViewTextBoxColumn
            // 
            this.fullNameDataGridViewTextBoxColumn.DataPropertyName = "FullName";
            this.fullNameDataGridViewTextBoxColumn.HeaderText = "FullName";
            this.fullNameDataGridViewTextBoxColumn.Name = "fullNameDataGridViewTextBoxColumn";
            this.fullNameDataGridViewTextBoxColumn.Width = 400;
            // 
            // typeScriptFileBindingSource
            // 
            this.typeScriptFileBindingSource.DataSource = typeof(Halberd.Bundler.TypeScriptFile);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(786, 728);
            this.Controls.Add(this.TypeScripts);
            this.Controls.Add(this.panel2);
            this.Controls.Add(this.panel1);
            this.Name = "Form1";
            this.Text = "Bastard Bundler";
            this.panel1.ResumeLayout(false);
            this.panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.TypeScripts)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.typeScriptFileBindingSource)).EndInit();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.Panel panel2;
        private System.Windows.Forms.Button ButtonExecute;
        private System.Windows.Forms.Button button1;
        private System.Windows.Forms.Label PathToBundle;
        private System.Windows.Forms.DataGridView TypeScripts;
        private System.Windows.Forms.DataGridViewCheckBoxColumn selectedDataGridViewCheckBoxColumn;
        private System.Windows.Forms.DataGridViewTextBoxColumn nameDataGridViewTextBoxColumn;
        private System.Windows.Forms.DataGridViewTextBoxColumn fullNameDataGridViewTextBoxColumn;
        private System.Windows.Forms.BindingSource typeScriptFileBindingSource;
        private System.Windows.Forms.Button ButtonRetrieve;
    }
}

