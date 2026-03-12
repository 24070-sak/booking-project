#!/usr/bin/env python3
"""
Generate a professional UML Use Case Diagram for the Hotel Booking System.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Ellipse
import numpy as np
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE_PNG = os.path.join(OUTPUT_DIR, "diagramme_cas_utilisation_HD.png")
OUTPUT_FILE_PDF = os.path.join(OUTPUT_DIR, "diagramme_cas_utilisation_HD.pdf")
OUTPUT_FILE_SVG = os.path.join(OUTPUT_DIR, "diagramme_cas_utilisation_HD.svg")

fig, ax = plt.subplots(1, 1, figsize=(20, 15), dpi=300)
ax.set_xlim(0, 30)
ax.set_ylim(0, 22)
ax.set_aspect('equal')
ax.axis('off')
fig.patch.set_facecolor('#FAFBFC')

FONT = 'DejaVu Sans'
TITLE_COLOR = '#1A2242'
SYSTEM_BG = '#F0F3FA'
SYSTEM_BORDER = '#3B4F8A'
UC_BG = '#DDE4F2'
UC_BORDER = '#4A5F9A'
ACTOR_COLOR = '#2C3E7B'
INCLUDE_COLOR = '#27AE60'
EXTEND_COLOR = '#E67E22'
INHERIT_COLOR = '#8E44AD'

# --- TITLE ---
ax.text(15, 21.5, 'Diagramme de Cas d\'Utilisation — Système de Réservation Hôtelière',
        ha='center', va='center', fontsize=24, fontweight='bold', color=TITLE_COLOR, fontfamily=FONT)
ax.text(15, 21.05, 'Use Case Diagram • Hotel Booking System',
        ha='center', va='center', fontsize=16, color='#6B7B9E', fontfamily=FONT)

# --- SYSTEM BOUNDARY ---
system_rect = FancyBboxPatch((5.5, 0.8), 19, 19.5,
                              boxstyle="round,pad=0.3", facecolor=SYSTEM_BG, edgecolor=SYSTEM_BORDER,
                              linewidth=3.5, linestyle='-', zorder=0)
ax.add_patch(system_rect)
ax.text(15, 20.0, 'Système de Réservation Hôtelière', ha='center', va='center',
        fontsize=18, fontweight='bold', color=SYSTEM_BORDER, fontfamily=FONT, zorder=1)

# --- DRAW ACTOR ---
def draw_actor(ax, x, y, name, sub_name=None):
    """Draw a UML stick figure actor."""
    # Head
    head = plt.Circle((x, y + 0.7), 0.25, fill=False, edgecolor=ACTOR_COLOR, linewidth=3, zorder=5)
    ax.add_patch(head)
    # Body
    ax.plot([x, x], [y + 0.45, y - 0.15], '-', color=ACTOR_COLOR, linewidth=3, zorder=5)
    # Arms
    ax.plot([x - 0.35, x + 0.35], [y + 0.25, y + 0.25], '-', color=ACTOR_COLOR, linewidth=3, zorder=5)
    # Legs
    ax.plot([x, x - 0.3], [y - 0.15, y - 0.6], '-', color=ACTOR_COLOR, linewidth=3, zorder=5)
    ax.plot([x, x + 0.3], [y - 0.15, y - 0.6], '-', color=ACTOR_COLOR, linewidth=3, zorder=5)
    # Name
    ax.text(x, y - 0.9, name, ha='center', va='top', fontsize=14, fontweight='bold',
            color=ACTOR_COLOR, fontfamily=FONT, zorder=5)
    if sub_name:
        ax.text(x, y - 1.2, sub_name, ha='center', va='top', fontsize=11,
                color='#6B7B9E', fontfamily=FONT, zorder=5)

# --- DRAW USE CASE ---
def draw_use_case(ax, x, y, text, w=3.2, h=0.65):
    """Draw a UML use case ellipse with text."""
    ellipse = Ellipse((x, y), w, h, facecolor=UC_BG, edgecolor=UC_BORDER,
                      linewidth=2.5, zorder=2)
    ax.add_patch(ellipse)
    ax.text(x, y, text, ha='center', va='center', fontsize=11, fontweight='bold',
            color='#2C3E50', fontfamily=FONT, zorder=3, wrap=True)
    return x, y

# --- DRAW ASSOCIATION ---
def draw_assoc(ax, x1, y1, x2, y2, color=ACTOR_COLOR):
    ax.plot([x1, x2], [y1, y2], '-', color=color, linewidth=1.8, alpha=0.6, zorder=1)

# --- DRAW INCLUDE/EXTEND ---
def draw_dependency(ax, x1, y1, x2, y2, label, color):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', color=color, lw=2.0, linestyle='dashed'),
                zorder=3)
    mid_x = (x1 + x2) / 2
    mid_y = (y1 + y2) / 2
    ax.text(mid_x, mid_y + 0.2, label, ha='center', va='center', fontsize=10,
            color=color, fontfamily=FONT, fontweight='bold', zorder=4,
            bbox=dict(boxstyle='round,pad=0.1', facecolor='white', edgecolor='none', alpha=0.9))

# --- DRAW GENERALIZATION ---
def draw_generalization(ax, x1, y1, x2, y2):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='-|>', color=INHERIT_COLOR, lw=3, linestyle='-',
                                facecolor='white'),
                zorder=3)

# ==========================================
# ACTORS
# ==========================================
draw_actor(ax, 2.2, 14, 'Client')
draw_actor(ax, 27.8, 14, 'Propriétaire', '/ Gérant')
draw_actor(ax, 27.8, 5.5, 'Administrateur')

# ==========================================
# CLIENT USE CASES (LEFT COLUMN)
# ==========================================
client_ucs = [
    (8.5, 19.0, "S'inscrire"),
    (8.5, 18.0, "Se connecter"),
    (8.5, 17.0, "Connexion Google"),
    (8.5, 16.0, "Réinitialiser mot de passe"),
    (8.5, 15.0, "Modifier mon profil"),
    (8.5, 14.0, "Rechercher un hôtel"),
    (8.5, 13.0, "Consulter les chambres"),
    (8.5, 12.0, "Réserver une chambre"),
    (8.5, 11.0, "Effectuer un paiement"),
    (8.5, 10.0, "Consulter mes réservations"),
    (8.5, 9.0, "Annuler une réservation"),
    (8.5, 8.0, "Laisser un avis"),
    (8.5, 7.0, "Envoyer un message"),
    (8.5, 6.0, "Recevoir des notifications"),
]

for x, y, text in client_ucs:
    draw_use_case(ax, x, y, text)
    draw_assoc(ax, 2.7, 14, x - 1.5, y)

# ==========================================
# <<include>> and <<extend>> USE CASES (MIDDLE)
# ==========================================
# Internal use cases
draw_use_case(ax, 14.5, 12.0, "Vérifier disponibilité", w=3.0)
draw_use_case(ax, 14.5, 11.0, "Calculer le prix total", w=3.0)
draw_use_case(ax, 14.5, 18.0, "Vérifier l'email", w=3.0)
draw_use_case(ax, 14.5, 6.0, "Configurer préférences\nnotification", w=3.0, h=0.75)

# <<include>> arrows
draw_dependency(ax, 10.1, 12.0, 13.0, 12.0, '«include»', INCLUDE_COLOR)
draw_dependency(ax, 10.1, 12.0, 13.0, 11.0, '«include»', INCLUDE_COLOR)
draw_dependency(ax, 10.1, 18.0, 13.0, 18.0, '«include»', INCLUDE_COLOR)
draw_dependency(ax, 10.1, 6.0, 13.0, 6.0, '«include»', INCLUDE_COLOR)

# <<extend>> arrows
draw_dependency(ax, 8.5, 11.0, 8.5, 12.0, '«extend»', EXTEND_COLOR)  # Payment extends Booking
draw_dependency(ax, 8.5, 8.0, 8.5, 10.0, '«extend»', EXTEND_COLOR)  # Review extends Bookings list
draw_dependency(ax, 8.5, 17.0, 8.5, 18.0, '«extend»', EXTEND_COLOR)  # Google extends Login

# ==========================================
# OWNER/MANAGER USE CASES (RIGHT COLUMN)
# ==========================================
owner_ucs = [
    (21.5, 19.0, "Gérer les hôtels"),
    (21.5, 18.0, "Gérer les chambres"),
    (21.5, 17.0, "Gérer les réservations"),
    (21.5, 16.0, "Confirmer/Refuser réservation"),
    (21.5, 15.0, "Gérer les paiements"),
    (21.5, 14.0, "Répondre aux avis"),
    (21.5, 13.0, "Consulter le tableau de bord"),
    (21.5, 12.0, "Consulter les statistiques"),
    (21.5, 11.0, "Envoyer des messages"),
]

for x, y, text in owner_ucs:
    draw_use_case(ax, x, y, text)
    draw_assoc(ax, 27.3, 14, x + 1.5, y)

# ==========================================
# ADMIN USE CASES (BOTTOM RIGHT)
# ==========================================
admin_ucs = [
    (21.5, 5.5, "Gérer tous les utilisateurs"),
    (21.5, 4.5, "Gérer tous les hôtels"),
    (21.5, 3.5, "Centre de contrôle"),
    (21.5, 2.5, "Consulter toutes les stats"),
    (21.5, 1.5, "Notifications système"),
]

for x, y, text in admin_ucs:
    draw_use_case(ax, x, y, text)
    draw_assoc(ax, 27.3, 5.5, x + 1.5, y)

# Generalization: Admin inherits from Owner/Manager
draw_generalization(ax, 27.8, 6.8, 27.8, 12.5)
ax.text(28.4, 9.5, '«hérite»', fontsize=11, color=INHERIT_COLOR, fontfamily=FONT,
        rotation=90, ha='center', va='center', fontweight='bold')

# ==========================================
# LEGEND
# ==========================================
leg_x, leg_y = 1.0, 4.5
ax.add_patch(FancyBboxPatch((leg_x, leg_y - 3.5), 4.0, 3.5,
             boxstyle="round,pad=0.2", facecolor='white', edgecolor='#B0B8C8', linewidth=1, zorder=6))
ax.text(leg_x + 2.0, leg_y - 0.2, 'Légende', ha='center', fontsize=13, fontweight='bold',
        color=TITLE_COLOR, fontfamily=FONT, zorder=7)

# Use case
ell = Ellipse((leg_x + 0.8, leg_y - 0.8), 1.0, 0.4, facecolor=UC_BG, edgecolor=UC_BORDER, linewidth=1.5, zorder=7)
ax.add_patch(ell)
ax.text(leg_x + 1.8, leg_y - 0.8, 'Cas d\'utilisation', fontsize=11, color='#34495E',
        fontfamily=FONT, va='center', zorder=7)

# Include
ax.annotate('', xy=(leg_x + 1.3, leg_y - 1.3), xytext=(leg_x + 0.3, leg_y - 1.3),
            arrowprops=dict(arrowstyle='->', color=INCLUDE_COLOR, lw=2, linestyle='dashed'), zorder=7)
ax.text(leg_x + 1.8, leg_y - 1.3, '«include»', fontsize=11, color=INCLUDE_COLOR,
        fontfamily=FONT, va='center', fontweight='bold', zorder=7)

# Extend
ax.annotate('', xy=(leg_x + 1.3, leg_y - 1.8), xytext=(leg_x + 0.3, leg_y - 1.8),
            arrowprops=dict(arrowstyle='->', color=EXTEND_COLOR, lw=2, linestyle='dashed'), zorder=7)
ax.text(leg_x + 1.8, leg_y - 1.8, '«extend»', fontsize=11, color=EXTEND_COLOR,
        fontfamily=FONT, va='center', fontweight='bold', zorder=7)

# Generalization
ax.annotate('', xy=(leg_x + 1.3, leg_y - 2.3), xytext=(leg_x + 0.3, leg_y - 2.3),
            arrowprops=dict(arrowstyle='-|>', color=INHERIT_COLOR, lw=3, facecolor='white'), zorder=7)
ax.text(leg_x + 1.8, leg_y - 2.3, 'Généralisation (héritage)', fontsize=11, color=INHERIT_COLOR,
        fontfamily=FONT, va='center', fontweight='bold', zorder=7)

# Association
ax.plot([leg_x + 0.3, leg_x + 1.3], [leg_y - 2.8, leg_y - 2.8], '-', color=ACTOR_COLOR, linewidth=2, zorder=7)
ax.text(leg_x + 1.8, leg_y - 2.8, 'Association', fontsize=11, color='#34495E',
        fontfamily=FONT, va='center', zorder=7)

plt.tight_layout()
plt.savefig(OUTPUT_FILE_PNG, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor())
plt.savefig(OUTPUT_FILE_PDF, bbox_inches='tight', facecolor=fig.get_facecolor())
plt.savefig(OUTPUT_FILE_SVG, bbox_inches='tight', facecolor=fig.get_facecolor())
plt.close()
print(f"✅ Use case diagram saved to:")
print(f"   PNG: {OUTPUT_FILE_PNG}")
print(f"   PDF: {OUTPUT_FILE_PDF}")
print(f"   SVG: {OUTPUT_FILE_SVG}")
