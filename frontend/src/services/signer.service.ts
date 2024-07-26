import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import sha256 from "fast-sha256";

// ethereum mainnet
const easContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
// schema https://sepolia.easscan.org/schema/view/0xbecbf8b1bd8992cbd43db64be07a2cd64a47fadab545ad2e77859f9e753bb5fb
const schemaUID = "0xbecbf8b1bd8992cbd43db64be07a2cd64a47fadab545ad2e77859f9e753bb5fb";
const eas = new EAS(easContractAddress);

export async function getFileHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        const hashUint8Array = sha256(uint8Array);
        const hash = ethers.hexlify(hashUint8Array);
        resolve(hash);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
}

export const signData = async (
  name: string,
  startTimestamp: number,
  endTimestamp: number,
  contentHash: string,
  additionalMeta: {}
) => {
  let signer = null;
  let provider;
  console.log("signing data");

  if ((window as any).ethereum == null) {
    console.log("not using metamask");
    provider = ethers.getDefaultProvider();
  } else {
    console.log("using metamask");
    console.log((window as any).ethereum);
    provider = new ethers.BrowserProvider((window as any).ethereum);
    console.log("got provider", provider);
    signer = await provider.getSigner();
    console.log("got signer", signer);
  }

  if (!signer) {
    throw new Error("No signer found");
  }

  // Signer must be an ethers-like signer.
  await eas.connect(signer);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder(
    "bytes32 contentHash,address owner,string name,uint48 startTimestamp,uint48 endTimestamp,string additionalMeta"
  );

  console.log("message", [
    { name: "contentHash", value: contentHash, type: "bytes32" },
    {
      name: "owner",
      value: (await signer.getAddress()) ?? "0x0000000000000000000000000000000000000000",
      type: "address",
    },
    { name: "name", value: name, type: "string" },
    { name: "startTimestamp", value: startTimestamp, type: "uint48" },
    { name: "endTimestamp", value: endTimestamp, type: "uint48" },
    { name: "additionalMeta", value: JSON.stringify(additionalMeta), type: "string" },
  ]);

  const encodedData = schemaEncoder.encodeData([
    { name: "contentHash", value: contentHash, type: "bytes32" },
    {
      name: "owner",
      value: (await signer.getAddress()) ?? "0x0000000000000000000000000000000000000000",
      type: "address",
    },
    { name: "name", value: name, type: "string" },
    { name: "startTimestamp", value: startTimestamp, type: "uint48" },
    { name: "endTimestamp", value: endTimestamp, type: "uint48" },
    { name: "additionalMeta", value: JSON.stringify(additionalMeta), type: "string" },
  ]);

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: BigInt(0),
      revocable: false, // Be aware that if your schema is not revocable, this MUST be false
      data: encodedData,
    },
  });

  const newAttestationUID = await tx.wait();
  console.log("New attestation UID:", newAttestationUID);
  return newAttestationUID;
};
