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

        // FK tới TinhTP
        [ForeignKey("TinhTP")]
        public int? IDTinhTP { get; set; }

        public virtual TinhTP TinhTP { get; set; }

        // FK tới QuanHuyen
        [ForeignKey("QuanHuyen")]
        public int? IDQuanHuyen { get; set; }

        public virtual QuanHuyen QuanHuyen { get; set; }

        [Column(TypeName = "decimal(15,2)")]
        public decimal? HocPhi { get; set; }

        [Column(TypeName = "decimal(15,2)")]
        public decimal? PhuDao { get; set; }
    }
}
