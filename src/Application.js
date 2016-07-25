import ui.TextView as TextView;
import device;
import ui.resource.loader as loader;
import ui.StackView as StackView;
import src.Config as Config;
import src.screens.GameScreen as GameScreen;

exports = Class(GC.Application, function ()
{
    this.rootStackView  = null;
    this.gameScreen     = null;
    this.baseWidth      = 0;
    this.baseHeight     = 0;


    this.initUI = function ()
    {
        this.setupScale();

        this.rootStackView = new StackView({
            superview: this,
            width: this.baseWidth,
            height: this.baseHeight,
            clip: true
        });

        var self = this;
        loader.preload(['resources/images'], function() {
            self.proceedToGameScreen();
        });

    };


    this.proceedToGameScreen = function()
    {
        this.gameScreen = new GameScreen({
            width: this.baseWidth,
            height: this.baseHeight
        });
        this.rootStackView.push(this.gameScreen);
    }


    this.setupScale = function()
    {
        this.baseWidth = Config.screenWidth;
        this.baseHeight = device.screen.height * (Config.screenWidth / device.screen.width);
        var scale = device.screen.width / this.baseWidth;
        this.view.style.scale = scale;
    }

});
