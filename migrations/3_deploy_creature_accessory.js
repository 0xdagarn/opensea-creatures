require("dotenv").config();
const CreatureAccessory = artifacts.require("../contracts/CreatureAccessory.sol");
const CreatureAccessoryFactory = artifacts.require("../contracts/CreatureAccessoryFactory.sol");
const CreatureAccessoryLootBox = artifacts.require(
  "../contracts/CreatureAccessoryLootBox.sol"
);
const LootBoxRandomness = artifacts.require(
  "../contracts/LootBoxRandomness.sol"
);

const setupCreatureAccessories = require("../lib/setupCreatureAccessories.js");

// If you want to hardcode what deploys, comment out process.env.X and use
// true/false;
const DEPLOY_ALL = process.env.DEPLOY_ALL;
const DEPLOY_ACCESSORIES_SALE = process.env.DEPLOY_ACCESSORIES_SALE || DEPLOY_ALL;
const DEPLOY_ACCESSORIES = process.env.DEPLOY_ACCESSORIES || DEPLOY_ACCESSORIES_SALE || DEPLOY_ALL;
const DEPLOY_CREATURES_SALE = process.env.DEPLOY_CREATURES_SALE || DEPLOY_ALL;

module.exports = async (deployer, network, addresses) => {
  // OpenSea proxy registry addresses for rinkeby and mainnet.
  let proxyRegistryAddress = "";
  if (network === 'rinkeby') {
    proxyRegistryAddress = "0x1E525EEAF261cA41b809884CBDE9DD9E1619573A";
  } else {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }

  await deployer.deploy(
    CreatureAccessory,
    proxyRegistryAddress,
    { gas: 5000000 }
  );
  const accessories = await CreatureAccessory.deployed();
  await setupCreatureAccessories.setupAccessory(
    accessories,
    addresses[0]
  );

  await deployer.deploy(LootBoxRandomness);
  await deployer.link(LootBoxRandomness, CreatureAccessoryLootBox);
  await deployer.deploy(
    CreatureAccessoryLootBox,
    proxyRegistryAddress,
    { gas: 6721975 }
  );
  const lootBox = await CreatureAccessoryLootBox.deployed();
  await deployer.deploy(
    CreatureAccessoryFactory,
    proxyRegistryAddress,
    CreatureAccessory.address,
    CreatureAccessoryLootBox.address,
    { gas: 5000000 }
  );
  const factory = await CreatureAccessoryFactory.deployed();
  await accessories.transferOwnership(
    CreatureAccessoryFactory.address
  );
  await setupCreatureAccessories.setupAccessoryLootBox(lootBox, factory);
  await lootBox.transferOwnership(factory.address);

  console.log("Deploying is finished. 👏👏👏");
};
