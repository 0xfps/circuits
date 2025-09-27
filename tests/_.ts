import { smolPadding } from "@fifteenfigures/tiny-merkle-tree";
import { toNum } from "./bits";
import { computeProofForCircom } from "./tree";
import { poseidon } from "poseidon-hash";
import { F1Field } from "@zk2/ffjavascript";
import { prime } from "./constants";

const comp = computeProofForCircom()
let leaf = BigInt(comp.leaf)
let addition = 0n

console.log("Starting Leaf", leaf);
console.log(BigInt(comp.root))
console.log(comp.root)
console.log(comp.tree)

console.log(comp.tree.verifyProof(comp.leaf, comp.merkleProof))

const { proof, directions } = comp.merkleProof

let currentHash = leaf
proof.forEach(function (currentLeaf: any, i: any) {
    if (directions[i]) {
        currentHash = poseidon([currentLeaf, currentHash])
    } else currentHash = poseidon([currentHash, currentLeaf])
})

console.log({ currentHash })
console.log(currentHash.toString(16))

for (let i = 0; i < comp.merkleProof.proof.length; i++) {
    const prevLeaf = leaf - addition
    const firstProof = comp.proof[i]
    const firstProofNum = smolPadding(`0x${toNum(firstProof).toString(16)}`)
    const [leaf1, leaf2] = comp.directions[i] == 0 ? [prevLeaf, firstProofNum] : [firstProofNum, prevLeaf]
    addition = BigInt(leaf)
    const hash = poseidon([leaf1, leaf2])
    leaf = hash + BigInt(leaf)

    console.log({
        i,
        currentLeaf: leaf,
        addition,
        prevLeaf,
        nextLeaf: BigInt(firstProofNum),
        hash
    })
    // console.log(BigInt(firstProof))

    // const firstProofBuffer = Buffer.from(firstProof.slice(2, firstProof.length), "hex").reverse()
    // const fPArray = new Uint8Array(firstProofBuffer)
    // const fPArrayBits = bytesToBits(fPArray)
    // console.log(i, "==>", toNum(fPArrayBits))
    // console.log(toNum(comp.rootBits.reverse()))

}