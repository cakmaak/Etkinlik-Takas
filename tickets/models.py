from django.db import models
from django.contrib.auth.models import User
from firebase_admin import storage
import uuid

def upload_to_firebase(instance, filename):
    # Benzersiz bir dosya adı oluştur
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"ticket_images/{filename}"

class Ticket(models.Model):
    KATEGORI_CHOICES = [
        ('konser', 'Konser'),
        ('tiyatro', 'Tiyatro'),
        ('sinema', 'Sinema'),
        ('spor', 'Spor'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    etkinlik_adi = models.CharField(max_length=200)
    kategori = models.CharField(max_length=20, choices=KATEGORI_CHOICES)
    tarih = models.DateField()
    fiyat = models.DecimalField(max_digits=10, decimal_places=2)
    resim = models.ImageField(upload_to=upload_to_firebase)
    resim_url = models.URLField(blank=True, null=True)

    def save(self, *args, **kwargs):
        # Önce normal kaydet
        super().save(*args, **kwargs)
        
        # Eğer resim varsa ve henüz Firebase'e yüklenmediyse
        if self.resim and not self.resim_url:
            try:
                # Firebase Storage'a yükle
                bucket = storage.bucket()
                blob = bucket.blob(self.resim.name)
                
                # Dosyayı doğrudan bellekteki veriden yükle
                self.resim.open('rb')
                blob.upload_from_file(self.resim, content_type=self.resim.file.content_type)
                self.resim.close()
                
                # Firebase Storage URL'ini al ve kaydet
                self.resim_url = blob.public_url
                # URL'i kaydetmek için tekrar save çağır
                super().save(update_fields=['resim_url'])
            except Exception as e:
                print(f"Firebase yükleme hatası: {e}")

    def __str__(self):
        return self.etkinlik_adi

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'ticket')

    def __str__(self):
        return f"{self.user.username} - {self.ticket.etkinlik_adi}"

class Offer(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Beklemede'),
        ('accepted', 'Kabul Edildi'),
        ('rejected', 'Reddedildi'),
    ]

    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_offers')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_offers')
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.from_user.username} - {self.ticket.etkinlik_adi} - {self.amount} TL"
