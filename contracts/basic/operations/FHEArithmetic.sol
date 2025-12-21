// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Arithmetic Operations Example
/// @notice Demonstrates arithmetic operations (add, sub, mul) on encrypted values
/// @dev This example shows:
///   - Addition of encrypted values
///   - Subtraction of encrypted values
///   - Multiplication of encrypted values
///   - Chaining multiple operations
///   - Permission management for results
contract FHEArithmetic is ZamaEthereumConfig {
  /// @dev Stored encrypted values for the user
  mapping(address => euint32) private userBalances;

  /// @notice Emitted when a balance is updated
  event BalanceUpdated(address indexed user);

  /// @notice Initializes balance with an encrypted value
  /// @param inputEuint32 Initial encrypted balance
  /// @param inputProof Zero-knowledge proof
  function initializeBalance(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 initialBalance = FHE.fromExternal(inputEuint32, inputProof);
    userBalances[msg.sender] = initialBalance;

    FHE.allowThis(initialBalance);
    FHE.allow(initialBalance, msg.sender);

    emit BalanceUpdated(msg.sender);
  }

  /// @notice Adds an encrypted amount to the user's balance
  /// @dev ✅ CORRECT: Demonstrates FHE.add() operation
  /// @param inputEuint32 Encrypted amount to add
  /// @param inputProof Zero-knowledge proof
  function addToBalance(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    // Decrypt input
    euint32 amountToAdd = FHE.fromExternal(inputEuint32, inputProof);

    // ✅ FHE.add() - Add two encrypted values
    euint32 currentBalance = userBalances[msg.sender];
    euint32 newBalance = FHE.add(currentBalance, amountToAdd);

    // Store result
    userBalances[msg.sender] = newBalance;

    // ✅ CRITICAL: Grant permissions for new result
    FHE.allowThis(newBalance);
    FHE.allow(newBalance, msg.sender);

    emit BalanceUpdated(msg.sender);
  }

  /// @notice Subtracts an encrypted amount from the user's balance
  /// @dev ✅ CORRECT: Demonstrates FHE.sub() operation
  /// @param inputEuint32 Encrypted amount to subtract
  /// @param inputProof Zero-knowledge proof
  function subtractFromBalance(
    externalEuint32 inputEuint32,
    bytes calldata inputProof
  ) external {
    euint32 amountToSubtract = FHE.fromExternal(inputEuint32, inputProof);

    // ✅ FHE.sub() - Subtract two encrypted values
    euint32 currentBalance = userBalances[msg.sender];
    euint32 newBalance = FHE.sub(currentBalance, amountToSubtract);

    userBalances[msg.sender] = newBalance;

    FHE.allowThis(newBalance);
    FHE.allow(newBalance, msg.sender);

    emit BalanceUpdated(msg.sender);
  }

  /// @notice Multiplies the balance by an encrypted factor
  /// @dev ✅ CORRECT: Demonstrates FHE.mul() operation
  /// @param inputEuint32 Encrypted multiplier
  /// @param inputProof Zero-knowledge proof
  function multiplyBalance(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 multiplier = FHE.fromExternal(inputEuint32, inputProof);

    // ✅ FHE.mul() - Multiply two encrypted values
    euint32 currentBalance = userBalances[msg.sender];
    euint32 newBalance = FHE.mul(currentBalance, multiplier);

    userBalances[msg.sender] = newBalance;

    FHE.allowThis(newBalance);
    FHE.allow(newBalance, msg.sender);

    emit BalanceUpdated(msg.sender);
  }

  /// @notice Demonstrates chaining multiple operations
  /// @dev ✅ Shows (balance + amount1) * amount2 - amount3
  /// @param add Encrypted value to add
  /// @param addProof Proof for add value
  /// @param mul Encrypted multiplier
  /// @param mulProof Proof for multiplier
  /// @param sub Encrypted value to subtract
  /// @param subProof Proof for subtract value
  function complexOperation(
    externalEuint32 add,
    bytes calldata addProof,
    externalEuint32 mul,
    bytes calldata mulProof,
    externalEuint32 sub,
    bytes calldata subProof
  ) external {
    // Decrypt all inputs
    euint32 amountToAdd = FHE.fromExternal(add, addProof);
    euint32 multiplier = FHE.fromExternal(mul, mulProof);
    euint32 amountToSub = FHE.fromExternal(sub, subProof);

    euint32 currentBalance = userBalances[msg.sender];

    // ✅ Chain operations: (balance + add) * mul - sub
    euint32 step1 = FHE.add(currentBalance, amountToAdd); // Add first
    euint32 step2 = FHE.mul(step1, multiplier); // Then multiply
    euint32 result = FHE.sub(step2, amountToSub); // Finally subtract

    userBalances[msg.sender] = result;

    // ✅ Grant permissions for final result
    FHE.allowThis(result);
    FHE.allow(result, msg.sender);

    emit BalanceUpdated(msg.sender);
  }

  /// @notice Gets the encrypted balance
  /// @return The encrypted balance value
  function getBalance() external view returns (euint32) {
    return userBalances[msg.sender];
  }

  /// @notice Gets the decrypted balance
  /// @return The decrypted balance value
  function getDecryptedBalance() external view returns (uint32) {
    return uint32(userBalances[msg.sender]);
  }
}

/// @title FHE Comparison Operations Example
/// @notice Demonstrates comparison operations on encrypted values
contract FHEComparison is ZamaEthereumConfig {
  mapping(address => euint32) private values;

  event ValueStored(address indexed user);

  function storeValue(externalEuint32 inputEuint32, bytes calldata inputProof) external {
    euint32 value = FHE.fromExternal(inputEuint32, inputProof);
    values[msg.sender] = value;

    FHE.allowThis(value);
    FHE.allow(value, msg.sender);

    emit ValueStored(msg.sender);
  }

  /// @notice Checks if stored value equals a given encrypted value
  /// @dev ✅ Demonstrates FHE.eq() - equality comparison
  /// @param inputEuint32 Value to compare against
  /// @param inputProof Zero-knowledge proof
  /// @return Boolean result of comparison (encrypted)
  function isEqual(
    externalEuint32 inputEuint32,
    bytes calldata inputProof
  ) external view returns (bool) {
    euint32 compareValue = FHE.fromExternal(inputEuint32, inputProof);
    euint32 storedValue = values[msg.sender];

    // ✅ FHE.eq() - Returns encrypted boolean (ebool)
    // Note: Result would typically be ebool, but for simplicity we show the pattern
    // In real usage, you'd return ebool and decrypt if needed
    return FHE.decrypt(FHE.eq(storedValue, compareValue));
  }

  function getValue() external view returns (euint32) {
    return values[msg.sender];
  }
}
