const env = process.env.NODE_ENV || 'development';

if( env === 'development') {
  const config = require('./config.json');

  const envConfig = config[env];

  Object.keys(envConfig).forEach(key => {
    process.env[key] = envConfig[key];
  });
} else if(env === 'test'){
  process.env.MONGO_URI = "mongodb://localhost:27017/TamutamuTest";
  process.env.PORT = 5000;
  process.env.JWT_SECRET = "qw7sdfh34hfsjfhw4jdf788df7d8f";
}
