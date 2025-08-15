using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SixOs_Test_1.Models
{
    public class SinhVien
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [StringLength(255)]
        public string MaSV { get; set; }

        [Required]
        [StringLength(255)]
        public string TenSV { get; set; }

        public DateTime? NgaySinh { get; set; }

        public DateTime? NgayVaoDoan { get; set; }

        public string? DiaChi { get; set; } 


        [Column(TypeName = "decimal(15,2)")]
        public decimal? HocPhi { get; set; }

        [Column(TypeName = "decimal(15,2)")]
        public decimal? PhuDao { get; set; }

        public bool Active { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? DeletedAt { get; set; }
    }
}
