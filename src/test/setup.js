const mongoose = require('mongoose');

const { getMongoUri, mongoOptions } = require('~/utils/mongoose-utils');

mongoose.Promise = global.Promise;

jest.setTimeout(30000); // default 5000

beforeAll(async(done) => {
  await mongoose.connect(getMongoUri(), mongoOptions);
  done();
});

afterAll(async(done) => {
  await mongoose.disconnect();
  done();
});

module.exports = {};
