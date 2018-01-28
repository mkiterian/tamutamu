const add = require('./sample');
const expect = require('chai').expect;

it('should pass', ()=>{
  const result = add(3, 4);
  expect(result).to.equal(7);
});