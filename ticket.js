// Bilet işlemleri için yardımcı fonksiyonlar

// Bilet kartı oluşturma fonksiyonu
function createTicketCard(bilet, isOwner) {
    const isLiked = favorites.includes(bilet.id);
    const deleteButton = isOwner ? `<button class="delete-button" onclick="event.stopPropagation(); biletSil(${bilet.id})">Bileti Sil</button>` : '';
    const ownerLabel = `<div class="ticket-owner">${bilet.userId === currentUserId ? 'Benim Biletim' : 'Diğer Kullanıcı'}</div>`;
    const likeButton = !isOwner ? `<button class="like-button ${isLiked ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${bilet.id})">
        ${isLiked ? '❤️' : '🤍'}
    </button>` : '';
    
    return `
        <div class="ticket-card" onclick="showTicketDetails(${JSON.stringify(bilet).replace(/"/g, '&quot;')})">
            ${ownerLabel}
            <img src="${bilet.resim}" alt="${bilet.etkinlikAdi}">
            <div class="ticket-info">
                <h3>${bilet.etkinlikAdi}</h3>
                <p>Kategori: ${bilet.kategori.charAt(0).toUpperCase() + bilet.kategori.slice(1)}</p>
                <p>Tarih: ${new Date(bilet.tarih).toLocaleDateString('tr-TR')}</p>
                <p>Fiyat: ${bilet.fiyat} ₺</p>
            </div>
            ${deleteButton}
            ${likeButton}
        </div>
    `;
}

// Biletleri görüntüleme fonksiyonu
function showAllTickets() {
    const biletler = JSON.parse(localStorage.getItem('biletler')) || [];
    displayTickets(biletler);
}

// Biletleri listeleme fonksiyonu
function displayTickets(tickets) {
    const ticketsContainer = document.getElementById('tickets-container');
    if (!ticketsContainer) return;
    
    ticketsContainer.innerHTML = '';
    
    if (tickets.length === 0) {
        ticketsContainer.innerHTML = '<p class="no-tickets">Bu kategoride henüz bilet bulunmuyor.</p>';
        return;
    }

    tickets.forEach(ticket => {
        const ticketCard = createTicketCard(ticket, ticket.userId === currentUserId);
        ticketsContainer.innerHTML += ticketCard;
    });
}

// Kullanıcının kendi biletlerini gösterme
function showMyTickets() {
    const biletler = JSON.parse(localStorage.getItem('biletler')) || [];
    const container = document.getElementById('my-tickets-container');
    if (!container) return;

    container.innerHTML = '';
    const myTickets = biletler.filter(bilet => bilet.userId === currentUserId);
    
    if (myTickets.length === 0) {
        container.innerHTML = '<p class="no-tickets">Henüz biletiniz bulunmuyor.</p>';
        return;
    }

    myTickets.forEach(bilet => {
        const biletHTML = createTicketCard(bilet, true);
        container.innerHTML += biletHTML;
    });
}

