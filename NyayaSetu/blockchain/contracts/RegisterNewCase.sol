// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RegisterNewCase {
    struct Case {
        string caseId;
        string caseName;
        string officer;
        string officerWallet;
        string description;
        string location;
        string[] suspects;
        string[] victims;
        string[] witnesses;
        string status;
    }

    mapping(string => Case) public cases;

    event CaseRegistered(string caseId);

    function registerNewCase(
        string memory caseId,
        string memory caseName,
        string memory officer,
        string memory officerWallet,
        string memory description,
        string memory location,
        string[] memory suspects,
        string[] memory victims,
        string[] memory witnesses,
        string memory status
    ) public {
        cases[caseId] = Case(
            caseId,
            caseName,
            officer,
            officerWallet,
            description,
            location,
            suspects,
            victims,
            witnesses,
            status
        );
        emit CaseRegistered(caseId);
    }
}