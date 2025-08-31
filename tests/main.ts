import hexyjs from "hexyjs"
import { keccak256, AbiCoder } from "ethers"
import MiniMerkleTree, { bytesToBits, formatForCircom } from "@fifteenfigures/mini-merkle-tree"
import { writeFileSync } from "fs"

const secretKey = "mysecretkeythere" // 16 bytes.
const withdrawalKey = "0x6fd506a454d907cae05c2a832de6ee6c9dcdd636b5f8415a1daec600bb6b52c80eb46eb3d1f9e4919b2eb40eb08c084aeefea9940000000000000000000000000000000000000000000000000000000000000100"
const depositKey = "0x67106eebbb1feab1484fe35a485b8b9274713bdcbdb1b909ccdda39800f743dc0eb46eb3d1f9e4919b2eb40eb08c084aeefea9940000000000000000000000000000000000000000000000000000000000000100"
const secretKeyInBytes = hexyjs.strToHex(secretKey)

const leafCount = 15

const depositKeyHash = keccak256(depositKey)
const leaves: string[] = [depositKeyHash]

for (let i = 0; i < leafCount; i++) {
    const encoding = new AbiCoder().encode(["string"], [i.toString()])
    leaves.push(keccak256(encoding))
}

const tree = new MiniMerkleTree(leaves)

const root = tree.root
const rootBuffer = Buffer.from(root.slice(2, root.length), "hex")
const rootArr = new Uint8Array(rootBuffer.reverse())
const rootBits = bytesToBits(rootArr)

const proof = tree.generateMerkleProof(depositKeyHash)
const circomFormat = formatForCircom(proof)

const withdrawalKeyBits = bytesToBits(new Uint8Array(Buffer.from(withdrawalKey.slice(2, withdrawalKey.length), "hex")))
const secretKeyBits = bytesToBits(new Uint8Array(Buffer.from(secretKeyInBytes, "hex")))

console.log(secretKeyInBytes, secretKeyBits.length)

writeFileSync("input.json", JSON.stringify({
    root: rootBits,
    proof: circomFormat.proof,
    validBits: circomFormat.validBits,
    directions: circomFormat.directions,
    withdrawalKey: withdrawalKeyBits,
    secretKey: secretKeyBits
}))