'use strict';

const expect = require('chai').expect,
    uncss = require('./../src/uncss.js');

const invalidCss =
    'We need to create a string longer than 40 characters to ' + 'check if the error string we are creating is helpful';

describe('Error reporting', () => {
    it('No valid HTML files', async () => {
        try {
            await uncss(['nonexistent.html']);
            expect.fail();
        } catch (error) {
            expect(error.message).to.equal('UnCSS: no HTML files found');
        }
    });

    it('Invalid options.stylesheets', async () => {
        try {
            await uncss('<html></html>', {
                stylesheets: ['nonexistent'],
            });
            expect.fail();
        } catch (error) {
            expect(error.message).to.contain('UnCSS: could not open');
        }
    });

    it('Invalid options.stylesheets with URL', async () => {
        try {
            await uncss('<html></html>', {
                stylesheets: ['http://invalid'],
            });
            expect.fail();
        } catch (error) {
            expect(error.message).to.contain('ENOTFOUND');
        }
    });

    it('Invalid options.raw', async () => {
        try {
            await uncss('<html></html>', {
                raw: ['.test { margin: 0 }'],
            });
            expect.fail();
        } catch (error) {
            expect(error.message).to.equal('UnCSS: options.raw - expected a string');
        }
    });

    it('No stylesheet found', async () => {
        try {
            await uncss('<html><body></body></html>');
            expect.fail();
        } catch (error) {
            expect(error.message).to.equal('UnCSS: no stylesheets found');
        }
    });

    it('jsdom errors', async () => {
        try {
            await uncss(['http://invalid']);
            expect.fail();
        } catch (error) {
            expect(error.message).to.match(/getaddrinfo ENOTFOUND invalid/);
        }
    });

    it('jsdom errors to stderr', async () => {
        let stderrBuffer = '';
        const oldWrite = process.stderr.write;
        process.stderr.write = function(data) {
            stderrBuffer += data;
        };

        try {
            await uncss(['tests/jsdom/throw.html']);
        } finally {
            process.stderr.write = oldWrite;

            expect(stderrBuffer).to.contain('Exception');
        }
    });

    it('css-parse errors', async () => {
        try {
            await uncss(['tests/selectors/index.html'], {
                raw: invalidCss,
            });
            expect.fail();
        } catch (error) {
            expect(error.message).to.contain('unable to parse');
        }
    });

    it('css-parse errors (minified stylesheet)', async () => {
        try {
            await uncss(['tests/selectors/index.html'], {
                stylesheets: ['../coverage/minified.css'],
            });
            expect.fail();
        } catch (error) {
            expect(error.message).to.contain('unable to parse');
        }
    });

    it('Report should be generated only if specified', done => {
        uncss(['tests/selectors/index.html'], (error, output, report) => {
            expect(report).to.equal(undefined);
            done();
        });
    });

    it('Reports when the uncssrc file does not exist', async () => {
        try {
            await uncss(['selectors/index.html'], {
                uncssrc: 'nonexistent',
            });
            expect.fail();
        } catch (err) {
            expect(err.code).to.equal('ENOENT');
        }
    });

    it('Reports errors in the uncssrc file', async () => {
        try {
            await uncss(['selectors/index.html'], {
                uncssrc: 'tests/coverage/.invaliduncssrc',
            });
            expect.fail();
        } catch (err) {
            expect(err).to.be.an.instanceOf(SyntaxError);
            expect(err.message).to.equal('UnCSS: uncssrc file is invalid JSON.');
        }
    });
});
