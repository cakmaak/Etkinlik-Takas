from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('my-tickets/', views.my_tickets, name='my_tickets'),
    path('add-ticket/', views.add_ticket, name='add_ticket'),
    path('delete-ticket/<int:ticket_id>/', views.delete_ticket, name='delete_ticket'),
    path('toggle-favorite/<int:ticket_id>/', views.toggle_favorite, name='toggle_favorite'),
    path('favorites/', views.favorites, name='favorites'),
    path('send-offer/<int:ticket_id>/', views.send_offer, name='send_offer'),
    path('offers/', views.offers, name='offers'),
    path('accept-offer/<int:offer_id>/', views.accept_offer, name='accept_offer'),
    path('reject-offer/<int:offer_id>/', views.reject_offer, name='reject_offer'),
] 