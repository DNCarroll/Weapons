<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="Differ.Web.Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge;" />
    <title></title>
    
    <script src="<%= ResolveUrl("~/Scripts/Halberd.js") %>" type="text/javascript"></script>       
    <script src="<%= ResolveUrl("~/Scripts/Main.js") %>" type="text/javascript"></script>   
    <link href="<%= ResolveUrl("~/Styles/UnorderList.css") %>" rel="stylesheet" />
</head>
<body style="font-family:Consolas; font-size:1em; overflow-y:scroll; margin-left:0px;">     

    <div id="content">    
    </div>    
        <asp:Image ID="progress" ImageUrl="~/Images/progressGif.gif" AlternateText="Getting Results..."
               Style="position: fixed; display: none; right:0px; top:0px;" runat="server" EnableViewState="false" />
</body>
</html>
