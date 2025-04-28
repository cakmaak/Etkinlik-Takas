function toggleProfileModal() {
    const modal = document.querySelector('.profile-modal');
    const overlay = document.querySelector('.overlay');
    
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

// Profil sekmesi değiştirme fonksiyonu
function changeOfferTab(tabName) {
    const tabs = document.querySelectorAll('.offers-tab');
    const contents = document.querySelectorAll('.offer-content');
    
    tabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    contents.forEach(content => {
        if (content.id === tabName) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    });
}

// Sayfa yüklendiğinde varsayılan sekme
document.addEventListener('DOMContentLoaded', () => {
    changeOfferTab('active-offers');
}); 