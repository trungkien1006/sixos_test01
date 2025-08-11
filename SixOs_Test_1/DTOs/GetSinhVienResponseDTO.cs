using SixOs_Test_1.Models;

namespace SixOs_Test_1.DTOs
{
    public class GetSinhVienResponseDTO
    {
        public IEnumerable<dynamic> students { get; set; }
        public int totalPages { get; set; }
    }
}
