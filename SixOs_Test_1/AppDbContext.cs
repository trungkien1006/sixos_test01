using SixOs_Test_1.Models;
using System.Collections.Generic;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore;

namespace SixOs_Test_1
{
    public class AppDbContext : DbContext
    {
        // Constructor nhận options để config connection string từ ngoài
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<SinhVien> SinhVien { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Cấu hình bảng nếu muốn, ví dụ tên bảng hoặc kiểu dữ liệu
            modelBuilder.Entity<SinhVien>().ToTable("SinhVien");

            // Có thể cấu hình quan hệ, nhưng với các annotation ở model thì EF tự hiểu

            base.OnModelCreating(modelBuilder);
        }
    }
}
