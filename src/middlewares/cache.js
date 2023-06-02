/**
 * TIFX Technologies
 * Copyright (c) 2014-2022 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2022
 */

const cacheMiddleware = (expirationTimeInSeconds = null) => {
  return apiCacheMiddleware = async (req, res, next) => {
    try {
      // Client does not want cache
      if (req.query.nocache) {
        next();
        return;
      }

      let cacheSettings = global.apiSettings.cache;

      if (cacheSettings.enabled === true) {
        // RETURN DATA FROM CACHE
        let key = global.apiCache.getRequestCacheKey(req);
        let cacheData = await global.apiCache.get(key);

        if (cacheData) {
          consoleLog(`CACHED: ${key}`);
          res.set('rest-api-base-cache', key);
          res.set('rest-api-base-cache-at', cacheData.datetime);
          res.set('rest-api-base-cache-exp-sec', cacheData.expirationTimeSeconds);
          return res.status(201).send(cacheData);
        }

        // SET CACHE OF REQUEST
        res.oldSend = res.send;

        res.send = async function(body) {
          let cacheData = {
            datetime: Date.now(),
            expirationTimeSeconds: expirationTimeInSeconds,
            data: body
          };

          await global.apiCache.set(key, JSON.stringify(cacheData), expirationTimeInSeconds);
          return res.oldSend(body);
        }
      }
    } catch (err) {
      consoleLog(err);
    }

    next();
  }
}

module.exports = cacheMiddleware;
