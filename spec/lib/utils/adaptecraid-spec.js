'use strict'
var fs = require('fs');
let _ = require("lodash");
describe("adaptecraid test", function () {
    let cmdResult = fs
        .readFileSync(__dirname + "/job-utils/samplefiles/adaptecraid-adapter-info.txt")
        .toString();
    let resultArr = cmdResult.split("Physical Device information");
    resultArr = cmdResult.split("Connector information");

    let deviceInfoStr = resultArr[0].split("Physical Device information")[1];
    let deviceInfoArr = deviceInfoStr.split(/Device #/);
    let adaptecRaidController = [];
    let index = 0;
    _.forEach(deviceInfoArr, function (data) {
        if (data.indexOf("Device") == -1) {
            return;
        }
        let deviceStr = data.split("----------------------------------------------------------------")[0];
        let isPd = false;
        let index2 = 0;
        let deviceObj = {};
        _.forEach(deviceStr.split("\n"), function (deviceLine) {
            if (deviceLine.indexOf("Device is a Hard drive") != -1) {
                isPd = true;
            }
        });
        if (isPd) {
            _.forEach(deviceStr.split("\n"), function (deviceLine) {
                let deviceSplitLine = deviceLine.split(":");
                if (deviceSplitLine.length != 2) {
                    return;
                }
                deviceObj[deviceSplitLine[0].trim()] = deviceSplitLine[1].trim();
            });
            adaptecRaidController.push(
                deviceObj
            );
        }
    });
    console.log(adaptecRaidController);
});