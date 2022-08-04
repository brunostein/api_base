/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const ApiAccountModel = require('../models/api/api_account.model');

module.exports = async function(passport) {
  
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(global.apiSettings.tokenAuthScheme || ""),
    secretOrKey: global.apiSettings.accessTokenSecret,
  };

  passport.use('jwt', new JwtStrategy(opts, function(jwt_payload, done) {
    
    let search = {
      _id: jwt_payload.id,
      username: jwt_payload.username
    };

    ApiAccountModel.findOne(search).then(account => {
      return done(null, account);
    })
    .catch((err) => {
      consoleLog(err);
      return done(err, false);
    });
  }));
};
