import { bytesToBits } from "@fifteenfigures/tiny-merkle-tree";
import { computeProofForCircom } from "../../tree";
import { depositKey, depositkeyHash, depositkeyHashInTree, prime } from "../../constants";
import { writeFileSync } from "fs";
import path from "path";
import { toNum } from "../../bits";
import { F1Field } from "@zk2/ffjavascript";
import { keccak256 } from "ethers";

const { secretKeyBits, withdrawalKeyBits } = computeProofForCircom()
const depositKeyHashBits = bytesToBits(new Uint8Array(Buffer.from(depositkeyHash.slice(2, depositkeyHash.length), "hex")))

// console.log(depositkeyHash)
// console.log(BigInt(depositkeyHash))
// console.log(toNum(depositKeyHashBits))

const reduced = new F1Field(prime).e(toNum(depositKeyHashBits))
const reducedHex = `0x${reduced.toString(16)}`

// console.log(reduced)
// console.log(reducedHex)
// console.log(BigInt(reducedHex))
// console.log(depositkeyHashInTree)

writeFileSync(path.join(__dirname, "input.json"), JSON.stringify({
    withdrawalKey: withdrawalKeyBits,
    secretKey: secretKeyBits,
    hashEquiv: depositKeyHashBits
}))