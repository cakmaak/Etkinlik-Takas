from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import Ticket, Favorite, Offer
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import os

def home(request):
    category = request.GET.get('category')
    if category:
        tickets = Ticket.objects.filter(kategori=category)
    else:
        tickets = Ticket.objects.all()
    
    favorite_tickets = []
    if request.user.is_authenticated:
        favorite_tickets = Favorite.objects.filter(user=request.user).values_list('ticket_id', flat=True)
    
    return render(request, 'tickets/home.html', {
        'tickets': tickets,
        'favorite_tickets': favorite_tickets
    })

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return redirect('home')
    return render(request, 'tickets/login.html')

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'tickets/signup.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('home')

def my_tickets(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    tickets = Ticket.objects.filter(user=request.user)
    incoming_offers = Offer.objects.filter(ticket__user=request.user)
    
    return render(request, 'tickets/my_tickets.html', {
        'tickets': tickets,
        'incoming_offers': incoming_offers
    })

@login_required
def add_ticket(request):
    if request.method == 'POST':
        etkinlik_adi = request.POST.get('etkinlik_adi')
        kategori = request.POST.get('kategori')
        tarih = request.POST.get('tarih')
        fiyat = request.POST.get('fiyat')
        resim = request.FILES.get('resim')
        
        if etkinlik_adi and kategori and tarih and fiyat and resim:
            # Önce geçici olarak dosyayı kaydet
            ticket = Ticket(
                user=request.user,
                etkinlik_adi=etkinlik_adi,
                kategori=kategori,
                tarih=tarih,
                fiyat=fiyat,
                resim=resim
            )
            ticket.save()  # Bu, Firebase Storage'a yükleyecek
            
            # Geçici dosyayı sil
            if os.path.exists(ticket.resim.path):
                os.remove(ticket.resim.path)
            
            return redirect('home')
    return render(request, 'tickets/add_ticket.html')

@login_required
def delete_ticket(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id, user=request.user)
    ticket.delete()
    return redirect('home')

@login_required
def toggle_favorite(request, ticket_id):
    if request.method == 'POST':
        ticket = get_object_or_404(Ticket, id=ticket_id)
        favorite, created = Favorite.objects.get_or_create(user=request.user, ticket=ticket)
        
        if not created:
            favorite.delete()
            return JsonResponse({'status': 'success', 'is_favorite': False})
        
        return JsonResponse({'status': 'success', 'is_favorite': True})
    
    return JsonResponse({'status': 'error'}, status=400)

@login_required
def favorites(request):
    favorites = Favorite.objects.filter(user=request.user)
    return render(request, 'tickets/favorites.html', {'favorites': favorites})

@login_required
def send_offer(request, ticket_id):
    if request.method == 'GET':
        amount = request.GET.get('amount')
        ticket = get_object_or_404(Ticket, id=ticket_id)
        
        if ticket.user != request.user:
            Offer.objects.create(
                from_user=request.user,
                to_user=ticket.user,
                ticket=ticket,
                amount=amount
            )
        
        return redirect('home')
    return redirect('home')

@login_required
def offers(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    # Kullanıcının biletlerine gelen teklifler
    received_offers = Offer.objects.filter(
        ticket__user=request.user
    ).order_by('-created_at')
    
    # Kullanıcının gönderdiği teklifler
    sent_offers = Offer.objects.filter(
        from_user=request.user
    ).order_by('-created_at')
    
    return render(request, 'tickets/offers.html', {
        'received_offers': received_offers,
        'sent_offers': sent_offers
    })

@login_required
def accept_offer(request, offer_id):
    offer = get_object_or_404(Offer, id=offer_id, ticket__user=request.user)
    offer.status = 'accepted'
    offer.save()
    return redirect('offers')

@login_required
def reject_offer(request, offer_id):
    offer = get_object_or_404(Offer, id=offer_id, ticket__user=request.user)
    offer.status = 'rejected'
    offer.save()
    return redirect('offers')

def signup_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        if password1 != password2:
            messages.error(request, 'Şifreler eşleşmiyor!')
            return redirect('signup')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Bu kullanıcı adı zaten kullanılıyor!')
            return redirect('signup')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Bu email adresi zaten kullanılıyor!')
            return redirect('signup')

        user = User.objects.create_user(username=username, email=email, password=password1)
        login(request, user)
        messages.success(request, 'Hesabınız başarıyla oluşturuldu!')
        return redirect('home')

    return render(request, 'registration/signup.html')
