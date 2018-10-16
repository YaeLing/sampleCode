import 'mocha';
import { assert } from 'chai';
import { helloWorld } from '../index';

describe('helloWorld Function:',()=>{
    it('helloWorld:',()=>{
        assert.equal('helloWorld',helloWorld());
    })
})