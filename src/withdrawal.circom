pragma circom 2.2.2;

include "./hasher.circom";
include "./converter.circom";
include "./sort.circom";

/**
 * Withdrawal Circuit.
 *
 * Given a root, secret key, withdrawal key and merkle proof, this circuit
 * validates that, the deposit key, when computed from the withdrawal key
 * and the secret, and when hashed, is a valid leaf that when applied to the
 * merkle proof will give the passed root.
 */
template Withdrawal() {
    var ARRAY_LEN = 32;

    var BYTES_16 = 16 * 8;
    var BYTES_32 = 32 * 8;
    var BYTES_64 = 64 * 8;
    var BYTES_84 = 84 * 8;

    // Merkle root, 32 bytes, computed with Poseidon.
    // This is within mod.
    signal input root;
    // User's secret key, a string of 16 characters, 16 bytes.
    // Assumed to be the number equivalent.
    signal input secretKey;

    // First part of the withdrawal key, the hash.
    // The hash is computed with Poseidon. It is within mod.
    signal input withdrawalKeyNumPart1;
    // The amount, in uint, it's uint224.
    signal input withdrawalKeyNumPart2;
    // Merkle Proof formatted for Circom already.
    // 32 arrays, all containing 32-byte info in bits.
    signal input proof[ARRAY_LEN];
    // Direction each 32 byte array will go to the subsequent
    // hash.
    signal input directions[ARRAY_LEN];
    // Valid bits, an array with 1s and 0s, control array.
    // Wherever 0 starts, the loop stops.
    signal input validBits[ARRAY_LEN];
    // Special number used as nullifier.
    signal input nullifier;
    // Nullifier hash.
    signal input nullifierHash;

    component depositKeyKeyHash = HashMul(3);
    depositKeyKeyHash.in[0] <== withdrawalKeyNumPart1;
    depositKeyKeyHash.in[1] <== withdrawalKeyNumPart2;
    depositKeyKeyHash.in[2] <== secretKey;
    signal depositKey <-- depositKeyKeyHash.hash;

    component leafHasher = HashMul(2);
    leafHasher.in[0] <== depositKey;
    leafHasher.in[1] <== withdrawalKeyNumPart2;
    signal leaf <-- leafHasher.hash;

    // Board L1.
    signal currentHashInNum[ARRAY_LEN + 1];
    currentHashInNum[0] <-- leaf;
    
    component converters[ARRAY_LEN];
    component sorters[ARRAY_LEN];
    component hashers[ARRAY_LEN];
    component convertersToBits[ARRAY_LEN];

    // Board L2.
    signal lastPoseidonHashAdded[ARRAY_LEN + 1];
    lastPoseidonHashAdded[0] <-- 0;
    
    for (var i = 0; i < ARRAY_LEN; i++) {
        var proofBitsInNumber = proof[i];

        // Board L4.
        var previousHash = currentHashInNum[i] - lastPoseidonHashAdded[i];

        var sortInput[2];
        sortInput[0] = previousHash;
        sortInput[1] = proofBitsInNumber;

        // Sort converted numbers based on direction.
        sorters[i] = Sort();
        sorters[i].in <== sortInput;
        sorters[i].dir <== directions[i];

        var sortedNums[2] = sorters[i].out;

        // Hash the sorted numbers.
        hashers[i] = HashLeftRight();
        hashers[i].left <== sortedNums[0];
        hashers[i].right <== sortedNums[1];

        // Store the latest hash.
        // Board L5.
        // These two lines yield problems.
        currentHashInNum[i + 1] <-- previousHash + (hashers[i].hash * validBits[i]);
        lastPoseidonHashAdded[i + 1] <-- previousHash * validBits[i];
    }
    // STEP 3 END.

    // STEP 5.
    // Hash nullifier.
    component nullHasher = Hash();
    nullHasher.in <== nullifier;
    signal outputNullHash <-- nullHasher.hash;

    // Final constraint.
    root === currentHashInNum[32] - lastPoseidonHashAdded[32];
    outputNullHash === nullifierHash;
    // Headache stop.
}