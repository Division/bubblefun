import ui.View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import src.Config as Config;
import src.utils.Point as Point;
import src.game.BallInfo as BallInfo;

/*
    Base class for the game views
*/
exports = Class(ImageView, function (supr)
{
    //---------------
    // Var

    // Move direction after the shot
    this.flyDirection = null;

    // Current position of the
    this.position = null;

    // Prev position is used for verlet physics simulation
    this.prevPosition = null;

    // Grid coordinates
    this.offsetX = 0;
    this.offsetY = 0;

    this.type = 0;

    this.init = function(options)
    {
        supr(this, 'init', [options]);
        this.position = new Point();
        this.prevPosition = new Point();
    };


    this.putToPosition = function(position)
    {
        this.position.copyFrom(position);
        this.prevPosition.copyFrom(position);
        this.style.x = this.position.x - this.style.width / 2;
        this.style.y = this.position.y - this.style.height / 2;
    }


    this.setType = function(type)
    {
        this.type = type;
        this.setImage(new Image({ url: BallInfo.getBallImagePath(type) }));
    }


    this.setOffset = function(offset)
    {
        this.offsetX = offset.x;
        this.offsetY = offset.y;
    }


});
