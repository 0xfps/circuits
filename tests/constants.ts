import { standardizeToPoseidon } from "@fifteenfigures/mini-merkle-tree"
import { keccak256 } from "ethers"
import { strToHex } from "hexyjs"

export const prime = 21888242871839275222246405745257275088548364400416034343698204186575808495617n

export const secretKey = "mysecretkeythere"
export const address = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
export const amount = 100

export const withdrawalKey = "0x5cf20babf05b9104224af49a1a7ac84d3a93febcac1d1897af803fcc8892242eb7ce8c93780B492a365d6B44b079b46816F090780000000000000000000000000000000000000000000000000000000000000005"
export const depositKey = "0xec3a829a0d177d656b4b2bafa101e4f7a47c17db21202c81e2d943d344c6e4beb7ce8c93780B492a365d6B44b079b46816F090780000000000000000000000000000000000000000000000000000000000000005"
export const withdrawalKeyConcat = `${withdrawalKey}${strToHex(secretKey)}`

export const depositkeyHash = keccak256(depositKey)
export const depositkeyHashInTree = standardizeToPoseidon(depositKey)