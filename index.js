require('dotenv').config();

const express = require("express");
const pinataSDK = require("@pinata/sdk");
const { generateImage } = require("./sharp.js");
const { mintLotteryNFT } = require("./nft.js");
const fs = require('fs');
const path = require('path');

// Pinata API keys
const pinataApiKey = "d68b2830f199fd17ede7";
const pinataSecretApiKey = "d2544c72f98eacfc9fee0e85db990d2f9a4455eb3ee010408a99cfa3ca2382da";

// Create Pinata instance
const pinata = new pinataSDK({ 
    pinataApiKey: pinataApiKey, 
    pinataSecretApiKey: pinataSecretApiKey 
});

// Helper function to upload buffer to Pinata
async function addToPinata(imageBuffer, metadata) {
    try {
        // Create a temporary file from the buffer
        const tempFilePath = path.join(__dirname, 'lotteryimages', `temp_${Date.now()}.png`);
        fs.writeFileSync(tempFilePath, imageBuffer);

        // Create a readable stream from the temporary file
        const readableStreamForFile = fs.createReadStream(tempFilePath);
        
        const options = {
            pinataMetadata: {
                name: metadata.name || "Lottery Image",
                keyvalues: {
                    lottery: "yes",
                    lotteryCode: metadata.lotteryCode,
                    lotteryId: metadata.lotteryId
                }
            }
        };

        // Upload to Pinata
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);

        // Clean up temporary file
        fs.unlinkSync(tempFilePath);

        return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    } catch (error) {
        throw new Error("Failed to upload to Pinata: " + error.message);
    }
}

// Set up Express server
const app = express();
app.use(express.json());


// Route to create a lottery NFT
app.post("/create-lottery-nft", async (req, res) => {
    const { lotteryCode, lotteryId , buyerAddress } = req.body;

    if (!lotteryCode || !lotteryId) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    try {
        // Step 1: Generate the lottery image
        const imageBuffer = await generateImage(lotteryCode, lotteryId);
        
        if (imageBuffer.error) {
            return res.status(400).json({ error: imageBuffer.error });
        }

        // Step 2: Upload the image to Pinata
        const imageLink = await addToPinata(imageBuffer, {
            name: `Lottery_${lotteryCode}_${lotteryId}`,
            lotteryCode,
            lotteryId
        });

        // Step 3: Create and upload metadata
        const metadata = {
            name: `Lottery Ticket ${lotteryCode}-${lotteryId}`,
            description: `NFT Lottery ticket for code ${lotteryCode}`,
            image: imageLink,
            attributes: [
                {
                    trait_type: "Lottery Type",
                    value: lotteryCode
                },
                {
                    trait_type: "Lottery ID",
                    value: lotteryId
                }
            ]
        };

        const metadataResult = await pinata.pinJSONToIPFS(metadata, {
            pinataMetadata: {
                name: `Metadata_${lotteryCode}_${lotteryId}`
            }
        });
        console.log(metadataResult);
        const tempmeta = "https://gateway.pinata.cloud/ipfs/QmZGAoeCmU4Lm1N1jfKfZ3Uwqf2NPqkiMtMDYg8fnf9CWc";
        //NFT MINT on eth sepolia
        const mintNFTHash = await mintLotteryNFT(buyerAddress, tempmeta, lotteryId);

        // Response with both image and metadata links
        res.status(200).json({
            message: "Lottery NFT successfully generated and uploaded to Pinata",
            imageLink,
            metadataLink: `https://gateway.pinata.cloud/ipfs/${metadataResult.IpfsHash}`,
            nfttransactionHash : mintNFTHash
            //imageHash: imageLink.split('/').pop(),
            //metadataHash: metadataResult.IpfsHash
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy" });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});






