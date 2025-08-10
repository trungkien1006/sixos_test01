using System.ComponentModel.DataAnnotations;

namespace SixOs_Test_1.Models
{
    public class TinhTP
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [StringLength(255)]
        public string MaTinhTP { get; set; }

        [Required]
        [StringLength(255)]
        public string TenTinhTP { get; set; }

        // Quan hệ 1-n với QuanHuyen
        public virtual ICollection<QuanHuyen> QuanHuyens { get; set; }
    }
}
