const Integrity = artifacts.require("Integrity");

module.exports = function (deployer) {
  deployer.deploy(Integrity);
};