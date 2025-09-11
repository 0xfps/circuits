rm -rf node_modules
npm i
cd node_modules/keccak256-circom
npm i

circom main.circom --wasm --r1cs -l node_modules