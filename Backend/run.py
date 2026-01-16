from app import create_app

app = create_app()

@app.route("/")
def home():
    return {
        "message": "Bienvenue sur l'API Hotel Booking",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "rooms": "/api/rooms",
            "bookings": "/api/bookings",
            "health": "/api/health"
        }
    }

if __name__ == "__main__":
    app.run(debug=True, port=5000)
