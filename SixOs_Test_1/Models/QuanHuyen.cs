using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SixOs_Test_1.Models
{
    public class QuanHuyen
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [StringLength(255)]
        public string MaQuanHuyen { get; set; }

        [Required]
        [StringLength(255)]
        public string TenQuanHuyen { get; set; }

        // FK tới TinhTP
        [ForeignKey("TinhTP")]
        public int IDTinhTP { get; set; }

        public virtual TinhTP TinhTP { get; set; }

        // Quan hệ 1-n với SinhVien
        public virtual ICollection<SinhVien> SinhViens { get; set; }
    }
}
