import ui.View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import src.game.HexView as HexView;
import src.utils.Point as Point;
import src.game.BallInfo as BallInfo;

exports = Class(ui.View, function (supr)
{
    //---------------
    // State

    this.STATE_IDLE          = 0;
    this.STATE_AIM           = 1;
    this.STATE_SHOOT         = 2;
    this.STATE_SHOOT_RECOVER = 3;

    //---------------
    // Const

    this.NUMBER_OF_SPRING_ITEMS = 5;
    this.MIN_SIZE_SPRING = 5;
    this.MAX_SIZE_SPRING = 12;
    this.STRETCH_DISTANCE = 75;

    this.Z_INDEX_BALL = 1;
    this.Z_INDEX_SPRING = 2;

    this.RECOVER_PERIOD = 200;

    //---------------
    // Var

    this.state = this.STATE_IDLE;
    this.ballRadius = 0;

    this.leftSpringItems = null;
    this.rightSpringItems = null;
    this.backSpringItem = null;
    this.ballImage = null;

    this.targetAngle = 0;
    this.currentAngle = 0;
    this.currentDistance = 0;
    this.targetDistance = 0;
    this.currentPosition = null;
    this.leftSpringOrigin = null;
    this.rightSpringOrigin = null;
    this.restPosition = null;

    this.ballSpeed = 100;
    this.nextShotTime = 0; // Time in ms at wich next shot will be possible

    this.currentBallType = 0;

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

        this.setCurrentType(BallInfo.BallTypeBlue);
        // this.randomizeType();
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
            if (targetPoint.y < this.restPosition.y - 20) {
                var direction = Point.subtract(targetPoint, this.restPosition),
                    horizontal = new Point(1, 0);
                this.targetAngle = Point.angle(horizontal, direction);
                this.state = this.STATE_AIM;
                result = true;
            }
            else {
                this.state = this.STATE_IDLE;
            }
        }

        return result;
    }


    this.fire = function(targetPoint)
    {
        if (this.state == this.STATE_AIM && this.setTargetPoint(targetPoint)) {
            this.state = this.STATE_SHOOT;
            this.shotTime = new Date().getTime();
        }
    }


    this.updateLayout = function()
    {
        // Position of the ball in the launcher
        this.currentPosition.copyFrom(this.restPosition);
        this.currentPosition.addXY(Math.cos(this.currentAngle) * this.currentDistance,
                                   Math.sin(this.currentAngle) * this.currentDistance);


        var sideSign = this.currentPosition.y > this.restPosition.y ? 1 : -1,
            directionToPosition = Point.subtract(this.currentPosition, this.restPosition).normalize().multiply(sideSign),
            normalToDirection = Point.normalRightHand(directionToPosition).multiply(this.ballRadius * 0.5),
            leftTargetPoint = Point.add(this.currentPosition, normalToDirection),
            rightTargetPoint = Point.subtract(this.currentPosition, normalToDirection),
            springPosition = new Point(),
            springDeltaPosition = new Point();

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
        this.ballImage.style.x = this.currentPosition.x - this.ballRadius;
        this.ballImage.style.y = this.currentPosition.y - this.ballRadius;

        // Positioning the back single spring
        this.backSpringItem.style.x = this.currentPosition.x + directionToPosition.x * this.ballRadius / 2 - this.backSpringItem.style.width / 2;
        this.backSpringItem.style.y = this.currentPosition.y + directionToPosition.y * this.ballRadius / 2 - this.backSpringItem.style.height / 2;
    }


    this.tick = function(dtMS)
    {
        var dt = dtMS / 1000,
            distanceChange = 30;

        switch (this.state) {
            case this.STATE_AIM:
                this.targetDistance = this.STRETCH_DISTANCE;
                distanceChange = 18;
                break;
            case this.STATE_SHOOT:
                this.targetDistance = -100;
                distanceChange = 24;
                if (this.currentPosition.y < this.restPosition.y - Math.sin(this.currentAngle) * 50) {
                    this.state = this.STATE_SHOOT_RECOVER;
                    this.ballImage.hide();
                    this.nextShotTime = new Date().getTime() + this.RECOVER_PERIOD;

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
                if (new Date().getTime() > this.nextShotTime) {
                    this.state = this.STATE_IDLE;
                    this.ballImage.show();
                }
                else {
                    distanceChange = 10;
                    this.targetDistance = 1;
                    this.targetAngle = Math.PI / 2;
                }
                break;
            case this.STATE_IDLE:
                this.targetDistance = 1;
                this.targetAngle = Math.PI / 2;
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


    this.randomizeType = function()
    {
        this.setCurrentType(Math.floor(Math.random() * 5 + 1));
    }

});
