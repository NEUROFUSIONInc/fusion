import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers, Wallet, Provider } from "ethers";

// ethereum mainnet
const easContractAddress = "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587";
// schema https://easscan.org/schema/view/0xb997c42482f0276ac7359a1c57ad91c2f880bd001b145d87c5e59d3cec6478ef
const schemaUID = "0xb997c42482f0276ac7359a1c57ad91c2f880bd001b145d87c5e59d3cec6478ef";
const eas = new EAS(easContractAddress);

export const signData = async (
  startTimestamp: number,
  endTimestamp: number,
  contentHash: string,
  deviceId: string,
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
    "address owner,uint40 startTimestamp,uint40 endTimestamp,bytes32 contentHash,string deviceId,string additionalMeta"
  );
  const encodedData = schemaEncoder.encodeData([
    {
      name: "owner",
      value: (await signer.getAddress()) ?? "0x0000000000000000000000000000000000000000",
      type: "address",
    },
    { name: "startTimestamp", value: Math.floor(startTimestamp / 1000), type: "uint40" },
    { name: "endTimestamp", value: Math.floor(endTimestamp / 1000), type: "uint40" },
    { name: "contentHash", value: `0x${contentHash}`, type: "bytes32" },
    { name: "deviceId", value: deviceId, type: "string" },
    { name: "additionalMeta", value: JSON.stringify(additionalMeta), type: "string" },
  ]);
  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      expirationTime: BigInt(0),
      revocable: true, // Be aware that if your schema is not revocable, this MUST be false
      data: encodedData,
    },
  });

  const newAttestationUID = await tx.wait();
  console.log("New attestation UID:", newAttestationUID);
  return newAttestationUID;
};
