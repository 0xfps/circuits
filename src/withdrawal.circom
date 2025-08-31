pragma circom 2.2.2;

include "../node_modules/keccak256-circom/circuits/keccak.circom";
include "./hasher.circom";
include "./converter.circom";
include "./sort.circom";

template Withdrawal() {
    var ARRAY_LEN = 32;

    var BYTES_16 = 16 * 8;
    var BYTES_32 = 32 * 8;
    var BYTES_64 = 64 * 8;
    var BYTES_84 = 84 * 8;

    // Merkle root, 32 bytes, computed with Poseidon.
    signal input root[BYTES_32];
    // User's secret key, a string of 16 characters, 16 bytes.
    // On the UI, it will be converted from a 16 character string
    // to hex to buffer to uint8 to bits.
    signal input secretKey[BYTES_16];
    // Withdrawal key, an 84 byte hex.
    signal input withdrawalKey[BYTES_84];
    // Merkle Proof formatted for Circom already.
    // 32 arrays, all containing 32-byte info in bits.
    signal input proof[ARRAY_LEN][BYTES_32];
    // Direction each 32 byte array will go to the subsequent
    // hash.
    signal input directions[ARRAY_LEN];
    // Valid bits, an array with 1s and 0s, control array.
    // Wherever 0 starts, the loop stops.
    signal input validBits[ARRAY_LEN];

    // This signal holds tiny info when needed;
    // Signal? Variable?
    // This holds the re-computed deposit key.
    var depositKey[BYTES_84];
    // This holds the concatenated withdrawalKey and secret key.
    var wKeyAndSKeyConcat[BYTES_84 + BYTES_16];

    // STEP 1 START.
    // Intermediate signals will hold the result of every step.
    // Recompute deposit key.
    // On the smart contract, encodePacked, here, concatenated.
    // First, copy all withdrawal key values into the concat.
    for (var i = 0; i < BYTES_84; i++) {
        wKeyAndSKeyConcat[i] = withdrawalKey[i];
    }

    // Copy the secret key.
    // 0 - 83 is occupied.
    // Start from 84.
    for (var i = 0; i < BYTES_16; i++) {
        var insertIndex = BYTES_84 + i;
        wKeyAndSKeyConcat[insertIndex] = secretKey[i];
    }

    component keyConcatHasher = Keccak(BYTES_84 + BYTES_16, BYTES_32);
    keyConcatHasher.in <== wKeyAndSKeyConcat;

    // Hold the hash of the above in this.
    signal wKeyAndSKeyConcatHash[BYTES_32] <-- keyConcatHasher.out;
    // STEP 1 END.

    // STEP 2 START.
    // Copy the hash to the deposit key.
    // This will occupy the first 32 bytes.
    // 0 - 31.
    for (var i = 0; i < BYTES_32; i++) {
        depositKey[i] = wKeyAndSKeyConcatHash[i];
    }

    // For 32 - 83.
    // Copy the last 52 bytes of the withdrawal key.
    // Now we have a complete 84 byte deposit key.
    // Built out of the withdrawal key.
    // This will be used for the merkle root computation.
    for (var i = BYTES_32; i < BYTES_84; i++) {
        depositKey[i] = withdrawalKey[i];
    }

    component depositKeyHasher = Keccak(BYTES_84, BYTES_32);
    depositKeyHasher.in <== depositKey;

    // Hold the hash of the above in this.
    signal depositKeyHash[BYTES_32] <-- depositKeyHasher.out;
    // STEP 2 END.

    // STEP 3 START.
    // This is where it gets quite complex.
    component currentHashToNumConverter = Bits2Num(BYTES_32);
    currentHashToNumConverter.in <== depositKeyHash;
    // Board L1.
    signal currentHashInNum[ARRAY_LEN + 1];
    currentHashInNum[0] <-- currentHashToNumConverter.out;
    
    component converters[ARRAY_LEN];
    component sorters[ARRAY_LEN];
    component hashers[ARRAY_LEN];
    component convertersToBits[ARRAY_LEN];

    // Board L2.
    signal lastPoseidonHashAdded[ARRAY_LEN + 1];
    lastPoseidonHashAdded[0] <-- 0;
    
    for (var i = 0; i < ARRAY_LEN; i++) {
        // Convert current hash and proof leaf to number for use in Poseidon hash.
        converters[i] = Converter(BYTES_32);
        converters[i].in <== proof[i];

        var proofBitsInNumber = converters[i].out;

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

    // STEP 4
    // Convert root to number;
    component rootToNumConverter = Bits2Num(BYTES_32);
    rootToNumConverter.in <== root;
    signal rootInNum <-- rootToNumConverter.out;

    // Final constraint.
    rootInNum === currentHashInNum[32] - lastPoseidonHashAdded[32];
    // Headache stop.
}