// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Single Value Example
/// @notice Demonstrates FHE encryption mechanism and common pitfalls
/// @dev This example shows:
///   - How to encrypt a single value using FHEVM
///   - Input proof verification
///   - Permission management (critical!)
///   - Common mistakes to avoid
contract EncryptSingleValue is ZamaEthereumConfig {
  /// @dev Mapping to store encrypted values per user
  mapping(address => euint32) private userValues;

  /// @notice Emitted when a value is encrypted and stored
  event ValueEncrypted(address indexed user);

  /// @notice Encrypts and stores a single value for the caller
  /// @dev ✅ CORRECT PATTERN: This function demonstrates the proper way to encrypt and store a value
  /// @param inputEuint32 The encrypted input value (external format)
  /// @param inputProof The zero-knowledge proof verifying the encrypted input
  function encryptAndStore(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    // ✅ STEP 1: Decrypt external input with proof verification
    // This verifies that the input was encrypted correctly for this contract
    // and that the caller has control of the encryption key
    euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);

    // ✅ STEP 2: Store the encrypted value
    userValues[msg.sender] = encryptedValue;

    // ✅ STEP 3: CRITICAL - Grant permissions!
    // Without these lines, the contract and user cannot access the value
    FHE.allowThis(encryptedValue);           // Allow THIS contract to use the value
    FHE.allow(encryptedValue, msg.sender);   // Allow the USER to decrypt the value

    emit ValueEncrypted(msg.sender);
  }

  /// @notice Retrieves the encrypted value for the caller
  /// @dev The user can only decrypt their own value if FHE.allow() was called
  /// @return The encrypted value as euint32
  function getValue() external view returns (euint32) {
    return userValues[msg.sender];
  }

  /// @notice Retrieves the encrypted value for a specific user
  /// @dev Only the owner of the value can retrieve it (access control)
  /// @param user The address of the user
  /// @return The encrypted value as euint32
  function getValueFor(address user) external view returns (euint32) {
    // ✅ CORRECT: Access control - only the owner can view their value
    require(msg.sender == user, "Not authorized to view this value");
    return userValues[user];
  }

  /// @notice Updates an existing encrypted value
  /// @dev This demonstrates updating stored encrypted data
  /// @param inputEuint32 The new encrypted value (external format)
  /// @param inputProof The zero-knowledge proof for the new value
  function updateValue(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    // ✅ Decrypt and verify new value
    euint32 newValue = FHE.fromExternal(inputEuint32, inputProof);

    // Update storage
    userValues[msg.sender] = newValue;

    // ✅ CRITICAL: Grant permissions for the new value
    FHE.allowThis(newValue);
    FHE.allow(newValue, msg.sender);
  }
}

/// @title Encrypt Single Value (Bad Example)
/// @notice ❌ This contract demonstrates COMMON MISTAKES - DO NOT USE IN PRODUCTION!
/// @dev This shows what happens when you forget critical steps
contract EncryptSingleValueBad {
  mapping(address => euint32) private userValues;

  /// @notice ❌ WRONG: Missing permission grants
  /// @dev This will compile but fail at runtime when trying to use the value
  function encryptAndStoreBad(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
    userValues[msg.sender] = encryptedValue;

    // ❌ MISSING: FHE.allowThis(encryptedValue);
    // ❌ MISSING: FHE.allow(encryptedValue, msg.sender);
    // Result: User cannot decrypt the value later!
  }

  /// @notice ❌ WRONG: Missing FHE.allowThis()
  /// @dev Only granting user permission is not enough
  function encryptAndStorePartiallyBad(
    externalEuint32 inputEuint32,
    bytes calldata inputProof
  ) external {
    euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
    userValues[msg.sender] = encryptedValue;

    // ❌ MISSING: FHE.allowThis(encryptedValue);
    FHE.allow(encryptedValue, msg.sender); // User permission alone is insufficient!
    // Result: Contract operations on this value will fail!
  }

  function getValue() external view returns (euint32) {
    return userValues[msg.sender];
  }
}
