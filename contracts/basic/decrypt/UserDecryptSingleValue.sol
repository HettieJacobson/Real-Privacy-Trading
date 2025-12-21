// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Single Value Example
/// @notice Demonstrates the FHE user decryption mechanism and highlights common pitfalls
/// @dev This example shows:
///   - How users decrypt their own encrypted values
///   - Permission requirements for decryption
///   - View functions with encrypted values
///   - Common mistakes with decryption
contract UserDecryptSingleValue is ZamaEthereumConfig {
  /// @dev Mapping to store encrypted values per user
  mapping(address => euint32) private secretValues;

  /// @notice Emitted when a value is stored for decryption
  event SecretStored(address indexed user);

  /// @notice Stores an encrypted value that the user can later decrypt
  /// @dev ✅ CORRECT PATTERN: Store encrypted value with proper permissions
  /// @param inputEuint32 The encrypted value (external format)
  /// @param inputProof The zero-knowledge proof
  function storeSecret(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    // ✅ Decrypt external input with proof verification
    euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);

    // Store the encrypted value
    secretValues[msg.sender] = encryptedValue;

    // ✅ CRITICAL: Grant permissions for the CALLER to decrypt
    FHE.allowThis(encryptedValue);           // Contract can use it
    FHE.allow(encryptedValue, msg.sender);   // User can decrypt it

    emit SecretStored(msg.sender);
  }

  /// @notice Returns the encrypted secret value
  /// @dev ✅ CORRECT: View function returning encrypted value
  /// This is allowed - the value is encrypted so no plaintext is exposed
  /// @return The encrypted secret value
  function getSecretEncrypted() external view returns (euint32) {
    return secretValues[msg.sender];
  }

  /// @notice Retrieves the decrypted secret value
  /// @dev ✅ CORRECT: User can decrypt their own value if they have permission
  /// This view function will work only for the caller (owner of the value)
  /// @return The decrypted plaintext value
  function decryptSecret() external view returns (uint32) {
    return uint32(secretValues[msg.sender]); // Type casting triggers decryption
  }

  /// @notice Gets decrypted secret for a specific user
  /// @dev ✅ CORRECT: Access control prevents unauthorized decryption
  /// Only the owner of the value can decrypt it
  /// @param user The address of the user
  /// @return The decrypted value if caller is authorized
  function getDecryptedSecretFor(address user) external view returns (uint32) {
    // ✅ CRITICAL: Access control - only owner can decrypt
    require(msg.sender == user, "Only owner can decrypt their secret");

    return uint32(secretValues[user]);
  }

  /// @notice Demonstrates what happens when user tries to decrypt someone else's value
  /// @dev ❌ This will return wrong or fail - encrypted values are user-bound
  /// @param user Address of another user
  /// @return This will fail or return encrypted data
  function attemptUnauthorizedDecrypt(address user) external view returns (uint32) {
    // ❌ SECURITY ISSUE: Attempting to decrypt another user's value
    // This will either fail with permission error or return encrypted data
    // Not decryptable plaintext!
    return uint32(secretValues[user]); // Security issue!
  }

  /// @notice Updates a stored secret
  /// @dev Shows how to update encrypted values with proper permission management
  /// @param newInput New encrypted value (external format)
  /// @param inputProof Zero-knowledge proof for new value
  function updateSecret(externalEuint32 newInput, bytes calldata inputProof) external {
    // ✅ Decrypt and verify new value
    euint32 newValue = FHE.fromExternal(newInput, inputProof);

    // Update storage
    secretValues[msg.sender] = newValue;

    // ✅ CRITICAL: Grant permissions for the new value
    FHE.allowThis(newValue);
    FHE.allow(newValue, msg.sender);
  }

  /// @notice Checks if a user has a stored secret
  /// @param user Address to check
  /// @return True if user has a stored secret
  function hasSecret(address user) external view returns (bool) {
    // This is public - showing that we can tell IF someone has a value
    // but cannot see WHAT the value is
    return user != address(0); // Placeholder - in real contracts, use actual storage check
  }
}

/// @title User Decrypt Single Value (Bad Example)
/// @notice ❌ This contract demonstrates COMMON MISTAKES - DO NOT USE!
/// @dev This shows what NOT to do with encrypted values
contract UserDecryptSingleValueBad {
  mapping(address => euint32) private secretValues;

  /// @notice ❌ WRONG: Missing FHE.allow() for user decryption
  /// @dev User won't be able to decrypt the value later
  function storeSecretBad(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
    secretValues[msg.sender] = encryptedValue;

    // ❌ WRONG: Only granting contract permission
    FHE.allowThis(encryptedValue);
    // ❌ MISSING: FHE.allow(encryptedValue, msg.sender);
    // Result: User cannot decrypt their own value!
  }

  /// @notice ❌ WRONG: View function trying to decrypt without permission
  /// @dev This will fail at runtime - unauthorized decryption
  function getDecryptedSecretWrong() external view returns (uint32) {
    // ❌ WRONG: Attempting to decrypt without proper permissions
    // This will fail because:
    // 1. FHE.allow() was never called for the caller
    // 2. The value is not decryptable for this user
    return uint32(secretValues[msg.sender]);
  }

  /// @notice ❌ WRONG: Allowing anyone to decrypt anyone's secret
  /// @dev CRITICAL SECURITY ISSUE: No access control
  function getSecretNoAccessControl(address user) external view returns (uint32) {
    // ❌ SECURITY: No access control!
    // This would allow anyone to decrypt anyone else's secret if permissions were set
    return uint32(secretValues[user]);
  }

  /// @notice ❌ WRONG: Storing encrypted value without any permissions
  /// @dev Neither contract nor user can use the value
  function storeSecretNoPermissions(
    externalEuint32 inputEuint32,
    bytes calldata inputProof
  ) external {
    euint32 encryptedValue = FHE.fromExternal(inputEuint32, inputProof);
    secretValues[msg.sender] = encryptedValue;

    // ❌ MISSING: No FHE.allowThis()
    // ❌ MISSING: No FHE.allow()
    // Result: Value cannot be used at all!
  }

  function getSecret(address user) external view returns (euint32) {
    return secretValues[user];
  }
}
