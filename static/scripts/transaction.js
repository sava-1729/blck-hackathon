async function transferSOL(amountSol=1, receiverAddress="GBgN4zftvZERm1epuWQXa5r46qALUmgdY8GQdwMDrprd") {
    console.log("Public key of the emitter: ",window.solana.publicKey);

    var recieverWallet = new solanaWeb3.PublicKey(receiverAddress);

    var transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
        fromPubkey: window.solana.publicKey,
        toPubkey: recieverWallet,
        lamports: Number(solanaWeb3.LAMPORTS_PER_SOL)*amountSol //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
      }),
    );

    transaction.feePayer = window.solana.publicKey;
    blockhashObj = await window.web3_solana.getRecentBlockhash();
    transaction.recentBlockhash = await blockhashObj.blockhash;

    if(transaction) {
      console.log("Txn created successfully");
      window.transactionObj = await transaction
    }

    signed = await window.solana.signTransaction(transaction);
    let signature = await window.web3_solana.sendRawTransaction(signed.serialize());
    await window.web3_solana.confirmTransaction(signature);

    console.log("Signature: ", signature);
}
