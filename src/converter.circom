pragma circom  2.2.2;

include "../node_modules/circomlib/circuits/bitify.circom";

template ConverterToNum(bits) {
    signal input in[2][bits];
    signal output out[2];

    component firstNumConverter = Bits2Num(bits);
    firstNumConverter.in <== in[0];
    out[0] <== firstNumConverter.out;

    component secondNumConverter = Bits2Num(bits);
    secondNumConverter.in <== in[1];
    out[1] <== secondNumConverter.out;
}

template ConverterToBits(bits) {
    signal input in;
    signal output out[bits];

    component converter = Num2Bits(bits);
    converter.in <== in;

    out <== converter.out;
}