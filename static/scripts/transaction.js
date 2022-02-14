function setupTransaction() {
    // Construct a `Keypair` from secret key
    // var from = web3.Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);
    // // Generate a new random public key
    // var to = web3.Keypair.generate();
    // Add transfer instruction to transaction
    var transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: new solanaWeb3.PublicKey("Hnajc43ptd5knuReumUtonts9BRi5MAxHcxKGinJqDDP"),
            toPubkey: new solanaWeb3.PublicKey("GBgN4zftvZERm1epuWQXa5r46qALUmgdY8GQdwMDrprd"),
            lamports: solanaWeb3.LAMPORTS_PER_SOL / 100,
        })
    );
    window.simpleTXOBJ = transaction
}

    // window.solana.signAndSendTransaction(
    // // Sign transaction, broadcast, and confirm
    // var signature = await web3.sendAndConfirmTransaction(
    //     connection,
    //     transaction,
    //     [from]
    // );
    // console.log("SIGNATURE", signature);
    // console.log("SUCCESS");