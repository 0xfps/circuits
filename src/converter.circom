pragma circom  2.2.2;

include "../node_modules/circomlib/circuits/bitify.circom";

// Converts bits to number.
template Converter(bits) {
    signal input in[bits];
    signal output out;

    component converter = Bits2Num(bits);
    converter.in <== in;
    out <== converter.out;
}

template ConvertToBits(bitsOut) {
    signal input in;
    signal output out[bitsOut];

    component converter = Num2Bits(bitsOut);
    converter.in <== in;
    out <== converter.out;
}