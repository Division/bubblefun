import ui.View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import src.game.HexView as HexView;
import src.utils.Point as Point;
import src.game.BallInfo as BallInfo;
import src.Config as Config;
import src.game.BallTrajectory as BallTrajectory;

exports = Class(ui.View, function (supr)
{
    //---------------
    // Event
    this.EVENT_GET_TRAJECTORY_LENGTH = 'get_trajectory_length';

    //---------------
    // State

    this.STATE_IDLE          = 0;
    this.STATE_AIM           = 1;
    this.STATE_SHOOT         = 2;
    this.STATE_SHOOT_RECOVER = 3;
    this.STATE_CHARGE        = 4;

    //---------------
    // Aim type

    this.AIM_TYPE_NONE = 0;
    this.AIM_TYPE_TOP = 1;
    this.AIM_TYPE_BOTTOM = 2;

    //---------------
    // Const

    this.NUMBER_OF_SPRING_ITEMS = 5;
    this.MIN_SIZE_SPRING = 5;
    this.MAX_SIZE_SPRING = 12;
    this.STRETCH_DISTANCE = 75;

    this.Z_INDEX_BALL = 1;
    this.Z_INDEX_SPRING = 2;

    this.NEXT_BALL_X = 200;
    this.NEXT_BALL_Y = 145;

    this.RECOVER_PERIOD = 200;

    this.ANGLE_LIMIT = 30 / 180 * Math.PI;

    //---------------
    // Var

    this.state = this.STATE_IDLE;
    this.ballRadius = 0;

    this.ballTrajectory = null;

    this.leftSpringItems = null;
    this.rightSpringItems = null;
    this.backSpringItem = null;
    this.ballImage = null;
    this.nextBallImage = null;

    this.targetAngle = 0;
    this.currentAngle = 0;
    this.currentDistance = 0;
    this.targetDistance = 0;
    this.currentPosition = null;
    this.leftSpringOrigin = null;
    this.rightSpringOrigin = null;
    this.restPosition = null;

    this.ballSpeed = 100;

    this.currentBallType = 0;
    this.nextBallType = 0;

    this.lastTargetPoint = null;

    this.lastTrajectoryAngle = 0;

    this.aimType = this.AIM_TYPE_NONE;

    //------------------------------------------------------------------------
    // init
    //------------------------------------------------------------------------

    this.init = function(options)
    {
        supr(this, 'init', [options]);

        this.restPosition = new Point(options.width / 2, 40);
        this.currentPosition = this.restPosition.clone();
        this.leftSpringOrigin = new Point(0,0);
        this.rightSpringOrigin = new Point(options.width, 0);
        this.currentDistance = this.STRETCH_DISTANCE;
        this.ballRadius = options.ballRadius;

        this.initViews();
        this.updateLayout();
    };


    this.initViews = function()
    {
        this.leftSpringItems = [];
        this.rightSpringItems = [];

        this.ballTrajectory = new BallTrajectory({
            superview: this,
            x: this.restPosition.x,
            y: this.restPosition.y
        });

        var imageView;

        for (var i = 0; i < this.NUMBER_OF_SPRING_ITEMS; i++) {
            var size = this.MIN_SIZE_SPRING + (i / (this.NUMBER_OF_SPRING_ITEMS)) * (this.MAX_SIZE_SPRING - this.MIN_SIZE_SPRING);

            imageView = this.createSpringImageView(size);
            this.leftSpringItems.push(imageView);

            imageView = this.createSpringImageView(size);
            this.rightSpringItems.push(imageView);
        }

        this.backSpringItem = this.createSpringImageView(this.MAX_SIZE_SPRING);

        this.ballImage = new ImageView({
            superview: this,
            width: this.ballRadius * 2,
            height: this.ballRadius * 2,
            zIndex: this.Z_INDEX_BALL
        });

        this.nextBallImage = new ImageView({
            superview: this,
            x: this.NEXT_BALL_X,
            y: this.NEXT_BALL_Y,
            width: this.ballRadius * 2,
            height: this.ballRadius * 2,
            zIndex: this.Z_INDEX_BALL - 1
        });
    };


    this.createSpringImageView = function(size)
    {
        return new ImageView({
            superview: this,
            width: size,
            height: size,
            image: 'resources/images/star.png',
            zIndex: this.Z_INDEX_SPRING
        });
    }

    //------------------------------------------------------------------------
    // Interaction
    //------------------------------------------------------------------------

    this.toggleBalls = function()
    {
        if (this.state == this.STATE_IDLE && this.nextBallType) {
            var currentType = this.currentBallType;
            this.setCurrentType(this.nextBallType);
            this.setNextType(currentType);
        }
    }


    this.startupWithBall = function(nextBall)
    {
        this.state = this.STATE_SHOOT_RECOVER;
        this.setNextType(nextBall);
        this.ballImage.hide();
    }


    this.chargeBall = function(nextBall)
    {
        this.state = this.STATE_CHARGE;
        this.ballImage.show();
        this.nextBallImage.hide();
        this.ballImage.style.x = this.nextBallImage.style.x;
        this.ballImage.style.y = this.nextBallImage.style.y;
        this.setCurrentType(this.nextBallType);
        this.setNextType(nextBall);
    }

    //------------------------------------------------------------------------
    // Update
    //------------------------------------------------------------------------

    /**
        Used as input handler
        targetPoint is a point in the local coordinate system
    */
    this.setTargetPoint = function(targetPoint)
    {
        var result = false;

        // Proceed only for IDLE and AIM state
        if (this.state == this.STATE_IDLE || this.state == this.STATE_AIM) {
            if (targetPoint.y < this.restPosition.y - 30 && this.aimType != this.AIM_TYPE_BOTTOM) {
                var direction = Point.subtract(targetPoint, this.restPosition),
                    horizontal = new Point(1, 0);
                this.targetAngle = Point.angle(horizontal, direction);
                this.targetAngle = Math.min(Math.max(this.ANGLE_LIMIT, this.targetAngle), Math.PI - this.ANGLE_LIMIT);
                this.state = this.STATE_AIM;
                this.aimType = this.AIM_TYPE_TOP;
                result = true;
            }
            else if (targetPoint.y > this.restPosition.y - Config.ballRadius  && this.aimType != this.AIM_TYPE_TOP) {
                var direction = Point.subtract(this.restPosition, targetPoint),
                    horizontal = new Point(1, 0);

                this.targetAngle = Point.angle(horizontal, direction);
                this.targetAngle = Math.min(Math.max(this.ANGLE_LIMIT, this.targetAngle), Math.PI - this.ANGLE_LIMIT);
                this.state = this.STATE_AIM;
                this.aimType = this.AIM_TYPE_BOTTOM;
                result = true;
            }
            else {
                this.state = this.STATE_IDLE;
                this.ballTrajectory.setVisible(false);
            }
        }
        else {
            this.lastTargetPoint = targetPoint;
            this.ballTrajectory.setVisible(false);
            this.aimType = this.AIM_TYPE_NONE;
        }

        return result;
    }


    this.fire = function(targetPoint)
    {
        this.lastTargetPoint = null;

        if (this.state == this.STATE_AIM && this.setTargetPoint(targetPoint)) {
            this.state = this.STATE_SHOOT;
            this.shotTime = new Date().getTime();
        }

        this.aimType = this.AIM_TYPE_NONE;
        this.ballTrajectory.setVisible(false);
    }


    this.updateLayout = function()
    {
        var aimDirectionX = Math.cos(this.currentAngle),
            aimDirectionY = Math.sin(this.currentAngle);

        // Position of the ball in the launcher
        this.currentPosition.copyFrom(this.restPosition);
        this.currentPosition.addXY(aimDirectionX * this.currentDistance, aimDirectionY * this.currentDistance);

        var sideSign = this.currentPosition.y > this.restPosition.y ? 1 : -1,
            directionToPosition = Point.subtract(this.currentPosition, this.restPosition).normalize().multiply(sideSign),
            normalToDirection = Point.normalRightHand(directionToPosition).multiply(this.ballRadius * 0.7),
            leftTargetPoint = Point.add(this.currentPosition, normalToDirection),
            rightTargetPoint = Point.subtract(this.currentPosition, normalToDirection),
            springPosition = new Point(),
            springDeltaPosition = new Point(),
            targetPointOffset = 13;


        leftTargetPoint.x += aimDirectionX * targetPointOffset;
        leftTargetPoint.y += aimDirectionY * targetPointOffset;
        rightTargetPoint.x += aimDirectionX * targetPointOffset;
        rightTargetPoint.y += aimDirectionY * targetPointOffset;

        // Positioning left and right springs
        for (var i = 0; i < this.NUMBER_OF_SPRING_ITEMS; i++) {
            springDeltaPosition = Point.subtract(leftTargetPoint, this.leftSpringOrigin, springDeltaPosition);
            springDeltaPosition.divide(this.NUMBER_OF_SPRING_ITEMS - 1);

            springPosition.copyFrom(this.leftSpringOrigin);
            springPosition.addXY(springDeltaPosition.x * i, springDeltaPosition.y * i);
            this.leftSpringItems[i].style.x = springPosition.x - this.leftSpringItems[i].style.width / 2;
            this.leftSpringItems[i].style.y = springPosition.y - this.leftSpringItems[i].style.height / 2;

            springDeltaPosition = Point.subtract(rightTargetPoint, this.rightSpringOrigin, springDeltaPosition);
            springDeltaPosition.divide(this.NUMBER_OF_SPRING_ITEMS - 1);

            springPosition.copyFrom(this.rightSpringOrigin);
            springPosition.addXY(springDeltaPosition.x * i, springDeltaPosition.y * i);
            this.rightSpringItems[i].style.x = springPosition.x - this.rightSpringItems[i].style.width / 2;
            this.rightSpringItems[i].style.y = springPosition.y - this.rightSpringItems[i].style.height / 2;
        }

        // Positioning the ball
        if (this.state != this.STATE_CHARGE) {
            this.ballImage.style.x = this.currentPosition.x - this.ballRadius;
            this.ballImage.style.y = this.currentPosition.y - this.ballRadius;
        }

        if (this.state == this.STATE_AIM && this.currentAngle != this.lastTrajectoryAngle) {
            this.lastTrajectoryAngle = this.currentAngle;
            this.ballTrajectory.style.x = this.currentPosition.x;
            this.ballTrajectory.style.y = this.currentPosition.y;
            var lengthResult = {},
                fromPoint = this.ballTrajectory.getPosition(this.getSuperview());

            this.emit(this.EVENT_GET_TRAJECTORY_LENGTH, fromPoint, this.targetAngle,
                      this.ballTrajectory.TRACK_MAX_DISTANCE, lengthResult);

            this.ballTrajectory.pointTo(this.targetAngle, lengthResult.length, this.currentBallType);
        }
        else if (this.state != this.STATE_AIM) {
            this.ballTrajectory.setVisible(false);
        }

        // Positioning the back single spring
        this.backSpringItem.style.x = this.currentPosition.x + directionToPosition.x * this.ballRadius * 0.9 - this.backSpringItem.style.width / 2;
        this.backSpringItem.style.y = this.currentPosition.y + directionToPosition.y * this.ballRadius * 0.9 - this.backSpringItem.style.height / 2;
    }


    this.tick = function(dtMS)
    {
        var dt = Math.min(dtMS / 1000, 1/30),
            distanceChange = 30;

        switch (this.state) {
            case this.STATE_AIM:
                this.targetDistance = this.STRETCH_DISTANCE;
                distanceChange = 38;
                break;

            case this.STATE_SHOOT:
                this.targetDistance = -100;
                distanceChange = 24;
                if (this.currentPosition.y < this.restPosition.y - Math.sin(this.currentAngle) * 50) {
                    this.state = this.STATE_SHOOT_RECOVER;
                    this.ballImage.hide();

                    var ballPosition = this.ballImage.getPosition(this.getSuperview());
                    ballPosition.x += this.ballImage.style.width / 2;
                    ballPosition.y += this.ballImage.style.height / 2;

                    // Notify game view
                    this.emit('fire', {
                        position: new Point(ballPosition.x, ballPosition.y),
                        direction: new Point(- Math.cos(this.currentAngle),
                                             - Math.sin(this.currentAngle)),
                        type: this.currentBallType
                    });

                    this.randomizeType();
                }

                break;

            case this.STATE_SHOOT_RECOVER:
                distanceChange = 10;
                this.targetDistance = 1;
                this.targetAngle = Math.PI / 2;
                break;

            case this.STATE_IDLE:
                this.targetDistance = 1;
                this.targetAngle = Math.PI / 2;
                break;

            case this.STATE_CHARGE:
                var cx = this.ballImage.style.x,
                    cy = this.ballImage.style.y,
                    dx = (this.restPosition.x - cx - Config.ballRadius) * 0.17,
                    dy = (this.restPosition.y - cy - Config.ballRadius) * 0.17;
                cx += dx;
                cy += dy;

                if ((cx - this.restPosition.x + Config.ballRadius) * (cx - this.restPosition.x + Config.ballRadius) +
                    (cy - this.restPosition.y + Config.ballRadius) * (cy - this.restPosition.y + Config.ballRadius) < 20) {
                    this.state = this.STATE_IDLE;
                    this.nextBallImage.show();
                    if (this.lastTargetPoint) {
                        this.setTargetPoint(this.lastTargetPoint);
                    }
                }

                this.ballImage.style.x = cx;
                this.ballImage.style.y = cy;

                break;
        }

        this.currentAngle = this.currentAngle + (this.targetAngle - this.currentAngle) * 30 * dt;
        this.currentDistance = this.currentDistance + (this.targetDistance - this.currentDistance) * distanceChange * dt;

        this.updateLayout();
    }


    this.setCurrentType = function(type)
    {
        this.currentBallType = type;
        this.ballImage.setImage(BallInfo.getBallImagePath(type));
    }


    this.setNextType = function(type)
    {
        this.nextBallType = type;
        this.nextBallImage.setImage(BallInfo.getBallImagePath(type));
    }


    this.randomizeType = function()
    {
        this.setCurrentType(Math.floor(Math.random() * 5 + 1));
    }

});
