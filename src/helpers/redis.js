/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2022
 */

const redis = require("redis");

var redisClient = null;

const getConnection = async (redisConfig) => {
  if (redisClient !== null) {
    return redisClient;
  }

  redisClient = redis.createClient(redisConfig);

  redisClient.on("error", function(error) {
    consoleLog(error);
  });

  await redisClient.connect();

  return redisClient
}

const apiRedis = {
  getConnection
};

module.exports = apiRedis;
