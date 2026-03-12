#!/usr/bin/env python3
"""
Generate a professional UML Class Diagram for the Hotel Booking System.
Uses matplotlib to render a high-resolution PNG.
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import os

# Output path
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE_PNG = os.path.join(OUTPUT_DIR, "diagramme_de_classe_HD.png")
OUTPUT_FILE_PDF = os.path.join(OUTPUT_DIR, "diagramme_de_classe_HD.pdf")
OUTPUT_FILE_SVG = os.path.join(OUTPUT_DIR, "diagramme_de_classe_HD.svg")

fig, ax = plt.subplots(1, 1, figsize=(21, 16), dpi=300)
ax.set_xlim(0, 32)
ax.set_ylim(0, 24)
ax.set_aspect('equal')
ax.axis('off')
fig.patch.set_facecolor('#FAFBFC')

# --- COLORS ---
HEADER_COLOR = '#2C3E7B'
HEADER_TEXT = 'white'
ATTR_BG = '#EFF2F7'
METHOD_BG = '#E3E8F0'
BORDER_COLOR = '#3B4F8A'
RELATION_COLOR = '#5B6B8D'
TITLE_COLOR = '#1A2242'
FONT = 'DejaVu Sans'

def draw_class(ax, x, y, w, h_header, name, attrs, methods, stereotype=None):
    """Draw a UML class box at (x, y) with given width."""
    total_attrs = len(attrs)
    total_methods = len(methods)
    line_h = 0.32
    h_attrs = max(total_attrs * line_h + 0.2, 0.5)
    h_methods = max(total_methods * line_h + 0.2, 0.5)
    h_total = h_header + h_attrs + h_methods

    # Shadow
    shadow = FancyBboxPatch((x + 0.06, y - h_total + 0.06), w, h_total,
                            boxstyle="round,pad=0.08", facecolor='#D0D4DB', edgecolor='none', zorder=1)
    ax.add_patch(shadow)

    # Header
    header = FancyBboxPatch((x, y - h_header), w, h_header,
                            boxstyle="round,pad=0.08", facecolor=HEADER_COLOR, edgecolor=BORDER_COLOR, linewidth=2.5, zorder=2)
    ax.add_patch(header)
    if stereotype:
        ax.text(x + w / 2, y - 0.15, f'«{stereotype}»', ha='center', va='top',
                fontsize=10, color='#C0CBE8', fontfamily=FONT, style='italic', zorder=3)
        ax.text(x + w / 2, y - h_header / 2 - 0.05, name, ha='center', va='center',
                fontsize=13, fontweight='bold', color=HEADER_TEXT, fontfamily=FONT, zorder=3)
    else:
        ax.text(x + w / 2, y - h_header / 2, name, ha='center', va='center',
                fontsize=13, fontweight='bold', color=HEADER_TEXT, fontfamily=FONT, zorder=3)

    # Attributes
    attr_rect = FancyBboxPatch((x, y - h_header - h_attrs), w, h_attrs,
                               boxstyle="square,pad=0", facecolor=ATTR_BG, edgecolor=BORDER_COLOR, linewidth=1.5, zorder=2)
    ax.add_patch(attr_rect)
    for i, attr in enumerate(attrs):
        ax.text(x + 0.15, y - h_header - 0.18 - i * line_h, attr, ha='left', va='top',
                fontsize=9.5, color='#23293A', fontfamily=FONT, zorder=3)

    # Methods
    method_rect = FancyBboxPatch((x, y - h_header - h_attrs - h_methods), w, h_methods,
                                 boxstyle="square,pad=0", facecolor=METHOD_BG, edgecolor=BORDER_COLOR, linewidth=1.5, zorder=2)
    ax.add_patch(method_rect)
    for i, method in enumerate(methods):
        ax.text(x + 0.15, y - h_header - h_attrs - 0.18 - i * line_h, method, ha='left', va='top',
                fontsize=9.5, color='#2C3E50', fontfamily=FONT, style='italic', zorder=3)

    center_x = x + w / 2
    center_y = y - h_total / 2
    return center_x, center_y, x, y, x + w, y - h_total, w, h_total

# --- TITLE ---
ax.text(16, 23.5, 'Diagramme de Classes — Système de Réservation Hôtelière',
        ha='center', va='center', fontsize=24, fontweight='bold', color=TITLE_COLOR, fontfamily=FONT)
ax.text(16, 23.05, 'Hotel Booking System • Class Diagram',
        ha='center', va='center', fontsize=16, color='#6B7B9E', fontfamily=FONT)

# ---- Draw classes ----
W = 4.2  # Standard width
H_HEAD = 0.55

# USER (top center)
user_info = draw_class(ax, 13.5, 22.2, W + 0.3, H_HEAD, 'User', [
    '- id : Integer «PK»',
    '- email : String «unique»',
    '- password_hash : String',
    '- google_id : String',
    '- first_name : String',
    '- last_name : String',
    '- phone : String',
    '- username : String «unique»',
    '- role : String {client|admin|manager}',
    '- is_active : Boolean',
    '- profile_picture : String',
    '- is_email_verified : Boolean',
    '- verification_token : String',
    '- reset_token : String',
    '- created_at : DateTime',
], [
    '+ set_password(password)',
    '+ check_password(password) : Boolean',
    '+ to_dict() : Dict',
])

# HOTEL (left center)
hotel_info = draw_class(ax, 1.0, 15.5, W, H_HEAD, 'Hotel', [
    '- id : Integer «PK»',
    '- name : String',
    '- location : String',
    '- description : Text',
    '- image_url : String',
    '- rating : Float',
    '- user_id : Integer «FK»',
    '- views : Integer',
    '- unique_visitors : Integer',
    '- bounce_rate : Integer',
], [
    '+ to_dict() : Dict',
])

# ROOM (center)
room_info = draw_class(ax, 7.0, 15.5, W + 0.2, H_HEAD, 'Room', [
    '- id : Integer «PK»',
    '- room_number : String «unique»',
    '- name : String',
    '- description : Text',
    '- room_type_id : Integer «FK»',
    '- hotel_id : Integer «FK»',
    '- price_per_night : Float',
    '- floor : Integer',
    '- size_sqm : Float',
    '- bed_type : String',
    '- max_guests : Integer',
    '- is_available : Boolean',
    '- image_url : String',
], [
    '+ to_dict(include_amenities) : Dict',
])

# BOOKING (right mid)
booking_info = draw_class(ax, 19.0, 15.5, W + 0.3, H_HEAD, 'Booking', [
    '- id : Integer «PK»',
    '- booking_reference : String «unique»',
    '- user_id : Integer «FK»',
    '- room_id : Integer «FK»',
    '- check_in_date : Date',
    '- check_out_date : Date',
    '- num_guests : Integer',
    '- total_price : Float',
    '- status : String {pending|confirmed|...}',
    '- special_requests : Text',
    '- created_at : DateTime',
], [
    '+ generate_booking_reference() : String',
    '+ calculate_nights() : Integer',
    '+ to_dict() : Dict',
])

# PAYMENT (far right)
payment_info = draw_class(ax, 25.5, 15.5, W + 0.2, H_HEAD, 'Payment', [
    '- id : Integer «PK»',
    '- booking_id : Integer «FK» «unique»',
    '- amount : Float',
    '- currency : String',
    '- payment_method : String',
    '- transaction_id : String',
    '- transaction_phone : String',
    '- screenshot_url : String',
    '- bank_app : String',
    '- status : String {pending|completed|...}',
    '- paid_at : DateTime',
], [
    '+ to_dict() : Dict',
])

# ROOMTYPE (bottom left)
roomtype_info = draw_class(ax, 1.0, 8.5, 3.8, H_HEAD, 'RoomType', [
    '- id : Integer «PK»',
    '- name : String «unique»',
    '- description : Text',
    '- base_price : Float',
    '- max_occupancy : Integer',
], [
    '+ to_dict() : Dict',
])

# AMENITY (bottom center-left)
amenity_info = draw_class(ax, 5.5, 8.5, 3.5, H_HEAD, 'Amenity', [
    '- id : Integer «PK»',
    '- name : String «unique»',
    '- icon : String',
    '- description : String',
], [
    '+ to_dict() : Dict',
])

# ROOMIMAGE (center bottom)
roomimage_info = draw_class(ax, 9.5, 8.5, 3.5, H_HEAD, 'RoomImage', [
    '- id : Integer «PK»',
    '- room_id : Integer «FK»',
    '- image_url : String',
    '- caption : String',
    '- is_primary : Boolean',
    '- display_order : Integer',
], [
    '+ to_dict() : Dict',
])

# REVIEW (right bottom)
review_info = draw_class(ax, 13.5, 8.5, 3.8, H_HEAD, 'Review', [
    '- id : Integer «PK»',
    '- user_id : Integer «FK»',
    '- room_id : Integer «FK»',
    '- rating : Integer',
    '- comment : Text',
    '- reply : Text',
    '- is_verified : Boolean',
    '- created_at : DateTime',
], [
    '+ to_dict() : Dict',
])

# MESSAGE (far right bottom)
message_info = draw_class(ax, 18.0, 8.5, 3.8, H_HEAD, 'Message', [
    '- id : Integer «PK»',
    '- sender_id : Integer «FK»',
    '- receiver_id : Integer «FK»',
    '- subject : String',
    '- content : Text',
    '- is_read : Boolean',
    '- created_at : DateTime',
], [
    '+ to_dict() : Dict',
])

# NOTIFICATION (far right bottom)
notif_info = draw_class(ax, 22.5, 8.5, 4.0, H_HEAD, 'Notification', [
    '- id : Integer «PK»',
    '- user_id : Integer «FK»',
    '- sender_id : Integer «FK»',
    '- title : String',
    '- message : Text',
    '- type : String',
    '- room_id : Integer «FK»',
    '- hotel_id : Integer «FK»',
    '- booking_id : Integer «FK»',
    '- is_read : Boolean',
    '- created_at : DateTime',
], [
    '+ to_dict() : Dict',
])

# NOTIFICATION SETTING (bottom far right)
notifsetting_info = draw_class(ax, 27.5, 8.5, 3.8, H_HEAD, 'NotificationSetting', [
    '- user_id : Integer «PK, FK»',
    '- notify_messages : Boolean',
    '- notify_bookings : Boolean',
    '- notify_payments : Boolean',
    '- sound_enabled : Boolean',
], [
    '+ to_dict() : Dict',
])

# --- ASSOCIATION TABLE ---
# room_amenities M:N
assoc_x, assoc_y = 7.0, 9.5
ax.add_patch(FancyBboxPatch((6.0, 5.5), 3.0, 0.8,
             boxstyle="round,pad=0.08", facecolor='#FFF3CD', edgecolor='#D4A800', linewidth=2, zorder=2))
ax.text(7.5, 5.9, '«table»\nroom_amenities', ha='center', va='center',
        fontsize=10, fontweight='bold', color='#856404', fontfamily=FONT, zorder=3)

# --- RELATIONSHIPS ---
def draw_relation(ax, x1, y1, x2, y2, label, card1, card2, style='-', color=RELATION_COLOR, zorder=1, midpoints=None):
    """Draw a relationship line with labels."""
    if midpoints:
        xs = [x1] + [p[0] for p in midpoints] + [x2]
        ys = [y1] + [p[1] for p in midpoints] + [y2]
        ax.plot(xs, ys, style, color=color, linewidth=2.5, zorder=zorder)
    else:
        ax.plot([x1, x2], [y1, y2], style, color=color, linewidth=2.5, zorder=zorder)
    # cardinality labels
    if card1:
        ax.text(x1 + (x2 - x1) * 0.08, y1 + (y2 - y1) * 0.08 + 0.15, card1,
                fontsize=11, fontweight='bold', color='#C0392B', fontfamily=FONT, ha='center', zorder=4)
    if card2:
        ax.text(x2 - (x2 - x1) * 0.08, y2 - (y2 - y1) * 0.08 + 0.15, card2,
                fontsize=11, fontweight='bold', color='#C0392B', fontfamily=FONT, ha='center', zorder=4)
    if label:
        mid_x = (x1 + x2) / 2
        mid_y = (y1 + y2) / 2
        if midpoints:
            mid_x = midpoints[len(midpoints) // 2][0]
            mid_y = midpoints[len(midpoints) // 2][1]
        ax.text(mid_x, mid_y + 0.25, label, fontsize=10, color='#34495E', fontfamily=FONT,
                ha='center', fontweight='bold', fontstyle='italic', zorder=4,
                bbox=dict(boxstyle='round,pad=0.15', facecolor='white', edgecolor='none', alpha=0.85))

# User -> Hotel (owns) 1..* 
draw_relation(ax, 13.5, 17.5, 5.0, 15.5, 'owns', '1', '0..*')

# User -> Booking (makes)
draw_relation(ax, 17.8, 17.0, 19.0, 15.5, 'makes', '1', '0..*')

# User -> Review
draw_relation(ax, 15.5, 16.2, 15.3, 8.5, 'writes', '1', '0..*')

# User -> Message (sender)
draw_relation(ax, 16.5, 16.0, 19.9, 8.5, 'sends', '1', '0..*')

# User -> Message (receiver)
draw_relation(ax, 17.0, 16.5, 20.5, 8.5, 'receives', '1', '0..*')

# User -> Notification
draw_relation(ax, 17.8, 17.5, 24.5, 8.5, 'receives', '1', '0..*')

# User -> NotificationSetting
draw_relation(ax, 17.8, 18.0, 29.4, 8.5, 'configures', '1', '0..1')

# Hotel -> Room (contains) 1..*
draw_relation(ax, 5.0, 13.0, 7.0, 13.0, 'contains', '1', '0..*')

# Room -> RoomType *..1
draw_relation(ax, 7.5, 10.0, 3.8, 8.5, 'type', '*', '1')

# Room -> Amenity M:N (through room_amenities)
ax.plot([8.5, 8.5], [10.0, 6.3], '--', color='#D4A800', linewidth=2.5, zorder=1)
ax.plot([7.0, 8.5], [6.3, 6.3], '--', color='#D4A800', linewidth=2.5, zorder=1)
ax.text(8.9, 8.0, '*', fontsize=13, fontweight='bold', color='#C0392B', fontfamily=FONT, zorder=4)
ax.text(7.5, 5.4, '*', fontsize=13, fontweight='bold', color='#C0392B', fontfamily=FONT, zorder=4)

# Room -> RoomImage
draw_relation(ax, 10.0, 10.0, 11.0, 8.5, 'has', '1', '0..*')

# Room -> Booking
draw_relation(ax, 11.2, 12.0, 19.0, 12.0, 'booked as', '1', '0..*')

# Room -> Review
draw_relation(ax, 10.5, 10.0, 13.5, 8.5, 'reviewed', '1', '0..*')

# Booking -> Payment 1:1
draw_relation(ax, 23.3, 12.5, 25.5, 12.5, 'has', '1', '0..1')

# --- LEGEND ---
legend_x, legend_y = 0.3, 4.5
ax.add_patch(FancyBboxPatch((legend_x, legend_y - 3.5), 6.5, 3.5,
             boxstyle="round,pad=0.2", facecolor='white', edgecolor='#B0B8C8', linewidth=1.5, zorder=2))
ax.text(legend_x + 3.25, legend_y - 0.25, 'Légende / Legend', ha='center', va='center',
        fontsize=14, fontweight='bold', color=TITLE_COLOR, fontfamily=FONT, zorder=3)
ax.plot([legend_x + 0.3, legend_x + 1.5], [legend_y - 0.8, legend_y - 0.8], '-', color=RELATION_COLOR, linewidth=3, zorder=3)
ax.text(legend_x + 1.8, legend_y - 0.8, 'Association (1..* / 0..1)', fontsize=11, color='#34495E', fontfamily=FONT, va='center', zorder=3)
ax.plot([legend_x + 0.3, legend_x + 1.5], [legend_y - 1.3, legend_y - 1.3], '--', color='#D4A800', linewidth=3, zorder=3)
ax.text(legend_x + 1.8, legend_y - 1.3, 'Association M:N (Many-to-Many)', fontsize=11, color='#34495E', fontfamily=FONT, va='center', zorder=3)
ax.text(legend_x + 0.3, legend_y - 1.8, '- attribut : Type «contrainte»', fontsize=11, color='#23293A', fontfamily=FONT, zorder=3)
ax.text(legend_x + 0.3, legend_y - 2.2, '+ méthode(params) : ReturnType', fontsize=11, color='#2C3E50', fontfamily=FONT, style='italic', zorder=3)
ax.text(legend_x + 0.3, legend_y - 2.7, '«PK» = Primary Key    «FK» = Foreign Key', fontsize=10, color='#6B7B9E', fontfamily=FONT, zorder=3)
ax.text(legend_x + 0.3, legend_y - 3.1, '1 = one    * = many    0..1 = zero or one    0..* = zero or many', fontsize=10, color='#6B7B9E', fontfamily=FONT, zorder=3)


plt.tight_layout()
plt.savefig(OUTPUT_FILE_PNG, dpi=300, bbox_inches='tight', facecolor=fig.get_facecolor())
plt.savefig(OUTPUT_FILE_PDF, bbox_inches='tight', facecolor=fig.get_facecolor())
plt.savefig(OUTPUT_FILE_SVG, bbox_inches='tight', facecolor=fig.get_facecolor())
plt.close()
print(f"✅ Class diagram saved to:")
print(f"   PNG: {OUTPUT_FILE_PNG}")
print(f"   PDF: {OUTPUT_FILE_PDF}")
print(f"   SVG: {OUTPUT_FILE_SVG}")
