/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright 2016, Joyent, Inc.
 */

/*
 * Unit tests for "triton-tags"
 */

var format = require('util').format;
var test = require('tape');
var vasync = require('vasync');

var triton_tags = require('../');


// ---- test data

/*
 * `parseTritonTagStr` tests use key, str, val and err
 * `validateTritonTag` tests use key, val (or str if `val` isn't set) and
 *      errmsg (or `err` if errmsg isn't set)
 *
 */
var cases = [
    // Basics:
    {
        key: 'triton._test.string',
        str: 'astr',
        val: 'astr'
    },
    {
        key: 'triton._test.string',
        str: '',
        val: ''
    },
    {
        key: 'triton._test.boolean',
        str: 'true',
        val: true
    },
    {
        key: 'triton._test.boolean',
        str: 'false',
        val: false
    },
    {
        key: 'triton._test.number',
        str: '42',
        val: 42
    },

    // Some type failures:
    {
        key: 'triton._test.boolean',
        str: 'not a bool',
        /* JSSTYLED */
        err: /Triton tag "triton._test.boolean" value must be "true" or "false": "not a bool"/,
        /* JSSTYLED */
        errmsg: /Triton tag "triton._test.boolean" value must be a boolean: "not a bool"/
    },
    {
        key: 'triton._test.number',
        str: 'not a num',
        /* JSSTYLED */
        err: /Triton tag "triton._test.number" value must be a number: "not a num"/
    },
    {
        key: 'triton._test.number',
        str: '',
        /* JSSTYLED */
        err: /Triton tag "triton._test.number" value must be a number: ""/
    },

    // Unknown tag:
    {
        key: 'triton.unknown',
        str: '',
        /* JSSTYLED */
        err: /Unrecognized special triton tag \"triton.unknown\"/
    },

    // triton.cns.disable
    {
        key: 'triton.cns.disable',
        str: 'true',
        val: true
    },
    {
        key: 'triton.cns.disable',
        str: 'false',
        val: false
    },
    {
        key: 'triton.cns.disable',
        str: 'booga',
        /* JSSTYLED */
        err: /Triton tag "triton.cns.disable" value must be "true" or "false": "booga"/,
        /* JSSTYLED */
        errmsg: /Triton tag "triton.cns.disable" value must be a boolean: "booga"/
    },

    {
        key: 'triton.cns.services',
        str: '',
        err: /Expected DNS name but end of input found/
    },
    {
        key: 'triton.cns.services',
        str: 'foobar',
        val: 'foobar'
    },
    {
        key: 'triton.cns.services',
        str: '_foobar',
        err: /Expected DNS name but "_" found/
    },
    {
        key: 'triton.cns.services',
        str: 'foobar:1234',
        val: 'foobar:1234'
    },
    {
        key: 'triton.cns.services',
        str: 'foobar,test',
        val: 'foobar,test'
    },
    {
        key: 'triton.cns.services',
        str: 'foobar:1234,test:1234',
        val: 'foobar:1234,test:1234'
    },
    {
        key: 'triton.cns.services',
        str: 'foobar:abcd',
        err: /Expected "=" but end of input found/
    },
    {
        key: 'triton.cns.services',
        str: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        err: /63 or fewer characters/
    },
    {
        key: 'triton.cns.services',
        str: 'foobar:123123123123',
        err: /must be within the range 0 - 65535/
    },
    {
        key: 'triton.cns.services',
        str: 'foobar:1234:priority=10',
        val: 'foobar:1234:priority=10'
    },
    {
        key: 'triton.cns.services',
        str: 'foobar:port=1234',
        val: 'foobar:port=1234'
    },
    {
        key: 'triton.cns.services',
        str: 'foobar:invalid=somevalue1',
        err: /not a valid property name/
    },
    {
        key: 'triton.cns.services',
        str: 'foobar:priority=aaaaaaa',
        err: /must be within the range 0 - 65535/
    }

    // TODO: triton.cns.reverse_ptr
];


// ---- tests

test('isTritonTag', function (t) {
    var isTritonTag = triton_tags.isTritonTag;

    [
        'triton.foo',
        'triton.cns.disable'
    ].forEach(function (key) {
        t.equal(isTritonTag(key), true, 'is a triton tag: ' + key);
    });

    [
        'Triton.foo',
        'cns.disable',
        ''
    ].forEach(function (key) {
        t.equal(isTritonTag(key), false, 'is not a triton tag: ' + key);
    });

    t.end();
});


test('parseTritonTagStr', function (t) {
    var parseTritonTagStr = triton_tags.parseTritonTagStr;

    vasync.forEachPipeline({
        inputs: cases,
        func: function testOneCase(c, next) {
            parseTritonTagStr(c.key, c.str, function (err, val) {
                var name = format('parseTritonTagStr(%j, %j)',
                    c.key, c.str);
                if (c.err) {
                    t.ok(err, name + ' (expect err)');
                    t.ok(c.err.exec(err.message), format(
                        'err.message matches %s: %j', c.err, err.message));
                    t.ok(val === undefined);
                } else {
                    t.ifErr(err, name);
                    t.equal(val, c.val, 'val');
                }
                next();
            });
        }
    }, function (err) {
        t.ifErr(err, 'parseTritonTagStr cases');
        t.end();
    });
});

test('validateTritonTag', function (t) {
    var validateTritonTag = triton_tags.validateTritonTag;

    vasync.forEachPipeline({
        inputs: cases,
        func: function testOneCase(c, next) {
            var val = (c.hasOwnProperty('val') ? c.val : c.str);
            var name = format('validateTritonTag(%j, %j)', c.key, val);
            var errmsg = validateTritonTag(c.key, val);
            if (c.errmsg || c.err) {
                t.ok(errmsg, name + ' (expect err)');
                t.ok((c.errmsg || c.err).exec(errmsg), format(
                    'errmsg matches %s: %j', (c.errmsg || c.err), errmsg));
            } else {
                t.ifErr(errmsg, name);
            }
            next();
        }
    }, function (err) {
        t.ifErr(err, 'validateTritonTag cases');
        t.end();
    });
});
