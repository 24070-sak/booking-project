#!/bin/bash

# Base URL
API_URL="http://localhost:5000/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Verifying Dashboard API..."

# 0. Register a new user (to ensure we have one)
echo -e "\n0. Registering test user..."
REGISTER_RES=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"verify_admin@hotel.com", "password":"password123", "first_name":"Verify", "last_name":"Admin", "phone":"1234567890"}')

# 1. Login to get token
echo -e "\n1. Logging in..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"verify_admin@hotel.com", "password":"password123"}' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Login failed!${NC}"
    # Try logging in with the existing admin just in case
    TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"email":"admin@hotel.com", "password":"password123"}' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
      
    if [ -z "$TOKEN" ]; then
        echo -e "${RED}Login failed with admin too!${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}Login successful! Token acquired.${NC}"

# 2. Get Dashboard Stats
echo -e "\n2. Fetching Dashboard Stats..."
STATS=$(curl -s -X GET "$API_URL/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN")
echo "Result: $STATS"

# 3. Get Payments
echo -e "\n3. Fetching Payments..."
PAYMENTS=$(curl -s -X GET "$API_URL/payments" \
  -H "Authorization: Bearer $TOKEN")
echo "Result: $PAYMENTS"

# 4. Get Reviews
echo -e "\n4. Fetching Reviews..."
REVIEWS=$(curl -s -X GET "$API_URL/reviews" \
  -H "Authorization: Bearer $TOKEN")
echo "Result: $REVIEWS"

# 5. Create Hotel (access check)
# Need admin role usually? But let's try.
echo -e "\n5. Creating Hotel..."
NEW_HOTEL=$(curl -s -X POST "$API_URL/hotels" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Hotel Verify", "location":"Paris", "description":"A test hotel", "rating":4.5}')
echo "Result: $NEW_HOTEL"

echo -e "\n${GREEN}Verification Complete!${NC}"
