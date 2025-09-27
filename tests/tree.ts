import MiniMerkleTree, { bitsToNum, bytesToBits, convertProofToBits, formatForCircom, getInputObjects, getRandomNullifier, hashNums, smolPadding, standardizeToPoseidon } from "@fifteenfigures/tiny-merkle-tree";
import { buildLeaves } from "./build-leaves";
import { depositKey, depositkeyHashInTree, kkk, secretKey, withdrawalKey, withdrawalKeyConcat } from "./constants";
import { strToHex } from "hexyjs";
import { writeFileSync } from "fs";
import assert from "node:assert/strict"
import { toNum } from "./bits";

export function computeProofForCircom() {
    const tree = new MiniMerkleTree(buildLeaves())

    const root = convertProofToBits(tree.root)
    const merkleProof = tree.generateMerkleProof(depositkeyHashInTree)
    const { proof, directions, validBits } = formatForCircom(merkleProof)

    const withdrawalKeyBits = bytesToBits(new Uint8Array(Buffer.from(withdrawalKey.slice(2, withdrawalKey.length), "hex")))
    const secretKeyBits = bytesToBits(new Uint8Array(Buffer.from(strToHex(secretKey), "hex")))
    const nullifier = getRandomNullifier()
    const nullHash = hashNums([nullifier])
    const nullifierHash = convertProofToBits(nullHash)

    const outputs = getInputObjects(withdrawalKey, standardizeToPoseidon(depositKey), secretKey, tree)

    // console.log({ nullifier, nullHash })

    // writeFileSync("input.json", JSON.stringify({
    //     root,
    //     withdrawalKey: withdrawalKeyBits,
    //     secretKey: secretKeyBits,
    //     directions,
    //     validBits,
    //     proof,
    //     nullifier,
    //     nullifierHash
    // }))

    // OR

    writeFileSync("input.json", JSON.stringify(outputs))


    // const w = bytesToBits(new Uint8Array(Buffer.from(withdrawalKeyConcat.slice(2), "hex")))
    // const depositKeyBits = bytesToBits(new Uint8Array(Buffer.from(standardizeToPoseidon(withdrawalKeyConcat).slice(2), "hex").reverse()))
    // const depositKeyHash = smolPadding(`0x${bitsToNum(depositKeyBits.reverse()).toString(16)}`)
    // console.log(depositKeyBits.length)
    // const metadata = withdrawalKeyBits.slice(256)
    // const rev = depositKeyBits
    // console.log(smolPadding(`0x${bitsToNum(rev).toString(16)}`))
    // const k = [...rev, ...metadata]

    // console.log(depositKeyHash + withdrawalKeyConcat.slice(66))
    // console.log(kkk(BigInt(depositKeyHash + withdrawalKeyConcat.slice(66))))

    // console.log(k.slice(0, 8), k.slice(664))
    // console.log(k.length)
    // console.log(bitsToNum(k))
    // console.log(kkk(bitsToNum(k)))


    // console.log(BigInt(standardizeToPoseidon(depositKeyHash + withdrawalKeyConcat.slice(66))))

    console.log(">>>", BigInt("0x1bdb6d0aa61d10bf55d1e88691ead24222cbb336756feca1b133ef78b143a1c7"))
    const stdWKey = standardizeToPoseidon(withdrawalKeyConcat)
    console.log(stdWKey)
    const wKeyBits = bytesToBits(new Uint8Array(Buffer.from(stdWKey.slice(2), "hex")))
    console.log(toNum(wKeyBits))
    const metadata = bytesToBits(new Uint8Array(Buffer.from(withdrawalKey.slice(66), "hex")))

    const con = [...wKeyBits, ...metadata]

    const desiredWKey = `0x${toNum(wKeyBits).toString(16)}${withdrawalKey.slice(66)}`

    const desiredWKeyBits = bytesToBits(new Uint8Array(Buffer.from(desiredWKey.slice(2), "hex")))
    const desiredWKeyNum = toNum(desiredWKeyBits)
    console.log({ desiredWKey })
    console.log(">>>>>>", standardizeToPoseidon(desiredWKey), BigInt(standardizeToPoseidon(desiredWKey)))

    // for (let i = 0; i < con.length; i++) {
    //     console.log(con[i], "===", bits[i])
    //     assert(con[i] === bits[i])
    // }

    // const dKey = stdWKey + withdrawalKey.slice(66)
    // const stdDKey = standardizeToPoseidon(dKey)


    // // const metadata = bytesToBits(new Uint8Array(Buffer.from(withdrawalKeyConcat.slice(66), "hex")))
    // const metadata = withdrawalKeyBits.slice(256)
    // const wKeyBits = bytesToBits(new Uint8Array(Buffer.from(stdWKey.slice(2), "hex")).reverse())
    // const wkeyBitsInNum = bitsToNum([...wKeyBits, ...metadata])
    // const stdDKeyBitsInNum = kkk(wkeyBitsInNum)
    // console.log(wkeyBitsInNum.toString(16))
    // console.log({ stdDKeyBitsInNum })
    // console.log({ stdWKey, dKey, stdDKey, pos: BigInt(stdDKey) })

    // for (let i = 0; i < 800; i++) {
    //     assert(w[i] == k[i])
    // }

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