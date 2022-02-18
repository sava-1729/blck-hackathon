async function callContractFunction(abiEncodedRequest, contractAddress, cbFunction=()=>{}) {
    const resp = await ethereum.request({method:'eth_accounts'})
    const userPubKey = resp[0]
    if (userPubKey == undefined) {
        alert("Please connect your MetaMask wallet in order to bridge your NFT!");
        connectMetamask();
        return false;
    }
    const txCount = await window.web3_ethereum.eth.getTransactionCount(userPubKey)
    const gasPrice = await window.web3_ethereum.eth.getGasPrice()
    var txData = {
        nonce : window.web3_ethereum.utils.toHex(txCount),
        gasLimit : window.web3_ethereum.utils.toHex(5000000),
        gasPrice : window.web3_ethereum.utils.toHex(gasPrice),
        to : contractAddress,
        data : abiEncodedRequest,
        from : userPubKey
    }
    // window.ethereum.send({method : 'eth_sendTransaction', params : [txData]}).then(cbFunction)
    window.ethereum.sendAsync(
        {
          method: 'eth_sendTransaction',
          params: [txData],
          from: ethereum.selectedAddress, // Provide the user's account to use.
        },
        (err, response) => {
          if (err) {
            // Handle the error
          } else {
            // This always returns a JSON RPC response object.
            // The result varies by method, per the RPC method specification
            // For example, this method will return a transaction hash on success.
            console.log("Tx Hash: ", response.result);
            document.getElementById("toast-card").style.display = "block";
            document.getElementById("toast-text").innerHTML = "Please note your Token ID: "+String(window.currentTokenID+1);
            alert("Congrats! Your Token has been bridged!! \n Please note your Token ID: "+ String(window.currentTokenID+1)+ "\n And keep it safe :)");
            updateTokenID();
          }
        }
      );
}

async function updateTokenID() {
    window.currentTokenID = Number(await currentContract.methods.numMinted().call());
}

async function mintH2H(tokenURI=undefined, cbFunction=()=>{}) {
    if (tokenURI == undefined) {
        tokenURI = document.getElementById("inputURI").value
    }
    console.log(tokenURI)
    const request = window.currentContract.methods.getBridgedNFT(tokenURI).encodeABI()
    callContractFunction(request, window.contractAddress)
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

async function getTokenURI(tokenAddress=undefined, cbFunction=()=>{}) {
    tokenJSON = await getTokenJSON(tokenAddress)
    console.log(tokenJSON)
    if (tokenJSON.data == undefined) {
        return tokenAddress
    }
    return tokenJSON.data.uri
}

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

async function viewToken() {
    index = document.getElementById("oldToken").value
    tokenAddress = window.tokenAddresses[index].toBase58()
    tokenURI = await getTokenURI(tokenAddress)

    if (tokenURI.substring(0, 4) == "http") {
        open(tokenURI);
        // getJSON(tokenURI,
        //     function(err, data) {
        //     if (err !== null) {
        //         alert('Something went wrong: ' + err);
        //     } else {
        //         alert('Your query count: ' + data.query.count);
        //         console.log(data);
        //     }
        // });
    }
    else {
        // let url = "https://solscan.io/address/"+window.tokens[index].pubkey.toBase58()+"?cluster=devnet";
        // getJSON(url,
        //     function(err, data) {
        //     if (err !== null) {
        //         alert('Something went wrong: ' + err);
        //     } else {
        //         alert('Your query count: ' + data.query.count);
        //         console.log(data);
        //     }
        // });
        open("https://solscan.io/address/"+window.tokens[index].pubkey.toBase58()+"?cluster=devnet")
    }
}

async function bridgeToken(cbFunction=()=>{}) {
    index = document.getElementById("oldToken").value
    tokenAddress = window.tokenAddresses[index].toBase58()
    console.log(tokenAddress, window.tokens[index].pubkey.toBase58(), window.solana.publicKey.toBase58())
    await burnToken(window.tokenAddresses[index], window.tokens[index].pubkey, window.solana.publicKey, 1)
    console.log(tokenAddress)
    tokenURI = await getTokenURI(tokenAddress)
    mintH2H(tokenURI);
}

async function transferH2H(sender, receiver, tokenID, cbFunction=()=>{}) {
    const request = window.currentContract.methods.safeTransferFrom(sender, receiver, tokenID).encodeABI()
    callContractFunction(request, window.contractAddress)
}
