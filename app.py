import csv
import hashlib
import math
import os
import time
import requests
import json

from flask import (Flask, after_this_request, jsonify, redirect,
                   render_template, request, url_for, abort)

app = Flask(__name__)

# assert "contractAddress" in os.environ, "Contract not deployed yet!"

CONTRACT_ADDRESS = "0x333D6558f6E48910D7fF23be033227D8CAbF44f5" # os.environ["contractAddress"] #v1.3.1
ETH_ADDRESS_LENGTH = 42
CURRENT_USER = ""

@app.route("/", methods = ["POST", "GET"])
def home():
    return render_template("home.html")

@app.route("/contract_address", methods = ["GET"])
def get_contract_address():
    @after_this_request
    def add_header(response):
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    global CONTRACT_ADDRESS
    return jsonify(CONTRACT_ADDRESS)

@app.route("/get_metadata/<pub_key>", methods = ["GET"])
def get_meta_data(pub_key):
    @after_this_request
    def add_header(response):
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
    }

    params = {
        'address': pub_key
    }

    response = requests.get('http://api.devnet.solscan.io/account', headers=headers, params=params)

    print("Hello!!!!")
    print(response.content.decode())
    print("Hello!!!!")
    return jsonify(response.content.decode())

@app.route("/blockchainapi/<pub_key>", methods = ["GET"])
def get_theblockchainapi(pub_key):
    response = requests.get(
        "https://api.theblockchainapi.com/v1/solana/nft",
        params={
            'mint_address': 
                pub_key,
            'network': 'devnet'
        },
        headers={
            'APISecretKey': 'tt7Ev6E062jObYK',
            'APIKeyId': 'FbiqdlAC5YG6WVJ'
        }
    )
    print("----------------------------------------------")
    print(response.json())
    print("----------------------------------------------")
    return response.json()

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)