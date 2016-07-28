import ui.View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import src.Config as Config;
import src.game.GameView as GameView;
import math.geom.Point as GCPoint;
import ui.widget.ButtonView as ButtonView;
import src.utils.ButtonUtils as ButtonUtils;

/**
    GameScreen contains gameView, background, GUI and listens for the input
*/
exports = Class(ui.View, function (supr)
{
    this.STATE_NONE = 0;
    this.STATE_DOWN_MENU = 1;
    this.STATE_DOWN_SWITCH = 2;
    this.STATE_AIM = 3;


    this.EVENT_LEVEL_COMPLETED = 'level_completed';
    this.EVENT_SHOW_MENU = 'show_menu';

    this.BACKGROUND_URL = "resources/images/back.png";

    this.backgroundImage = null;

    // Flag indicates if finger or mouse is down
    this.inputIsDown = false,

    // Background
    this.backgroundImageView = null;

    // Contains all the gameplay items (balls, cannon etc)
    this.gameView = null;
    this.uiContainer = null;

    this.currentLevel = 0;

    this.inputState = this.STATE_NONE;

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
            if (self.inputState != self.STATE_NONE) {
                return;
            }

            self.inputState = self.STATE_AIM;
            var gameViewPoint = new GCPoint(point);
            self.gameView.style.localizePoint(gameViewPoint);
            self.gameView.handleTapStart(gameViewPoint);
        });

        this.on('InputMove', function(e, point) {
            if (self.inputState != self.STATE_AIM) {
                return;
            }

            var gameViewPoint = new GCPoint(point);
            self.gameView.style.localizePoint(gameViewPoint);
            self.gameView.handleTapMove(gameViewPoint);
        });

        this.on('InputSelect', function(e, point) {
            if (self.inputState != self.STATE_AIM) {
                self.inputState = self.STATE_NONE;
                return;
            }

            self.inputIsDown = false;
            var gameViewPoint = new GCPoint(point);
            self.gameView.style.localizePoint(gameViewPoint);
            self.gameView.handleTapEnd(gameViewPoint);

            self.inputState = self.STATE_NONE;
        });

        this.setupUI();

        this.gameView.hexModel.on(this.gameView.hexModel.EVENT_LEVEL_COMPLETED, function() {
            setTimeout(function() {
                self.emit(self.EVENT_LEVEL_COMPLETED, self.currentLevel);
            }, 1000);
        });
    };


    this.loadLevel = function(level)
    {
        this.currentLevel = level;
        this.gameView.loadLevel(level);
    }


    this.setupUI = function()
    {
        var self = this;
        this.buttonSwapBalls = new ui.View({
            superview: this.uiContainer,
            width: 80,
            height: 80,
            x: this.gameView.style.width / 2 + 135,
            y: Config.screenHeight - 100
        });


        this.buttonSwapBalls.on('InputStart', function(e) {
            self.inputState = self.STATE_DOWN_SWITCH;
        });


        this.buttonSwapBalls.on('InputSelect', function(e) {
            if (self.inputState != self.STATE_DOWN_SWITCH) {
                return;
            }

            self.buttonSwapIsDown = false;
            self.gameView.toggleBalls();
            self.inputState = self.STATE_NONE;
        });


        this.buttonSelectLevel = ButtonUtils.createButton(
            this.uiContainer,
            50,
            Config.screenHeight - 30,
            70,
            40,
            'Menu'
        );

        this.buttonSelectLevel.on('InputStart', function(e) {
            self.inputState = self.STATE_DOWN_MENU;
        });

        this.buttonSelectLevel.on('InputSelect', function(e) {
            if (self.inputState != self.STATE_DOWN_MENU) {
                return;
            }

            self.inputState = self.STATE_NONE;
            self.emit(self.EVENT_SHOW_MENU);
        });

        this.buttonSelectLevel.updateOpts({
            text: {
                size: 22
            }
        });
    }

});
