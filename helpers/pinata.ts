import axios, { AxiosResponse, AxiosError } from "axios";

// Define the shape of the expected response from the API
interface UploadImageResponse {
  IpfsHash: string;
}

// Function to upload an image to Pinata IPFS
export const uploadImage = async (file: File): Promise<string | undefined> => {
  try {
    // Create a new FormData object to handle the file and metadata
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pinataMetadata", '{"name": "pinnie"}');

    // Set up the configuration for the Axios request, including the authorization header
    const config = {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    };

    // Make a POST request to Pinata API to pin the file to IPFS
    const response: AxiosResponse<UploadImageResponse> = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      config
    );

    // Log the response data for debugging purposes
    console.log("Upload Image Response:", response.data);

    // Return the IPFS hash from the response
    return response.data.IpfsHash;
  } catch (error) {
    // Log any errors that occur during the process
    console.log({ error });

    // Return undefined to indicate that the upload failed
    return undefined;
  }
};

// Define the expected response structure from the Pinata API
interface UploadMetaDataResponse {
  IpfsHash: string;
}

// Define the structure of the metadata to be uploaded
interface UploadMetaData {
  name: string;
  description: string;
  price: string;
  cid: string;
}

// Function to upload metadata to Pinata IPFS
export const uploadMetaData = async ({
  cid,
  name,
  description,
  price,
}: UploadMetaData): Promise<string | undefined> => {
  try {
    // Create a JSON string with the pinataContent and pinataMetadata
    const data = JSON.stringify({
      pinataContent: {
        name,
        description,
        price,
        image: cid,
      },
      pinataMetadata: {
        name: "Pinnie NFT Metadata",
      },
    });

    // Set up the Axios configuration with headers and authorization
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    };

    // Make a POST request to Pinata API to pin the JSON to IPFS
    const response: AxiosResponse<UploadMetaDataResponse> = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      config
    );

    // Log the uploaded metadata CID for reference
    console.log("Metadata uploaded, CID:", response.data.IpfsHash);

    // Return the uploaded metadata CID
    return response.data.IpfsHash;
  } catch (error) {
    // Log any errors that occur during the process
    console.log("uploadMetaData error", error);

    // Return undefined to indicate failure
    return undefined;
  }
};

// Function to generate a Pinata IPFS gateway URL for a given CID
export const pinataGetURL = (CID: string): string => {
  // Construct the URL using the Pinata IPFS gateway and CID
  const url = `https://coffee-prickly-ferret-400.mypinata.cloud/ipfs/${CID}?pinataGatewayToken=${process.env.PINATA_GATEWAY_TOKEN}`;

  // Return the generated URL
  return url;
};
