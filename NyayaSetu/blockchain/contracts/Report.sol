// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReportSummary {
    mapping(string => string) private summaries;

    event SummaryStored(string caseId, string summary);

    function storeSummary(string memory caseId, string memory summary) public {
        summaries[caseId] = summary;
        emit SummaryStored(caseId, summary);
    }

    function getSummary(string memory caseId) public view returns (string memory) {
        return summaries[caseId];
    }
}