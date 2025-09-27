import { bytesToBits, smolPadding } from "@fifteenfigures/tiny-merkle-tree";
import { computeProofForCircom } from "../../tree";
import { depositkeyHash, prime, withdrawalKey, withdrawalKeyConcat } from "../../constants";
import { writeFileSync } from "fs";
import path from "path";
import { poseidon } from "poseidon-hash";
import { toNum } from "../../bits"
import { F1Field } from "@zk2/ffjavascript";
import { keccak256 } from "ethers";

const { secretKeyBits, withdrawalKeyBits } = computeProofForCircom()

const field = new F1Field(prime)

const withdrawalKeyReduced = field.e(BigInt(withdrawalKeyConcat))
const withdawakKeyReducedHash = `0x${withdrawalKeyReduced.toString(16)}`
console.log(field.e(BigInt(keccak256(withdawakKeyReducedHash))))

const preImage = "0x7B274238171D580267d0E9cB52469173682f8b1267d0E9cB52469173682f8b12"
const preImageBuf = Buffer.from(preImage.slice(2, preImage.length), "hex").reverse()
const preImageArr = new Uint8Array(preImageBuf)
const preimage = bytesToBits(preImageArr)

const hash = smolPadding(`0x${poseidon([depositkeyHash, preImage]).toString(16)}`)
const hashBuf = Buffer.from(hash.slice(2, hash.length), "hex")
const hashArr = new Uint8Array(hashBuf.reverse())
const hashimage = bytesToBits(hashArr)

writeFileSync(path.join(__dirname, "input.json"), JSON.stringify({
    withdrawalKey: withdrawalKeyBits,
    secretKey: secretKeyBits,
    preimage,
    hashEquiv: hashimage
}))

// 7494065895228865150753301380702717880692524178667102524062402499940657701683