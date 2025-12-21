// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Multiple Values Example
/// @notice Demonstrates how to encrypt and handle multiple values in a single transaction
/// @dev This example shows:
///   - Encrypting multiple values efficiently
///   - Managing permissions for multiple encrypted values
///   - Batch operations on encrypted data
///   - Best practices for multi-value encryption
contract EncryptMultipleValues is ZamaEthereumConfig {
  /// @dev Structure to hold multiple encrypted values per user
  struct EncryptedData {
    euint32 value1;
    euint32 value2;
    euint32 value3;
    bool initialized;
  }

  /// @dev Mapping to store encrypted data per user
  mapping(address => EncryptedData) private userData;

  /// @notice Emitted when multiple values are encrypted
  event MultipleValuesEncrypted(address indexed user, uint256 count);

  /// @notice Encrypts and stores three values for the caller
  /// @dev ✅ CORRECT PATTERN: This demonstrates encrypting multiple values in one transaction
  /// @param input1 First encrypted value (external format)
  /// @param proof1 Zero-knowledge proof for first value
  /// @param input2 Second encrypted value (external format)
  /// @param proof2 Zero-knowledge proof for second value
  /// @param input3 Third encrypted value (external format)
  /// @param proof3 Zero-knowledge proof for third value
  function encryptThreeValues(
    externalEuint32 input1,
    bytes calldata proof1,
    externalEuint32 input2,
    bytes calldata proof2,
    externalEuint32 input3,
    bytes calldata proof3
  ) external {
    // ✅ STEP 1: Decrypt all external inputs with proof verification
    euint32 encrypted1 = FHE.fromExternal(input1, proof1);
    euint32 encrypted2 = FHE.fromExternal(input2, proof2);
    euint32 encrypted3 = FHE.fromExternal(input3, proof3);

    // ✅ STEP 2: Store all encrypted values
    userData[msg.sender] = EncryptedData({
      value1: encrypted1,
      value2: encrypted2,
      value3: encrypted3,
      initialized: true
    });

    // ✅ STEP 3: CRITICAL - Grant permissions for ALL encrypted values
    // Each encrypted value needs both contract and user permissions
    FHE.allowThis(encrypted1);
    FHE.allow(encrypted1, msg.sender);

    FHE.allowThis(encrypted2);
    FHE.allow(encrypted2, msg.sender);

    FHE.allowThis(encrypted3);
    FHE.allow(encrypted3, msg.sender);

    emit MultipleValuesEncrypted(msg.sender, 3);
  }

  /// @notice Retrieves all three encrypted values for the caller
  /// @dev Returns the values in a tuple for convenient access
  /// @return value1 First encrypted value
  /// @return value2 Second encrypted value
  /// @return value3 Third encrypted value
  function getValues() external view returns (euint32 value1, euint32 value2, euint32 value3) {
    require(userData[msg.sender].initialized, "No data stored");
    EncryptedData memory data = userData[msg.sender];
    return (data.value1, data.value2, data.value3);
  }

  /// @notice Performs operation on all three encrypted values
  /// @dev ✅ Demonstrates FHE operations on multiple values
  /// @return The sum of all three encrypted values
  function sumAllValues() external view returns (euint32) {
    require(userData[msg.sender].initialized, "No data stored");
    EncryptedData memory data = userData[msg.sender];

    // ✅ CORRECT: Perform FHE operations on encrypted data
    euint32 sum = FHE.add(data.value1, data.value2);
    sum = FHE.add(sum, data.value3);

    return sum;
  }

  /// @notice Updates one of the encrypted values
  /// @dev Shows how to update individual values in a multi-value structure
  /// @param valueIndex Index of the value to update (0, 1, or 2)
  /// @param newInput New encrypted value (external format)
  /// @param inputProof Zero-knowledge proof for new value
  function updateSingleValue(
    uint8 valueIndex,
    externalEuint32 newInput,
    bytes calldata inputProof
  ) external {
    require(userData[msg.sender].initialized, "No data stored");
    require(valueIndex < 3, "Invalid index");

    // ✅ Decrypt and verify new value
    euint32 newValue = FHE.fromExternal(newInput, inputProof);

    // Update the specific value based on index
    if (valueIndex == 0) {
      userData[msg.sender].value1 = newValue;
    } else if (valueIndex == 1) {
      userData[msg.sender].value2 = newValue;
    } else {
      userData[msg.sender].value3 = newValue;
    }

    // ✅ CRITICAL: Grant permissions for the new value
    FHE.allowThis(newValue);
    FHE.allow(newValue, msg.sender);
  }

  /// @notice Checks if user has stored data
  /// @param user Address to check
  /// @return True if user has initialized data
  function hasData(address user) external view returns (bool) {
    return userData[user].initialized;
  }
}

/// @title Encrypt Multiple Values Array Example
/// @notice Demonstrates handling dynamic arrays of encrypted values
/// @dev More advanced pattern using arrays
contract EncryptMultipleValuesArray is ZamaEthereumConfig {
  /// @dev Maximum number of values per user
  uint256 public constant MAX_VALUES = 10;

  /// @dev Mapping to store dynamic arrays of encrypted values
  mapping(address => euint32[]) private userValuesArray;

  /// @notice Emitted when values are added
  event ValuesAdded(address indexed user, uint256 count);

  /// @notice Adds multiple encrypted values to the user's array
  /// @dev ✅ Demonstrates batch addition with proper permission handling
  /// @param inputs Array of encrypted inputs (external format)
  /// @param proofs Array of zero-knowledge proofs
  function addMultipleValues(
    externalEuint32[] calldata inputs,
    bytes[] calldata proofs
  ) external {
    require(inputs.length == proofs.length, "Input and proof array length mismatch");
    require(inputs.length > 0, "Cannot add zero values");
    require(
      userValuesArray[msg.sender].length + inputs.length <= MAX_VALUES,
      "Exceeds maximum values"
    );

    // ✅ Process and store all values
    for (uint256 i = 0; i < inputs.length; i++) {
      // Decrypt and verify each input
      euint32 encryptedValue = FHE.fromExternal(inputs[i], proofs[i]);

      // Add to array
      userValuesArray[msg.sender].push(encryptedValue);

      // ✅ CRITICAL: Grant permissions for each value
      FHE.allowThis(encryptedValue);
      FHE.allow(encryptedValue, msg.sender);
    }

    emit ValuesAdded(msg.sender, inputs.length);
  }

  /// @notice Gets the count of encrypted values for a user
  /// @param user Address to query
  /// @return Number of values stored
  function getValueCount(address user) external view returns (uint256) {
    return userValuesArray[user].length;
  }

  /// @notice Retrieves a specific encrypted value by index
  /// @param index Index in the array
  /// @return The encrypted value at the specified index
  function getValueAt(uint256 index) external view returns (euint32) {
    require(index < userValuesArray[msg.sender].length, "Index out of bounds");
    return userValuesArray[msg.sender][index];
  }

  /// @notice Computes the sum of all encrypted values
  /// @dev ✅ Demonstrates aggregation over multiple encrypted values
  /// @return The sum of all values in the array
  function sumAllValues() external view returns (euint32) {
    euint32[] memory values = userValuesArray[msg.sender];
    require(values.length > 0, "No values to sum");

    // Start with first value
    euint32 sum = values[0];

    // Add remaining values
    for (uint256 i = 1; i < values.length; i++) {
      sum = FHE.add(sum, values[i]);
    }

    return sum;
  }

  /// @notice Clears all values for the caller
  function clearValues() external {
    delete userValuesArray[msg.sender];
  }
}
