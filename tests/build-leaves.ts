import { AbiCoder } from "ethers";
import { depositkeyHashInTree } from "./constants";
import { convertToValidPoseidon } from "./convert-to-valid-circom-poseidon";

export function buildLeaves(): string[] {
    const leaves = [depositkeyHashInTree]
    for (let i = 0; i < 15; i++) {
        const encoding = new AbiCoder().encode(["string"], [i.toString()])
        leaves.push(convertToValidPoseidon(encoding))
    }

    return leaves
}