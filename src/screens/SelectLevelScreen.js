import ui.View;
import ui.TextView as TextView;
import src.utils.ButtonUtils as ButtonUtils;

exports = Class(ui.View, function (supr)
{
    this.EVENT_LEVEL_SELECTED = 'level_selected';
    this.TEXT_VIEW_WIDTH = 400;
    this.TEXT_VIEW_HEIGHT = 30;
    this.BUTTON_OFFSET = 10;
    this.LEVELS_ON_ROW = 3;

    this.textView = null;
    this.playButton = null;

    this.numberOfLevels = 0;
    this.nextLevel = 0;

    this.init = function(options)
    {
        supr(this, 'init', [options]);

        this.numberOfLevels = options.numberOfLevels;

        this.textView = new TextView({
            superview: this,
            x: options.width / 2 - this.TEXT_VIEW_WIDTH / 2,
            y: 85,
            color: 'white',
            horizontalAlign: 'center',
            verticalAlign: 'middle',
            width: this.TEXT_VIEW_WIDTH,
            height: this.TEXT_VIEW_HEIGHT,
            fontFamily: 'Arial',
            wrap: true,
            size: 30,
        });

        this.playButton = ButtonUtils.createButton(this, options.width / 2, 180, options.width - this.BUTTON_OFFSET * 2, 80, 'Play!');

        var self = this;
        this.playButton.on('up', function() {
            self.proceedNextLevel(self.nextLevel);
        });

        this.setupSelectionUI();
    },


    this.setupSelectionUI = function()
    {
        var rowCount = Math.ceil(this.numberOfLevels / this.LEVELS_ON_ROW),
            buttonSize = (this.style.width - this.BUTTON_OFFSET * 5) / this.LEVELS_ON_ROW,
            originY = this.style.height - rowCount * (this.BUTTON_OFFSET + buttonSize),
            self = this;

        for (var i = 0; i < this.numberOfLevels; i++) {
            var x = this.BUTTON_OFFSET + buttonSize / 2 + (i % this.LEVELS_ON_ROW) * (this.BUTTON_OFFSET + buttonSize),
                y = originY + Math.floor(i / this.LEVELS_ON_ROW) * (this.BUTTON_OFFSET + buttonSize);

            var button = ButtonUtils.createButton(this, x, y, buttonSize, buttonSize, i + 1);
            button.on('up', function(level) {
                return function() {
                    self.proceedNextLevel(level)
                }
            }(i + 1));
        }
    }


    this.setup = function(nextLevel, text)
    {
        this.nextLevel = nextLevel;
        if (text) {
            this.textView.setText(text);
        }
        else {
            this.textView.setText('Level ' + nextLevel);
        }
    }


    this.proceedNextLevel = function(level)
    {
        this.emit(this.EVENT_LEVEL_SELECTED, level);
    }

});
