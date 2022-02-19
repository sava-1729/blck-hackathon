async function getUserContractABI() {
    window.userContractAddress = document.getElementById("oldTokenAddress").value
    $.getJSON('https://api-testnet.snowtrace.io/api?module=contract&action=getabi&address='+userContractAddress+'&apikey=IZZGKQ4HUIUUJY5WNWDQ9PJI88G2ZVAVXI', function (data) {
    var contractABI = "";
    contractABI = JSON.parse(data.result);
    if (contractABI != ""){
        window.userContract = new window.web3_avalanche.eth.Contract(contractABI, window.userContractAddress)
        if (window.userContract.methods.tokenURI != undefined && window.userContract.methods.tokenOfOwnerByIndex != undefined && window.userContract.methods.balanceOf != undefined && window.userContract.methods.burn != undefined) {
            document.getElementById("loadingwheel").hidden = false
            loadTokenDetails();
        } else {
            alert("Please enter the contract address of a contract which offers burnable, enumerable ERC 721 tokens.");
        }
    } else {
        alert("Either the contract address was invalid, or the requested contract is not verified on Snowtrace. Please contact the owner of the contract to get it verified.");
    }});
}

async function getAllTokenIDs() {
    try {
        await switchToFuji();
    } catch (err) {
        confirm("Please switch to the Fuji network, select the Avalanche account which contains the token you wish to bridge, and try again.");
        return false
    }
    var balance = 0
    balance = Number(await window.userContract.methods.balanceOf(window.ethereum.selectedAddress).call())
    console.log("Balance", balance)
    window.tokenIDs = []
    window.tokenURIs = {}
    for (i = 0; i < balance; i++) {
        tokenID = Number(await window.userContract.methods.tokenOfOwnerByIndex(window.ethereum.selectedAddress, i).call())
        tokenIDs.push(tokenID);
        tokenURIs[tokenID] = await window.userContract.methods.tokenURI(tokenID).call()
        console.log(tokenID, " recorded.")
    }
    return true
}


async function loadTokenDetails() {
    result = await getAllTokenIDs()
    if (!result) {
        return false;
    } else {
        console.log("tokenIDs acquired")
        console.log(window.tokenIDs)
        console.log(window.tokenURIs)
    }
    select_tag = document.getElementById('oldToken');
    removeOptions(select_tag);
    window.tokenJSONs = {}
    window.tokenNames = {}
    console.log("about to begin looping")
    for (var i = 0; i < window.tokenIDs.length; i++) {
        window.tokenID = window.tokenIDs[i]
        url = window.tokenURIs[tokenID]
        window.tokenJSONs[tokenID] = (await (await fetch(url)).json())
        window.tokenNames[tokenID] = window.tokenJSONs[tokenID].name
        if (window.tokenNames[tokenID] == undefined) {
            window.tokenNames[tokenID] = "Token #" + String(tokenID)
        }
        // fetch(url)
        // .then(res => res.json())
        // .then((tokenFullJson) => {
        //     window.tokenJSONs[window.tokenID] = tokenFullJson
        //     if (tokenFullJson.name != undefined) {
        //         window.tokenNames[window.tokenID] = tokenFullJson.name
        //     } else {
        //         window.tokenNames[window.tokenID] = "Token #" + String(window.tokenID) 
        //     }
        // })
    }
    console.log(window.tokenJSONs)
    console.log(window.tokenNames)
    for (var i = 0; i < window.tokenIDs.length; i++){
        tokenID = window.tokenIDs[i]
        var opt = document.createElement('option');
        opt.value = tokenID;
        opt.innerHTML = tokenNames[tokenID];
        opt.title = "Token ID: " + String(tokenID);
        select_tag.appendChild(opt);
    }
    select_tag.disabled = false;
    showTokenDetails();
}

async function viewToken() {
    tokenID = document.getElementById("oldToken").value
    tokenURI = window.tokenURIs[tokenID]
    open(tokenURI);
}

async function updateImage() {
    console.log("Updating image")
    document.getElementById("bridgeButton").style.visibility = "visible";
    tokenID = document.getElementById("oldToken").value
    if (window.tokenJSONs[tokenID].image != undefined) {
        document.getElementById("tokenImg").src = window.tokenJSONs[tokenID].image
    }
    else {
        document.getElementById("tokenImg").src = "static/favico/avalanche.png"
    }
}

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
}
