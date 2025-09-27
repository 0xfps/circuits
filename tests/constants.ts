import { bitsToNum, bytesToBits, generatekeys, smolPadding, standardizeToPoseidon } from "@fifteenfigures/tiny-merkle-tree"
import { F1Field } from "@zk2/ffjavascript"
import { keccak256 } from "ethers"
import { strToHex } from "hexyjs"
import RandomString from "randomstring"

export const prime = 21888242871839275222246405745257275088548364400416034343698204186575808495617n

// export function standardizeToPoseidon(str: string): string {
//     const bigNumber = BigInt(str)
//     const reduced = new F1Field(prime).e(bigNumber)
//     return smolPadding(`0x${reduced.toString(16)}`)
// }
export function kkk(str: BigInt): BigInt {
    const bigNumber = str
    const reduced = new F1Field(prime).e(bigNumber)
    return reduced
}

export function convertToLSB(str: string): BigInt {
    const num = new Uint8Array(Buffer.from(str.slice(2), "hex"))
    return bitsToNum(bytesToBits(num))
}

export const secretKey = RandomString.generate({ length: 16, charset: "alphanumeric" })
export const address = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
export const amount = 100

const keys = generatekeys(address, BigInt(amount), secretKey)
export const withdrawalKey = keys.withdrawalKey
// "0xb43deb28cafba1907cdda5f986bf407a19185e3ef4f1cc39cb8c71ca9dceebf65B38Da6a701c568545dCfcB03FcB875f56beddC40000000000000000000000000000000000000000000000000000000000000064"
export const depositKey = keys.depositKey
// "0x1bdb6d0aa61d10bf55d1e88691ead24222cbb336756feca1b133ef78b143a1c75B38Da6a701c568545dCfcB03FcB875f56beddC40000000000000000000000000000000000000000000000000000000000000064"
export const withdrawalKeyConcat = `${withdrawalKey}${strToHex(secretKey)}`

console.log(withdrawalKey.length, depositKey.length)

console.log({ nnn: BigInt(standardizeToPoseidon(withdrawalKeyConcat)) })

console.log({
    secretKey,
    withdrawalKey,
    depositKey
})

export const depositkeyHash = keccak256(depositKey)
export const depositkeyHashInTree = standardizeToPoseidon(depositKey)

const bb = bitsToNum(bytesToBits(new Uint8Array(Buffer.from(depositKey.slice(2), "hex"))))
console.log("****************")
console.log({ depositKey })
console.log(standardizeToPoseidon(depositKey))
console.log(BigInt(standardizeToPoseidon(depositKey)))
console.log("****************")
// console.log("WKeyConcat", BigInt(withdrawalKeyConcat))
