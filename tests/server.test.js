const request = require('supertest');
const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const { testRecipe, seedRecipes, seedUsers, populateUsers, populateRecipes } = require('./seed');

const app = require('../server');
const Recipe = require('../app/models/Recipe');
const User = require('../app/models/User');

beforeEach(populateRecipes);
beforeEach(populateUsers);

describe('POST /users/signup', () => {
  it('should create a user', (done) => {
    const email = 'person@people.com';
    const password = 'password123';
    const confirmPassword = 'password123';

    request(app).post('/users/signup')
      .send({ email, password, confirmPassword })
      .expect(201)
      .expect(res => {
        expect(res.headers['x-auth']).to.exist;
        expect(res.body.user).to.have.property('_id');
        expect(res.body.user).to.have.property('email', email);
      })
      .end(err => {
        if (err) {
          done(err);
        }

        User.findOne({ email }).then(user => {
          expect(user).to.exist;
          done();
        }).catch(err => {
          done(err);
        });
      })
  });

  it('should not create a user when passwords do not match', (done) => {
    const email = 'person@people.com';
    const password = 'password123';
    const confirmPassword = 'password';

    request(app).post('/users/signup')
      .send({ email, password, confirmPassword })
      .expect(400)
      .expect(res => {
        expect(res.body).to.have.property('error', 'passwords do not match');
      })
      .end(done)
  });
});

describe('POST /recipes', () => {
  it('should create a new recipe', (done) => {
    request(app)
      .post('/recipes')
      .set('x-auth', seedUsers[0].tokens[0].token)
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

  it('should not allow unauthorized user to create a new recipe', (done) => {
    request(app)
      .post('/recipes')
      .send(testRecipe)
      .expect(401)
      .expect(res => {
        expect(res.body).to.eql({});
      })
      .end(done)
  })

  it('should not create recipe with invalid data', (done) => {
    request(app)
      .post('/recipes')
      .set('x-auth', seedUsers[0].tokens[0].token)
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
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(404)
      .expect(res => {
        expect(res.body.message).to.equal('recipe not found');
      })
      .end(done);
  });

  it('should return a 404 for an invalid id', (done) => {
    request(app)
      .get('/recipes/123456789')
      .set('x-auth', seedUsers[0].tokens[0].token)
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
      .set('x-auth', seedUsers[0].tokens[0].token)
      .send(update)
      .expect(200)
      .expect(res => {
        expect(res.body.recipe).to.have.property('name', update.name);
      })
      .end((err, res) => {
        if (err) {
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

  it('should send 401 if unauthorized user tries to update recipe', (done) => {
    request(app)
      .patch(`/recipes/${id}`)
      .send(update)
      .expect(401)
      .expect(res => {
        expect(res.body).to.eql({});
      })
      .end(done)
  })

  it('should return a 404 when valid id is not found', (done) => {
    const id = new ObjectID().toHexString();
    request(app)
      .patch(`/recipes/${id}`)
      .set('x-auth', seedUsers[0].tokens[0].token)
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
      .set('x-auth', seedUsers[0].tokens[0].token)
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

  it('should send 401 if unauthorized user tries to delete recipe', (done) => {
    request(app)
      .delete(`/recipes/${id}`)
      .expect(401)
      .expect(res => {
        expect(res.body).to.eql({});
      })
      .end(done)
  })

  it('should return a 404 when id is not found', (done => {
    const id = new ObjectID().toHexString();
    request(app)
      .delete(`/recipes/${id}`)
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(404)
      .expect(res => {
        expect(res.body.message).to.equal('recipe not found');
      })
      .end(done);
  }));

  it('should return a 404 when invalid id is provided', (done) => {
    request(app)
      .delete('/recipes/123456')
      .set('x-auth', seedUsers[0].tokens[0].token)
      .expect(404)
      .expect(res => {
        expect(res.body.message).to.equal('recipe not found');
      })
      .end(done);
  });
});
