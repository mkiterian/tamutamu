const { expect } = require('chai');
const request = require('supertest');
const app = require('../server');

const Recipe = require('../app/models/Recipe');

const testRecipe = {
  name: 'Soul Food',
  description: 'I\'ve got soul but I\'m not a soldier',
  imageUrl: 'http://wherepicsare.com',
  tags: ['Mama\'s', 'Dinner', 'Carnivore'],
  ingredients: ['ingredient 1', 'ingredient 2', 'ingredient 3'],
  directions: ['eat', 'pray', 'love']
}

beforeEach(done => {
  Recipe.remove({}).then(()=>{
    done();
  });
});

describe('POST /recipes', () => {
  it('should create a new recipe', (done) => {
    request(app)
      .post('/recipes')
      .send(testRecipe)
      .expect(201)
      .expect(res => {
        expect(res.body).to.have.property('name', 'Soul Food');
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }

        Recipe.find().then(recipes => {
          expect(recipes.length).to.equal(1);
          expect(recipes[0].name).to.equal('Soul Food');
          done();
        }).catch(err => {
          done(err);
        });
      })
  })

  it('should not create recipe with invalid data', (done) => {
    request(app)
    .post('/recipes')
    .send({})
    .expect(400)
    .end((err, res) => {
      if(err){
        return done(err);
      }

      Recipe.find().then(recipes => {
        expect(recipes.length).to.equal(0);
        done();
      }).catch(err => {
        done(err);
      });
    })
  })
});