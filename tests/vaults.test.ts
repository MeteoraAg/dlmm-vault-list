import { expect } from "chai";
import vaults from "../vaults.json";
import { Connection, PublicKey } from "@solana/web3.js";

function parseJson(json: string) {
  try {
    return JSON.parse(json);
  } catch (error) {
    return null;
  }
}

describe("DLMM vault test", () => {
  let parsedVaults: String[] = [];

  it("Parse pairs as an array", () => {
    const vaultsStr = JSON.stringify(vaults);
    const vaultsArr = parseJson(vaultsStr);

    expect(vaultsArr, "Invalid JSON format").not.null;
    expect(Array.isArray(vaultsArr), "Not an array").to.be.true;

    parsedVaults = vaultsArr;
  });

  it("Valid public key", () => {
    for (const vaultAddress of parsedVaults) {
      expect(() => {
        new PublicKey(vaultAddress);
      }).to.not.throw();
    }
  });

  it("Is vault account", async () => {
    const connection = new Connection("https://api.mainnet-beta.solana.com");
    while (parsedVaults.length > 0) {
      const chunkedParsedPairs = parsedVaults.splice(0, 100);
      const accounts = await connection.getMultipleAccountsInfo(
        chunkedParsedPairs.map((address) => new PublicKey(address))
      );
      for (const account of accounts) {
        expect(account).is.not.null;
        expect(account?.owner.toBase58()).to.be.equal(
          "vaU6kP7iNEGkbmPkLmZfGwiGxd4Mob24QQCie5R9kd2"
        );
        const disc = account?.data.slice(0, 8);
        expect(
          disc?.equals(new Uint8Array([211, 8, 232, 43, 2, 152, 117, 119]))
        );
      }
    }
  });
});
