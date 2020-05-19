const { resetBuidlerContext } = require("@nomiclabs/buidler/internal/reset")

exports.getFreshProvider = function () {
  resetBuidlerContext()
  const bre = require("@nomiclabs/buidler")
  return bre.waffle.provider
}
