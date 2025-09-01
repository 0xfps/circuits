import { AbiCoder } from "ethers";
import { depositkeyHashInTree } from "./constants";
import { standardizeToPoseidon } from "@fifteenfigures/mini-merkle-tree";

export function buildLeaves(): string[] {
    const leaves = [depositkeyHashInTree]
    for (let i = 0; i < 15; i++) {
        const encoding = new AbiCoder().encode(["string"], [i.toString()])
        leaves.push(standardizeToPoseidon(encoding))
    }

    return leaves
}