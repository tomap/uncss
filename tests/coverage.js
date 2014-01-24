/* jshint expr: true */
'use strict';

var expect    = require('chai').expect,
    fs        = require('fs'),
    path      = require('path'),
    uncss     = require('./../lib/uncss.js');

/* Read file sync sugar. */
var rfs = function (file) {
    return fs.readFileSync(path.join(__dirname, file), 'utf-8').toString();
};

var stylesheets = ['coverage/override.css', 'coverage/ignore.css'],
    rawcss = rfs('coverage/raw.css'),
    options = {
        csspath: 'tests',
        ignore: ['.unused_test', /^#test/],
        stylesheets: stylesheets,
        raw: rawcss
    };

describe('Options', function () {

    var output;

    before(function (done) {
        uncss(rfs('selectors/index.html'), options, function (err, res) {
            if (err) {
                throw err;
            }
            output = res;
            done();
        });
    });

    it('options.stylesheets should override <link> tags', function () {
        expect(output).to.include(rfs(stylesheets[0]));
    });

    it('options.raw should be added to the processed CSS', function () {
        expect(output).to.include(rawcss);
    });

    it('options.ignore should be added to the output and accept a regex', function () {
        expect(output).to.include(rfs(stylesheets[1]));
    });

    it('options.htmlroot should be respected', function (done) {
        uncss(rfs('coverage/htmlroot.html'), { htmlroot: 'tests/coverage' }, function (err, output) {
            expect(err).to.be.null;
            expect(output).to.include(rfs('coverage/override.css'));
            done();
        });
    });

    it('options.urls should be processed', function (done) {
        this.timeout(25000);
        uncss([], { urls: ['http://giakki.github.io/uncss/'] }, function (err, output) {
            expect(err).to.be.null;
            expect(output).to.exist;
            done();
        });
    });
});