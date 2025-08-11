using System.ComponentModel.DataAnnotations;

namespace SixOs_Test_1.DTOs
{
    public class GetSinhVienDTO
    {
        [StringLength(255)]
        public string? SearchValue { get; set; }

        [StringLength(255)]
        public string? SearchType { get; set; }

        [Required]
        public int Limit { get; set; }

        [Required]
        public int Page { get; set; }

        [Required]
        public string[] Columns { get; set; }
    }
}
