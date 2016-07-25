import ui.View;
import src.game.BallView as BallView;
import ui.ViewPool as ViewPool;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import src.Config as Config;
import src.game.HexView as HexView;
import src.game.HexViewItemContainer as HexViewItemContainer;
import src.utils.HexMath as HexMath;
import math.geom.Point as GCPoint;
import src.utils.Point as Point;
import animate;

exports = Class(ui.View, function (supr)
{
    //---------------
    // Const

    this.EVENT_LEVEL_START = 'level_start';
    this.EVENT_INSTANTIATE_BALLS = 'instantiate_balls';

    this.MAXIMUM_LINES_VISIBLE = 8; // 8.5?

    this.STATE_IDLE = 0;
    this.STATE_LEVEL_ANIM = 1;
    this.STATE_GAMEPLAY = 2;
    this.STATE_LEVEL_COMPLETED = 3;

    this.MAX_SCROLL_SPEED = 5;
    this.LEVEL_ANIM_SCROLL_SPEED = 2;

    this.DESTROY_INTERVAL = 25;

    //---------------
    // Var

    this.state = this.STATE_IDLE;

    /*
        Container with balls that is rotated and positioned as needed
    */
    this.itemContainer = null,
    this.targetContainerY = 0;
    this.scrollSpeed = 0;
    this.idleTime = 0;

    /*
        Array of hex cells stored line by line
    */
    this.hexModel = null;


    this.ballPool = null,

    this.ballsToDestroy = null;
    this.destroyTime = 0;

    //------------------------------------------------------------------------
    // Init
    //------------------------------------------------------------------------

    this.init = function(options)
    {
        supr(this, 'init', [options]);

        this.hexModel = options.model;

        var self = this;
        this.hexModel.on(this.hexModel.EVENT_LEVEL_LOADED, function() {
            self.handleNewLevelLoaded();
        });

        this.hexModel.on(this.hexModel.EVENT_BALL_LANDED, function(e) {
            self.handleBallLanded(e.item, e.offsetX, e.offsetY);
        });

        this.hexModel.on(this.hexModel.EVENT_ITEMS_DESTROYED, function(items, x, y) {
            self.handleBallsDestroyed(items, x, y);
        });

        this.hexModel.on(this.hexModel.EVENT_ITEMS_FALL, function(items) {
            self.handleBallsFall(items);
        });

        this.hexModel.on(this.hexModel.EVENT_LINES_COUNT_CHANGED, function(items) {
            self.handleLineCountChanged();
        });

        this.itemContainer = new HexViewItemContainer({
            superview: this,
            radius: Config.hexRadius,
            model: this.hexModel
        });

        this.ballPool = new ViewPool({
            ctor: BallView,
            initCount: 300,
            initOpts: {
                parent: this.itemContainer,
                width: Config.ballRadius * 2,
                height: Config.ballRadius * 2,
                zIndex: 4
            }
        });


        this.ballsToDestroy = [];

    }


    this.handleNewLevelLoaded = function()
    {
        this.createBallViewsForNewLevel();
        this.setContainerPosition(Config.hexRadius);
        this.targetContainerY = this.getTargetContainerPosition();

        if (this.linesIsMoreThanVisible()) {
            this.state = this.STATE_IDLE;
            this.scrollSpeed = this.LEVEL_ANIM_SCROLL_SPEED;
            this.idleTime = new Date().getTime() + 1000;
        }
        else {
            var self = this;
            setTimeout(function() {
                self.emit(this.EVENT_LEVEL_START);
            }, 0);
        }
    }


    this.handleBallLanded = function(item, offsetX, offsetY)
    {
        this.instantiateBall(item.type, offsetX, offsetY);
    }


    this.handleBallsDestroyed = function(items, x, y)
    {
        var origin = HexMath.offsetToPixel(x, y, Config.hexRadius);

        for (var i = 0; i < items.length; i++) {
            items[i].distance = Point.distance(origin, items[i].ball.position);
        }

        items.sort(function(a, b) {
            if  (a.distance > b.distance) {
                return 1;
            }
            else {
                return -1;
            }
        });

        for (i = 0; i < items.length; i++) {
            this.ballsToDestroy.push(items[i].ball);
        }
    }


    this.handleBallsFall = function(items)
    {
        for (var i = 0; i < items.length; i++) {
            items[i].positionParent = items[i].ball.getPosition(this.getSuperview());
            items[i].positionParent.x += Config.ballRadius;
            items[i].positionParent.y += Config.ballRadius;
            this.ballPool.releaseView(items[i].ball);
        }

        // Handled in BallDynamics
        this.emit(this.EVENT_INSTANTIATE_BALLS, items);
    }


    this.handleLineCountChanged = function()
    {
        if (!this.hexModel.levelIsCenterPinned) {
            this.targetContainerY = this.getTargetContainerPosition();
        }
    }


    this.instantiateBall = function(type, offsetX, offsetY)
    {
        var ball = this.ballPool.obtainView();
        ball.setType(type);

        if (Config.DEBUG_HIDE_BALLS) {
            ball.hide();
        }
        else {
            ball.show();
        }

        this.hexModel.setBallViewForOffset(ball, offsetX, offsetY);
        ball.putToPosition(HexMath.offsetToPixel(offsetX, offsetY, Config.hexRadius));

        return ball;
    }


    this.createBallViewsForNewLevel = function()
    {
        this.ballPool.releaseAllViews();
        for (var i = 0; i < this.hexModel.horizontalItemCount; i++) {
            for (var j = 0; j < this.hexModel.numberOfLines; j++) {
                if (this.hexModel.shouldSkipOffset(i, j)) {
                    continue;
                }

                var item = this.hexModel.getItemAtOffset(i, j);
                if (item.type) {
                    this.instantiateBall(item.type, i, j);
                }
            }
        }
    }

    //------------------------------------------------------------------------
    // Update
    //------------------------------------------------------------------------

    this.tick = function(dtMS)
    {
        var dt = Math.min(dtMS / 1000, 1 / 30);

        if (this.ballsToDestroy.length) {
            var time = new Date().getTime(),
                self = this;

            if (time > this.destroyTime) {
                var ball = this.ballsToDestroy.shift();
                animate(ball).now({
                    scale: 0.3,
                }, 70)
                .then({
                    scale: 1.2,
                    opacity: 0.2,
                }, 100)
                .then(function() {
                    ball.style.opacity = 1;
                    ball.style.scale = 1;
                    self.ballPool.releaseView(ball);
                });
                this.destroyTime = time + this.DESTROY_INTERVAL;
            }
        }

        switch (this.state)
        {
            case this.STATE_IDLE:
                if (new Date().getTime() > this.idleTime) {
                    this.state = this.STATE_LEVEL_ANIM;
                }
                break;

            case this.STATE_LEVEL_ANIM:
                if (Math.abs(this.targetContainerY - this.itemContainer.style.y) < 5) {
                    this.state = this.STATE_GAMEPLAY;
                    this.emit(this.EVENT_LEVEL_START);
                }

                this.updateContainerPosition(dt);
                break;

            case this.STATE_GAMEPLAY:
                this.scrollSpeed = this.MAX_SCROLL_SPEED;
                this.updateContainerPosition(dt);
                break;
        }

    }


    this.getTargetContainerPosition = function()
    {
        if (this.hexModel.numberOfLines > this.MAXIMUM_LINES_VISIBLE) {
            var result = HexMath.offsetToPixel(0, this.hexModel.numberOfLines - this.MAXIMUM_LINES_VISIBLE, Config.hexRadius);
            return -result.y + Config.hexRadius;
        }
        else {
            return Config.hexRadius;
        }
    }


    this.updateContainerPosition = function(dt)
    {
        var targetPosition = this.getTargetContainerPosition(),
            currentPosition = this.itemContainer.style.y,
            delta = (targetPosition - currentPosition) * 0.08,
            sign = delta < 0 ? -1 : 1;

        delta = Math.min(Math.abs(delta), this.MAX_SCROLL_SPEED) * sign;

        this.setContainerPosition(currentPosition + delta);
    }


    this.setContainerPosition = function(positionY)
    {
        var offsetX = Config.ballRadius;
        this.itemContainer.style.x = offsetX;
        this.itemContainer.style.y = positionY;
    }

    //------------------------------------------------------------------------
    // Utils
    //------------------------------------------------------------------------

    this.linesIsMoreThanVisible = function()
    {
        return this.hexModel.numberOfLines > this.MAXIMUM_LINES_VISIBLE;
    }


    this.getHexOffsetFromPixel = function(x, y)
    {
        var containerPoint = new GCPoint(x, y);
        this.itemContainer.style.localizePoint(containerPoint);
        var offset = HexMath.pixelToOffset(containerPoint.x, containerPoint.y, Config.hexRadius);
        return offset;
    }


    this.convertPointFromGameViewToItemContainerView = function(x, y)
    {
        var localPoint = new GCPoint(x, y);
        this.itemContainer.style.localizePoint(localPoint);
        return new Point(localPoint.x, localPoint.y);
    }


});
