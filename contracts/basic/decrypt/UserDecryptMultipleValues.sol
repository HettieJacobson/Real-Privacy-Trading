// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Multiple Values Example
/// @notice Demonstrates how to decrypt multiple encrypted values for a user
/// @dev This example shows:
///   - Decrypting multiple values efficiently
///   - Managing permissions for batch decryption
///   - Access control for multi-value retrieval
///   - Selective decryption patterns
contract UserDecryptMultipleValues is ZamaEthereumConfig {
  /// @dev Structure to hold multiple encrypted values
  struct EncryptedDataset {
    euint32 value1;
    euint32 value2;
    euint32 value3;
    bool initialized;
  }

  /// @dev Mapping to store datasets per user
  mapping(address => EncryptedDataset) private datasets;

  /// @notice Emitted when multiple values are stored
  event DatasetStored(address indexed user);

  /// @notice Stores three encrypted values for the user to later decrypt
  /// @dev ✅ CORRECT PATTERN: Store multiple values with proper permissions
  /// @param input1 First encrypted value (external format)
  /// @param proof1 Zero-knowledge proof for first value
  /// @param input2 Second encrypted value (external format)
  /// @param proof2 Zero-knowledge proof for second value
  /// @param input3 Third encrypted value (external format)
  /// @param proof3 Zero-knowledge proof for third value
  function storeDataset(
    externalEuint32 input1,
    bytes calldata proof1,
    externalEuint32 input2,
    bytes calldata proof2,
    externalEuint32 input3,
    bytes calldata proof3
  ) external {
    // ✅ Decrypt all external inputs
    euint32 encrypted1 = FHE.fromExternal(input1, proof1);
    euint32 encrypted2 = FHE.fromExternal(input2, proof2);
    euint32 encrypted3 = FHE.fromExternal(input3, proof3);

    // Store the dataset
    datasets[msg.sender] = EncryptedDataset({
      value1: encrypted1,
      value2: encrypted2,
      value3: encrypted3,
      initialized: true
    });

    // ✅ CRITICAL: Grant permissions for ALL values
    FHE.allowThis(encrypted1);
    FHE.allow(encrypted1, msg.sender);

    FHE.allowThis(encrypted2);
    FHE.allow(encrypted2, msg.sender);

    FHE.allowThis(encrypted3);
    FHE.allow(encrypted3, msg.sender);

    emit DatasetStored(msg.sender);
  }

  /// @notice Returns all three encrypted values (without decryption)
  /// @dev ✅ CORRECT: Can return encrypted values directly
  /// @return The encrypted dataset
  function getEncryptedDataset()
    external
    view
    returns (euint32 v1, euint32 v2, euint32 v3)
  {
    require(datasets[msg.sender].initialized, "No dataset stored");
    EncryptedDataset memory data = datasets[msg.sender];
    return (data.value1, data.value2, data.value3);
  }

  /// @notice Decrypts and returns all three values
  /// @dev ✅ CORRECT: User can decrypt all their own values
  /// @return All three decrypted values as a tuple
  function decryptAllValues()
    external
    view
    returns (uint32 value1, uint32 value2, uint32 value3)
  {
    require(datasets[msg.sender].initialized, "No dataset stored");
    EncryptedDataset memory data = datasets[msg.sender];

    // ✅ Type casting triggers decryption
    return (uint32(data.value1), uint32(data.value2), uint32(data.value3));
  }

  /// @notice Decrypts only a specific value by index
  /// @dev Shows selective decryption - useful for large datasets
  /// @param index Index of value to decrypt (0, 1, or 2)
  /// @return The decrypted value at the specified index
  function decryptSingleValue(uint8 index) external view returns (uint32) {
    require(datasets[msg.sender].initialized, "No dataset stored");
    require(index < 3, "Index out of range");

    EncryptedDataset memory data = datasets[msg.sender];

    // ✅ Return specific value based on index
    if (index == 0) {
      return uint32(data.value1);
    } else if (index == 1) {
      return uint32(data.value2);
    } else {
      return uint32(data.value3);
    }
  }

  /// @notice Decrypts values for authorized user only
  /// @dev ✅ CORRECT: Access control - only owner can decrypt
  /// @param user The address of the owner
  /// @return All three decrypted values
  function decryptForUser(address user)
    external
    view
    returns (uint32 value1, uint32 value2, uint32 value3)
  {
    // ✅ Access control: Only the owner can decrypt their values
    require(msg.sender == user, "Only owner can decrypt");
    require(datasets[user].initialized, "No dataset stored");

    EncryptedDataset memory data = datasets[user];
    return (uint32(data.value1), uint32(data.value2), uint32(data.value3));
  }

  /// @notice Gets decrypted values with role-based access
  /// @dev Advanced pattern with different access levels
  /// @param user The user whose data to access
  /// @param role The role of the requester (0=owner, 1=authorized, 2=public)
  /// @return Selected decrypted values based on role
  function decryptWithRoleAccess(address user, uint8 role)
    external
    view
    returns (uint32 value1, uint32 value2)
  {
    require(datasets[user].initialized, "No dataset stored");

    if (role == 0) {
      // ✅ Owner - can see all
      require(msg.sender == user, "Not owner");
      EncryptedDataset memory data = datasets[user];
      return (uint32(data.value1), uint32(data.value2));
    } else if (role == 1) {
      // Authorized - can see only first value
      require(msg.sender == user, "Not authorized");
      EncryptedDataset memory data = datasets[user];
      return (uint32(data.value1), 0);
    } else {
      // Public - cannot see any
      revert("Public access not allowed");
    }
  }

  /// @notice Updates the dataset
  /// @dev Demonstrates updating multiple values at once
  /// @param input1 New first value
  /// @param proof1 Proof for first value
  /// @param input2 New second value
  /// @param proof2 Proof for second value
  /// @param input3 New third value
  /// @param proof3 Proof for third value
  function updateDataset(
    externalEuint32 input1,
    bytes calldata proof1,
    externalEuint32 input2,
    bytes calldata proof2,
    externalEuint32 input3,
    bytes calldata proof3
  ) external {
    // ✅ Decrypt all new values
    euint32 encrypted1 = FHE.fromExternal(input1, proof1);
    euint32 encrypted2 = FHE.fromExternal(input2, proof2);
    euint32 encrypted3 = FHE.fromExternal(input3, proof3);

    // Update storage
    datasets[msg.sender] = EncryptedDataset({
      value1: encrypted1,
      value2: encrypted2,
      value3: encrypted3,
      initialized: true
    });

    // ✅ CRITICAL: Grant permissions for all new values
    FHE.allowThis(encrypted1);
    FHE.allow(encrypted1, msg.sender);

    FHE.allowThis(encrypted2);
    FHE.allow(encrypted2, msg.sender);

    FHE.allowThis(encrypted3);
    FHE.allow(encrypted3, msg.sender);
  }

  /// @notice Checks if user has a dataset
  /// @param user Address to check
  /// @return True if user has stored dataset
  function hasDataset(address user) external view returns (bool) {
    return datasets[user].initialized;
  }

  /// @notice Clears the dataset
  function clearDataset() external {
    delete datasets[msg.sender];
  }
}
