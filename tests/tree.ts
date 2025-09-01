import MiniMerkleTree, { bytesToBits, convertProofToBits, formatForCircom } from "@fifteenfigures/mini-merkle-tree";
import { buildLeaves } from "./build-leaves";
import { depositkeyHashInTree, secretKey, withdrawalKey } from "./constants";
import { strToHex } from "hexyjs";
import { writeFileSync } from "fs";

export function computeProofForCircom() {
    const tree = new MiniMerkleTree(buildLeaves())
    
    const root = convertProofToBits(tree.root)
    const merkleProof = tree.generateMerkleProof(depositkeyHashInTree)
    const { proof, directions, validBits } = formatForCircom(merkleProof)
    
    const withdrawalKeyBits = bytesToBits(new Uint8Array(Buffer.from(withdrawalKey.slice(2, withdrawalKey.length), "hex")))
    const secretKeyBits = bytesToBits(new Uint8Array(Buffer.from(strToHex(secretKey), "hex")))
    
    writeFileSync("input.json", JSON.stringify({
        root,
        withdrawalKey: withdrawalKeyBits,
        secretKey: secretKeyBits,
        directions,
        validBits,
        proof
    }))

    return {
        tree,
        withdrawalKeyBits,
        secretKeyBits,
        rootBits: root,
        root: tree.root,
        merkleProof,
        proof,
        directions,
        validBits,
        leaf: depositkeyHashInTree
    }
}