from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import Ticket, Favorite, Offer
from django.contrib.auth.models import User
from django.db.models import Q

def home(request):
    category = request.GET.get('category')
    tickets = Ticket.objects.all()
    if category:
        tickets = tickets.filter(kategori=category)
    return render(request, 'tickets/home.html', {'tickets': tickets})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            messages.success(request, 'Başarıyla giriş yaptınız!')
            return redirect('home')
    else:
        form = AuthenticationForm()
    return render(request, 'tickets/login.html', {'form': form})

def signup_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            messages.success(request, 'Hesabınız başarıyla oluşturuldu!')
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'tickets/signup.html', {'form': form})

@login_required
def my_tickets(request):
    tickets = Ticket.objects.filter(user=request.user)
    incoming_offers = Offer.objects.filter(ticket__user=request.user).order_by('-created_at')
    outgoing_offers = Offer.objects.filter(from_user=request.user).order_by('-created_at')
    return render(request, 'tickets/my_tickets.html', {
        'tickets': tickets,
        'incoming_offers': incoming_offers,
        'outgoing_offers': outgoing_offers
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
            ticket = Ticket.objects.create(
                etkinlik_adi=etkinlik_adi,
                kategori=kategori,
                tarih=tarih,
                fiyat=fiyat,
                resim=resim,
                user=request.user
            )
            messages.success(request, 'Bilet başarıyla eklendi!')
            return redirect('my_tickets')
        else:
            messages.error(request, 'Lütfen tüm alanları doldurun!')

    return render(request, 'tickets/add_ticket.html')

@login_required
def delete_ticket(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id, user=request.user)
    ticket.delete()
    messages.success(request, 'Bilet başarıyla silindi!')
    return redirect('my_tickets')

@login_required
def toggle_favorite(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    favorite, created = Favorite.objects.get_or_create(user=request.user, ticket=ticket)
    if not created:
        favorite.delete()
    return redirect('home')

@login_required
def favorites(request):
    favorite_tickets = request.user.favorite_set.all()
    return render(request, 'tickets/favorites.html', {'tickets': favorite_tickets})

@login_required
def send_offer(request, ticket_id):
    ticket = get_object_or_404(Ticket, id=ticket_id)
    amount = request.GET.get('amount')
    if amount:
        Offer.objects.create(
            ticket=ticket,
            from_user=request.user,
            to_user=ticket.user,
            amount=amount
        )
        messages.success(request, 'Teklifiniz başarıyla gönderildi!')
    return redirect('home')

@login_required
def handle_offer(request, offer_id, action):
    offer = get_object_or_404(Offer, id=offer_id)
    
    if offer.to_user == request.user and offer.status == 'pending':
        if action == 'accept':
            offer.status = 'accepted'
            messages.success(request, 'Teklif kabul edildi!')
        elif action == 'reject':
            offer.status = 'rejected'
            messages.success(request, 'Teklif reddedildi!')
        offer.save()
    
    return redirect('my_tickets')
