/**
 * TIFX Technologies
 * Copyright (c) 2014-2021 - All rights reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Written by Bruno B. Stein <bruno.stein@tifx.com.br>, 2021
 */

const ApiUtilController = {

  ping: (req, res) => {
    try {
      return res.status(201).send({ success: true, data: "pong" });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ success: false, msg: "Ping failed." });
    }
  },

}

module.exports = ApiUtilController;
