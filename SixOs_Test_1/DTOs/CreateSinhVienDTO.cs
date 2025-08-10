using SixOs_Test_1.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SixOs_Test_1.DTOs
{
    public class CreateSinhVienDTO
    {
        [Required]
        [StringLength(255)]
        public string MaSV { get; set; }

        [Required]
        [StringLength(255)]
        public string TenSV { get; set; }

        public DateTime? NgaySinh { get; set; }

        public DateTime? NgayVaoDoan { get; set; }

        public int? IDTinhTP { get; set; }

        public int? IDQuanHuyen { get; set; }

        [Column(TypeName = "decimal(15,2)")]
        public decimal? HocPhi { get; set; }

        [Column(TypeName = "decimal(15,2)")]
        public decimal? PhuDao { get; set; }
    }
}
