pragma circom 2.2.2;

include "../node_modules/circomlib/circuits/poseidon.circom";

template Hash() {
    signal input in;
    signal output hash;

    component hasher = Poseidon(1);
    hasher.inputs[0] <== in;
    
    hash <== hasher.out;
}

template HashMul(num) {
    signal input in[num];
    signal output hash;

    component hasher = Poseidon(num);
    
    for (var i = 0; i < num; i++) {
        hasher.inputs[i] <== in[i];
    }

    hash <== hasher.out;
}

template HashLeftRight() {
    signal input left;
    signal input right;
    signal output hash;

    component hasher = Poseidon(2);
    hasher.inputs[0] <== left;
    hasher.inputs[1] <== right;
    
    hash <== hasher.out;
}