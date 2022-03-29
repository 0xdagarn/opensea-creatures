require("dotenv").config();
const Creature = artifacts.require("./Creature.sol");
const CreatureFactory = artifacts.require("./CreatureFactory.sol");

module.exports = async (deployer, network) => {
  // OpenSea proxy registry addresses for rinkeby and mainnet.
  let proxyRegistryAddress = "";
  if (network === 'rinkeby') {
    proxyRegistryAddress = "0x1E525EEAF261cA41b809884CBDE9DD9E1619573A";
  } else {
    proxyRegistryAddress = "0xa5409ec958c83c3f309868babaca7c86dcb077c1";
  }

  await deployer.deploy(Creature, proxyRegistryAddress, {gas: 5000000});
  await deployer.deploy(CreatureFactory, proxyRegistryAddress, Creature.address, {gas: 7000000});
  const creature = await Creature.deployed();
  await creature.transferOwnership(CreatureFactory.address);

  console.log("Deploying is finished. 👏👏👏");
};
