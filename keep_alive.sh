#!/bin/bash
# ============================================================
# Hotely Keep-Alive Script
# Pings the Render backend every 4 minutes to prevent cold starts.
#
# Usage:
#   1. Replace BACKEND_URL with your actual Render backend URL
#   2. Make executable: chmod +x keep_alive.sh
#   3. Add to crontab: crontab -e
#      Then add:  */4 * * * * /home/sak/Desktop/booking-project/keep_alive.sh
# ============================================================

# === CONFIG ===
# Replace this with your actual Render backend URL
BACKEND_URL="https://YOUR_APP_NAME.onrender.com/api/hotels?limit=1"

LOG_FILE="/tmp/hotely_keepalive.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Ping the API endpoint
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "$BACKEND_URL")

if [ "$HTTP_STATUS" == "200" ]; then
    echo "$TIMESTAMP - ✅ Backend alive (HTTP $HTTP_STATUS)" >> "$LOG_FILE"
else
    echo "$TIMESTAMP - ⚠️  Backend responded with HTTP $HTTP_STATUS (may be waking up)" >> "$LOG_FILE"
fi

# Keep only last 100 lines of the log to avoid bloat
tail -n 100 "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
