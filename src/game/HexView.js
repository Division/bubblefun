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

exports = Class(ui.View, function (supr)
{
    //---------------
    // Const

    this.MAXIMUM_LINES_VISIBLE = 8; // 8.5?

    //---------------
    // Var

    /*
        Container with balls that is rotated and positioned as needed
    */
    this.itemContainer = null,

    /*
        Array of hex cells stored line by line
    */
    this.hexModel = null;


    this.ballPool = null,

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

        this.hexModel.on(this.hexModel.EVENT_ITEMS_DESTROYED, function(items) {
            self.handleBallsDestroyed(items);
        });

        this.hexModel.on(this.hexModel.EVENT_ITEMS_FALL, function(items) {
            self.handleBallsFall(items);
        });

        this.itemContainer = new HexViewItemContainer({
            superview: this,
            radius: Config.hexRadius,
            model: this.hexModel
        });

        this.ballPool = new ViewPool({
            ctor: BallView,
            initCount: 100,
            initOpts: {
                parent: this.itemContainer,
                width: Config.ballRadius * 2,
                height: Config.ballRadius * 2
            }
        });

    }


    this.handleNewLevelLoaded = function()
    {
        this.createBallViewsForNewLevel();
        this.updateContainerPosition();
    }


    this.handleBallLanded = function(item, offsetX, offsetY)
    {
        this.instantiateBall(item.type, offsetX, offsetY);
    }


    this.handleBallsDestroyed = function(items)
    {
        for (var i = 0; i < items.length; i++) {
            this.ballPool.releaseView(items[i].ball);
        }
    }


    this.handleBallsFall = function(items)
    {
        console.log('fall', items);
        for (var i = 0; i < items.length; i++) {
            this.ballPool.releaseView(items[i].ball);
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

    this.updateContainerPosition = function()
    {
        var offsetX = Config.ballRadius;
        this.itemContainer.style.x = offsetX;
        this.itemContainer.style.y = Config.hexRadius;
    }

    //------------------------------------------------------------------------
    // Utils
    //------------------------------------------------------------------------

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
