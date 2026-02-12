// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UpdateEvidence {
    mapping(string => string) public evidenceCondition;

    event EvidenceUpdated(string evidenceId, string condition);

    function updateEvidenceStatus(string memory evidenceId, string memory condition) public {
        evidenceCondition[evidenceId] = condition;
        emit EvidenceUpdated(evidenceId, condition);
    }
}