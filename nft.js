require('dotenv').config();

const { ethers } = require("ethers");



const CONTRACT_ABI = require("./NFTContract.abi.json");
const CONTRACT_ADDRESS = "0x9da3db634531583351842a6773817C8b5Dd3348B";            //need





// Connect to Ethereum provider (e.g., Ganache, Infura, or Alchemy)
const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/86cb1361d34948a7ab88dd954f91d39c");

// Wallet setup (use private key for testing, or Metamask key for deployment)
const PRIVATE_KEY = process.env.PRIVATE_KEY;               //doubt
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
//0x9da3db634531583351842a6773817C8b5Dd3348B contract address
// Contract instance
const nftContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

// Mint NFT
async function mintLotteryNFT(buyerAddress, tokenUri, lotteryId) {
    try {
        const tx = await nftContract.mintNft(buyerAddress, tokenUri, lotteryId);
        console.log("Transaction Hash:", tx.hash);
        await tx.wait();
        console.log("NFT Minted!");
        return tx.hash;
    } catch (error) {
        console.error("Error minting NFT:", error);
        throw new Error(error.message);
    }   
}

module.exports = {
    mintLotteryNFT
};
