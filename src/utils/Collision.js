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
            collisionInfo.point1 = null;
            collisionInfo.point2 = null;
        }

        var p1p2 = Point.subtract(p2,p1),
            p1p2Length = p1p2.getMagnitude(),
            p1p2Normalized = p1p2.clone().normalize(),
            p1c = Point.subtract(center, p1),
            projectionRestricted = Math.min(Math.max(0, p1c.dot(p1p2Normalized)), p1p2Length),
            projectionPointRestricted = Point.multiply(p1p2Normalized, projectionRestricted).add(p1),
            depthRestricted = Point.distance(center, projectionPointRestricted),

            result = projectionRestricted > - radius &&
                     projectionRestricted < p1p2Length + radius &&
                     depthRestricted < radius;

        // Calculate intersection points
        if (result && collisionInfo) {
            var projection = p1c.dot(p1p2Normalized),
                projectionPoint = Point.multiply(p1p2Normalized, projection).add(p1),
                depth = Point.distance(center, projectionPoint),
                hl = Math.sqrt(radius * radius - depth * depth);

            p1p2.divide(p1p2Length); // Normalized
            collisionInfo.collisionPoint = Point.add(projectionPoint, new Point(-p1p2.x * hl, -p1p2.y * hl));
        }

        return result;
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
                        debugView.addDebugCircle(lineCircleCollisionInfo.collisionPoint, 3, 'red', 1);
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
    },


    getTrajectoryDistance: function(hexModel, position, localPosition, angle, maxDistance, debugView)
    {
        var collidesBall = false,
            direction = new Point(-Math.sin(angle + Math.PI / 2), Math.cos(angle + Math.PI / 2)),
            normal = direction.clone().normalRightHand().multiply(this.smallCollisionRadius),
            stepDistance = Config.hexRadius / 2,
            numberOfIterations = Math.floor(maxDistance / stepDistance),
            resultPoints = [],
            collisionInfo = {},
            currentPoint = new Point(),
            minDistance = maxDistance,
            self = this;

        for (var i = 0; i <= numberOfIterations; i++) {
            var distance = i * stepDistance;
            if (i == numberOfIterations) {
                distance = maxDistance;
            }

            function checkCollision(normalDeltaX, normalDeltaY) {
                currentPoint.setTo(normalDeltaX + localPosition.x + direction.x * distance, normalDeltaY + localPosition.y + direction.y * distance);

                var currentOffset = HexMath.pixelToOffset(currentPoint.x, currentPoint.y, Config.hexRadius),
                    circleCenter = HexMath.offsetToPixel(currentOffset.x, currentOffset.y, Config.hexRadius),
                    containsBall = hexModel.offsetIsValidForItems(currentOffset.x, currentOffset.y) &&
                                   hexModel.offsetContainsBall(currentOffset.x, currentOffset.y);

                if (containsBall && self.lineVsCircle(localPosition, currentPoint, circleCenter, Config.ballRadius, collisionInfo)) {
                    distanceToPoint = Point.distance(collisionInfo.collisionPoint, localPosition);
                    if (distanceToPoint < minDistance) {
                        minDistance = distanceToPoint;
                    }

                    collidesBall = true;
                }
            }

            checkCollision(-normal.x, -normal.y);
            checkCollision(normal.x, normal.y);
        }
        
        // Calculate distance to the wall;
        if (!collidesBall) {
            tga = b / a;
            b = tga * a;

            var a = direction.x < 0 ? position.x - Config.ballRadius : Config.screenWidth - position.x - Config.ballRadius,
                b = Math.abs(Math.tan(angle) * a),
                minDistance = Math.min(Math.sqrt(a * a + b * b), maxDistance);
        }

        if (debugView) {
            debugView.setDebugLine(localPosition, new Point(localPosition.x + direction.x * minDistance,
                                                            localPosition.y + direction.y * minDistance));
        }

        return minDistance;
    }
}
