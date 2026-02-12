const EvidenceTransfer = artifacts.require("EvidenceTransfer");

module.exports = function (deployer) {
  deployer.deploy(EvidenceTransfer);
};