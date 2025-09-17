cd outputs
rm -rf *
cd ..

rm main.r1cs
rm -rf main_js
circom main.circom --wasm --r1cs -l node_modules

cd main_js
node generate_witness main.wasm ../input.json witness.wtns
cd ..

# Phase 1.
snarkjs powersoftau new bn128 20 outputs/main.ptau -v
snarkjs powersoftau contribute outputs/main.ptau outputs/main2.ptau --name="ATTP Default Contribution 2" -v

# Phase 2.
snarkjs powersoftau prepare phase2 outputs/main2.ptau outputs/main_final.ptau -v
snarkjs groth16 setup main.r1cs outputs/main_final.ptau outputs/main.zkey
snarkjs zkey contribute outputs/main.zkey outputs/main2.zkey --name="ATTP Default Contribution 3" -v
snarkjs zkey export verificationkey outputs/main2.zkey outputs/verification_key.json
snarkjs groth16 prove outputs/main2.zkey main_js/witness.wtns outputs/proof.json outputs/public.json
snarkjs groth16 verify outputs/verification_key.json outputs/public.json outputs/proof.json
snarkjs zkey export solidityverifier outputs/main2.zkey outputs/Verifier.sol