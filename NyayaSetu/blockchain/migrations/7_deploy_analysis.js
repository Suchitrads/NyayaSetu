const Analysis = artifacts.require("Analysis");

module.exports = function (deployer) {
  deployer.deploy(Analysis);
};