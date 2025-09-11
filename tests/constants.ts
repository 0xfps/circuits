import { generatekeys, standardizeToPoseidon } from "@fifteenfigures/mini-merkle-tree"
import { keccak256 } from "ethers"
import { strToHex } from "hexyjs"
import RandomString from "randomstring"

export const prime = 21888242871839275222246405745257275088548364400416034343698204186575808495617n

export const secretKey = RandomString.generate({ length: 16, charset: "alphanumeric"})
export const address = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
export const amount = 100

const keys = generatekeys(address, BigInt(amount), secretKey)
export const withdrawalKey = keys.withdrawalKey
export const depositKey = keys.depositKey
export const withdrawalKeyConcat = `${withdrawalKey}${strToHex(secretKey)}`

console.log({
    secretKey,
    withdrawalKey,
    depositKey
})

export const depositkeyHash = keccak256(depositKey)
export const depositkeyHashInTree = standardizeToPoseidon(depositKey)