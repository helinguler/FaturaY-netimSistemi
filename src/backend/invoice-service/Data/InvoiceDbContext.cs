using InvoiceService.Models;
using Microsoft.EntityFrameworkCore;

namespace InvoiceService.Data;

// InvoiceService içinde EF Core db yapılandırmasını yapan class
public class InvoiceDbContext : DbContext
{
    // Constractor
    public InvoiceDbContext(DbContextOptions<InvoiceDbContext> options) : base(options)
    {
    }

    // entityler için table erişimi
    public DbSet<Invoice> Invoices => Set<Invoice>();

    public DbSet<InvoiceLine> InvoiceLines => Set<InvoiceLine>();

    // modellerin dbde nasıl oluşacağını detaylı şekilde ayarlar
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.ToTable("Invoice");

            entity.HasKey(x => x.InvoiceId);    // primary key

            entity.Property(x => x.CustomerId)
                .IsRequired();

            entity.Property(x => x.InvoiceNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(x => x.InvoiceDate)
                .IsRequired()
                .HasColumnType("timestamp without time zone");  // tarih, saat bilgisini timezone bilgisi olmadan saklar.

            entity.Property(x => x.TotalAmount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            entity.Property(x => x.UserId)  // faturayı oluşturan kullanıcının ID si zorunlu
                .IsRequired();

            entity.Property(x => x.RecordDate)
                .IsRequired();

            entity.HasIndex(x => x.UserId);

            entity.HasIndex(x => new { x.UserId, x.InvoiceNumber })
                .IsUnique();

            entity.HasIndex(x => new { x.UserId, x.InvoiceDate });

            entity.HasIndex(x => x.CustomerId);
        });

        modelBuilder.Entity<InvoiceLine>(entity =>
        {
            entity.ToTable("InvoiceLine");

            entity.HasKey(x => x.InvoiceLineId);    // primary key

            entity.Property(x => x.ItemName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(x => x.Quantity)
                .HasColumnName("Quentity")
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            entity.Property(x => x.Price)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            entity.Property(x => x.UserId)
                .IsRequired();

            entity.Property(x => x.RecordDate)
                .IsRequired();

            entity.HasIndex(x => x.InvoiceId);

            entity.HasIndex(x => x.UserId);

            entity.HasOne(x => x.Invoice)
                .WithMany(x => x.InvoiceLines)
                .HasForeignKey(x => x.InvoiceId)    // InvoiceLine.InvoiceId → Invoice.InvoiceId ilişkisi
                .OnDelete(DeleteBehavior.Cascade);  // bir Invoice silinirse, ona bağlı InvoiceLine kayıtları da otomatik silinir
        });
    }
}