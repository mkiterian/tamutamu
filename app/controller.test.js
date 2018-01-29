const sinon = require('sinon');
const { expect } = require('chai');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server').app;
// require('sinon-mongoose');

// const Recipe = require('./models/Recipe');

describe('GET /recipe', () => {
  it('should return all recipes', (done) => {
    request(app)
      .get('/recipe')
      .expect(200)
      .expect(res => {
        expect(res.body).to.have.property('name', 'chapati');
        expect(res.body).to.have.property('description');
        expect(res.body).to.have.property('directions');
      })
      .end(done);
  });
});