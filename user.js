// Kullanıcı yönetimi için gerekli değişkenler
let currentUserId = generateUserId();
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Kullanıcı ID'si oluşturma
function generateUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'USER_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

// Kullanıcı bilgilerini gösterme
function showUserInfo() {
    const profileName = document.querySelector('.profile-name');
    const profileHeaderInfo = document.querySelector('.profile-header-info h3');
    
    if (profileName) profileName.textContent = 'Kullanıcı';
    if (profileHeaderInfo) profileHeaderInfo.textContent = 'Kullanıcı';
}

// Kullanıcının kendi biletlerini gösterme
function showMyTickets() {
    const biletler = JSON.parse(localStorage.getItem('biletler')) || [];
    const container = document.getElementById('my-tickets-container');
    container.innerHTML = '';

    const myTickets = biletler.filter(bilet => bilet.userId === currentUserId);
    
    myTickets.forEach(bilet => {
        const biletHTML = createTicketCard(bilet, true);
        container.innerHTML += biletHTML;
    });
}

// Favori biletleri gösterme
function showFavorites() {
    const biletler = JSON.parse(localStorage.getItem('biletler')) || [];
    const container = document.getElementById('favorites-container');
    container.innerHTML = '';

    const favoriteTickets = biletler.filter(bilet => favorites.includes(bilet.id));
    
    favoriteTickets.forEach(bilet => {
        const biletHTML = createTicketCard(bilet, false);
        container.innerHTML += biletHTML;
    });
}

// Bilet kartı oluşturma fonksiyonu
function createTicketCard(bilet, isOwner) {
    const isLiked = favorites.includes(bilet.id);
    const deleteButton = isOwner ? `<button class="delete-button" onclick="biletSil(${bilet.id})">Bileti Sil</button>` : '';
    const ownerLabel = `<div class="ticket-owner">${bilet.userId === currentUserId ? 'Benim Biletim' : 'Diğer Kullanıcı'}</div>`;
    
    return `
        <div class="ticket-card">
            ${ownerLabel}
            <img src="${bilet.resim}" alt="${bilet.etkinlikAdi}">
            <div class="ticket-info">
                <h3>${bilet.etkinlikAdi}</h3>
                <p>Kategori: ${bilet.kategori.charAt(0).toUpperCase() + bilet.kategori.slice(1)}</p>
                <p>Tarih: ${new Date(bilet.tarih).toLocaleDateString('tr-TR')}</p>
                <p>Fiyat: ${bilet.fiyat} ₺</p>
            </div>
            ${deleteButton}
            <button class="like-button ${isLiked ? 'active' : ''}" onclick="toggleFavorite(${bilet.id})">
                ${isLiked ? '❤️' : '🤍'}
            </button>
        </div>
    `;
}

// Favori ekleme/çıkarma
function toggleFavorite(biletId) {
    const index = favorites.indexOf(biletId);
    if (index === -1) {
        favorites.push(biletId);
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    biletleriGoster();
    showFavorites();
    showMyTickets();
}

// Bilet silme fonksiyonu (sadece kendi biletleri için)
function biletSil(id) {
    let biletler = JSON.parse(localStorage.getItem('biletler')) || [];
    const bilet = biletler.find(b => b.id === id);
    
    if (bilet && bilet.userId === currentUserId) {
        if (confirm('Bu bileti silmek istediğinizden emin misiniz?')) {
            biletler = biletler.filter(b => b.id !== id);
            localStorage.setItem('biletler', JSON.stringify(biletler));
            biletleriGoster();
            showMyTickets();
            showFavorites();
        }
    } else {
        alert('Bu bileti silme yetkiniz yok!');
    }
}

// Tüm görünümleri güncelleme fonksiyonu
function updateAllViews() {
    showAllTickets();
    showMyTickets();
    showFavorites();
}

// Sayfa yüklendiğinde çalışacak fonksiyonlar
window.addEventListener('DOMContentLoaded', () => {
    showUserInfo();
    updateAllViews();
}); 