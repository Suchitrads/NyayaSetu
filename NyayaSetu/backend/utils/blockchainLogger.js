const { Web3 } = require('web3');
const path = require('path');
const fs = require('fs');

// Load environment variables for addresses and RPC URL
require('dotenv').config();

const web3 = new Web3(process.env.GANACHE_URL || 'http://127.0.0.1:7545');
const fromAddress = process.env.FROM_ADDRESS; // Set this in your .env

// Helper to load ABI and contract address
function getContract(contractName) {
    const abiPath = path.join(__dirname, '../abis', `${contractName}.json`);
    const contractJson = JSON.parse(fs.readFileSync(abiPath));
    // Replace with your deployed contract address
    const address = process.env[`${contractName.toUpperCase()}_ADDRESS`];
    return new web3.eth.Contract(contractJson.abi, address);
}

module.exports = {
    logRegisterCase: async (data) => {
        try {
            const contract = getContract('RegisterNewCase');
            await contract.methods.registerNewCase(
                data.caseId,
                data.caseName,
                data.selectedOfficer,
                data.selectedOfficerWallet,
                data.description,
                data.location,
                (data.suspects || []).map(s => s.name || s),
                (data.victims || []).map(v => v.name || v),
                (data.witnesses || []).map(w => w.name || w),
                data.status
            ).send({ from: fromAddress, gas: 3000000 });
        } catch (err) {
            console.error('Blockchain log failed (registerCase):', err.message);
            throw err;
        }
    },

    logUpdateCase: async (data) => {
        try {
            const contract = getContract('UpdateCase');
            await contract.methods.updateCaseStatus(
                data.caseId,
                data.status
            ).send({ from: fromAddress, gas: 3000000 });
        } catch (err) {
            console.error('Blockchain log failed (updateCase):', err.message);
            throw err;
        }
    },

    logAddEvidence: async (data) => {
        try {
            const contract = getContract('AddEvidence');
            await contract.methods.addEvidence(
                data.evidenceId,
                data.caseId,
                data.evidenceName,
                data.seizureLocation,
                data.collectorName,
                data.collectorWallet,
                data.investigatingOfficerName,
                data.investigatingOfficerWallet,
                data.description,
                data.type,
                data.condition
            ).send({ from: fromAddress, gas: 3000000 });
        } catch (err) {
            console.error('Blockchain log failed (addEvidence):', err.message);
            throw err;
        }
    },

    logUpdateEvidence: async (data) => {
        try {
            const contract = getContract('UpdateEvidence');
            await contract.methods.updateEvidenceStatus(
                data.evidenceId,
                data.condition
            ).send({ from: fromAddress, gas: 3000000 });
        } catch (err) {
            console.error('Blockchain log failed (updateEvidence):', err.message);
            throw err;
        }
    },

    logImagingEvidence: async (data) => {
        try {
            const contract = getContract('Imaging');
            await contract.methods.addImagingEvidence(
                data.fileName,
                data.sha256Hash,
                data.imagingDone,
                data.downloaded
            ).send({ from: fromAddress, gas: 3000000 });
        } catch (err) {
            console.error('Blockchain log failed (imagingEvidence):', err.message);
            throw err;
        }
    },


    logIntegrityRecord: async (data) => {
        try {
            const contract = getContract('Integrity');
            await contract.methods.addIntegrityRecord(
                data.evidenceId,
                data.sha256Hash,
                data.status
            ).send({ from: fromAddress, gas: 3000000 });
        } catch (err) {
            console.error('Blockchain log failed (integrityRecord):', err.message);
            throw err;
        }
    },

    logAnalysisRecord: async (data) => {
        try {
            const contract = getContract('Analysis');
            await contract.methods.addAnalysisRecord(
                data.fileName,
                data.analysisType
            ).send({ from: fromAddress, gas: 3000000 });
        } catch (err) {
            console.error('Blockchain log failed (analysisRecord):', err.message);
            throw err;
        }
    },

    logTransferRecord: async (data) => {
        try {
            console.log("Calling recordTransfer with:", data);
            const contract = getContract('EvidenceTransfer');
            await contract.methods.recordTransfer(
                data.evidenceId,
                data.caseId,
                data.transferredTo,
                data.status,
                data.remarks || ""
            ).send({ from: fromAddress, gas: 3000000 });
            console.log("recordTransfer successful");
        } catch (err) {
            console.error('Blockchain log failed (transferRecord):', err.message);
            throw err;
        }
    },
    logSummaryRecord: async (caseId, summary) => {
        try {
            const contract = getContract('ReportSummary');
            await contract.methods.storeSummary(caseId, summary)
                .send({ from: fromAddress, gas: 300000 });
            console.log("storeSummary successful");
        } catch (err) {
            console.error('Blockchain log failed (summaryRecord):', err.message);
            throw err;
        }
    }
};