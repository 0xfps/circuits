# TinyMerkleTree Circom Proof Circuit

A **zero-knowledge circuit** in Circom to verify Merkle proofs generated from [TinyMerkleTree](https://github.com/0xfps/tiny-merkle-tree-ts). This circuit allows proving inclusion of a leaf in a tree **without revealing other leaves**.

## Features

- Verifies a **Merkle proof** from [TinyMerkleTree](https://github.com/0xfps/tiny-merkle-tree-ts).
- Fixed depth trees (DEPTH configurable).
- Poseidon-based hashing for ZK compatibility.
- Efficient circuit size for verification.
- TypeScript-friendly for proof generation and verification.

## Merkle Proof Concept

To prove that a leaf `L` is in the tree with root `R`:

1. Provide the leaf value `L` (private)
2. Provide sibling hashes along the path (`pathElements`)
3. Provide left/right indices for each sibling (`pathIndices`)
4. Circuit recomputes hashes up to the root and asserts it equals `R`

```
Example Depth 3:

Leaf: L2
Proof Path: [H3, H1]
Root: H7

Circuit recomputes:
hash(L2, H3) -> H6
hash(H6, H1) -> H7'
Assert H7' == H7
```

## Circuit Interface

### Inputs

| Name             | Type      | Description |
|-----------------|----------|-------------|
| `leaf`          | private  | Leaf being proven |
| `pathElements`  | private  | Sibling hashes along the path |
| `pathIndices`   | private  | Left/right indices (0/1) |
| `root`          | public   | Merkle root to verify against |

### Constraints

- Hash function: Poseidon (`PoseidonT2` for two inputs)
- Depth: Fixed, must match TinyMerkleTree depth
- Computation is incremental from leaf → root
- Public output: boolean equality check `computedRoot == root`

## Notes

- Ensure **circuit depth matches TinyMerkleTree depth**
- Use **Poseidon** hash in the circuit identical to your tree
- Circuits scale **logarithmically** with depth; depth 32 is manageable
- Private inputs: `leaf`, `pathElements`
- Public input: `root`

### License

MIT