import src.utils.Point as Point;
import src.utils.HexMath as HexMath;

exports =
{
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


    collideBalls: function(hexModel, debugView, prevPosition, position, collisionInfo)
    {
        var positionOffset = HexMath.pixelToOffset(position.x ,position.y, Config.hexRadius);
            direction = Point.subtract(position, prevPosition).normalize(),
            leftPoint1 = prevPosition.clone();
            leftPoint2 = position.clone();
            leftPoint2.addXY(direction.x * this.ballRadius, direction.y * this.ballRadius);
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
                if (Collision.lineVsCircle(leftPoint1, leftPoint2,
                                      HexMath.offsetToPixel(x, y, Config.hexRadius),
                                      self.ballRadius, lineCircleCollisionInfo) ||
                // Checking second line
                    Collision.lineVsCircle(rightPoint1, rightPoint2,
                                           HexMath.offsetToPixel(x, y, Config.hexRadius),
                                           self.ballRadius, lineCircleCollisionInfo)) {

                    if (debugView) {
                        debugView.addDebugLine(leftPoint1, leftPoint2);
                        debugView.addDebugLine(rightPoint1, rightPoint2);
                        debugView.addDebugCircle(lineCircleCollisionInfo.circleCenter,
                                                                  lineCircleCollisionInfo.circleRadius,
                                                                  'black', 2);

                    }

                    hasCollision = true;
                    return true; // stop iterations
                }
            }

        });

        if (hasCollision) {
            return true;
        }

        return false;
    }
}
