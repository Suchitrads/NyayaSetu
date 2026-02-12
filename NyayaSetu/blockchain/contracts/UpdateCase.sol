// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UpdateCase {
    mapping(string => string) public caseStatus;

    event CaseUpdated(string caseId, string status);

    function updateCaseStatus(string memory caseId, string memory status) public {
        caseStatus[caseId] = status;
        emit CaseUpdated(caseId, status);
    }
}