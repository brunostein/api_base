/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const crypto = require('crypto');
const redis = require('./redis');

class ApiCache {
  constructor () {
    this.apiCache = null;
    this.cacheSettings = global.apiSettings.cache;

    if (this.cacheSettings.enabled !== true) {
      return;
    }

    (async () => {
      if (this.cacheSettings.type === "redis") {
        let redisConfig = {
          socket: {
            host: this.cacheSettings.redis.host || "",
            port: this.cacheSettings.redis.port || "",
          },
          password: this.cacheSettings.redis.pass || ""
        };

        this.apiCache = await redis.getConnection(redisConfig);
      }
    })();
  }

  async set(key, cacheData, keyExpirationTime = null) {
    // SET CACHE
    if (this.apiCache === null) {
      return;
    }

    let randomExpiration = false;
    let randomMinValue = null;
    let randomMaxValue = null;

    if (keyExpirationTime !== null) {
      let [min, max] = keyExpirationTime.toString().split(":");
      if (max !== undefined) {
        randomExpiration = true;
        randomMinValue = min;
        randomMaxValue = max;
      }
    } else {
      if (this.cacheSettings.type === "redis") {
        keyExpirationTime = this.cacheSettings.redis.defaultExpirationTime || 300;

        if (this.cacheSettings.redis.randomExpiration === true) {
          randomExpiration = true;
          randomMinValue = this.cacheSettings.redis.randomExpirationMinNumber;
          randomMaxValue = this.cacheSettings.redis.randomExpirationMaxNumber;
        }
      }
    }

    if (randomExpiration) {
      keyExpirationTime = Math.floor(
        Math.random() * (parseInt(randomMaxValue) - parseInt(randomMinValue) + 1)
      ) + parseInt(randomMinValue);
    }

    consoleLog(`SET CACHE: ${key}`);
    await this.apiCache.set(key, cacheData);
    await this.apiCache.expire(key, keyExpirationTime);
  }

  async get(key) {
    // GET CACHE
    if (this.apiCache === null) {
      return;
    }

    if (this.cacheSettings.type === "redis") {
      let cacheData = await this.apiCache.get(key);

      if (cacheData) {
        let response = JSON.parse(cacheData);
        return response;
      }
    }
  }

  getRequestCacheKey(req) {
    // GENERATE CACHE KEY BASED ON REQUEST
    let url = req.originalUrl || req.url;
    let host = req.headers.host;
    let query = req.query || "";
    let hashOf = `${url}_${host}_${query}`;
    let hash = crypto.createHash('md5').update(hashOf).digest('hex');
    let key = this.cacheSettings.prefix + hash;
    
    return key;
  }
}

module.exports = ApiCache;
