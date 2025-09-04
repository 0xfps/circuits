pragma circom 2.2.2;

// Sorts and returns two numbers based on dir.
// if dir == 0 returns [in[0], in[1]]
// if dir == 1 returns [in[1], in[0]]
template Sort() {
    // Number after converted from bits to number.
    signal input in[2];
    signal input dir;

    signal output out[2];

    dir * (1 - dir) === 0;
    
    out[0] <== (in[1] - in[0]) * dir + in[0];
    out[1] <== (in[0] - in[1]) * dir + in[1];
}