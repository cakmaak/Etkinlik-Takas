from django.db import models
from django.contrib.auth.models import User

class Ticket(models.Model):
    CATEGORY_CHOICES = [
        ('konser', 'Konser'),
        ('tiyatro', 'Tiyatro'),
        ('sinema', 'Sinema'),
        ('spor', 'Spor'),
    ]

    etkinlik_adi = models.CharField(max_length=200)
    kategori = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    tarih = models.DateField()
    fiyat = models.DecimalField(max_digits=10, decimal_places=2)
    resim = models.ImageField(upload_to='ticket_images/')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.etkinlik_adi} - {self.user.username}"

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
        ('pending', 'Bekliyor'),
        ('accepted', 'Kabul Edildi'),
        ('rejected', 'Reddedildi'),
    ]

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    from_user = models.ForeignKey(User, related_name='sent_offers', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_offers', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username} - {self.ticket.etkinlik_adi}"
