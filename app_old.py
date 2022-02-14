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

USER_INPUT_KEYS = set(["user_type", "name", "aadhaar", "address", "city", "state", \
                        "phone", "pkey", "pswd", "rpswd"])
REGISTRY_KEYS = ["user_type", "name", "aadhaar", "address", "city", "state", "phone", "pkey"]
OPEN_DEAL_KEYS = ["id", "creator", "itemName", "itemQuantity", "itemPrice", "daysToDeliver", "interestedBuyers"]
USER_DETAILS_FILE = 'data/user_details.csv'
USER_CREDENTIALS_FILE = 'data/user_credentials.csv'
OPEN_DEALS_FILE = 'data/open_deals.csv'
ETH_ADDRESS_LENGTH = 42
CURRENT_USER = ""
CURRENT_USER_DETAIL = {}
CONTRACT_ADDRESS = "0xeecec509931f0d2f8b9c056cb94c8b319824aa49" #v1.3.1
#WORKING CONTRACT VERSION: "0x9113db5c1002b24d0edd7b698adb7ea0fded920a" (v1.3, only farmer buyer interactions with one minor error)
ALL_USER_DATA = {}
OPEN_DEALS = []
TEMP_HASH = ""
DEAL_ID = ""

# @app.route('/client_list', methods = ['POST', 'GET'])
# def set_exhaustive_client_list():
#     global CLIENT_LIST
#     if request.method == 'POST':
#         print('!!!!!!!!!!!!!  Got deals  !!!!!!!!!!!!!!')
#         CLIENT_LIST = list(request.get_json())
#         print(CLIENT_LIST)
#     else:
#         return jsonify(CLIENT_LIST)

# @app.route('/deals', methods = ['POST', 'GET'])
# def set_exhaustive_deals_list():
#     global DEALS
#     if request.method == 'POST':
#         print('Got deals')
#         DEALS = list(request.get_json())
#         print(DEALS)
#     else:
#         return jsonify(DEALS)

