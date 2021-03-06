// Copyright 2015, EMC, Inc.
/* jshint node: true */


'use strict';

var xmlParser = require('xml2js').parseString;


describe("test_eses Task Parser", function () {
    var taskParser;
    var stdoutMocks;

    before('test_eses task parser before', function() {
        stdoutMocks = require('./stdout-helper');

        // create a child injector with on-core and the base pieces we need to test this
        helper.setupInjector([
            helper.require('/spec/mocks/logger.js'),
            helper.require('/lib/utils/job-utils/command-parser.js')
        ]);

        taskParser = helper.injector.get('JobUtils.CommandParser');

    });

    it("should parse test_eses -R output", function (done) {
        var esesCmd = 'sudo test_eses -R --xml';

        var tasks = [
            {
                cmd: esesCmd,
                stdout: stdoutMocks.testesesR,
                stderr: '',
                error: null
            }
        ];

        xmlParser(stdoutMocks.testesesR, function (err, jsonOut) {
            if (err) {
                done(err);
                return;
            }

            taskParser.parseTasks(tasks)
            .spread(function (result) {
                expect(result.error).to.be.undefined;
                expect(_.isEqual(result.data, jsonOut)).to.be.true;
                expect(result.source).to.equal('test_eses');
                // data specific format verification
                expect(result.data.REVISION.exp).to.be.an("Array");
                expect(result.data.REVISION.exp.length).to.equal(3);
                _.forEach(result.data.REVISION.exp, function(devicedata) {
                    expect(devicedata).to.be.ok;
                    expect(devicedata.dev).to.be.an('Array');
                });
                done();
            })
            .catch(function(err) {
                done(err);
            });
        });
    });

    it("should parse test_eses -q output", function (done) {
        var esesCmd = 'sudo test_eses -q std --xml';

        var tasks = [
            {
                cmd: esesCmd,
                stdout: stdoutMocks.testesesQ,
                stderr: '',
                error: null
            }
        ];

        xmlParser(stdoutMocks.testesesQ, function (err, jsonOut) {
            if (err) {
                done(err);
                return;
            }
            return taskParser.parseTasks(tasks)
            .spread(function (result) {
                expect(result.error).to.be.undefined;
                expect(_.isEqual(result.data, jsonOut)).to.be.true;
                expect(result.source).to.equal('test_eses');
                // data specific format verification
                //var util = require('util');
                //console.log(util.inspect(result.data, {depth: null}));
                expect(result.data).to.have.property('VPD').to.be.ok;
                expect(result.data.VPD).to.have.property('version').to.be.ok;
                expect(result.data.VPD).to.have.property('vendor_id').to.be.ok;
                expect(result.data.VPD).to.have.property('product_id').to.be.ok;
                done();
            })
            .catch(function(err) {
                done(err);
            });
        });
    });
});


