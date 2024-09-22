namespace MapApp.Models
{
    public class UpdatePointRequest
    {
        public int Id { get; set; }
        public double NewX { get; set; }
        public double NewY { get; set; }
        public string NewName { get; set; }
    }
}
