async function burnToken(mint, tokenAddress, ownerPubKey, amount, cbFunction=()=>{}) {
    window.txObj = txObj = new solanaWeb3.Transaction({feePayer: ownerPubKey})
    const burn_instrc = splToken.Token.createBurnInstruction(window.spl_program_id, mint, tokenAddress, ownerPubKey, [], amount)
    txObj = txObj.add(burn_instrc)
    txObj.recentBlockhash = (await web3_solana.getRecentBlockhash()).blockhash;
    // console.log("HellooOooooooo")
    // txObj.recentBlockhash = blockhash_resp.blockhash;
    // console.log("HellooOooooooo")
    txObj.feePayer = ownerPubKey
    txObj.nonceInfo = (await web3_solana.getNonce(tokenAddress)).nonce;
    txObj.programId = window.spl_program_id
    const signedTransaction = await window.solana.signTransaction(txObj);
    const signature = await web3_solana.sendRawTransaction(signedTransaction.serialize());
    return signature
};
