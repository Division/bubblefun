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

    /**
        Array of BallView
    */
    this.balls = null;
    this.firedBalls = null;
    this.falledBalls = null;

    this.ballPool = null;

    this.ballContainer = null,
    this.hexView = null;
    this.hexModel = null;
    this.nextFixedUpdateTime = 0;

    this.init = function(options)
    {
        this.ballPool = options.ballPool;
        this.ballContainer = options.ballContainer;
        this.hexView = options.hexView;
        this.ballRadius = options.ballRadius;
        this.hexModel = options.model;

        this.firedBalls = [];
        this.falledBalls = [];

        var self = this;
        this.hexView.on(this.hexView.EVENT_INSTANTIATE_BALLS, function(items){
            self.instantiateFalledBalls(items);
        });
    };

    //------------------------------------------------------------------------
    // Update
    //------------------------------------------------------------------------

    this.update = function(dt)
    {
        this.moveFiredBalls(dt);

        var time = new Date().getTime() / 1000;
        this.nextFixedUpdateTime = time + 1 / this.FIXED_UPDATE_FPS;
        this.moveFalledBalls(dt);
        this.keepFalledBallsInBounds();
    };

    //------------------------------------------------------------------------
    // Falled balls
    //------------------------------------------------------------------------

    this.moveFalledBalls = function(dt)
    {
        for (var i = this.falledBalls.length - 1; i >= 0 ; i--) {
            var ball = this.falledBalls[i];

            var delta = Point.subtract(ball.position, ball.prevPosition);
            ball.prevPosition = ball.position.clone();
            ball.position.add(delta);
            ball.position.add(Point.multiplyFloat(new Point(0, 750), dt * dt));

            ball.updateImageCoordsToPosition();

            if (ball.position.y > Config.screenHeight + Config.ballRadius) {
                this.falledBalls[i] = this.falledBalls[this.falledBalls.length - 1];
                this.falledBalls.pop();
                this.ballPool.releaseView(ball);

                console.log('releasing ball');
            }
        }
    }

    this.keepFalledBallsInBounds = function()
    {

    }


    this.instantiateFalledBalls = function(items)
    {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var ball = this.ballPool.obtainView();
            ball.setType(item.ball.type);
            ball.position.setTo(item.positionParent.x, item.positionParent.y);

            var randomAngle = Math.PI * 2 * Math.random(),
                randomSpeed = Math.random() * 2 + 0.4,
                dx = Math.cos(randomAngle) * randomSpeed,
                dy = Math.min(0, Math.sin(randomAngle) * randomSpeed) - 2;

            ball.prevPosition.setTo(item.positionParent.x + dx, item.positionParent.y + dy);

            ball.updateImageCoordsToPosition();
            ball.show();
            this.falledBalls.push(ball);

            console.log('item', item, 'ball', ball);
        }
    }

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

            this.updateBallOffsetForMovingTheSegment(convertedPrevPosition, convertedNewPosition, ball);

            // Checking collision with other balls
            if (Collision.collideBalls(this.hexModel, convertedPrevPosition, convertedNewPosition, collisionInfo, this.hexView.itemContainer)) {
                this.handleBallCollision(newPosition, convertedNewPosition, collisionInfo, ball);

            }

            // Collision with walls
            else if (Collision.collideWalls(this.hexModel, prevPosition, newPosition, ball, collisionInfo)) {
                this.handleWallCollision(newPosition, convertedNewPosition, collisionInfo, ball);
                if (collisionInfo.verticalHit) {
                    this.handleBallCollision(newPosition, convertedNewPosition, collisionInfo, ball);
                }
                else if (collisionInfo.horizontalHit) {
                    convertedNewPosition = this.hexView.convertPointFromGameViewToItemContainerView(newPosition.x, newPosition.y);
                    var checkPrevPosition = new Point(convertedNewPosition.x - ball.flyDirection.x,
                                                      convertedNewPosition.y - ball.flyDirection.y);

                    this.updateBallOffsetForMovingTheSegment(checkPrevPosition, convertedNewPosition, ball);
                    if (Collision.collideBalls(this.hexModel, checkPrevPosition, convertedNewPosition, collisionInfo)) {
                        //this.handleBallCollision(newPosition, convertedNewPosition, collisionInfo, ball);
                    }
                }
            }

            // Simple movement, no collision occured
            else {
                ball.putToPosition(newPosition);
                // var offset = HexMath.pixelToOffset(convertedNewPosition.x, convertedNewPosition.y, Config.hexRadius);
                // if (this.hexModel.offsetIsAvailableForLanding(offset.x, offset.y)) {
                //     ball.setOffset(offset);
                // }
            }
        }
    }


    this.handleWallCollision = function(newPosition, convertedNewPosition, collisionInfo, ball)
    {
        if (collisionInfo.depthX) {
            var sign = collisionInfo.horizontalLeft ? 1 : -1;
            ball.flyDirection.x = Math.abs(ball.flyDirection.x) * sign;
            newPosition.x += collisionInfo.depthX * sign;

            collisionInfo.newPosition = newPosition.clone();
        }

        ball.putToPosition(newPosition);
        // var offset = HexMath.pixelToOffset(convertedNewPosition.x, convertedNewPosition.y, Config.hexRadius);
        // if (this.hexModel.offsetIsAvailableForLanding(offset.x, offset.y)) {
        //     ball.setOffset(offset);
        // }
    }


    this.handleBallCollision = function(newPosition, convertedNewPosition, collisionInfo, ball)
    {
        ball.putToPosition(newPosition);

        var offsetFound = true;
        if (!this.hexModel.offsetIsAvailableForLanding(ball.offsetX, ball.offsetY)) {
            // TODO: implement
        }

        this.hexModel.landBall(ball);

        var index = this.firedBalls.indexOf(ball);
        if (index != -1) {
            this.firedBalls[index] = this.firedBalls[this.firedBalls.length - 1];
            this.firedBalls.pop();
            this.ballPool.releaseView(ball);
        }
    }


    this.updateBallOffsetForMovingTheSegment = function(startPosition, endPosition, ball)
    {
        var offset = HexMath.pixelToOffset(endPosition.x, endPosition.y, Config.hexRadius);
        if (this.hexModel.offsetIsAvailableForLanding(offset.x, offset.y)) {
            ball.setOffset(offset);
        }

        /*
        var direction = Point.subtract(endPosition, startPosition).divide(12),
            normal = direction.clone().normalize().normalRightHand(),
            deltaLeft = normal.multiply(Collision.smallCollisionRadius);
            currentPosition = startPosition.clone(),
            lastValidOffset = null,
            self = this;

        function checkOffset(localOffset) {
            if (self.hexModel.offsetIsValidForItems(localOffset.x, localOffset.y)) {
                if (self.hexModel.offsetContainsBall(localOffset.x, localOffset.y)) {
                    return true;
                }
                else if (self.hexModel.offsetIsAvailableForLanding(localOffset.x, localOffset.y)){
                    lastValidOffset = localOffset;
                }
            }

            return false;
        }

        for (var i = 0; i <= 12; i++) {
            currentPosition.addXY(direction.x * i, direction.y * i);
            var offset = HexMath.pixelToOffset(currentPosition.x, currentPosition.y, Config.hexRadius),
                offsetLeft = HexMath.pixelToOffset(currentPosition.x - deltaLeft.x, currentPosition.y - deltaLeft.y, Config.hexRadius),
                offsetRight = HexMath.pixelToOffset(currentPosition.x + deltaLeft.x, currentPosition.y + deltaLeft.y, Config.hexRadius);

            if (checkOffset(offset) || checkOffset(offsetLeft) || checkOffset(offsetRight)) {
                break;
            }
        }

        if (lastValidOffset) {
            ball.setOffset(lastValidOffset);
        }

        */
    }


});
