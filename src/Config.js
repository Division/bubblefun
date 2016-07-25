import src.utils.HexMath as HexMath;

var DEFAULT_HEX_COUNT = 11,
    screenHeight = 1024,
    screenWidth = 576,
    hexRadius = HexMath.getHexRadiusByWidth(screenWidth / DEFAULT_HEX_COUNT),
    ballRadius = HexMath.getHexWidth(hexRadius) / 2;

exports = {
  screenWidth: screenWidth,
  screenHeight: screenHeight,
  defaultHorizontalHexCount: DEFAULT_HEX_COUNT,
  hexRadius: hexRadius,
  ballRadius: ballRadius,
  DEBUG_HIDE_BALLS: false,
};
