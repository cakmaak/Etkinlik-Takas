from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.home, name='home'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', auth_views.LoginView.as_view(template_name='tickets/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
    path('my-tickets/', views.my_tickets, name='my_tickets'),
    path('favorites/', views.favorites, name='favorites'),
    path('add-ticket/', views.add_ticket, name='add_ticket'),
    path('delete-ticket/<int:ticket_id>/', views.delete_ticket, name='delete_ticket'),
    path('toggle-favorite/<int:ticket_id>/', views.toggle_favorite, name='toggle_favorite'),
    path('send-offer/<int:ticket_id>/', views.send_offer, name='send_offer'),
    path('handle-offer/<int:offer_id>/<str:action>/', views.handle_offer, name='handle_offer'),
] 