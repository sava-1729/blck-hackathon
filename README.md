# blck-hackathon

# PREREQUISITES

1) Install [Metamask](https://metamask.io/), and [Phantom](https://phantom.app/) (or [Solflare](https://solflare.com/)) on your browser before beginning.
2) Make sure that the relevant accounts for bridging are imported, and the following networks are enabled in your wallets:
    - Metamask - Ropsten Testnet
    - Metamask - [Avalanche FUJI C-chain](https://docs.avax.network/build/tutorials/smart-contracts/deploy-a-smart-contract-on-avalanche-using-remix-and-metamask/#step-1-setting-up-metamask)
    - Phantom - Devnet, or
      Solflare - Devnet
3) If you wish to run the server locally, install `Python` (tested on v3.9.5) and `Flask`.

# USAGE (HEROKU)
This project has been deployed on Heroku, and can be accessed at the URL: https://bridgetohell.herokuapp.com/

# USAGE (LOCAL SERVER)

To start the bridge locally, move to the base `blck-hackathon/` directory of this repository, and run:
`python app.py`

You can now access the bridge at the default URL: https://localhost:5000

Using the bridge is fairly simple.
1) On the homepage of the bridge, elect the bridge you wish to use
    - Solana to Ethereum
    - Avalanche to Ethereum
2) Depending on your choice in Step 1, choose and connect the relevant wallets. 
3) If you're bridging an Avalanche NFT, enter the contract address of the contract which minted your token.
   The minter contract must be a **burnable, enumerable, ERC721 contract** that has been **verified and published** on https://testnet.snowtrace.io/
   If your contract does not follow these standards, you can request the owner to create a new one that follows them, or you can use our _StairwayToHeaven_ contract (https://testnet.snowtrace.io/address/0xad212c24c9c8d822c71a6f34d02c04b856960163) to mint your own NFTs.
4) Based on the source account you have selected in the chosen wallets, a list of ERC 721 tokens will now be loaded.
5) From the dropdown menu, pick the token that you wish to bridge. If this token has an image associated with it, it will now be loaded.
6) In case you want to cross-check that the token is indeed the one you intend to bridge, you may click on `View Token Details`, which opens up the metadata of the selected token in a new tab.
7) Finally click on `Bridge`. You will now be requested to confirm two transactions, one by one - kindly confirm both in order to successfully bridge the token. Note that if you refresh the page, or reject any of the transactions, your NFT may be lost forever.
   If you're bridging an Avalanche token, then after the first transaction, you need to manually switch to the Ethereum account where you want your tokens bridged to. After this, click on `Bridge (Step 2)`.
8) Your NFT has been bridged successfully! Note the token ID for future reference.
PS: The Metamask browser extension still does not support viewing NFTs, so in order to view them, you may use the Metamask mobile app. The ERC 721 tokens show up under the `Collectibles` tab in your wallet.
