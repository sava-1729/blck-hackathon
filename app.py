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

CONTRACT_ADDRESS = "0x13031b6a98cB7606438761f3418052310d523fAc" # os.environ["contractAddress"] #v1.3.1
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

if __name__ == "__main__":
    app.run(debug=True)