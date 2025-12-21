// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Counter
/// @notice A simple encrypted counter contract demonstrating basic FHEVM operations
/// @dev This example demonstrates:
///   - Encrypted state variables using euint32
///   - Input proofs for encrypted inputs
///   - FHE operations (add, subtract)
///   - Permission management (allowThis, allow)
contract FHECounter is ZamaEthereumConfig {
  /// @dev The encrypted counter value
  euint32 private _count;

  /// @notice Emitted when the counter is incremented
  event Incremented(address indexed user);

  /// @notice Emitted when the counter is decremented
  event Decremented(address indexed user);

  /// @notice Returns the encrypted counter value
  /// @return The encrypted counter as euint32
  function getCount() external view returns (euint32) {
    return _count;
  }

  /// @notice Increments the counter by an encrypted amount
  /// @dev This example omits overflow/underflow checks for simplicity and readability.
  ///      In a production contract, proper range checks should be implemented.
  /// @param inputEuint32 The encrypted amount to add (external format)
  /// @param inputProof The zero-knowledge proof for the encrypted input
  function increment(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    // ✅ CORRECT PATTERN: Decrypt external input with proof verification
    euint32 encryptedAmount = FHE.fromExternal(inputEuint32, inputProof);

    // ✅ CORRECT PATTERN: Perform FHE operation on encrypted values
    _count = FHE.add(_count, encryptedAmount);

    // ✅ CRITICAL: Grant both permissions after operation
    // Without these lines, the contract and user cannot access the value
    FHE.allowThis(_count);           // Allow contract to use this value
    FHE.allow(_count, msg.sender);   // Allow user to decrypt this value

    emit Incremented(msg.sender);
  }

  /// @notice Decrements the counter by an encrypted amount
  /// @dev This example omits overflow/underflow checks for simplicity and readability.
  ///      In a production contract, proper range checks should be implemented.
  /// @param inputEuint32 The encrypted amount to subtract (external format)
  /// @param inputProof The zero-knowledge proof for the encrypted input
  function decrement(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    // ✅ CORRECT PATTERN: Decrypt external input with proof verification
    euint32 encryptedAmount = FHE.fromExternal(inputEuint32, inputProof);

    // ✅ CORRECT PATTERN: Perform FHE operation on encrypted values
    _count = FHE.sub(_count, encryptedAmount);

    // ✅ CRITICAL: Grant both permissions after operation
    FHE.allowThis(_count);
    FHE.allow(_count, msg.sender);

    emit Decremented(msg.sender);
  }

  /// @notice Resets the counter to a new encrypted value
  /// @param inputEuint32 The new encrypted counter value (external format)
  /// @param inputProof The zero-knowledge proof for the encrypted input
  function reset(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    // ✅ CORRECT PATTERN: Decrypt external input with proof verification
    _count = FHE.fromExternal(inputEuint32, inputProof);

    // ✅ CRITICAL: Grant both permissions after operation
    FHE.allowThis(_count);
    FHE.allow(_count, msg.sender);
  }
}
