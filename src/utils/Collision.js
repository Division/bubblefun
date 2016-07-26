import src.utils.Point as Point;
import src.utils.HexMath as HexMath;
import src.Config as Config;

exports =
{
    smallCollisionRadius: 5,

    lineVsCircle: function(p1, p2, center, radius, collisionInfo)
    {
        if (collisionInfo) {
            collisionInfo.circleCenter = center;
            collisionInfo.circleRadius = radius;
        }

        var p1p2 = Point.subtract(p2,p1),
            p1p2Length = p1p2.getMagnitude(),
            p1p2Normalized = p1p2.clone().normalize(),
            p1c = Point.subtract(center, p1),
            projection = Math.min(Math.max(0, p1c.dot(p1p2Normalized)), p1p2Length),
            projectionPoint = p1p2Normalized.multiply(projection).add(p1);

        return projection > - radius &&
               projection < p1p2Length + radius &&
               Point.distance(center, projectionPoint) < radius;
    },


    collideBalls: function(hexModel, prevPosition, position, collisionInfo, debugView)
    {
        collisionInfo.offsetX = 0;
        collisionInfo.offsetY = 0;

        var ballRadius = Config.ballRadius;
            positionOffset = HexMath.pixelToOffset(position.x ,position.y, Config.hexRadius),
            direction = Point.subtract(position, prevPosition).normalize(),
            leftPoint1 = prevPosition.clone(),
            leftPoint2 = position.clone();
            leftPoint2.addXY(direction.x * ballRadius, direction.y * ballRadius);
        var rightPoint1 = leftPoint1.clone(),
            rightPoint2 = leftPoint2.clone();

        normal = direction.normalRightHand().multiply(this.smallCollisionRadius);

            leftPoint1.subtract(normal);
            leftPoint2.subtract(normal);
            rightPoint1.add(normal);
            rightPoint2.add(normal);

        var self = this,
            hasCollision = false,
            lineCircleCollisionInfo = {};

        HexMath.iterateNeighbours(positionOffset.x, positionOffset.y, function(x, y) {
            if (hexModel.offsetIsValidForItems(x, y) && hexModel.offsetContainsBall(x, y)) {

                // Checking first line
                if (self.lineVsCircle(leftPoint1, leftPoint2,
                                      HexMath.offsetToPixel(x, y, Config.hexRadius),
                                      ballRadius, lineCircleCollisionInfo) ||
                // Checking second line
                    self.lineVsCircle(rightPoint1, rightPoint2,
                                           HexMath.offsetToPixel(x, y, Config.hexRadius),
                                           ballRadius, lineCircleCollisionInfo)) {

                    if (debugView) {
                        debugView.addDebugLine(leftPoint1, leftPoint2);
                        debugView.addDebugLine(rightPoint1, rightPoint2);
                        debugView.addDebugCircle(lineCircleCollisionInfo.circleCenter,
                                                                  lineCircleCollisionInfo.circleRadius,
                                                                  'black', 2);

                    }

                    collisionInfo.offsetX = x;
                    collisionInfo.offsetY = y;
                    hasCollision = true;
                    return true; // stop iterations
                }
            }

        });

        if (hasCollision) {
            return true;
        }

        return false;
    },


    collideWalls: function(hexModel, prevPosition, position, convertedPosition, ball, collisionInfo)
    {
        var result = false;

        collisionInfo.depthX = null;
        collisionInfo.horizontalLeft = null;
        collisionInfo.verticalTop = null;
        collisionInfo.depthY = null;
        collisionInfo.horizontalHit = false;
        collisionInfo.verticalHit = false;
        collisionInfo.verticalTop = false;

        if (position.x - Config.ballRadius < 0) {
            collisionInfo.depthX = Config.ballRadius - position.x;
            collisionInfo.horizontalLeft = true;
            collisionInfo.horizontalHit = true;
            result = true;
        }
        else if (position.x + Config.ballRadius > Config.screenWidth) {
            collisionInfo.depthX = position.x + Config.ballRadius - Config.screenWidth;
            collisionInfo.horizontalLeft = false;
            collisionInfo.horizontalHit = true;
            result = true;
        }
        if (!hexModel.levelIsCenterPinned) {
            if (convertedPosition.y - Config.ballRadius < 0) {
                collisionInfo.verticalTop = true;
                collisionInfo.verticalHit = true;
                result = true;
            }
        }

        return result;
    }
}
