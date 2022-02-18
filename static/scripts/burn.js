// import * as web3 from '@solana/web3.js';
// import * as splToken from '@solana/spl-token';

async function burnToken(tokenAddress, tokenAccountAddress, ownerPubKey, amount, cbFunction=()=>{}) {
	burn_instrc = splToken.Token.createBurnInstruction(splToken.TOKEN_PROGRAM_ID, tokenAddress, tokenAccountAddress, ownerPubKey, [], amount)
	var transaction = new solanaWeb3.Transaction().add(burn_instrc)
	
  	transaction.recentBlockhash = (await web3_solana.getRecentBlockhash()).blockhash
	transaction.feePayer = get_pubKey()
	if (window.flag == "solflare")
	{
		const signedTransaction = await window.solflare.signTransaction(transaction);
		var signature = await web3_solana.sendRawTransaction(signedTransaction.serialize());
	}
	else
	{
		var signature = await window.solana.signAndSendTransaction(transaction)
	}
	console.log(signature)
};


async function transferSPLToken(receiverAddress, amount, tokenAddress) {
	receiver = new solanaWeb3.PublicKey(receiverAddress);
	tokenMintAddress = new solanaWeb3.PublicKey(tokenAddress);
	pubKey = get_pubKey()
	myToken = new splToken.Token(
			web3_solana,
			tokenMintAddress,
			splToken.TOKEN_PROGRAM_ID,
			publicKey
		);
		// Create associated token accounts for my token if they don't exist yet
	var fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(solana.publicKey)
	var associatedDestinationTokenAddr = await splToken.Token.getAssociatedTokenAddress(
		myToken.associatedProgramId,
		myToken.programId,
		tokenMintAddress,
		receiver
	);
	var INSTRUCTIONS = []
	receiverAssociatedAccount = await web3_solana.getAccountInfo(associatedDestinationTokenAddr)
	pubKey = get_pubKey()

	if (receiverAssociatedAccount == null) {
			INSTRUCTIONS.push(splToken.Token.createAssociatedTokenAccountInstruction(
					myToken.associatedProgramId,
					myToken.programId,
					tokenMintAddress,
					associatedDestinationTokenAddr,
					receiver,
					publicKey
				));
	}
	INSTRUCTIONS.push(splToken.Token.createTransferInstruction(
			splToken.TOKEN_PROGRAM_ID,
			fromTokenAccount.address,
			associatedDestinationTokenAddr,
			publicKey,
			[],
			amount
		));
	var transaction = new solanaWeb3.Transaction().add(...INSTRUCTIONS);
	pubKey = get_pubKey()
	
	transaction.recentBlockhash = (await web3_solana.getRecentBlockhash()).blockhash
	// Sign transaction, broadcast, and confirm

	if (window.flag == "solflare")
	{
		const signedTransaction = await window.solflare.signTransaction(transaction);
		var signature = await web3_solana.sendRawTransaction(signedTransaction.serialize());
	}
	else
	{
		var signature = await window.solana.signAndSendTransaction(transaction)
	}
	console.log(signature)
}

async function testingModuleExport() {
	console.log("Test function called!")
}



