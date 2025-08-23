pragma circom 2.2.2;

include "../node_modules/keccak256-circom/circuits/keccak.circom";

template Withdrawal() {
    var ARRAY_LEN = 32;

    var BYTES_16 = 16 * 8;
    var BYTES_32 = 32 * 8;
    var BYTES_84 = 84 * 8;

    // Merkle root, 32 bytes, computed with keccak256.
    signal input root[BYTES_32];
    // User's secret key, a string of 16 characters, 16 bytes.
    // On the UI, it will be converted from a 16 character string
    // to hex to buffer to uint8 to bits.
    signal input secretKey[BYTES_16];
    // Withdrawal key, an 84 byte hex.
    signal input withdrawalkey[BYTES_84];
    // Merkle Proof formatted for Circom already.
    // 32 arrays, all containing 32-byte info in bits.
    signal input proof[ARRAY_LEN][BYTES_32];
    // Direction each 32 byte array will go to the subsequent
    // hash.
    signal input direction[ARRAY_LEN];
    // Valid bits, an array with 1s and 0s, control array.
    // Wherever 0 starts, the loop stops.
    signal input validBits[ARRAY_LEN];

    // This signal holds tiny info when needed;
    // Signal? Variable?
    // Var for now. @todo Consider changing these.
    var currentHash;
    // This holds the re-computed deposit key.
    var depositKey[BYTES_84];
    // This holds the concatenated withdrawalkey and secret key.
    var wKeyAndSKeyConcat[BYTES_84 + BYTES_16];

    // STEP 1 START.
    // Intermediate signals will hold the result of every step.
    // Recompute deposit key.
    // On the smart contract, encodePacked, here, concatenated.
    // First, copy all withdrawal key values into the concat.
    for (var i = 0; i < BYTES_84; i++) {
        wKeyAndSKeyConcat[i] = withdrawalkey[i];
    }

    // Copy the secret key.
    // 0 - 83 is occupied.
    // Start from 84.
    for (var i = 0; i < BYTES_16; i++) {
        var insertIndex = (84 * 8) + i;
        wKeyAndSKeyConcat[insertIndex] = secretKey[i];
    }

    component keyConcatHash = Keccak(BYTES_84 + BYTES_16, BYTES_32);
    keyConcatHash.in <== wKeyAndSKeyConcat;

    // Hold the hash of the above in this.
    // @note THIS IS NOT A CONSTRAINT!
    signal wKeyAndSKeyConcatHash[BYTES_32] <-- keyConcatHash.out;
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
    for (var i = 32 * 8; i < BYTES_84; i++) {
        depositKey[i] = withdrawalkey[i];
    }
    // STEP 2 END.
}