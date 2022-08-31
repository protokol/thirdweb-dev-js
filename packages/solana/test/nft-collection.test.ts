import { MockStorage } from "../../sdk/test/mock/MockStorage";
import { METAPLEX_PROGRAM_ID } from "../src/constants/addresses";
import { NFTCollection } from "../src/contracts/nft-collection";
import { ThirdwebSDK } from "../src/sdk";
import { Amman } from "@metaplex-foundation/amman-client";
import { Connection, Keypair } from "@solana/web3.js";
import { expect } from "chai";

const createTestSDK = async (
  solsToAirdrop: number = 100,
): Promise<ThirdwebSDK> => {
  const connection = new Connection("http://localhost:8899");
  const sdk = new ThirdwebSDK(connection, new MockStorage());
  const wallet = Keypair.generate();
  const amman = Amman.instance({
    knownLabels: { [METAPLEX_PROGRAM_ID]: "Token Metadata" },
  });
  await amman.airdrop(connection, wallet.publicKey, solsToAirdrop);
  sdk.wallet.connect(wallet);
  return sdk;
};

describe("NFTCollection", async () => {
  let sdk: ThirdwebSDK;
  let collection: NFTCollection;

  before(async () => {
    sdk = await createTestSDK();
    const addr = await sdk.deployer.createNftCollection({
      name: "Test Collection",
      description: "Test Description",
      symbol: "TC",
    });
    collection = await sdk.getNFTCollection(addr);
  });

  it("should mint an NFT", async () => {
    const mint = await collection.mint({
      name: "Test NFT",
      description: "Test Description",
    });
    expect(mint.name).to.eq("Test NFT");
  });

  it("should fetch NFTs", async () => {
    const all = await collection.getAll();
    expect(all.length).to.eq(1);
    const single = await collection.get(all[0]);
    expect(single.name).to.eq("Test NFT");
  });
});