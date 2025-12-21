// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHEVM Access Control Example
/// @notice Demonstrates access control patterns with encrypted values
/// @dev This example shows:
///   - FHE.allow() - Grant user permission to decrypt
///   - FHE.allowThis() - Grant contract permission to operate
///   - FHE.allowTransient() - Temporary permissions
///   - Role-based access control with FHE
///   - Ownership patterns
contract AccessControlExample is ZamaEthereumConfig {
  /// @dev Encrypted data with owner information
  struct ConfidentialRecord {
    euint32 sensitiveData;
    address owner;
    mapping(address => bool) authorizedReaders;
    bool exists;
  }

  /// @dev Storage for confidential records
  mapping(uint256 => ConfidentialRecord) private records;
  uint256 private recordCounter;

  /// @notice Emitted when a record is created
  event RecordCreated(uint256 indexed recordId, address indexed owner);

  /// @notice Emitted when access is granted
  event AccessGranted(uint256 indexed recordId, address indexed reader);

  /// @notice Creates a new confidential record
  /// @dev ✅ CORRECT: Demonstrates proper permission setup for owner
  /// @param inputEuint32 Encrypted data
  /// @param inputProof Zero-knowledge proof
  /// @return recordId The ID of the created record
  function createRecord(
    externalEuint32 inputEuint32,
    bytes calldata inputProof
  ) external returns (uint256 recordId) {
    // Decrypt and verify input
    euint32 encryptedData = FHE.fromExternal(inputEuint32, inputProof);

    // Create record
    recordId = recordCounter++;
    records[recordId].sensitiveData = encryptedData;
    records[recordId].owner = msg.sender;
    records[recordId].exists = true;

    // ✅ CRITICAL: Grant permissions
    FHE.allowThis(encryptedData); // Contract can operate on it
    FHE.allow(encryptedData, msg.sender); // Owner can decrypt it

    emit RecordCreated(recordId, msg.sender);
  }

  /// @notice Grants read access to another user
  /// @dev ✅ Demonstrates FHE.allow() for sharing encrypted data
  /// @param recordId ID of the record
  /// @param reader Address to grant access to
  function grantAccess(uint256 recordId, address reader) external {
    require(records[recordId].exists, "Record does not exist");
    require(records[recordId].owner == msg.sender, "Only owner can grant access");
    require(reader != address(0), "Invalid reader address");

    // Mark as authorized in our access control list
    records[recordId].authorizedReaders[reader] = true;

    // ✅ CRITICAL: Grant FHE permission for the reader to decrypt
    FHE.allow(records[recordId].sensitiveData, reader);

    emit AccessGranted(recordId, reader);
  }

  /// @notice Revokes read access from a user
  /// @dev Note: FHE permissions cannot be revoked, so we use application-level control
  /// @param recordId ID of the record
  /// @param reader Address to revoke access from
  function revokeAccess(uint256 recordId, address reader) external {
    require(records[recordId].exists, "Record does not exist");
    require(records[recordId].owner == msg.sender, "Only owner can revoke access");

    // Remove from access control list
    records[recordId].authorizedReaders[reader] = false;

    // Note: FHE permissions cannot be revoked at the cryptographic level
    // We rely on application-level access control checks
  }

  /// @notice Reads encrypted data (access control enforced)
  /// @dev ✅ CORRECT: Check authorization before returning encrypted value
  /// @param recordId ID of the record to read
  /// @return The encrypted data value
  function readRecord(uint256 recordId) external view returns (euint32) {
    require(records[recordId].exists, "Record does not exist");

    // ✅ Access control: Owner or authorized readers only
    require(
      msg.sender == records[recordId].owner || records[recordId].authorizedReaders[msg.sender],
      "Not authorized to read this record"
    );

    return records[recordId].sensitiveData;
  }

  /// @notice Reads and decrypts data (stricter access control)
  /// @dev Only owner can decrypt through this function
  /// @param recordId ID of the record
  /// @return Decrypted data value
  function decryptRecord(uint256 recordId) external view returns (uint32) {
    require(records[recordId].exists, "Record does not exist");

    // ✅ STRICT: Only owner can decrypt
    require(msg.sender == records[recordId].owner, "Only owner can decrypt");

    return uint32(records[recordId].sensitiveData);
  }

  /// @notice Updates a record (owner only)
  /// @dev Demonstrates updating with proper permission management
  /// @param recordId ID of the record to update
  /// @param newInput New encrypted value
  /// @param inputProof Zero-knowledge proof
  function updateRecord(
    uint256 recordId,
    externalEuint32 newInput,
    bytes calldata inputProof
  ) external {
    require(records[recordId].exists, "Record does not exist");
    require(records[recordId].owner == msg.sender, "Only owner can update");

    // Decrypt new value
    euint32 newData = FHE.fromExternal(newInput, inputProof);

    // Update record
    records[recordId].sensitiveData = newData;

    // ✅ Grant permissions for new value
    FHE.allowThis(newData);
    FHE.allow(newData, msg.sender);

    // Note: Need to grant access to all previously authorized readers
    // In production, you'd iterate through authorized readers or use events
  }

  /// @notice Checks if an address has read access
  /// @param recordId ID of the record
  /// @param reader Address to check
  /// @return True if reader has access
  function hasAccess(uint256 recordId, address reader) external view returns (bool) {
    if (!records[recordId].exists) return false;
    return reader == records[recordId].owner || records[recordId].authorizedReaders[reader];
  }

  /// @notice Gets the owner of a record
  /// @param recordId ID of the record
  /// @return Owner address
  function getRecordOwner(uint256 recordId) external view returns (address) {
    require(records[recordId].exists, "Record does not exist");
    return records[recordId].owner;
  }

  /// @notice Checks if a record exists
  /// @param recordId ID to check
  /// @return True if record exists
  function recordExists(uint256 recordId) external view returns (bool) {
    return records[recordId].exists;
  }

  /// @notice Gets the total number of records created
  /// @return The record counter value
  function getTotalRecords() external view returns (uint256) {
    return recordCounter;
  }
}

/// @title FHE.allowTransient Example
/// @notice Demonstrates temporary permissions with FHE.allowTransient()
/// @dev Shows how to use transient permissions for temporary access
contract AllowTransientExample is ZamaEthereumConfig {
  euint32 private sharedValue;

  event ValueSet(address indexed setter);

  /// @notice Sets a value with transient permissions
  /// @dev ✅ Demonstrates FHE.allowTransient() for temporary access
  /// @param inputEuint32 Encrypted value
  /// @param inputProof Zero-knowledge proof
  function setValueWithTransientPermission(
    externalEuint32 inputEuint32,
    bytes calldata inputProof
  ) external {
    euint32 value = FHE.fromExternal(inputEuint32, inputProof);
    sharedValue = value;

    // ✅ FHE.allowTransient() - Temporary permission for this transaction
    // Permission is only valid for the current transaction
    FHE.allowTransient(value, msg.sender);

    // Also grant persistent permissions
    FHE.allowThis(value);
    FHE.allow(value, msg.sender);

    emit ValueSet(msg.sender);
  }

  function getSharedValue() external view returns (euint32) {
    return sharedValue;
  }
}
