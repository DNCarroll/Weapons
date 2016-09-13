namespace Forge {
    public class Result {
        public bool Success { get; set; }
        public string Message { get; set; }
        public virtual object DataObject { get; set; }
    }    
}
