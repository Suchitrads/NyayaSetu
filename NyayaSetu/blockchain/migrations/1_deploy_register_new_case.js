const RegisterNewCase = artifacts.require("RegisterNewCase");

module.exports = function (deployer) {
  deployer.deploy(RegisterNewCase);
};