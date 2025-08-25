pragma circom  2.2.2;

template Concatenator(direction) {
    var ARRAY_LEN = 32;

    var BYTES_32 = 32 * 8;
    var BYTES_64 = 64 * 8;

    signal input firstHash[BYTES_32];
    signal input secondHash[BYTES_32];
    signal output concatHash[BYTES_64];
    
    signal out[BYTES_64];

    direction * (1 - direction) === 0;

    for (var i = 0; i < ARRAY_LEN; i++) {
        out[i] = (direction * ARRAY_LEN) + i;
        out[32 + i] = (!direction * ARRAY_LEN) + i;
    }
    
    concatHash <== out;
}