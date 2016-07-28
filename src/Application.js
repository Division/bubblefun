import ui.TextView as TextView;
import device;
import ui.resource.loader as loader;
import ui.StackView as StackView;
import src.Config as Config;
import src.screens.GameScreen as GameScreen;
import src.screens.SelectLevelScreen as SelectLevelScreen;
import src.game.level.Levels as Levels;

exports = Class(GC.Application, function ()
{
    this.NUMBER_OF_LEVELS  = Levels.length;

    this.gameScreen        = null;
    this.selectLevelScreen = null;

    this.baseWidth         = 0;
    this.baseHeight        = 0;

    this.currentLevel      = 0;

    this.initUI = function ()
    {
        this.setupScale();

        this.gameScreen = new GameScreen({
            superview: this,
            visible: false,
            width: this.baseWidth,
            height: this.baseHeight
        });

        var self = this;

        this.gameScreen.on(this.gameScreen.EVENT_LEVEL_COMPLETED, function(completedLevel) {
            var nextLevel = completedLevel % self.NUMBER_OF_LEVELS + 1,
                text = 'Level cleared! Next: Level ' + nextLevel;
            self.proceedToLevelSelect(nextLevel, text);
        });

        this.gameScreen.on(this.gameScreen.EVENT_SHOW_MENU, function() {
            self.proceedToLevelSelect(1);
        });

        this.selectLevelScreen = new SelectLevelScreen({
            superview: this,
            visible: false,
            width: this.baseWidth,
            height: this.baseHeight,
            numberOfLevels: this.NUMBER_OF_LEVELS
        });

        this.selectLevelScreen.on(this.selectLevelScreen.EVENT_LEVEL_SELECTED, function(level) {
            self.proceedToGameScreen(level);
        });

        loader.preload(['resources/images'], function() {
            self.proceedToLevelSelect(1);
        });
    };


    this.proceedToGameScreen = function(level)
    {
        this.selectLevelScreen.hide();
        this.gameScreen.loadLevel(level);
        this.gameScreen.show();
    }


    this.proceedToLevelSelect = function(nextLevel, text)
    {
        this.gameScreen.hide();
        this.selectLevelScreen.setup(nextLevel, text);
        this.selectLevelScreen.show();
    }


    this.setupScale = function()
    {
        this.baseWidth = Config.screenWidth;
        this.baseHeight = device.screen.height * (Config.screenWidth / device.screen.width);
        var scale = device.screen.width / this.baseWidth;
        this.view.style.scale = scale;
    }

});
