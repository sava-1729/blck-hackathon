async function callContractFunction(abiEncodedRequest, contractAddress, cbFunction=()=>{}) {
    const txCount = await window.web3.eth.getTransactionCount(window.ethereum.selectedAddress)
    const gasPrice = await window.web3.eth.getGasPrice()
    var txData = {
        nonce : web3.utils.toHex(txCount),
        gasLimit : web3.utils.toHex(5000000),
        gasPrice : web3.utils.toHex(gasPrice),
        to : contractAddress,
        data : abiEncodedRequest,
        from : window.ethereum.selectedAddress
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
            console.log(response.result);
          }
        }
      );
}

async function mintH2H(cbFunction=()=>{}) {
    tokenURI = document.getElementById("inputURI").value
    console.log(tokenURI)
    const request = window.currentContract.methods.getBridgedNFT(tokenURI).encodeABI()
    callContractFunction(request, window.contractAddress)
}
