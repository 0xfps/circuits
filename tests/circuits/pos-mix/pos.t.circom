pragma circom 2.2.2;

include "../../../node_modules/keccak256-circom/circuits/keccak.circom";
include "../../../node_modules/circomlib/circuits/poseidon.circom";
include "../../../src/converter.circom";

template Hash() {
    var ARRAY_LEN = 32;

    var BYTES_16 = 16 * 8;
    var BYTES_32 = 32 * 8;
    var BYTES_64 = 64 * 8;
    var BYTES_84 = 84 * 8;

    // User's secret key, a string of 16 characters, 16 bytes.
    // On the UI, it will be converted from a 16 character string
    // to hex to buffer to uint8 to bits.
    signal input secretKey[BYTES_16];
    // Withdrawal key, an 84 byte hex.
    signal input withdrawalKey[BYTES_84];
    signal input preimage[BYTES_32];

    signal input hashEquiv[BYTES_32];

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


    component p = Converter(BYTES_32);
    p.in <== wKeyAndSKeyConcatHash;
    log("Withdrawal Key Concat Hash", p.out);



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

    component d = Converter(BYTES_32);
    component e = Converter(BYTES_32);

    d.in <== depositKeyHash;
    e.in <== preimage;

    component pos = Poseidon(2);
    pos.inputs[0] <== d.out;
    pos.inputs[1] <== e.out;

    log("Key Hash", d.out);
    log("Preimage hash", e.out);

    component a = Converter(BYTES_32);
    a.in <== hashEquiv;

    log("Hash passed", a.out);
    log("\n");

    signal outer <-- pos.out;

    log("Poseidon Hash", outer);

    outer === a.out;

    // // STEP 3 START.
    // // This is where it gets quite complex.
    // component currentHashToNumConverter = Bits2Num(BYTES_32);
    // currentHashToNumConverter.in <== depositKeyHash;
    // // Board L1.
    // signal currentHashInNum[ARRAY_LEN + 1];
    // currentHashInNum[0] <-- currentHashToNumConverter.out;
}

component main = Hash();