'use strict'
var fs = require('fs');
let _ = require("lodash");
describe("adaptecraid test", function () {
    let cmdResult = fs
        .readFileSync(__dirname + "/job-utils/samplefiles/hpssaraid-adapter-info-have.txt")
        .toString();

    var start = _.findIndex(lines, function (line) {
        return line.startsWith('Handle');
    });
    var temp1 = cmdResult.split("SEP");
    var drives = [];
    //解析未做raid的磁盘

    var lines = cmdResult.split('\n');
    var end = _.findLastIndex(lines, function (line) {
        return line.trim().indexOf('Unassigned') != -1 && line.trim().indexOf("Unassigned Drive") == -1;
    });

    lines = lines.slice(end, lines.length);

    var pdObj = {};
    lines.forEach(function (p) {
        if (p.indexOf("physicaldrive") != -1) {
            key = true;
        }
        if (!p) {
            if (key != 'first') {
                key = false;
                drives.push(pdObj);
                pdObj = {};
            }
        }
        if (key) {
            var proArr = p.split(":");
            if (proArr.length != 2) {
                return;
            }
            pdObj[proArr[0].trim()] = proArr[1].trim();
        }
    });


    //解析做了raid的磁盘
    if (cmdResult.indexOf("Array:") != -1) {
        var arrDrive = temp1[0].split("Array:");
        arrDrive.forEach(function (arr) {
            if (arr.indexOf("Array Type: Data") == -1) {
                return;
            }
            //防止部分做了raid部分没做raid
            if (arr.indexOf("Unassigned") != -1) {
                arr = arr.split("Unassigned")[0];
            }
            let driveStr = arr.split("Logical Drive:")[1];
            let driveArr = driveStr.split("physicaldrive");
            let type = null;
            driveArr.forEach(function (e) {
                if (e.indexOf("Fault Tolerance:") != -1) {
                    let tempArr = e.split("\n");
                    tempArr.forEach(function (e1) {
                        let tempArr1 = e1.split(":");
                        if (tempArr1[0].trim() == "Fault Tolerance") {
                            type = tempArr1[1].trim();
                        }
                    });
                }

                if (e.indexOf("Serial Number") == -1) {
                    return;
                }

                let proStr = e.split("\n");
                let pdObj = {};
                proStr.forEach(function (p) {
                    let proArr = p.split(":");
                    if (proArr.length != 2) return;
                    pdObj[proArr[0].trim()] = proArr[1].trim();
                });
                pdObj.raid = type;
                drives.push(pdObj);
            });
        });
    }
    console.log(JSON.stringify(drives));
});