function setup()
{
    var request = new XMLHttpRequest()
    request.open("GET", "/static/build/HighwayToHell.abi", false)
    request.send(null)
    window.ABI = JSON.parse(request.responseText)
    request.open("GET", "/contract_address", false)
    request.send(null)
    // ethereum.request({method:'eth_requestAccounts'})
    // window.ethereum.enable()
    window.web3_solana = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"), "confirmed")
    window.spl_program_id = new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    window.web3_ethereum = new Web3(window.ethereum)
    window.contractAddress = JSON.parse(request.responseText)
    window.currentContract = new window.web3_ethereum.eth.Contract(window.ABI, window.contractAddress)
    updateTokenID();
    // connectPhantom();
    console.log("SETUP COMPLETE.")
}

async function connectMetamask()
{
    const resp = await web3_ethereum.request({method:'eth_accounts'})
    const userPubKey = resp[0]
    if (userPubKey == undefined) {
        // alert("Please connect your MetaMask wallet in order to bridge your NFT!")
        ethereum.request({method:'eth_requestAccounts'})
    }
}

async function showSolanaWallets() {

    document.getElementById("solana-wallets").style.display = "block";
    document.getElementById("avax-wallets").style.display = "none";
    document.getElementById('dropdownMenuLink').innerHTML = "Solana → Ethereum";
}
async function showAVAXWallets() {
    
    document.getElementById("solana-wallets").style.display = "none";
    document.getElementById("avax-wallets").style.display = "block";
    document.getElementById('dropdownMenuLink').innerHTML = "AVAX → Ethereum";
}
async function loadTokenDetails() {
    window.tokenAddresses = await getTokenAddresses();
    tokenJSONs = []
    for (var i = 0; i < tokenAddresses.length; i++) {
        tokenJSONs.push(await getTokenJSON(tokenAddresses[i].toBase58()))
    }
    console.log(tokenJSONs)
    tokenNames = []
    for (var i = 0; i < tokenJSONs.length; i++) {
        if (tokenJSONs[i].data == undefined) {
            tokenNames.push(tokenJSONs[i])
        }
        else {
            tokenNames.push(tokenJSONs[i].data.name)

        }
    }
    console.log(tokenNames)
    select_tag = document.getElementById('oldToken');
    for (var i = 0; i < tokenNames.length; i++){
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = tokenNames[i];
        select_tag.appendChild(opt);
    }
    select_tag.disabled = false;
}

async function connectPhantom()
{
    document.getElementById("loadingwheel").hidden = false
    try {
        const resp = await window.solana.connect();
        resp.publicKey.toString()
        // 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo 
    } catch (err) {
        alert("Please connect your Phantom wallet to bridge tokens.")
        return false
        // { code: 4001, message: 'User rejected the request.' }
    }

    loadTokenDetails().then((out)=>{
        document.getElementById("loadingwheel").hidden = true;
        document.getElementById("oldToken").disabled = false;
        document.getElementById("viewButton").disabled = false;
        document.getElementById("bridgeButton").disabled = false;
        updateImage().then((out)=>{ console.log("Hello"); document.getElementById("tokenImg").hidden = false;});
    })
}

async function getTokenAddresses()
{
    window.tokens = (await web3_solana.getTokenAccountsByOwner(solana.publicKey, {"programId": window.spl_program_id})).value
    // console.log(window.tokens)
    window.tokenAddresses = []
    window.tokenAccountInfo = []
    for (index = 0; index < window.tokens.length; index++) {
        tokenAccount = window.tokens[index].pubkey;
        // console.log(tokenAccount.toBase58())
        window.tokenAccountInfo.push(await web3_solana.getParsedAccountInfo(tokenAccount))
        window.tokenAddress = (await web3_solana.getParsedAccountInfo(tokenAccount)).value.data.parsed.info.mint
        // console.log(window.tokenAddress)
        tokenAddresses.push(new solanaWeb3.PublicKey(tokenAddress))
    }
    return tokenAddresses
}

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

async function updateImage() {
    console.log("Updating image")
    index = document.getElementById("oldToken").value
    url = "static/favico/solana.jpg"
    document.getElementById("tokenImg").src = url
    if (window.tokenJSONs[index].data != undefined) {
        url = window.tokenJSONs[index].data.uri;
        fetch(url)
        .then(res => res.json())
        .then((tokenFullJson) => {
            document.getElementById("tokenImg").src = tokenFullJson.image
        })
    }
}

async function viewEthToken() {
    tokenID = Number(document.getElementById("ethTokenID").value)
    uri = await window.currentContract.methods.tokenURI(tokenID).call();
    open(uri);
}
