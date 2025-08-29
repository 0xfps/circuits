pragma circom  2.2.2;

include "../node_modules/circomlib/circuits/bitify.circom";

template Converter(bits) {
    signal input in[bits];
    signal output out;

    component converter = Bits2Num(bits);
    converter.in <== in;
    out <== converter.out;
}