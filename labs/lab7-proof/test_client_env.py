# Lab7-Proof /test_client_env.py
# Test client that loads your .env file automatically

import os
import requests
from dotenv import load_dotenv

# ------------------------------------------------------------------
# Load environment variables from .env
# ------------------------------------------------------------------
load_dotenv()  # reads .env in current directory

BASE_URL = os.getenv("LAB7_URL", "https://your-lab7-api-url.onrender.com")
API_KEY = os.getenv("API_KEY", "")
LAB_ID = os.getenv("LAB_ID", "lab4")  # e.g. lab4, lab6, ledger, lab7

# ------------------------------------------------------------------
# Compose headers & payload
# ------------------------------------------------------------------
headers = {
    "x-api-key": API_KEY,
    "x-lab-id": LAB_ID,
    "Content-Type": "application/json",
}

payload = {"test": "hello from test_client_env"}

# Choose the route to verify
url = f"{BASE_URL}/health/auth"

print("------------------------------------------------")
print(f"🔗 Sending request to {url}")
print(f"🔑 API_KEY starts with: {API_KEY[:5]}...  |  LAB_ID: {LAB_ID}")
print("------------------------------------------------")

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"✅ Status: {response.status_code}")
    print("📬 Response JSON:", response.json())
except Exception as e:
    print("❌ Request failed:", e)
