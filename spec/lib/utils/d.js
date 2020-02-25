'use strict'
var fs = require('fs');
let _ = require("lodash");
describe("adaptecraid test", function () {
    var b={
        friendlyName: 'Catalog perccli',
        injectableName: 'Task.Catalog.perccli',
        implementsTask: 'Task.Base.Linux.Catalog',
        optionsSchema: 'catalog-raid.json',
        options: {
            adapter: '0',
            commands: [
                'sudo /opt/MegaRAID/perccli/perccli64 /c{{ options.adapter }} show all J',
                'sudo /opt/MegaRAID/perccli/perccli64 show ctrlcount J',
                'sudo /opt/MegaRAID/perccli/perccli64 /c{{ options.adapter }} /eall /sall show all J',
                'sudo /opt/MegaRAID/perccli/perccli64 /c{{ options.adapter }} /vall show all J',
                'sudo /opt/MegaRAID/perccli/perccli64 -v'
            ]
        },
        properties: {
            catalog: {
                type: 'perccli'
            }
        }
    };;
    let c = a(b);
    console.log(c);
});
function a(commands){
return _.map(_.flatten([commands]), function(cmd) {
    if (typeof cmd === 'string') {
        return { cmd: cmd };
    }
    return _.transform(cmd, function(cmdObj, v, k) {
        if (k === 'catalog') {
            cmdObj.source = v.source;
            cmdObj.format = v.format;
            cmdObj.catalog = true;
        } else if (k === 'command') {
            cmdObj.cmd = v;
        } else if (k === 'retries') {
            cmdObj.retries = v;
        } else if (k === 'downloadUrl') {
            cmdObj.downloadUrl = v;
        } else if (k === 'acceptedResponseCodes') {
            cmdObj[k] = v;
        } else if (k === 'timeout'){
            cmdObj.timeout = v;
        } 
    }, {});
});
}
