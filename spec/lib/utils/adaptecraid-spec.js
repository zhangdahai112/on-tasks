'use strict'
var fs = require('fs');
let _ = require("lodash");
describe("adaptecraid test", function () {
    let cmdResult = fs
        .readFileSync(__dirname + "\\job-utils\\samplefiles\\adaptecraid-adapter-info-raid10new.txt")
        // .readFileSync(__dirname + "\\job-utils\\samplefiles\\adaptecraid-adapter-info-tworaidnew.txt")
        .toString();


    let lines = cmdResult.split('\n');
    let ldIndex = _.findIndex(lines, function (line) {
        return line.indexOf("Logical device information") != -1;
    });
    let pdIndex = _.findIndex(lines, function (line) {
        return line.indexOf("Physical Device information") != -1;
    });

    let pdEndIndex = lines.length;

    //处理逻辑磁盘
    let ldData = lines.slice(ldIndex, pdIndex);
    let ldStartKey = false;
    let adaptecLd = [];
    let ld = {};
    _.forEach(ldData, function (line) {
        if (line.indexOf("Logical Device number") != -1) {
            ldStartKey = line;
            ld = {};
        }
        if ((line.trim().length == 0 && ldStartKey) || (ldStartKey && line.indexOf("----------------------------------------------------------------------") != -1)) {
            adaptecLd.push(ld);
            ldStartKey = false;
        }
        if (ldStartKey) {
            let pro = line.split(":");
            if (pro.length == 2) {
                ld[pro[0].trim()] = pro[1].trim();
            }
            if (pro.length == 4) {
                ld[pro[0].trim()] = pro[1].trim() + ":" + pro[2].trim() + ":" + pro[3].trim();
            }
        }
    });
    // key = EnclosureId:Slot, value = Raid Level
    let pdldMap = {};
    for (let i = 0; i < adaptecLd.length; i++) {
        let keys = Object.keys(adaptecLd[i]);
        for (let j = 0; j < keys.length; j++) {
            if (keys[j].indexOf("Segment") != -1) {
                pdldMap[adaptecLd[i][keys[j]].split(":")[1].split(",")[0] + "," + adaptecLd[i][keys[j]].split(":")[2].split(")")[0]] = adaptecLd[i]["RAID level"];
            }
        }
    }
    console.log(JSON.stringify(pdldMap));

    //处理物理磁盘
    let adaptecRaidController = [];
    let pdData = lines.slice(pdIndex, pdEndIndex);
    let startKey = false;
    let pd = {};
    _.forEach(pdData, function (line) {
        if (line.indexOf("Device is a Hard drive") != -1) {
            startKey = line;
            pd = {};
        }
        if ((line.trim().length == 0 && startKey) || (startKey && line.indexOf("----------------------------------------------------------------------") != -1)) {
            startKey = false;
            adaptecRaidController.push(pd);
        }
        if (startKey) {
            let pro = line.split(":");
            if (pro.length == 2) {
                pd[pro[0].trim()] = pro[1].trim();
            }
            if (line.indexOf("Reported Channel") != -1) {
                pd["EnclosureId"] = pro[2].trim().split("(")[0].split(",")[0];
                pd["Slot"] = pro[2].trim().split("(")[0].split(",")[1];
                if (pdldMap[pro[2].trim().split("(")[0]]) {
                    pd["RaidLevel"] = pdldMap[pro[2].trim().split("(")[0]];
                }
            }
        }

    });
    console.log(JSON.stringify(adaptecRaidController));
});