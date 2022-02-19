async function callContractFunction(abiEncodedRequest, contractAddress, web3Obj, flag, cbFunction=()=>{}) {
    const userPubKey = ethereum.selectedAddress
    const txCount = await web3Obj.eth.getTransactionCount(userPubKey)
    const gasPrice = await web3Obj.eth.getGasPrice()
    var txData = {
        nonce : web3Obj.utils.toHex(txCount),
        gasLimit : web3Obj.utils.toHex(5000000),
        gasPrice : web3Obj.utils.toHex(gasPrice),
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
				console.log(err)
				// Handle the error
			} else {
				console.log("Tx Hash: ", response.result);
				if (flag == "mint") {
                    document.getElementById("bridgeButton").innerHTML = "Bridge (step 1)"
                    document.getElementById("bridgeButton").onclick = bridgeToken1
                    alert("Congrats! Your Token has been bridged!! \n Please note your Token ID: " + String(window.currentTokenID+1) + "\n And the contract address: " + window.contractAddress_H2H + "\n Keep both these details safe :)");
				} else {
					document.getElementById("bridgeButton").innerHTML = "Bridge (step 2)";
                    document.getElementById("bridgeButton").onclick = bridgeToken2;
                    alert("Your original NFT has been burnt. Please switch to the Ropsten network, and select the Ethereum account where your new token should be bridged to. Then, click on the 'Bridge (step 2)' button");
				}
			}
        });
}

async function updateTokenID() {
    window.currentTokenID = Number(await currentContract_H2H.methods.numMinted().call());
}

async function mintH2H(tokenURI=undefined, cbFunction=()=>{}) {
    console.log(tokenURI)
    const request = window.currentContract_H2H.methods.mint(tokenURI).encodeABI()
    return (await callContractFunction(request, window.contractAddress_H2H, window.web3_ethereum, "mint"));
}

async function mintS2H(tokenURI=undefined, cbFunction=()=>{}) {
    if (tokenURI == undefined) {
        tokenURI = document.getElementById("inputURI").value
    }
    console.log(tokenURI)
    const request = window.currentContract_S2H.methods.mint(tokenURI).encodeABI()
    callContractFunction(request, window.contractAddress_S2H, window.web3_avalanche, "mint")
}

async function burnAvaToken(tokenID, cbFunction=()=>{}) {
    try {
        switchToFuji();
        alert("Please select the Avalanche account which contains this token.")
    } catch (err) {
        alert("You need to switch to the Fuji network to burn your existing token.")
        console.log(err)
        return false;
    }
    const request = window.currentContract_S2H.methods.burn(tokenID).encodeABI()
    return (await callContractFunction(request, window.contractAddress_S2H, window.web3_avalanche, "burn"))
};

async function bridgeToken1(cbFunction=()=>{}) {
    tokenID = Number(document.getElementById("oldToken").value)
    window.newTokenURI = window.tokenURIs[tokenID]
	try {
        await switchToFuji();
		await burnAvaToken(tokenID);
        
	} catch (err) {
		alert("Token bridging failed.")
        console.log(err)
		return false;
	}
}

async function bridgeToken2(cbFunction=()=>{}) {
	try {
        await switchToRopsten();
        await updateTokenID();
		await mintH2H(newTokenURI);
	} catch (err) {
		alert("Token bridging failed.")
        console.log(err)
		return false;
	}
}
