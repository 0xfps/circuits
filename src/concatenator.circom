pragma circom  2.2.2;

template Concatenator() {
    var BYTES_32 = 32 * 8;
    var BYTES_64 = 64 * 8;

    signal input firstHash[BYTES_32];
    signal input secondHash[BYTES_32];
    signal output concatHash[BYTES_64];
    signal input direction;

    direction * (1 - direction) === 0;

    for (var i = 0; i < BYTES_32; i++) {
        concatHash[i] <== (direction * BYTES_32) + i;
        concatHash[BYTES_32 + i] <== ((1 - direction) * BYTES_32) + i;
    }
}