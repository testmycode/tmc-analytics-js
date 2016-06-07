import chai from 'chai';
import Spyware from '../src/index.js';

chai.expect();

const expect = chai.expect;


describe('Spyware', () => {
  it('can be intialized', () => {
    const spyware = new Spyware('username', 'password', 'name of the course', 'http://example.com', 'name of the exercise');
    expect(spyware).to.exist;
  });
});
