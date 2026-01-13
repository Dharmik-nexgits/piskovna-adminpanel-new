import { BlobServiceClient } from "@azure/storage-blob";

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!,
);
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;

export const uploadToBlob = async (file: File) => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobName = `${Date.now()}-${file.name}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: file.type,
    },
  });
  return blockBlobClient.url;
};

export const deleteToBlob = async (blobUrl: string) => {
  if (!blobUrl) return;
  const containerClient = blobServiceClient.getContainerClient(containerName);
  try {
    const url = new URL(blobUrl);
    const path = url.pathname;
    const blobName = decodeURIComponent(path.replace(`/${containerName}/`, ""));

    if (!blobName) {
      console.warn("Could not parse blob name from URL:", blobUrl);
      return;
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const response = await blockBlobClient.deleteIfExists();
    console.log(`Deleted blob ${blobName}:`, response);
  } catch (error) {
    console.error("Error deleting blob:", error);
  }
};
