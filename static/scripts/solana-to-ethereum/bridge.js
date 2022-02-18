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
          }
        }
      );
}

async function updateTokenID() {
    window.currentTokenID = Number(await currentContract.methods.numMinted().call());
}

async function mintH2H(tokenURI=undefined, cbFunction=()=>{}) {
    await updateTokenID();
    if (tokenURI == undefined) {
        tokenURI = document.getElementById("inputURI").value
    }
    console.log(tokenURI)
    const request = window.currentContract.methods.mint(tokenURI).encodeABI()
    callContractFunction(request, window.contractAddress).then((result)=> {
        alert("Congrats! Your Token has been bridged!! \n Please note your Token ID: " + String(window.currentTokenID+1) + "\n And the contract address: " + window.contractAddress + "\n Keep both these details safe :)");
        updateTokenID();
    });
}

async function burnSPLToken(tokenAddress, tokenAccountAddress, ownerPubKey, amount, cbFunction=()=>{}) {
	console.log("Burn called")
	burn_instrc = splToken.Token.createBurnInstruction(splToken.TOKEN_PROGRAM_ID, tokenAddress, tokenAccountAddress, ownerPubKey, [], amount)
	console.log("burn instr created")
	var transaction = new solanaWeb3.Transaction().add(burn_instrc)
	console.log("added to tx obj")
	transaction.recentBlockhash = (await web3_solana.getRecentBlockhash()).blockhash
	transaction.feePayer = solana.publicKey;
	var signature = await solana.signAndSendTransaction(transaction)
	console.log(signature)
};

async function bridgeToken(cbFunction=()=>{}) {
    tokenAccountAddress = document.getElementById("oldToken").value
	console.log(tokenAccountAddress)
	tokenAccountAddressObj = new solanaWeb3.PublicKey(tokenAccountAddress)
    tokenAddress = window.tokenAddresses[tokenAccountAddress]
    await burnSPLToken(tokenAddress, tokenAccountAddressObj, window.solana.publicKey, 1)
    tokenURI = window.tokenURIs[tokenAccountAddress]
    await mintH2H(tokenURI);
}

async function transferH2H(sender, receiver, tokenID, cbFunction=()=>{}) {
    const request = window.currentContract.methods.safeTransferFrom(sender, receiver, tokenID).encodeABI()
    callContractFunction(request, window.contractAddress)
}
