const Report = artifacts.require("ReportSummary");

module.exports = function (deployer) {
  deployer.deploy(Report);
};