// Favori biletleri gösterme
function showFavorites() {
    const biletler = JSON.parse(localStorage.getItem('biletler')) || [];
    const container = document.getElementById('favorites-container');
    if (!container) return;

    container.innerHTML = '';
    const favoriteTickets = biletler.filter(bilet => favorites.includes(bilet.id));
    
    if (favoriteTickets.length === 0) {
        container.innerHTML = '<p class="no-tickets">Henüz favori biletiniz bulunmuyor.</p>';
        return;
    }

    favoriteTickets.forEach(bilet => {
        const biletHTML = createTicketCard(bilet, bilet.userId === currentUserId);
        container.innerHTML += biletHTML;
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
            // Resmi optimize et ve boyutunu küçült
            resimUrl = await optimizeImage(fileInput.files[0]);
        } catch (error) {
            console.error('Resim optimize edilirken hata oluştu:', error);
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

    try {
        // Eski biletleri temizle (en son 50 bilet tut)
        if (biletler.length >= 50) {
            biletler.splice(0, biletler.length - 49);
        }
        
        biletler.push(yeniBilet);
        localStorage.setItem('biletler', JSON.stringify(biletler));
        
        showSuccessMessage('Biletiniz başarıyla yüklendi!');
        updateAllViews();
        form.reset();
    } catch (error) {
        console.error('Bilet kaydedilirken hata oluştu:', error);
        showErrorMessage('Bilet kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

// Resmi optimize etme fonksiyonu
function optimizeImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Maksimum boyutları belirle
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                
                let width = img.width;
                let height = img.height;
                
                // Boyutları orantılı olarak küçült
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // JPEG formatında ve düşük kalitede kaydet
                const optimizedImage = canvas.toDataURL('image/jpeg', 0.7);
                resolve(optimizedImage);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// Tüm görünümleri güncelleme fonksiyonu
function updateAllViews() {
    showAllTickets();
    showMyTickets();
    showFavorites();
}

// Başarı mesajı gösterme fonksiyonu
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Hata mesajı gösterme fonksiyonu
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Bilet silme fonksiyonu
function biletSil(id) {
    let biletler = JSON.parse(localStorage.getItem('biletler')) || [];
    const bilet = biletler.find(b => b.id === id);
    
    if (bilet && bilet.userId === currentUserId) {
        if (confirm('Bu bileti silmek istediğinizden emin misiniz?')) {
            biletler = biletler.filter(b => b.id !== id);
            localStorage.setItem('biletler', JSON.stringify(biletler));
            updateAllViews();
            showSuccessMessage('Bilet başarıyla silindi!');
        }
    } else {
        showErrorMessage('Bu bileti silme yetkiniz yok!');
    }
}

// Favori ekleme/çıkarma fonksiyonu
function toggleFavorite(biletId) {
    const index = favorites.indexOf(biletId);
    if (index === -1) {
        favorites.push(biletId);
        showSuccessMessage('Bilet favorilere eklendi!');
    } else {
        favorites.splice(index, 1);
        showSuccessMessage('Bilet favorilerden çıkarıldı!');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateAllViews();
}

// Teklifleri görüntüleme fonksiyonunu güncelle
function showOffers(type = 'incoming', ticketId = null) {
    const offersList = document.getElementById('offersList');
    if (!offersList) return;
    
    const tabButtons = document.querySelectorAll('.offers-tab');
    if (tabButtons) {
        tabButtons.forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector(`.offers-tab[onclick*="${type}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    const offers = JSON.parse(localStorage.getItem('offers')) || [];
    const tickets = JSON.parse(localStorage.getItem('biletler')) || [];
    
    // Teklifleri filtrele
    let filteredOffers = offers.filter(offer => {
        const baseFilter = type === 'incoming' ? 
            offer.toUserId === currentUserId : 
            offer.fromUserId === currentUserId;

        // Eğer ticketId belirtilmişse, sadece o bilete ait teklifleri göster
        if (ticketId !== null) {
            return baseFilter && offer.ticketId === ticketId;
        }
        return baseFilter;
    });

    if (filteredOffers.length === 0) {
        offersList.innerHTML = `<div class="no-offers">${type === 'incoming' ? 'Henüz gelen teklifiniz yok' : 'Henüz gönderdiğiniz teklif yok'}</div>`;
        return;
    }

    offersList.innerHTML = filteredOffers.map(offer => {
        const ticket = tickets.find(t => t.id === offer.ticketId);
        if (!ticket) return '';

        const statusText = {
            'pending': 'Bekliyor',
            'accepted': 'Kabul Edildi',
            'rejected': 'Reddedildi'
        }[offer.status];

        const statusClass = {
            'pending': 'pending',
            'accepted': 'accepted',
            'rejected': 'rejected'
        }[offer.status];

        const actions = type === 'incoming' && offer.status === 'pending' ? `
            <div class="offer-actions">
                <button class="offer-action-btn offer-accept" onclick="handleOffer(${offer.id}, 'accept')">Kabul Et</button>
                <button class="offer-action-btn offer-reject" onclick="handleOffer(${offer.id}, 'reject')">Reddet</button>
            </div>
        ` : '';

        return `
            <div class="offer-item">
                <img src="${ticket.resim}" alt="${ticket.etkinlikAdi}" class="offer-ticket-image">
                <div class="offer-details">
                    <span class="offer-event-name">${ticket.etkinlikAdi}</span>
                    <span class="offer-price">Teklif: ${offer.amount} ₺</span>
                    <span class="offer-status ${statusClass}">${statusText}</span>
                    <span class="offer-date">${new Date(offer.date).toLocaleDateString('tr-TR')}</span>
                    <span class="offer-badge ${type}">${type === 'incoming' ? 'Gelen Teklif' : 'Gönderilen Teklif'}</span>
                </div>
                ${actions}
            </div>
        `;
    }).join('');
}

// Teklif işleme fonksiyonu
function handleOffer(offerId, action) {
    let offers = JSON.parse(localStorage.getItem('offers')) || [];
    const offerIndex = offers.findIndex(o => o.id === offerId);
    
    if (offerIndex === -1) return;
    
    offers[offerIndex].status = action === 'accept' ? 'accepted' : 'rejected';
    localStorage.setItem('offers', JSON.stringify(offers));
    
    showSuccessMessage(`Teklif ${action === 'accept' ? 'kabul edildi' : 'reddedildi'}!`);
    showOffers('incoming'); // Teklifleri yeniden yükle
}

// ESC tuşu ile modalı kapatma
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Sayfa yüklendiğinde çalışacak fonksiyonları güncelle
window.addEventListener('DOMContentLoaded', () => {
    showAllTickets();
    // Profil menüsüne tıklama olayı ekle
    document.querySelector('.profile-menu').addEventListener('click', togglePanel);
});

// Modal HTML'ini oluşturma fonksiyonunu güncelle
function createTicketModal(bilet) {
    return `
        <div class="modal" id="ticketModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${bilet.etkinlikAdi}</h2>
                    <button class="modal-close" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="modal-image-container">
                        <img src="${bilet.resim}" alt="${bilet.etkinlikAdi}" class="modal-image">
                    </div>
                    <div class="modal-details">
                        <div class="detail-item">
                            <span>Kategori:</span>
                            <span>${bilet.kategori.charAt(0).toUpperCase() + bilet.kategori.slice(1)}</span>
                        </div>
                        <div class="detail-item">
                            <span>Tarih:</span>
                            <span>${new Date(bilet.tarih).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div class="detail-item">
                            <span>Fiyat:</span>
                            <span>${bilet.fiyat} ₺</span>
                        </div>
                        <div class="detail-item">
                            <span>Satıcı:</span>
                            <span>${bilet.userId === currentUserId ? 'Ben' : 'Diğer Kullanıcı'}</span>
                        </div>
                        ${bilet.userId !== currentUserId ? `
                            <div class="offer-form">
                                <h3>Teklif Ver</h3>
                                <input type="number" id="offerAmount" placeholder="Teklif tutarını giriniz (₺)" min="1" step="1">
                                <div class="modal-actions">
                                    <button class="cancel-button" onclick="closeModal()">İptal</button>
                                    <button class="offer-button" onclick="sendOffer(${bilet.id})">Teklif Gönder</button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                ${bilet.userId === currentUserId ? `
                    <div class="ticket-offers-section">
                        <h3 class="section-title">Bu Bilet İçin Teklifler</h3>
                        <div class="offers-tabs">
                            <button class="offers-tab active" onclick="showTicketOffers(${bilet.id}, 'incoming')">Gelen Teklifler</button>
                            <button class="offers-tab" onclick="showTicketOffers(${bilet.id}, 'outgoing')">Gönderilen Teklifler</button>
                        </div>
                        <div class="offer-list" id="offersList">
                            <!-- Teklifler buraya eklenecek -->
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Bilet için teklifleri gösterme fonksiyonu
function showTicketOffers(ticketId, type) {
    showOffers(type, ticketId);
}

// Modal gösterme fonksiyonunu güncelle
function showTicketDetails(bilet) {
    const existingModal = document.getElementById('ticketModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', createTicketModal(bilet));
    
    const modal = document.getElementById('ticketModal');
    modal.style.display = 'block';

    // Eğer bilet sahibiyse, teklifleri göster
    if (bilet.userId === currentUserId) {
        showTicketOffers(bilet.id, 'incoming');
    }

    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Modal kapatma fonksiyonu
function closeModal() {
    const modal = document.getElementById('ticketModal');
    if (modal) {
        modal.remove();
    }
}

// Teklif gönderme fonksiyonu
function sendOffer(biletId) {
    const offerAmount = document.getElementById('offerAmount').value;
    
    if (!offerAmount || offerAmount <= 0) {
        showErrorMessage('Lütfen geçerli bir teklif tutarı giriniz!');
        return;
    }

    // Teklifleri localStorage'dan al
    let offers = JSON.parse(localStorage.getItem('offers')) || [];
    
    // Yeni teklif objesi oluştur
    const newOffer = {
        id: Date.now(),
        ticketId: biletId,
        fromUserId: currentUserId,
        toUserId: getTicketOwner(biletId),
        amount: parseFloat(offerAmount),
        status: 'pending',
        date: new Date().toISOString()
    };

    // Teklifi listeye ekle
    offers.push(newOffer);
    
    // Teklifleri localStorage'a kaydet
    localStorage.setItem('offers', JSON.stringify(offers));

    showSuccessMessage(`Teklif başarıyla gönderildi! Teklif: ${offerAmount} ₺`);
    closeModal();
}

// Bilet sahibini bulan yardımcı fonksiyon
function getTicketOwner(ticketId) {
    const tickets = JSON.parse(localStorage.getItem('biletler')) || [];
    const ticket = tickets.find(t => t.id === ticketId);
    return ticket ? ticket.userId : null;
}

// Profil panelini oluşturma fonksiyonu
function createProfilePanel() {
    return `
        <div class="side-panel" id="sidePanel">
            <div class="side-panel-header">
                <h2>Profilim</h2>
                <button class="close-panel" onclick="togglePanel()">&times;</button>
            </div>
            <div class="profile-content">
                <div class="profile-header">
                    <div class="profile-header-avatar">A</div>
                    <div class="profile-header-info">
                        <h3>Ahmet Yılmaz</h3>
                        <p>@ahmetyilmaz</p>
                    </div>
                </div>

                <div class="profile-stats">
                    <div class="stat-card">
                        <div class="stat-number" id="ticketCount">0</div>
                        <div class="stat-label">Biletlerim</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="offerCount">0</div>
                        <div class="stat-label">Teklifler</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="favoriteCount">0</div>
                        <div class="stat-label">Favoriler</div>
                    </div>
                </div>

                <div class="profile-sections">
                    <div class="profile-section offers-section">
                        <h3 class="section-title">Teklifler</h3>
                        <div class="offers-tabs">
                            <button class="offers-tab active" onclick="showOffers('incoming')">Gelen Teklifler</button>
                            <button class="offers-tab" onclick="showOffers('outgoing')">Gönderilen Teklifler</button>
                        </div>
                        <div class="offer-list" id="offersList">
                            <!-- Teklifler buraya eklenecek -->
                        </div>
                    </div>

                    <div class="profile-section">
                        <h3 class="section-title">Aktif Biletlerim</h3>
                        <div class="tickets-grid" id="my-tickets-container">
                            <!-- Kullanıcının kendi biletleri buraya eklenecek -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Panel açma/kapama fonksiyonu güncelleme
function togglePanel() {
    const profileModal = document.getElementById('profileModal');
    
    if (profileModal) {
        if (!profileModal.classList.contains('active')) {
            profileModal.classList.add('active');
            updateProfileStats();
            showOffers('incoming');
            showMyTickets();
        } else {
            profileModal.classList.remove('active');
        }
    }
}

// Modal dışına tıklandığında kapatma
document.addEventListener('click', function(e) {
    const profileModal = document.getElementById('profileModal');
    if (profileModal && e.target === profileModal) {
        togglePanel();
    }
});

// ESC tuşu ile modalı kapatma
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const profileModal = document.getElementById('profileModal');
        if (profileModal && profileModal.classList.contains('active')) {
            togglePanel();
        }
    }
});

// Profil istatistiklerini güncelleme
function updateProfileStats() {
    const biletler = JSON.parse(localStorage.getItem('biletler')) || [];
    const offers = JSON.parse(localStorage.getItem('offers')) || [];
    
    const ticketCount = biletler.filter(bilet => bilet.userId === currentUserId).length;
    const offerCount = offers.filter(offer => 
        offer.fromUserId === currentUserId || offer.toUserId === currentUserId
    ).length;
    const favoriteCount = favorites.length;

    document.getElementById('ticketCount').textContent = ticketCount;
    document.getElementById('offerCount').textContent = offerCount;
    document.getElementById('favoriteCount').textContent = favoriteCount;
} 