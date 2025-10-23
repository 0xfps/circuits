pragma circom  2.2.2;

include "./src/withdrawal.circom";

component main { public[ root, withdrawalKeyNumPart1, withdrawalKeyNumPart2, slot, nullifier ] } = Withdrawal();