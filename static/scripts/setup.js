function setup()
{
    var request = new XMLHttpRequest()
    request.open("GET", "/static/build/HighwayToHell.abi", false)
    request.send(null)
    window.ABI = JSON.parse(request.responseText)
    request.open("GET", "/contract_address", false)
    request.send(null)
    window.ethereum.enable()
    window.web3 = new Web3(window.ethereum)
    window.contractAddress = JSON.parse(request.responseText)
    window.currentContract = new window.web3.eth.Contract(window.ABI, window.contractAddress)
    console.log("SETUP COMPLETE.")
}

async function checkMetamask(event)
{
    if (event != undefined && (window.ethereum.selectedAddress == null ||
            window.ethereum.selectedAddress == undefined))
    {
        try
        {
            event.preventDefault();
        }
        catch (error)
        {
            console.log(error);
        }
    }
    try
    {
        await window.ethereum.enable();
    }
    catch (error)
    {
        console.log(error);
        alert("You need to allow Innofarms to connect to Metamask in order to create a new account.\nKindly authorize.");
        return false;
        // checkMetamask(event);
    }
    return true;
}