@app.route('/contract_address', methods = ['GET'])
def get_contract_address():
    @after_this_request
    def add_header(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    global CONTRACT_ADDRESS
    return jsonify(CONTRACT_ADDRESS)

@app.route('/other_user_data/<user_pkey>/<spec>')
def get_other_user_spec(user_pkey="", spec=""):
    @after_this_request
    def add_header(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    if not is_current_user_agent():
        abort(403)
    global ALL_USER_DATA
    if not ALL_USER_DATA.has_key(user_pkey):
        abort(403)
    if not ALL_USER_DATA[user_pkey].has_key(spec):
        abort(403)
    return jsonify(ALL_USER_DATA[user_pkey][spec])

# image_name = "12.jpg"
# from PIL import Image  
# f = open(image_name, "r")
# files = {"file": f}

# # params = (("arg", p["Hash"]),)
# # response = requests.get("https://ipfs.infura.io:5001/api/v0/cat?arg="+p["Hash"])
# # print (response)

def upload_image(name):
    file = open(name, "r")
    files = {"file": file}
    response = requests.post("https://ipfs.infura.io:5001/api/v0/add",files=files)
    p = response.json()
    print(p["Hash"])
    return (p["Hash"])

@app.route('/save_image', methods = ['POST','GET'])
def save_image():
    global TEMP_HASH
    if request.method == 'POST':
        f = request.files['file']
        print (f.filename)
        f.save(str(f.filename))
        TEMP_HASH = str(upload_image(f.filename))
    return redirect("/load_page")

@app.route('/load_page', methods = ['POST','GET'])
def load_page():    
    return render_template("load_page.html")

@app.route('/get_hash', methods = ['POST','GET'])
def get_hash():
    @after_this_request
    def add_header(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    global TEMP_HASH
    pack = {"image_hash": TEMP_HASH}
    return jsonify(pack)

@app.route('/get_deal_id', methods = ['POST','GET'])
def get_deal_id():
    @after_this_request
    def add_header(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    global DEAL_ID
    pack = {"deal_id": DEAL_ID}
    return jsonify(pack)

@app.route('/user_data', methods = ['GET'])
def get_user_info():
    @after_this_request
    def add_header(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    global CURRENT_USER_DETAIL, CONTRACT_ADDRESS
    pack = {"contractAddress" : CONTRACT_ADDRESS, "userInfo" : CURRENT_USER_DETAIL}
    return jsonify(pack)

@app.route('/user_data/<key>', methods = ['GET'])
def get_user_key_detail(key):
    @after_this_request
    def add_header(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    global CURRENT_USER_DETAIL
    if not CURRENT_USER_DETAIL.has_key(key):
        abort(403)
    return jsonify(CURRENT_USER_DETAIL[key])

@app.route('/all_users_data', methods = ['GET'])
def get_all_users_info():
    @after_this_request
    def add_header(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    if not is_current_user_agent():
        abort(403)
    global ALL_USER_DATA
    return jsonify(ALL_USER_DATA)

@app.route('/all_open_deals', methods = ['GET'])
def get_all_open_deals():
    @after_this_request
    def add_header(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    if not (is_current_user_agent() or is_current_user_buyer()):
        abort(403)
    global OPEN_DEALS
    print "#############################################"
    print "OPEN DEALS: ", OPEN_DEALS
    print "#############################################"
    return jsonify(OPEN_DEALS)

@app.route('/open_deal/<deal_id>', methods = ['GET'])
def get_open_deal_data(deal_id):
    @after_this_request
    def add_header(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response

    deal_id = is_valid_open_deal_id(deal_id)
    if not (is_current_user_agent() or is_current_user_buyer()):
        abort(403)
    global OPEN_DEALS
    return jsonify(OPEN_DEALS[deal_id])

@app.route('/', methods = ['POST', 'GET'])
def home():
    if not loggedIn():
        return render_template("home.html")
    else:
        return redirect("/dashboard")

@app.route('/signup', methods = ['POST', 'GET'])
def signup():
    return render_template("signup.html")

@app.route('/signup/verify', methods = ['POST', 'GET'])
def signup_result():
    if request.method == 'POST':
        form_data = request.form.to_dict()
        form_data = clean_input(form_data)
        if validate(form_data):
            store_data(form_data)
            load_all_user_data()
            pass
            # add some flash message etc here to show that the user has successfully created an account
        else:
            return redirect("/signup")
    return redirect("/")

@app.route('/login', methods = ['POST', 'GET'])
def login():
    if request.method == 'POST':
        form_data = request.form.to_dict()
        form_data = clean_input(form_data)
        if verify_credentials(form_data):
            global CURRENT_USER
            CURRENT_USER = form_data["phone"]
            load_current_user_data(CURRENT_USER)
            # flash("Login Done!")
            return redirect("/dashboard")
    error = "Login Details are wrong"
    return render_template("home.html", error=error)

@app.route('/logout', methods = ['POST', 'GET'])
def logout():
    global CURRENT_USER, CURRENT_USER_DETAIL
    CURRENT_USER = ""
    CURRENT_USER_DETAIL = {}
    return redirect("/")

@app.route('/dashboard', methods = ['POST', 'GET'])
def dashboard():
    if not loggedIn():
        return redirect("/")
    return render_template(CURRENT_USER_DETAIL["user_type"] + "_mp.html", name=CURRENT_USER_DETAIL["name"])

@app.route('/dashboard/newdeal', methods = ['POST', 'GET'])
def newdeal():
    global CURRENT_USER, CURRENT_USER_DETAIL, CONTRACT_ADDRESS
    if CURRENT_USER == "" or CURRENT_USER_DETAIL.get("user_type", None) not in ["farmer", "agent"]:
        return redirect("/")
    return render_template(CURRENT_USER_DETAIL["user_type"]+"_promise.html")

@app.route('/dashboard/newopendeal', methods = ['POST', 'GET'])
def newopendeal():
    global CURRENT_USER_DETAIL
    if CURRENT_USER_DETAIL.get("user_type", None) != "agent":
        return redirect("/")
    return render_template("agent_open_promise.html")

@app.route('/dashboard/mydeals', methods = ['POST', 'GET'])
def mydeals():
    global CURRENT_USER, CURRENT_USER_DETAIL, CONTRACT_ADDRESS
    if CURRENT_USER == "" or CURRENT_USER_DETAIL.get("user_type", None) not in ["farmer", "buyer", "agent"]:
        return redirect("/")
    return render_template(CURRENT_USER_DETAIL["user_type"]+"_query.html", user_type=CURRENT_USER_DETAIL["user_type"], farmer_pkey=CURRENT_USER_DETAIL["pkey"], contract_address=CONTRACT_ADDRESS)

@app.route('/dashboard/mydeals/<deal_id>', methods = ['POST', 'GET'])
def mydeal(deal_id):
    global CONTRACT_ADDRESS, CURRENT_USER_DETAIL, DEAL_ID
    DEAL_ID = deal_id
    return render_template("deal_details.html", dealID=deal_id, contractAddress=CONTRACT_ADDRESS, userInfo=CURRENT_USER_DETAIL)

@app.route('/dashboard/myopendeals', methods = ['POST', 'GET'])
def myopendeals():
    if not is_current_user_agent():
        return redirect("/")
    return render_template("marketplace.html")

@app.route('/market', methods = ['POST', 'GET'])
def market_place():
    if not is_current_user_buyer():
        return redirect("/")
    return render_template("marketplace.html")

@app.route('/publish_deal', methods = ['POST', 'GET'])
def publish_deal():
    if not is_current_user_agent():
        abort(403)
    if request.method == 'POST':
        global CURRENT_USER_DETAIL, OPEN_DEAL_KEYS, OPEN_DEALS
        form_data = request.form.to_dict()
        form_data = clean_input(form_data)
        ordered_data = []
        ordered_data.append(int(time.time()))
        ordered_data.append(CURRENT_USER_DETAIL["pkey"])
        ordered_data.append(form_data["item_name"])
        ordered_data.append(int(form_data["item_total_qty"]))
        item_price = int(form_data["item_price"])
        item_price_unit = form_data["item_per"]
        if item_price_unit == "perquintle":
            item_price /= 100
        elif item_price_unit == "perton":
            item_price /= 1000
        elif item_price_unit != "perkg":
            abort(404)
        ordered_data.append(int(item_price))
        ordered_data.append(int(form_data["daysToDeliver"]))
        ordered_data.append([])
        print "###############################################"
        print "OPEN DEALS:", OPEN_DEALS
        print "###############################################"
        store_open_deal(ordered_data)
        load_open_deals()
        return redirect("/dashboard/myopendeals")
    return redirect("/")

@app.route('/register_interest/<deal_id>', methods = ['POST', 'GET'])
def show_interest(deal_id):
    if not is_current_user_buyer():
        abort(403)
    deal_id = is_valid_open_deal_id(deal_id)
    if deal_id == -1:
        abort(404)
    global OPEN_DEALS, OPEN_DEALS_FILE, CURRENT_USER_DETAIL, OPEN_DEAL_KEYS
    if deal_id + 1 > len(OPEN_DEALS):
        return redirect("/market")
    if CURRENT_USER_DETAIL["pkey"] not in OPEN_DEALS[deal_id]["interestedBuyers"]:
        OPEN_DEALS[deal_id]["interestedBuyers"].append(CURRENT_USER_DETAIL["pkey"])
        update_open_deals_file()
    return redirect("/market")

@app.route('/seal_deal/<deal_id>/<confirmed_buyer>', methods = ['POST', 'GET'])
def seal_the_deal(deal_id, confirmed_buyer):
    if not is_current_user_agent():
        abort(403)
    deal_id = is_valid_open_deal_id(deal_id)
    if deal_id == -1:
        abort(404)
    global OPEN_DEALS
    print "&&&&&&&&&&&&& CONFIRMED BUYER: ", confirmed_buyer
    print "&&&&&&&&&&&&& INTERESTED BUYER: ", OPEN_DEALS[deal_id]["interestedBuyers"]
    if confirmed_buyer not in OPEN_DEALS[deal_id]["interestedBuyers"]:
        abort(404)
    OPEN_DEALS[deal_id]["confirmed"] = confirmed_buyer
    return render_template("agent_promise.html")

@app.route('/delete_deal/<deal_id>', methods = ['POST', 'GET'])
def delete_the_deal(deal_id):
    if not is_current_user_agent():
        abort(403)
    deal_id = is_valid_open_deal_id(deal_id)
    if deal_id == -1:
        abort(404)
    global OPEN_DEALS, CURRENT_USER_DETAIL
    if OPEN_DEALS[deal_id]["creator"] != CURRENT_USER_DETAIL["pkey"]:
        abort(403)
    del OPEN_DEALS[deal_id]
    update_open_deals_file()
    return render_template("agent_promise.html")

@app.errorhandler(403)
def page_not_found(error):
    return render_template("403.html", error=error), 403

@app.errorhandler(404)
def page_not_found(error):
    return render_template("404.html", error=error), 404

@app.route('/buyer/main_page', methods = ['POST', 'GET'])
def buyer_mp():
    return render_template("buyer_mp.html")

@app.route('/buyer/view', methods = ['POST', 'GET'])
def buyer_view():
    return render_template("buyer_view.html")

@app.route('/buyer/loi', methods = ['POST', 'GET'])
def buyer_loi():
    return render_template("buyer_loi.html")

@app.route('/buyer/pop', methods = ['POST', 'GET'])
def buyer_pop():
    return render_template("buyer_pop.html")

@app.route('/buyer/query', methods = ['POST', 'GET'])
def buyer_query():
    return render_template("buyer_query.html")

@app.route('/bank/main_page', methods = ['POST', 'GET'])
def bank_mp():
    return render_template("bank_mp.html")

def clean_input(form):
    for key, value in form.items():
        form[key] = str(value.encode('utf-8'))
    return form

def loggedIn():
    global CURRENT_USER
    return (CURRENT_USER != "")

def is_current_user_farmer():
    global CURRENT_USER_DETAIL
    return loggedIn() and CURRENT_USER_DETAIL.get("user_type", None) == "farmer"

def is_current_user_agent():
    global CURRENT_USER_DETAIL
    return loggedIn() and CURRENT_USER_DETAIL.get("user_type", None) == "agent"

def is_current_user_buyer():
    global CURRENT_USER_DETAIL
    return loggedIn() and CURRENT_USER_DETAIL.get("user_type", None) == "buyer"

def load_current_user_data(CURRENT_USER):
    global CURRENT_USER_DETAIL, USER_DETAILS_FILE
    print (CURRENT_USER)
    with open(USER_DETAILS_FILE) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        for row in csv_reader:
            if (row[6] == CURRENT_USER):
                temp = row
    for i in range(len(REGISTRY_KEYS)):
        CURRENT_USER_DETAIL[REGISTRY_KEYS[i]] = temp[i]

def store_data(form):
    global REGISTRY_KEYS
    user_details = [form[key] for key in REGISTRY_KEYS]
    # print("address: ", form["address"])
    with open(USER_DETAILS_FILE, 'a') as csvfile:
        writer = csv.writer(csvfile, delimiter=',')
        writer.writerow(user_details)
    credentials = form["phone"] + form["pswd"] # phone number ensures uniqueness
    credentials = hashlib.sha256(credentials.encode()).hexdigest()
    with open(USER_CREDENTIALS_FILE, 'a') as csvfile:
        writer = csv.writer(csvfile, delimiter=',')
        writer.writerow([form["user_type"], credentials])

def store_open_deal(ordered_data):
    global OPEN_DEALS_FILE
    with open(OPEN_DEALS_FILE, 'a') as csvfile:
        writer = csv.writer(csvfile, delimiter=',')
        writer.writerow(ordered_data[:6] + ordered_data[6])

def load_open_deals():
    global OPEN_DEALS, OPEN_DEALS_FILE, OPEN_DEAL_KEYS
    OPEN_DEALS = []
    with open(OPEN_DEALS_FILE) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        for row in csv_reader:
            deal = {}
            for i, key in enumerate(OPEN_DEAL_KEYS[:6]):
                deal[key] = row[i]
            buyer_key = OPEN_DEAL_KEYS[6]
            deal[buyer_key] = []
            for i in range(6, len(row)):
                deal[buyer_key].append(row[i])
            OPEN_DEALS.append(deal)

def validate(form):
    global USER_INPUT_KEYS
    validations = []
    # print "USER INPUT KEYS: ", set(form.keys())
    # print "EXPECTED USER INPUT KEYS: ", USER_INPUT_KEYS
    validations.append(set(form.keys()) == USER_INPUT_KEYS)
    validations.append(form["pswd"] == form["rpswd"])
    validations.append(len(form["pkey"]) == ETH_ADDRESS_LENGTH)
    # print "PUBLIC KEY: ", form["pkey"]
    # print "PUBLIC KEY LENGTH: ", len(form["pkey"])
    flag = True
    try:
        local = int(form["pkey"][2:], 16)
    except ValueError:
        flag = False
    validations.append(flag)
    phone_nos = []
    aadhaar_nos = []
    pkey_nos = []
    with open(USER_DETAILS_FILE, 'r') as csvfile:
        reader = csv.reader(csvfile)
        for user_data in reader:
            phone_nos.append(user_data[REGISTRY_KEYS.index("phone")])
            aadhaar_nos.append(user_data[REGISTRY_KEYS.index("aadhaar")])
            pkey_nos.append(user_data[REGISTRY_KEYS.index("pkey")])
        validations.append(form["phone"] not in phone_nos)
        validations.append(form["aadhaar"] not in aadhaar_nos)
        validations.append(form["pkey"] not in pkey_nos)
    print ("validations: " + str(validations))
    return all(validations)

def verify_credentials(form):
    input_credentials = form["phone"] + form["pswd"]
    input_credentials = hashlib.sha256(input_credentials.encode()).hexdigest()
    with open(USER_CREDENTIALS_FILE, 'r') as csvfile:
        reader = csv.reader(csvfile)
        for user_credentials in reader:
            if form["user_type"] == user_credentials[0] and \
                input_credentials == user_credentials[1]:
                return True
    return False

def load_all_user_data():
    global CONTRACT_ADDRESS, USER_DETAILS_FILE, REGISTRY_KEYS, ALL_USER_DATA
    ALL_USER_DATA = {}
    with open(USER_DETAILS_FILE) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        for row in csv_reader:
            user_data = {}
            for i in range(len(REGISTRY_KEYS)):
                user_data[REGISTRY_KEYS[i]] = row[i]
            ALL_USER_DATA[user_data["pkey"]] = user_data
    ALL_USER_DATA["contractAddress"] = CONTRACT_ADDRESS

def is_valid_open_deal_id(deal_id):
    try:
        int(deal_id)
    except ValueError:
        return -1
    global OPEN_DEALS
    print "**********************CHECK DEAL ID :", deal_id
    print "**********************CHECK OPEN DEALS :", OPEN_DEALS
    index = 0
    for deal in OPEN_DEALS:
        if deal["id"] == deal_id:
            print "!!!!!!!!!!!!!!!!!!!!!!!!!! RETURNING", index
            return index
        index += 1
    print "$$$$$$$$$$$ RETURNING -1 !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    return -1

def update_open_deals_file():
    global OPEN_DEALS_FILE, OPEN_DEALS, OPEN_DEAL_KEYS
    with open(OPEN_DEALS_FILE, 'w') as csvfile:
        for deal in OPEN_DEALS:
            writer = csv.writer(csvfile, delimiter=',')
            deal = [deal[key] for key in OPEN_DEAL_KEYS]
            print "deal: ", deal
            writer.writerow(deal[:6] + deal[6])

if __name__ == '__main__':
    # global CURRENT_USER, CURRENT_USER_DETAIL
    # CURRENT_USER = ""
    # CURRENT_USER_DETAIL = {}
    load_all_user_data()
    load_open_deals()
    print "###############################################"
    print "OPEN DEALS:", OPEN_DEALS
    print "###############################################"
    app.run(debug=True)
