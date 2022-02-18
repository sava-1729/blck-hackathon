async function getTokenAddresses()
{
    window.tokens = (await web3_solana.getTokenAccountsByOwner(getPublicKey(), {"programId": splToken.TOKEN_PROGRAM_ID})).value
    // console.log(window.tokens)
    window.tokenAccountAddresses = []
    window.tokenAddresses = {}
    window.tokenAccountsInfo = {}
    for (index = 0; index < window.tokens.length; index++) {
        tokenAccountAddress = window.tokens[index].pubkey;
        tokenAccountBalance = (await web3_solana.getTokenAccountBalance(tokenAccountAddress)).value.amount
        if (tokenAccountBalance == 1) {
            window.tokenAccountAddresses.push(tokenAccountAddress)
            tokenAccountInfo = await web3_solana.getParsedAccountInfo(tokenAccountAddress)
            window.tokenAccountsInfo[tokenAccountAddress] = tokenAccountInfo
            // tokenAddress = (await web3_solana.getParsedAccountInfo(tokenAccountAddress)).value.data.parsed.info.mint
            window.tokenAddresses[tokenAccountAddress] = new solanaWeb3.PublicKey(tokenAccountInfo.value.data.parsed.info.mint)
        }
    }
    return window.tokenAddresses
}

async function getTokenMetadata() {
    return (await metaplex.programs.metadata.Metadata.findByOwnerV2(web3_solana, getPublicKey()))
}

async function getTokenJSON(tokenAddress=undefined, cbFunction=()=>{}) {
    var request = new XMLHttpRequest()
    request.open("GET", "/blockchainapi/"+tokenAddress, false)
    request.send(null)
    userTokenJSON = JSON.parse(request.responseText)
    if (userTokenJSON.data == undefined) {
        return tokenAddress
    }
    // window.open(userTokenURI.data.uri)
    return userTokenJSON
}

async function viewToken() {
    tokenAccountAddress = document.getElementById("oldToken").value
    tokenURI = window.tokenURIs[tokenAccountAddress]

    if (tokenURI.substring(0, 4) == "http") {
        open(tokenURI);
    }
    else {
        open("https://solscan.io/address/"+tokenAccountAddress+"?cluster=devnet")
    }
}

async function loadTokenDetails() {
    select_tag = document.getElementById('oldToken');
    removeOptions(select_tag);
    await getTokenAddresses();
    window.tokenJSONs = {}
    for (var i = 0; i < window.tokenAccountAddresses.length; i++) {
        tokenAccountAddress = window.tokenAccountAddresses[i].toBase58()
        tokenAddress = (window.tokenAddresses[tokenAccountAddress]).toBase58()
        tokenJSONs[tokenAccountAddress] = await getTokenJSON(tokenAddress)
    }
    console.log(tokenJSONs)
    window.tokenNames = {}
    window.tokenURIs = {}
    for (var i = 0; i < window.tokenAccountAddresses.length; i++) {
        tokenAccountAddress = window.tokenAccountAddresses[i].toBase58()
        tokenJSON = tokenJSONs[tokenAccountAddress]
        if (tokenJSON.data == undefined) {
            tokenNames[tokenAccountAddress] = tokenJSONs[tokenAccountAddress]
            tokenURIs[tokenAccountAddress] = "https://solscan.io/address/"+tokenAccountAddress+"?cluster=devnet"
        }
        else {
            tokenNames[tokenAccountAddress] = tokenJSONs[tokenAccountAddress].data.name
            tokenURIs[tokenAccountAddress] = tokenJSONs[tokenAccountAddress].data.uri
        }
    }
    console.log(tokenNames)
    for (var i = 0; i < window.tokenAccountAddresses.length; i++){
        var opt = document.createElement('option');
        tokenAccountAddress = window.tokenAccountAddresses[i].toBase58()
        opt.value = tokenAccountAddress;
        opt.innerHTML = tokenNames[tokenAccountAddress];
        select_tag.appendChild(opt);
    }
    select_tag.disabled = false;
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
    tokenAccountAddress = document.getElementById("oldToken").value
    if (window.tokenJSONs[tokenAccountAddress].data != undefined) {
        url = window.tokenJSONs[tokenAccountAddress].data.uri;
        fetch(url)
        .then(res => res.json())
        .then((tokenFullJson) => {
            document.getElementById("tokenImg").src = tokenFullJson.image
        })
    }
    else {
        document.getElementById("tokenImg").src = "static/favico/solana.jpg"
    }
    document.getElementById("bridge").style.visibility="visible";
}

function removeOptions(selectElement) {
    var i, L = selectElement.options.length - 1;
    for(i = L; i >= 0; i--) {
       selectElement.remove(i);
    }
}
