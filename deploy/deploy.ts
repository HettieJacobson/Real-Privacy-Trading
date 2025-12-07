import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploy Real Privacy Trading Smart Contract
 *
 * This deployment script demonstrates FHEVM deployment best practices:
 * - Proper contract initialization
 * - Event logging for verification
 * - Error handling and validation
 */
const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("\n🚀 Starting Real Privacy Trading Deployment");
  console.log(`📍 Network: ${network.name}`);
  console.log(`👤 Deployer: ${deployer}\n`);

  try {
    // Deploy RealPrivacyTrading Contract
    console.log("📝 Deploying RealPrivacyTrading contract...");

    const deploymentResult = await deploy("RealPrivacyTrading", {
      from: deployer,
      args: [],
      log: true,
      skipIfAlreadyDeployed: false,
    });

    const contractAddress = deploymentResult.address;

    console.log("\n✅ Deployment Successful!");
    console.log(`📍 Contract Address: ${contractAddress}`);
    console.log(`📦 Transaction Hash: ${deploymentResult.transactionHash}`);
    console.log(`⛽ Gas Used: ${deploymentResult.receipt?.gasUsed || "N/A"}`);

    // Verify contract on Etherscan (if on Sepolia)
    if (network.name === "sepolia") {
      console.log("\n🔍 Verifying contract on Etherscan...");
      console.log(`   URL: https://sepolia.etherscan.io/address/${contractAddress}`);
      console.log(`\n   To verify, run:`);
      console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
    }

    // Save deployment info
    const deploymentInfo = {
      contractAddress,
      network: network.name,
      deployer,
      deploymentTime: new Date().toISOString(),
      transactionHash: deploymentResult.transactionHash,
      blockNumber: deploymentResult.receipt?.blockNumber,
    };

    console.log("\n📋 Deployment Information:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Log next steps
    console.log("\n📌 Next Steps:");
    console.log("1. Verify deployment:");
    console.log(`   npx hardhat verify --network ${network.name} ${contractAddress}`);
    console.log("\n2. Run tests:");
    console.log(`   npm run test`);
    console.log("\n3. Interact with contract:");
    console.log(`   npx hardhat console --network ${network.name}`);

    return true;
  } catch (error) {
    console.error("\n❌ Deployment Failed!");
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (error.stack) {
        console.error(error.stack);
      }
    } else {
      console.error(error);
    }
    throw error;
  }
};

deploy.tags = ["RealPrivacyTrading"];
deploy.dependencies = [];

export default deploy;
