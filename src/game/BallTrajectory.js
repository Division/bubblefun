import ui.View;
import ui.ViewPool as ViewPool;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import src.utils.Point as Point;
import src.Config as Config;
import src.utils.Collision as Collision;

exports = Class(ui.View, function (supr)
{

    this.TRACK_ITEM_SIZE = Collision.smallCollisionRadius * 2;
    this.TRACK_ITEM_INTERVAL = 25;
    this.TRACK_MAX_DISTANCE = 1000;

    this.trackImagePool = null;

    this.distance = 0;
    this.angle = 0;

    this.images = null;

    this.currentImage = null;

    this.init = function(options)
    {
        supr(this, 'init', [options]);

        this.images = [
            new Image({ url: 'resources/images/Trajectory_Red.png'}),
            new Image({ url: 'resources/images/Trajectory_Blue.png'}),
            new Image({ url: 'resources/images/Trajectory_Green.png'}),
            new Image({ url: 'resources/images/Trajectory_Purple.png'}),
            new Image({ url: 'resources/images/Trajectory_Yellow.png'})
        ];

        this.trackImagePool = new ViewPool({
            ctor: ImageView,
            initCount: Math.floor(this.TRACK_MAX_DISTANCE / this.TRACK_ITEM_SIZE),
            initOpts: {
                parent: this,
                width: this.TRACK_ITEM_SIZE,
                height: this.TRACK_ITEM_SIZE,
                image: 'resources/images/star.png'
            }
        });

        this.visibleItems = [];

        this.setVisible(false);
    }


    this.pointTo = function(angle, distance, type)
    {
        this.distance = Math.min(distance, this.TRACK_MAX_DISTANCE);
        this.angle = angle;
        this.layoutTrack();
        this.setVisible(true);
        this.currentImage = this.images[type - 1];
    }


    this.layoutTrack = function()
    {
        this.trackImagePool.releaseAllViews();
        var direction = new Point(Math.cos(this.angle), Math.sin(this.angle)),
            requiredCount = Math.floor(this.distance / this.TRACK_ITEM_INTERVAL);

        this.visibleItems.length = 0;
        for (var i = 0; i < requiredCount; i++) {
            var item = this.trackImagePool.obtainView();
            item.style.x = -direction.x * (i+1) * this.TRACK_ITEM_INTERVAL - this.TRACK_ITEM_SIZE / 2;
            item.style.y = -direction.y * (i+1) * this.TRACK_ITEM_INTERVAL - this.TRACK_ITEM_SIZE / 2;
            item.setImage(this.currentImage);
            item.show();

            this.visibleItems.push(item);
        }
    }


    this.setVisible = function(visible)
    {
        this.style.visible = visible;
    }



});
