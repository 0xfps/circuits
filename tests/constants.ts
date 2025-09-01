import { bytesToBits, smolPadding } from "@fifteenfigures/mini-merkle-tree"
import { F1Field } from "@zk2/ffjavascript"
import { keccak256 } from "ethers"
import { strToHex } from "hexyjs"
import { poseidon } from "poseidon-hash"
import { toNum } from "./bits"
import { convertToValidPoseidon } from "./convert-to-valid-circom-poseidon"

export const prime = 21888242871839275222246405745257275088548364400416034343698204186575808495617n
const field = new F1Field(prime)

export const secretKey = "mysecretkeythere"
export const address = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
export const amount = 100

export const withdrawalKey = "0x6fd506a454d907cae05c2a832de6ee6c9dcdd636b5f8415a1daec600bb6b52c85b38da6a701c568545dcfcb03fcb875f56beddc40000000000000000000000000000000000000000000000000000000000000064"
export const depositKey = "0x1a10edf08a5329488719ab829e94bc295e97016dbe4dee1f5a265b877ca1b2355b38da6a701c568545dcfcb03fcb875f56beddc40000000000000000000000000000000000000000000000000000000000000064"
export const withdrawalKeyConcat = `${withdrawalKey}${strToHex(secretKey)}`

export const depositkeyHash = keccak256(depositKey)
export const depositkeyHashInTree = convertToValidPoseidon(depositKey)