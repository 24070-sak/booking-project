import requests

TEST_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc3MzE5NDk2MiwianRpIjoiYWEzNDlkNGYtNzIzOS00MTMwLTk3OWItZWNhODcyNWM0NmI0IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3NzMxOTQ5NjIsImNzcmYiOiI3ZGJiZWEzNi1lNjk3LTRjMzMtOTRkZS0wMzg1M2M5YWFhNzMiLCJleHAiOjE3NzMxOTg1NjJ9.mgfUVKBjjOnCwFzT_KOqIKpRwISYaxg1wPufgPce-zI"

headers = {"Authorization": f"Bearer {TEST_TOKEN}"}

# Needs to be multipart/form-data for file upload
files = {
    'screenshot': ('test.png', b'fake image data', 'image/png')
}
data = {
    'booking_id': 1,
    'bank_app': 'bankily',
    'transaction_phone': '55555555'
}

resp = requests.post("http://localhost:5000/api/payments/submit-local", headers=headers, files=files, data=data)
print(resp.status_code)
print(resp.text)
