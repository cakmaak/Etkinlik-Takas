// Görsel URL'leri
const IMAGES = {
    // Kategori görselleri
    konser: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format",
    tiyatro: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=500&auto=format",
    sinema: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format",
    spor: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format",
    
    // Örnek bilet görselleri
    dumanKonseri: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&auto=format",
    hamlet: "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=500&auto=format",
    derbi: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=500&auto=format",
    basketbol: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format"
};

// Örnek biletler verisi
const ornekBiletler = [
    {
        id: 1,
        etkinlikAdi: "Duman Konseri",
        kategori: "konser",
        tarih: "2024-04-15",
        fiyat: 450,
        resim: IMAGES.dumanKonseri,
        userId: "SYSTEM"
    },
    {
        id: 2,
        etkinlikAdi: "Hamlet",
        kategori: "tiyatro",
        tarih: "2024-04-20",
        fiyat: 200,
        resim: IMAGES.hamlet,
        userId: "SYSTEM"
    },
    {
        id: 3,
        etkinlikAdi: "Fenerbahçe vs Galatasaray",
        kategori: "spor",
        tarih: "2024-05-01",
        fiyat: 750,
        resim: IMAGES.derbi,
        userId: "SYSTEM"
    },
    {
        id: 4,
        etkinlikAdi: "Türkiye vs Yunanistan Basketbol Maçı",
        kategori: "spor",
        tarih: "2024-05-15",
        fiyat: 300,
        resim: IMAGES.basketbol,
        userId: "SYSTEM"
    }
];

// Sayfa yüklendiğinde örnek biletleri localStorage'a kaydet
function initializeBiletler() {
    if (!localStorage.getItem('biletler')) {
        localStorage.setItem('biletler', JSON.stringify(ornekBiletler));
    }
}

// Biletleri görüntüleme fonksiyonu
function biletleriGoster() {
    const biletler = JSON.parse(localStorage.getItem('biletler')) || [];
    displayTickets(biletler);
}

// Dosyayı Base64'e çeviren yardımcı fonksiyon
function dosyayiBase64eCevir(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Yeni bilet kaydetme fonksiyonu
async function saveTicket(event) {
    event.preventDefault();
    
    const form = event.target;
    const biletler = JSON.parse(localStorage.getItem('biletler')) || [];
    
    const fileInput = form.querySelector('#bilet-foto');
    let resimUrl;
    
    if (fileInput.files.length > 0) {
        try {
            resimUrl = await dosyayiBase64eCevir(fileInput.files[0]);
        } catch (error) {
            console.error('Dosya yüklenirken hata oluştu:', error);
            resimUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(form.querySelector('#etkinlik-adi').value)}`;
        }
    } else {
        resimUrl = `https://via.placeholder.com/300x200?text=${encodeURIComponent(form.querySelector('#etkinlik-adi').value)}`;
    }

    const yeniBilet = {
        id: Date.now(),
        etkinlikAdi: form.querySelector('#etkinlik-adi').value,
        kategori: form.querySelector('#kategori').value,
        tarih: form.querySelector('#tarih').value,
        fiyat: parseFloat(form.querySelector('#fiyat').value),
        resim: resimUrl,
        userId: currentUserId
    };

    biletler.push(yeniBilet);
    localStorage.setItem('biletler', JSON.stringify(biletler));
    
    // Başarı mesajını göster
    showSuccessMessage('Biletiniz başarıyla yüklendi!');
    
    // Tüm görünümleri güncelle
    showAllTickets();
    showMyTickets();
    showFavorites();
    form.reset();
}

// Başarı mesajı gösterme fonksiyonu
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Mesajı sayfaya ekle
    document.body.appendChild(successDiv);
    
    // 3 saniye sonra mesajı kaldır
    setTimeout(() => {
        successDiv.classList.add('fade-out');
        setTimeout(() => {
            successDiv.remove();
        }, 500);
    }, 3000);
}

// Sayfa yüklendiğinde çalışacak favori kontrol fonksiyonu
function initializeFavorites() {
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    showFavorites();
}

// Bilet silme fonksiyonu
function biletSil(id) {
    if (confirm('Bu bileti silmek istediğinizden emin misiniz?')) {
        let biletler = JSON.parse(localStorage.getItem('biletler')) || [];
        biletler = biletler.filter(bilet => bilet.id !== id);
        localStorage.setItem('biletler', JSON.stringify(biletler));
        biletleriGoster();
    }
}

// Bilet yükleme formuna kaydırma
function scrollToUpload() {
    document.getElementById('bilet-yukle').scrollIntoView({ behavior: 'smooth' });
} 