// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Analysis {
    struct AnalysisRecord {
        string fileName;
        string analysisType;
        uint256 timestamp;
    }

    mapping(string => AnalysisRecord) public analysisRecords; // key: fileName

    event AnalysisRecordAdded(string fileName, string analysisType);

    function addAnalysisRecord(
        string memory fileName,
        string memory analysisType
    ) public {
        analysisRecords[fileName] = AnalysisRecord(
            fileName,
            analysisType,
            block.timestamp
        );
        emit AnalysisRecordAdded(fileName, analysisType);
    }

    function getAnalysisRecord(string memory fileName) public view returns (AnalysisRecord memory) {
        return analysisRecords[fileName];
    }
}