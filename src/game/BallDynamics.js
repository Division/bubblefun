import ui.View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import src.Config as Config;
import src.game.HexView as HexView;
import src.utils.Point as Point;
import src.utils.HexMath as HexMath;
import src.utils.Collision as Collision;

/*
    Base class for the game views
*/
exports = Class(function ()
{
    //---------------
    // Var

    this.BALL_FLY_SPEED = 1000;
    this.FIXED_UPDATE_FPS = 30;

    this.ballRadius = 0;
    this.smallCollisionRadius = 5;

    /**
        Array of BallView
    */
    this.balls = null;
    this.firedBalls = null;

    this.ballPool = null;

    this.ballContainer = null,
    this.hexView = null;
    this.hexModel = null;

    this.init = function(options)
    {
        this.ballPool = options.ballPool;
        this.ballContainer = options.ballContainer;
        this.hexView = options.hexView;
        this.ballRadius = options.ballRadius;
        this.hexModel = options.model;

        this.firedBalls = [];
    };

    //------------------------------------------------------------------------
    // Update
    //------------------------------------------------------------------------

    this.update = function(dt)
    {
        this.moveFiredBalls(dt);
    };

    //------------------------------------------------------------------------
    // Fired balls
    //------------------------------------------------------------------------

    this.fireBall = function(position, direction, type)
    {
        var ball = this.ballPool.obtainView();
        ball.putToPosition(position);
        ball.flyDirection = direction.clone().normalize();
        ball.setType(type);
        if (Config.DEBUG_HIDE_BALLS) {
            ball.hide();
        }
        else {
            ball.show();
        }

        this.firedBalls.push(ball);
    };


    this.moveFiredBalls = function(dt)
    {
        var collisionInfo = {}; // reused object

        for (var i = this.firedBalls.length - 1; i >= 0; i--) {
            var ball = this.firedBalls[i],
                prevPosition = ball.position.clone(),
                newPosition = Point.multiply(ball.flyDirection, this.BALL_FLY_SPEED * dt).add(prevPosition);

            convertedPrevPosition = this.hexView.convertPointFromGameViewToItemContainerView(prevPosition.x, prevPosition.y);
            convertedNewPosition = this.hexView.convertPointFromGameViewToItemContainerView(newPosition.x, newPosition.y);

            // Checking collision with other balls
            if (this.collideBalls(convertedPrevPosition, convertedNewPosition, ball, collisionInfo)) {

                ball.putToPosition(newPosition);
                var offset = HexMath.pixelToOffset(convertedNewPosition.x, convertedNewPosition.y, Config.hexRadius);
                if (this.hexModel.offsetIsAvailableForLanding(offset.x, offset.y)) {
                    ball.setOffset(offset);
                }
                this.hexModel.landBall(ball);

                this.firedBalls[i] = this.firedBalls[this.firedBalls.length - 1];
                this.firedBalls.pop();

                this.ballPool.releaseView(ball);
            }

            // Collision with walls
            else if (this.collideWalls(prevPosition, newPosition, ball, collisionInfo)) {
                if (collisionInfo.depthX) {
                    var sign = collisionInfo.horizontalLeft ? 1 : -1;
                    ball.flyDirection.x = Math.abs(ball.flyDirection.x) * sign;
                    newPosition.x += collisionInfo.depthX * sign;
                }

                ball.putToPosition(newPosition);
                var offset = HexMath.pixelToOffset(convertedNewPosition.x, convertedNewPosition.y, Config.hexRadius);
                if (this.hexModel.offsetIsAvailableForLanding(offset.x, offset.y)) {
                    ball.setOffset(offset);
                }
            }

            // Simple movement, no collision occured
            else {
                ball.putToPosition(newPosition);
                var offset = HexMath.pixelToOffset(convertedNewPosition.x, convertedNewPosition.y, Config.hexRadius);
                if (this.hexModel.offsetIsAvailableForLanding(offset.x, offset.y)) {
                    ball.setOffset(offset);
                }

            }
        }
    };


    this.collideWalls = function(prevPosition, position, ball, collisionInfo)
    {
        var result = false;

        collisionInfo.depthX = null;
        collisionInfo.horizontalLeft = null;
        collisionInfo.verticalTop = null;
        collisionInfo.depthY = null;
        collisionInfo.horizontalHit = false;

        if (position.x - this.ballRadius < 0) {
            collisionInfo.depthX = this.ballRadius - position.x;
            collisionInfo.horizontalLeft = true;
            collisionInfo.horizontalHit = true;
            result = true;
        }
        else if (position.x + this.ballRadius > Config.screenWidth) {
            collisionInfo.depthX = position.x + this.ballRadius - Config.screenWidth;
            collisionInfo.horizontalLeft = false;
            collisionInfo.horizontalHit = true;
            result = true;
        }

        return result;
    };


    this.collideBalls = function(prevPosition, position, collisionInfo)
    {
        var positionOffset = HexMath.pixelToOffset(position.x ,position.y, Config.hexRadius);
            direction = Point.subtract(position, prevPosition).normalize(),
            leftPoint1 = prevPosition.clone();
            leftPoint2 = position.clone();
            leftPoint2.addXY(direction.x * this.ballRadius, direction.y * this.ballRadius);
        var rightPoint1 = leftPoint1.clone(),
            rightPoint2 = leftPoint2.clone();

            this.hexView.itemContainer.setDebugLine(leftPoint1, leftPoint2);

        normal = direction.normalRightHand().multiply(this.smallCollisionRadius);

            leftPoint1.subtract(normal);
            leftPoint2.subtract(normal);
            rightPoint1.add(normal);
            rightPoint2.add(normal);

        var self = this,
            hasCollision = false,
            lineCircleCollisionInfo = {};

        HexMath.iterateNeighbours(positionOffset.x, positionOffset.y, function(x, y) {
            if (self.hexModel.offsetIsValidForItems(x, y) && self.hexModel.offsetContainsBall(x, y)) {

                // Checking first line
                if (Collision.lineVsCircle(leftPoint1, leftPoint2,
                                      HexMath.offsetToPixel(x, y, Config.hexRadius),
                                      self.ballRadius, lineCircleCollisionInfo) ||
                // Checking second line
                    Collision.lineVsCircle(rightPoint1, rightPoint2,
                                           HexMath.offsetToPixel(x, y, Config.hexRadius),
                                           self.ballRadius, lineCircleCollisionInfo)) {

                    self.hexView.itemContainer.addDebugLine(leftPoint1, leftPoint2);
                    self.hexView.itemContainer.addDebugLine(rightPoint1, rightPoint2);
                    self.hexView.itemContainer.addDebugCircle(lineCircleCollisionInfo.circleCenter,
                                                              lineCircleCollisionInfo.circleRadius,
                                                              'black', 2);
                    hasCollision = true;
                    return true; // stop iterations
                }
            }

        });

        if (hasCollision) {
            return true;
        }

        return false;
    };




});
