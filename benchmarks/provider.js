const bre = require("@nomiclabs/buidler");
const {usePlugin} = require("@nomiclabs/buidler/internal/core/config/config-env")

usePlugin("@nomiclabs/buidler-waffle")

exports.provider = bre.waffle.provider;
