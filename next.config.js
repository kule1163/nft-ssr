/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PINATA_API_KEY: process.env.PINATA_API_KEY,
    PINATA_API_SECRET: process.env.PINATA_API_SECRET,
    PINATA_JWT: process.env.PINATA_JWT,
    PINATA_GATEWAY_TOKEN: process.env.PINATA_GATEWAY_TOKEN,
    ALCHEMY_SECRET: process.env.ALCHEMY_SECRET,
    NFTMARKETPLACE_CONTRACT_ADDRESS:
      process.env.NFTMARKETPLACE_CONTRACT_ADDRESS,
  },
  images: {
    domains: ["coffee-prickly-ferret-400.mypinata.cloud", "res.cloudinary.com"],
  },
};

module.exports = nextConfig;
