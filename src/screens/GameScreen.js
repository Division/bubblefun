import ui.View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import src.Config as Config;
import src.game.GameView as GameView;
import math.geom.Point as GCPoint;
import ui.widget.ButtonView as ButtonView;

/**
    GameScreen contains gameView, background, GUI and listens for the input
*/
exports = Class(ui.View, function (supr)
{
    this.BACKGROUND_URL = "resources/images/back.png";

    this.backgroundImage = null;

    // Flag indicates if finger or mouse is down
    this.inputIsDown = false,

    // Background
    this.backgroundImageView = null;

    // Contains all the gameplay items (balls, cannon etc)
    this.gameView = null;
    this.uiContainer = null;

    //---------------
    // UI

    this.buttonSwapBalls = null;

    this.init = function(options)
    {
        supr(this, 'init', [options]);

        this.backgroundImage = new Image({
            url: this.BACKGROUND_URL
        });

        // Background
        var backgroundAspect = this.backgroundImage.getWidth() / this.backgroundImage.getHeight(),
            backgroundWidth = this.style.height * backgroundAspect,
            backgroundHeight = this.style.height;
        this.backgroundImageView = new ImageView({
            superview: this,
            image: this.backgroundImage,
            autoSize: false,
            x: this.style.width / 2 - backgroundWidth / 2,
            y: 0,
            width: this.style.height * backgroundAspect,
            height: this.style.height
        });

        // Game view
        var gameScale = backgroundHeight / Config.screenHeight;
        this.gameView = new GameView({
            superview: this,
            scale: gameScale,
            x: this.style.width / 2 - (Config.screenWidth / 2) * gameScale,
            y: 0,
            width: Config.screenWidth,
            height: Config.screenHeight
        });

        this.uiContainer = new ui.View({
            superview: this,
            scale: gameScale,
            x: this.style.width / 2 - (Config.screenWidth / 2) * gameScale,
            y: 0,
            width: Config.screenWidth,
            height: Config.screenHeight
        });

        // Events
        var self = this;
        this.on('InputStart', function(e, point) {
            self.inputIsDown = true;
            var gameViewPoint = new GCPoint(point);
            self.gameView.style.localizePoint(gameViewPoint);
            self.gameView.handleTapStart(gameViewPoint);
        });

        this.on('InputMove', function(e, point) {
            if (self.inputIsDown) {
                var gameViewPoint = new GCPoint(point);
                self.gameView.style.localizePoint(gameViewPoint);
                self.gameView.handleTapMove(gameViewPoint);
            }
        });

        this.on('InputSelect', function(e, point) {
            self.inputIsDown = false;
            var gameViewPoint = new GCPoint(point);
            self.gameView.style.localizePoint(gameViewPoint);
            self.gameView.handleTapEnd(gameViewPoint);
        });

        this.setupUI();
    };


    this.setupUI = function()
    {
        var self = this;
        this.buttonSwapBalls = new ButtonView({
            superview: this.uiContainer,
            width: 80,
            height: 80,
            x: this.gameView.style.x + Config.screenWidth / 2 - 40,
            y: Config.screenHeight - 145,
            on: {
                up: function () {
                    self.gameView.toggleBalls();
                }
            }
        });
    }

});
