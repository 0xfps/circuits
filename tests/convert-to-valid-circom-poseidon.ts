import { bytesToBits, smolPadding } from "@fifteenfigures/mini-merkle-tree";
import { F1Field } from "@zk2/ffjavascript";
import { keccak256 } from "ethers";
import { prime } from "./constants";
import { toNum } from "./bits";

export function convertToValidPoseidon(str: string, reverse: boolean = false) {
    const hash = keccak256(str)
    const hashBits = reverse ? bytesToBits(new Uint8Array(Buffer.from(hash.slice(2, hash.length), "hex").reverse()))
        : bytesToBits(new Uint8Array(Buffer.from(hash.slice(2, hash.length), "hex")))
    const reduced = new F1Field(prime).e(toNum(hashBits))
    return smolPadding(`0x${reduced.toString(16)}`)
}