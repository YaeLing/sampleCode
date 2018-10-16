"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const index_1 = require("../index");
describe('helloWorld Function:', () => {
    it('helloWorld:', () => {
        chai_1.assert.equal('helloWorld', index_1.helloWorld());
    });
});
//# sourceMappingURL=test.spec.js.map