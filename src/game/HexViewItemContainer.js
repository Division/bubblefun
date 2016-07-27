import src.utils.HexMath as HexMath;
import ui.View;
import src.Config as Config;
import ui.ImageView as ImageView;

exports = Class(ui.View, function (supr)
{
    this.DEBUG_ENABLED = false;
    this.DEBUG_GRID_ENABLED = true;
    this.DEBUG_GRID_FILL = true;

    this.radius = 0;
    this.model = null;

    this.debugLines = null;
    this.debugCircles = null;

    this.targetTopItems = null;

    this.topItemsVisible = false,

    this.debugColors = [
        '',
        '#f6181a',
        '#2e83ee',
        '#45ce17',
        '#cc2ce8',
        '#fded2f'
    ];

    this.init = function(options)
    {
        supr(this, 'init', [options]);
        this.radius = options.radius;
        this.model = options.model;
        this.debugLines = [];
        this.debugCircles = [];
        this.targetTopItems = [];

        for (var i = 0; i < Config.defaultHorizontalHexCount; i++) {
            var position = HexMath.offsetToPixel(i, 0, Config.hexRadius),
                size = 30;

            this.targetTopItems.push(new ImageView({
                superview: this,
                x: position.x - size / 2,
                y: position.y - size / 2,
                anchorX: size / 2,
                anchorY: size / 2,
                width: size,
                height: size,
                image: 'resources/images/Target_item.png'
            }));
        }
    };


    this.setTopItemsVisible = function(visible)
    {
        for (var i = 0; i < this.targetTopItems.length; i++) {
            if (visible) {
                this.targetTopItems[i].show();
            }
            else {
                this.targetTopItems[i].hide();
            }
        }

        this.topItemsVisible = visible;
    }


    this.tick = function(dtMS)
    {
        if (this.topItemsVisible) {
            var time = new Date().getTime() / 1000;
            for (var i = 0; i < this.targetTopItems.length; i++) {
                var item = this.targetTopItems[i];
                item.style.r = Math.PI * time / 3;
                item.style.scale = 0.6 + Math.sin(time * 3) * 0.08;
            }
        }
    }


    this.render = function(ctx)
    {
        if (!this.DEBUG_ENABLED) {
            return;
        }

        ctx.save();

        this.drawGrid(ctx, this.model.horizontalItemCount, this.model.numberOfLines);
        this.drawDebugLines(ctx);
        this.drawDebugCircles(ctx);

        ctx.restore();
    };


    //------------------------------------------------------------------------
    // Debug
    //------------------------------------------------------------------------

    this.setDebugLine = function(p1, p2, color, width)
    {
        this.debugLines[0] = {
            p1: p1,
            p2: p2,
            color: color,
            width: width
        }
    }


    this.addDebugLine = function(p1, p2, color, width)
    {
        if (this.debugLines.length == 0) {
            this.debugLines.length = 1;
            this.debugLines[0] = {};
        }

        this.debugLines.push({
            p1: p1,
            p2: p2,
            color: color || 'white',
            width: width || 1
        });
    }


    this.addDebugCircle = function(point, radius, color, width)
    {
        this.debugCircles.push({
            p: point,
            radius: radius || 2,
            color: color || white,
            width: width || 1
        });
    }


    this.drawDebugLines = function(ctx)
    {
        for (var i = 0; i < this.debugLines.length; i++) {
            if (!this.debugLines[i].p1) {
                continue;
            }

            ctx.strokeStyle = this.debugLines[i].color;
            ctx.lineWidth = this.debugLines[i].width;
            ctx.beginPath();
            ctx.moveTo(this.debugLines[i].p1.x, this.debugLines[i].p1.y);
            ctx.lineTo(this.debugLines[i].p2.x, this.debugLines[i].p2.y);
            ctx.stroke();
        }
    }


    this.drawDebugCircles = function(ctx)
    {
        for (var i = 0; i < this.debugCircles.length; i++) {
            ctx.strokeStyle = this.debugCircles[i].color;
            ctx.lineWidth = this.debugCircles[i].width;
            ctx.beginPath();
            ctx.arc(this.debugCircles[i].p.x, this.debugCircles[i].p.y, this.debugCircles[i].radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }


    this.drawGrid = function(ctx, columns, rows)
    {
        if (!this.DEBUG_GRID_ENABLED)
        {
            return;
        }

        ctx.font = "17px Arial";
        ctx.strokeStyle = "white";

        for (var i = 0; i < columns; i++) {
            for (var j = 0; j < rows; j++) {

                if (j % 2 != 0 && i == columns - 1) {
                    continue;
                }

                var position = HexMath.offsetToPixel(i, j, this.radius);


                ctx.beginPath();
                for (var k = 0; k < 7; k++) {
                    var angle = Math.PI * 2 * k / 6; // radians
                    var targetX = position.x + Math.sin(angle) * this.radius;
                    var targetY = position.y + Math.cos(angle) * this.radius;

                    if (k == 0) {
                        ctx.moveTo(targetX, targetY);
                    }
                    else {
                        ctx.lineTo(targetX, targetY);
                    }
                }
                ctx.stroke();

                if (this.DEBUG_GRID_FILL) {
                    var item = this.model.getItemAtOffset(i, j);
                    if (item.type) {
                        ctx.fillStyle = this.debugColors[item.type];
                        ctx.fill();
                    }
                }

                ctx.fillStyle = "white";
                ctx.fillText(i + ", " + j, position.x - 17, position.y + 4);

            }
        }
    };

});
