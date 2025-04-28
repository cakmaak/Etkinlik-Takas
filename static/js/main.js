// Profil menüsünü aç/kapat
function toggleProfileModal() {
    const modal = document.getElementById('profileModal');
    const overlay = document.getElementById('overlay');
    
    if (modal.classList.contains('active')) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    } else {
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Bilet silme onayı
function deleteTicket(ticketId) {
    if (confirm('Bu bileti silmek istediğinizden emin misiniz?')) {
        window.location.href = `/delete-ticket/${ticketId}/`;
    }
}

// Favori ekleme/çıkarma
function toggleFavorite(ticketId) {
    window.location.href = `/toggle-favorite/${ticketId}/`;
}

// Teklif modalını göster
function showOfferModal(ticketId) {
    document.getElementById('ticketId').value = ticketId;
    document.getElementById('offerModal').style.display = 'block';
}

// Teklif modalını kapat
function closeOfferModal() {
    document.getElementById('offerModal').style.display = 'none';
}

// Teklif gönderme
function sendOffer(event) {
    event.preventDefault();
    const ticketId = document.getElementById('ticketId').value;
    const amount = document.getElementById('amount').value;
    window.location.href = `/send-offer/${ticketId}/?amount=${amount}`;
}

// Kategori filtreleme
function filterTickets(category) {
    window.location.href = `/?category=${category}`;
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Profil menüsüne tıklama olayı
    const profileMenu = document.querySelector('.profile-menu');
    if (profileMenu) {
        profileMenu.addEventListener('click', function(e) {
            e.preventDefault();
            toggleProfileModal();
        });
    }

    // Modal dışına tıklandığında kapatma
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // ESC tuşu ile modalı kapatma
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
    });
}); 