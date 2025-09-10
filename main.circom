pragma circom  2.2.2;

include "./src/withdrawal.circom";

component main { public[ root, withdrawalKey, nullifier ] } = Withdrawal();