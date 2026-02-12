// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AddEvidence {
    struct Evidence {
        string evidenceId;
        string caseId;
        string evidenceName;
        string seizureLocation;
        string collectorName;
        string collectorWallet;
        string investigatingOfficerName;
        string investigatingOfficerWallet;
        string description;
        string evidenceType;
        string condition;
    }

    mapping(string => Evidence) public evidences;

    event EvidenceAdded(string evidenceId);

    function addEvidence(
        string memory evidenceId,
        string memory caseId,
        string memory evidenceName,
        string memory seizureLocation,
        string memory collectorName,
        string memory collectorWallet,
        string memory investigatingOfficerName,
        string memory investigatingOfficerWallet,
        string memory description,
        string memory evidenceType,
        string memory condition
    ) public {
        evidences[evidenceId] = Evidence(
            evidenceId,
            caseId,
            evidenceName,
            seizureLocation,
            collectorName,
            collectorWallet,
            investigatingOfficerName,
            investigatingOfficerWallet,
            description,
            evidenceType,
            condition
        );
        emit EvidenceAdded(evidenceId);
    }
}