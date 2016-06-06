import chai from 'chai';
import Spyware from '../lib/library.js';

chai.expect();

const expect = chai.expect;


describe('Spyware', () => {
  it('can be intialized', () => {
    const spyware = new Spyware('username', 'password', 'name of the course', 'name of the exercise');
    expect(spyware).to.exist;
  });
});
