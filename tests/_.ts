import TinyMerkleTree, { bitsToNum, convertProofToBits, formatForCircom, generatekeys, generateRandomNumber, getRandomNullifier, hashNums, smolPadding, standardizeToPoseidon } from "@fifteenfigures/tiny-merkle-tree"
import { AbiCoder } from "ethers"
import { writeFileSync } from "fs"
import { strToHex } from "hexyjs"
import { poseidon } from "poseidon-hash"
import RandomString from "randomstring"

export const secretKey = RandomString.generate({ length: 16, charset: "alphanumeric" })
export const address = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
export const amount = 100n

export function extractKeyMetadata(key: string) {
    // Including 0x, bytes32 stretches to 66 characters.
    const keyHash = key.slice(0, 66)
    const asset = `0x${key.slice(66, 106)}`
    const amount = BigInt(`0x${key.slice(106)}`)
    const amountU32 = `0x${key.slice(106)}`

    return { keyHash, asset, amountU32, amount }
}

const leaves = []

const keys = generatekeys(address, amount, secretKey)
const { keyHash, asset, amountU32 } = extractKeyMetadata(keys.withdrawalKey)
const { keyHash: dKeyHash } = extractKeyMetadata(keys.depositKey)

const dKeyBigInt = BigInt(dKeyHash)
const wKeyBigInt = BigInt(keyHash)
const assetBigInt = BigInt(asset)
const amountBigInt = BigInt(amountU32)
const secretKeyBigInt = BigInt(`0x${strToHex(secretKey)}`)

const leafNum = poseidon([dKeyBigInt, assetBigInt, amountBigInt])
const leaf = smolPadding(`0x${leafNum.toString(16)}`)
leaves.push(leaf)

function buildLeaves() {
    for (let i = 0; i < 15; i++) {
        const encoding = new AbiCoder().encode(["string"], [i.toString()])
        leaves.push(standardizeToPoseidon(encoding))
    }
}

buildLeaves()

const tree = new TinyMerkleTree(leaves)
const root = bitsToNum(convertProofToBits(tree.root))
const merkleProof = tree.generateMerkleProof(leaf)
const { proof, directions, validBits } = formatForCircom(merkleProof)
const nullifier = generateRandomNumber()
const nullHash = hashNums([nullifier])
const nullifierHash = bitsToNum(convertProofToBits(nullHash))

writeFileSync("input.json", JSON.stringify({
    root: root.toString(),
    withdrawalKeyNumPart1: wKeyBigInt.toString(),
    withdrawalKeyNumPart2: assetBigInt.toString(),
    withdrawalKeyNumPart3: amountBigInt.toString(),
    secretKey: secretKeyBigInt.toString(),
    directions,
    validBits,
    proof,
    nullifier: nullifier.toString(),
    nullifierHash: nullifierHash.toString()
}))