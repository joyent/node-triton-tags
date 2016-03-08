/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2015, Joyent, Inc.
 */

/*
 * Unit tests for "triton-tags"
 */

var test = require('tape');

var triton_tags = require('../');


// ---- tests

test('isTritonTag', function (t) {
    var isTritonTag = triton_tags.isTritonTag;

    [
        'triton.foo',
        'triton.cns.disable'
    ].forEach(function (key) {
        t.equal(isTritonTag(key), true, key);
    });

    [
        'Triton.foo',
        'cns.disable',
        ''
    ].forEach(function (key) {
        t.equal(isTritonTag(key), false, key);
    })

    t.end();
});
