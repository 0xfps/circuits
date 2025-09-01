export function toNum(s: number[]): BigInt {
    let total = 0n;

    for (let i = 0; i < s.length; i++) {
        total += BigInt(s[i]) * (2n ** BigInt(i));
    }

    return total
}