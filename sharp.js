const sharp = require("sharp");

// Function to generate lottery image using sharp
async function generateImage(lotteryCode, lotteryId) {
  // Validate parameters
  if (!lotteryCode || !lotteryId) {
    return { error: "Parameters are missing" };
  }

  try {
    const basePath = "./lotterytemplates/palakkad.png";  // Base template image
    const generatedPath = `./lotteryimages/${lotteryCode}_${lotteryId}.png` ; // Generated image path

    // Get dimensions of the base image
    const { width, height } = await sharp(basePath).metadata();

    // Generate SVG dynamically to fit the image
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <text x="${(7 * width) / 11}" y="${(4 * height) / 6}" font-size=" 40" fill="black">${lotteryCode} ${lotteryId}</text>
      </svg>`;

    // Create the image with Sharp
    const imageBuffer = await sharp(basePath)
      .composite([
        {
          input: Buffer.from(svg),
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    return imageBuffer; // Return the image buffer for further processing
  } catch (error) {
    console.error("Failed to generate lottery ID on image through Sharp:", error);
    return { error: "Failed to generate image" };
  }
}

module.exports = { generateImage };