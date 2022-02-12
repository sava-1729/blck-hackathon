async function deployMinterContract() {
    var web3_lib = require('web3')
    var web3 = new web3_lib('https://ropsten.infura.io/v3/a1f0fc3853d04cbcb9cfd13a03009ec6')
    var tx_lib = require('ethereumjs-tx').Transaction
    var fs = require('fs');
    const OWNER_PUBLIC_KEY = "0x1705B37de26931EC373eD791A17a2FD6c129A7b3"
    const OWNER_PRIVATE_KEY = Buffer.from(process.env.PRIVATE_KEY, 'hex')
    const contractJSON = "static/build/HighwayToHell.bin";
    const BYTECODE = "0x" + fs.readFileSync(contractJSON, "utf-8")
    const txCount = await web3.eth.getTransactionCount(OWNER_PUBLIC_KEY)
    var gasPrice = await web3.eth.getGasPrice()
    var txData = {
        nonce : web3.utils.toHex(txCount),
        gasLimit : web3.utils.toHex(5000000),
        gasPrice : web3.utils.toHex(gasPrice),
        data : BYTECODE,
        from : OWNER_PUBLIC_KEY
    }
    const txObj = new tx_lib(txData, {chain:'ropsten', hardfork: 'petersburg'})
    txObj.sign(OWNER_PRIVATE_KEY)

    const serialized = txObj.serialize().toString('hex')
    const raw = '0x' + serialized
    console.log('DEPLOYING CONTRACT...')
    const receipt = await web3.eth.sendSignedTransaction(raw);
    console.log('CONTRACT DEPLOYED!')
    console.log('Contract Address:', receipt.contractAddress);
    process.env['contractAddress'] = receipt.contractAddress;
}
if (require.main === module) {
    deployMinterContract();
}
module.exports = {deployMinterContract}