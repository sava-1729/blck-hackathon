function setup()
{
    window.web3_solana = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"), "confirmed")
    window.web3_ethereum = new Web3(window.ethereum)
    url = "static/build/HighwayToHell.json"
    fetch(url).then(res => res.json()).then((out) => {
        window.H2H_json = out;
        window.ABI = window.H2H_json.abi
        window.contractAddress = window.H2H_json.contractAddress
        window.currentContract = new window.web3_ethereum.eth.Contract(window.ABI, window.contractAddress)
    });
    console.log("SETUP COMPLETE.")
}

function showTokenDetails(arg) {
    document.getElementById("loadingwheel").hidden = true;
    document.getElementById("oldToken").disabled = false;
    document.getElementById("viewButton").disabled = false;
    document.getElementById("bridgeButton").disabled = false;
    updateImage().then((out)=>{ console.log("Hello"); document.getElementById("tokenImg").hidden = false;});
}

async function connectPhantom()
{
    window.flag = "phantom"
    console.log("Phantom connecting!")
    document.getElementById("loadingwheel").hidden = false
    try {
        const resp = await window.solana.connect();
    } catch (err) {
        alert("Please connect your Phantom wallet to bridge tokens.")
        return false
    }
    loadTokenDetails().then(showTokenDetails)
}

async function connectMetamask()
{
    await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x3' }], // chainId must be in hexadecimal numbers
    });
    const resp = await ethereum.request({method:'eth_accounts'})
    if (resp[0] == undefined) {
        // alert("Please connect your MetaMask wallet in order to bridge your NFT!")
        ethereum.request({method:'eth_requestAccounts'})
    }
}

async function connectSolflare()
{
    window.flag = "solflare"
    console.log("Solflare connecting!")
    document.getElementById("loadingwheel").hidden = false
    try {
        const resp = await window.solflare.connect();
        window.solflare.on("connect", () => console.log("connected!"));
    } catch (err) {
        alert("Please connect your Solflare wallet to bridge tokens.")
        return false
    }
    loadTokenDetails().then(showTokenDetails)
}

async function viewEthToken() {
    tokenID = Number(document.getElementById("ethTokenID").value)
    uri = await window.currentContract.methods.tokenURI(tokenID).call();
    open(uri);
}

function getPublicKey()
{
    if (window.flag == "solflare")
    {
        return window.solflare.publicKey
    }
    else
    {
        return window.solana.publicKey
    }
}
