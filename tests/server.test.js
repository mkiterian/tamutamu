const request = require('supertest');
const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const app = require('../server');

const Recipe = require('../app/models/Recipe');

const testRecipe = {
  _id: new ObjectID(),
  name: 'Soul Food',
  description: 'I\'ve got soul but I\'m not a soldier',
  imageUrl: 'http://wherepicsare.com',
  tags: ['Mama\'s', 'Dinner', 'Carnivore'],
  ingredients: ['ingredient 1', 'ingredient 2', 'ingredient 3'],
  directions: ['eat', 'pray', 'love']
}

const seedRecipes = [
  {
    _id: new ObjectID(),
    name: 'KDF',
    description: 'If you need a description you do not deserve it',
    imageUrl: 'http://wherepicsare.com',
    tags: ['Breakfast', 'Snack', 'Donut'],
    ingredients: ['wheat flour', 'water', 'no baking soda'],
    directions: ['eat', 'pray', 'love']
  },
  {
    _id: new ObjectID(),
    name: 'Githeri',
    description: 'For that good *ss sleep',
    imageUrl: 'http://wherepicsare.com',
    tags: ['Mama\'s', 'Dinner', 'Vegeterian'],
    ingredients: ['maize', 'beans', 'water'],
    directions: ['eat', 'pray', 'love']
  }
];

beforeEach(done => {
  Recipe.remove({})
    .then(() => {
      return Recipe.insertMany(seedRecipes);
    })
    .then(() => {
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
        expect(res.body.recipe).to.have.property('name', 'Soul Food');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Recipe.find({ name: 'Soul Food' }).then(recipes => {
          expect(recipes.length).to.equal(1);
          expect(recipes[0].name).to.equal('Soul Food');
          done();
        }).catch(err => {
          done(err);
        });
      });
  })

  it('should not create recipe with invalid data', (done) => {
    request(app)
      .post('/recipes')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Recipe.find().then(recipes => {
          expect(recipes.length).to.equal(2);
          done();
        }).catch(err => {
          done(err);
        });
      });
  })
});

describe('GET /recipes', () => {
  it('should get all recipes', (done) => {
    request(app)
      .get('/recipes')
      .expect(200)
      .expect(res => {
        expect(res.body.recipes.length).to.equal(2);
      }).end(done);
  });
});

describe('GET /recipes/:id', () => {
  it('should return a recipe', (done) => {
    request(app)
      .get(`/recipes/${seedRecipes[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.recipe.name).to.equal(seedRecipes[0].name);
      })
      .end(done);
  });

  it('should return a 404 when valid id is not found', (done) => {
    const id = new ObjectID().toHexString();
    request(app)
      .get(`/recipes/${id}`)
      .expect(404)
      .expect(res => {
        expect(res.body.message).to.equal('recipe not found');
      })
      .end(done);
  });

  it('should return a 404 for an invalid id', (done) => {
    request(app)
      .get('/recipes/123456789')
      .expect(404)
      .expect(res => {
        expect(res.body.message).to.equal('recipe not found');
      })
      .end(done);
  });
});

describe('PATCH /recipes/:id', () => {
  const id = seedRecipes[0]._id.toHexString();
  const update = { name: 'KDF aka Ngumu' };

  it('should update recipe', (done) => {
    request(app)
      .patch(`/recipes/${id}`)
      .send(update)
      .expect(200)
      .expect(res => {
        expect(res.body.recipe).to.have.property('name', update.name);
      })
      .end((err, res) => {
        if(err){
          return done(err);
        }
        Recipe.findById(id).then(recipe => {
          expect(recipe.name).to.equal(update.name);
          done();
        }).catch(err => {
          done(err);
        });
      });
  });

  it('should return a 404 when valid id is not found', (done) => {
    const id = new ObjectID().toHexString();
    request(app)
      .patch(`/recipes/${id}`)
      .send(update)
      .expect(404)
      .expect(res => {
        expect(res.body.message).to.equal('recipe not found');
      })
      .end(done);
  });

});

describe('DELETE /recipes/:id', () => {
  const id = seedRecipes[1]._id.toHexString();
  it('should delete a recipe and return it', (done) => {
    request(app)
      .delete(`/recipes/${id}`)
      .expect(200)
      .expect(res => {
        expect(res.body.recipe.name).to.equal('Githeri');
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Recipe.findById(id).then(recipe => {
          expect(recipe).to.be.null;
          done();
        }).catch(err => {
          done(err);
        });
      });
  });

  it('should return a 404 when id is not found', (done => {
    const id = new ObjectID().toHexString();
    request(app)
      .delete(`/recipes/${id}`)
      .expect(404)
      .expect(res => {
        expect(res.body.message).to.equal('recipe not found');
      })
      .end(done);
  }));

  it('should return a 404 when invalid id is provided', (done) => {
    request(app)
      .delete('/recipes/123456')
      .expect(404)
      .expect(res => {
        expect(res.body.message).to.equal('recipe not found');
      })
      .end(done);
  });
});
