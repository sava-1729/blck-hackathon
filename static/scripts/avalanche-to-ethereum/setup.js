async function setup() {
    const net = window.ethereum.networkVersion
    if (net == '43113') {
        if (!built_S2H) {
            await buildS2HContract();
        }
        if (!built_H2H) {
            await buildH2HContract();
        }
    }
    if (net == '3') {
        if (!built_H2H) {
            await buildH2HContract();
        }
        if (!built_S2H) {
            await buildS2HContract();
        }
    }
    // window.ethereum.on('accountsChanged', function (accounts) { 
    //     alert("Warning: Accounts Changed \n Make sure you have selected the correct account.")
    // });
    confirm("Please switch to the Avalanche account which contains the tokens you wish to bridge.")
    await switchToFuji();
    connectMetamask().then(() => {document.getElementById("oldTokenAddress").disabled = false});

    console.log("SETUP COMPLETE.")
}

async function buildH2HContract() {
    try {
        await switchToRopsten();
    } catch {
        if(confirm("Please allow switching to the Ropsten network, so as to set up the bridging protocol.")) {
            await buildH2HContract(); return true;
        } else {
            return false;
        }
    }
    window.web3_ethereum = new Web3(window.ethereum)
    contract_url_eth = "static/build/HighwayToHell.json"
    fetch(contract_url_eth).then(res => res.json()).then((out) => {
        H2H_json = out;
        window.ABI_H2H = H2H_json.abi
        window.contractAddress_H2H = H2H_json.contractAddress
        window.currentContract_H2H = new window.web3_ethereum.eth.Contract(window.ABI_H2H, window.contractAddress_H2H)
        window.built_H2H = true
        console.log("Built H2H.")
    });
}

async function buildS2HContract() {
    try {
        await switchToFuji();
    } catch {
        if(confirm("Please allow switching to the Fuji network, so as to set up the bridging protocol.")) {
            await buildS2HContract(); return true;
        } else {
            return false;
        }
    }
    window.web3_avalanche = new Web3(window.ethereum)
    contract_url_ava = "static/build/StairwayToHeaven.json"
    fetch(contract_url_ava).then(res => res.json()).then((out) => {
        H2H_json = out;
        window.ABI_S2H = H2H_json.abi
        window.contractAddress_S2H = H2H_json.contractAddress
        window.currentContract_S2H = new window.web3_avalanche.eth.Contract(window.ABI_S2H, window.contractAddress_S2H)
        window.built_S2H = true
        console.log("Built S2H.")
    });
}

function switchToRopsten() {
    return window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x3' }], // chainId must be in hexadecimal numbers
    });
}

function switchToFuji() {
    return window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA869' }], // chainId must be in hexadecimal numbers
    });
}

async function connectMetamask() {
    try {
        ethereum.request({method:'eth_requestAccounts'});

    } catch (err) {
        alert("Please allow connecting to your Metamask wallet to bridge tokens.")
    }
}

function showTokenDetails(arg) {
    document.getElementById("loadingwheel").hidden = true;
    document.getElementById("oldToken").disabled = false;
    document.getElementById("viewButton").disabled = false;
    document.getElementById("bridgeButton").disabled = false;
    updateImage().then((out)=>{ console.log("Hello"); document.getElementById("tokenImg").hidden = false;});
}

async function viewEthToken() {
    tokenID = Number(document.getElementById("ethTokenID").value)
    uri = await window.currentContract_H2H.methods.tokenURI(tokenID).call();
    open(uri);
}