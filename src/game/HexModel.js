import event.Emitter as Emitter;
import src.game.BallInfo as BallInfo;
import src.utils.HexMath as HexMath;
import src.game.level.LevelBlocks as LevelBlocks;
import src.game.level.Levels as Levels;
import ui.ViewPool as ViewPool;
import src.Config as Config;

exports = Class(Emitter, function (supr)
{
    //---------------
    // Events

    this.EVENT_LEVEL_LOADED         = "level_loaded";
    this.EVENT_BALL_LANDED          = "ball_landed";
    this.EVENT_ITEMS_DESTROYED      = "items_destroyed";
    this.EVENT_ITEMS_FALL           = "items_fall";
    this.EVENT_LEVEL_COMPLETED      = "level_completed";
    this.EVENT_LINES_COUNT_CHANGED  = "line_number_changed";


    //---------------
    // Const

    this.CENTER_PINNED_ITEM_COUNT = 17;

    this.VICTORY_OPEN_ITEM_COUNT = 6;

    //---------------
    // Var

    /*
        Array of hex cells stored line by line
        Cell object is
        {
            type,
            ball
        }
    */
    this.items = null; // All grid data lives here

    /**
        Current number of lines in the models
        It is changing in the game process
    */
    this.numberOfLines = 0;

    /**
        Maximum number of items on the line
    */
    this.horizontalItemCount = 0;

    /**
        Level is pinned to the center of screen and able to rotate
    */
    this.levelIsCenterPinned = false;


    /**
        Array of ball types that can be spawned on the current level
    */
    this.availableBallTypes = [];

    this.levelIsCompleted = false;

    //------------------------------------------------------------------------
    // Init
    //------------------------------------------------------------------------

    this.init = function(options)
    {
        supr(this, 'init', arguments);
        this.horizontalItemCount = Config.defaultHorizontalHexCount;
    }

    //------------------------------------------------------------------------
    // Loading
    //------------------------------------------------------------------------

    this.loadLevelByNumber = function(levelNumber)
    {
        this.levelIsCompleted = false;

        var levelIndex = levelNumber - 1;
        if (levelIndex < 0 || levelNumber > Levels.length) {
            this.throwError('Invalid level number: ' + levelNumber);
        }

        var levelData = Levels[levelIndex];

        this.items = [];
        this.numberOfLines = this.fillLinesRecursively(levelData, 0);
        this.updateBallTypes();

        this.emit(this.EVENT_LEVEL_LOADED);
    }


    this.fillLinesRecursively = function(levelData, fillingLine)
    {
        var startLine = fillingLine;

        for (var i = 0; i < levelData.lines.length; i++) {
            var line = levelData.lines[i];
            if (typeof line === 'string') {
                var block = LevelBlocks[line];
                if (!block) {
                    this.throwError('Block with name "' + line + '" does not exist');
                }

                var numberOfLinesAdded = this.fillLinesRecursively(block, fillingLine);
                fillingLine += numberOfLinesAdded;
            }
            else if (line.constructor === Array) {
                if (line.length > this.horizontalItemCount) {
                    this.throwError('Invalid number of items in line ' + line);
                }

                // Filling items with

                var maxItemsOnLine = fillingLine % 2 == 0 ? this.horizontalItemCount : this.horizontalItemCount - 1;
                var availableItemsOnLine = Math.min(maxItemsOnLine, line.length);
                var watchdogCounter = 0;

                for (var j = 0; j < availableItemsOnLine; j++) {
                    this.addItemWithType(line[j]);
                    watchdogCounter++;
                }

                for (j = 0; j < this.horizontalItemCount - availableItemsOnLine; j++) {
                    this.addItemWithType(0);
                    watchdogCounter++;
                }

                if (watchdogCounter != this.horizontalItemCount) {
                    this.throwError('Invalid number of added items on line (' + fillingLine + '): ' + watchdogCounter + '. Expected: ' + this.horizontalItemCount);
                }

                fillingLine++;
            }
            else {
                this.throwError('Illegal line type (' + i + '): ' + line);
            }
        }

        return fillingLine - startLine;
    }


    this.addItemWithType = function(type)
    {
        this.items.push({
            type: type
        });
    }

    // Called from the HexView to setup balls to the cells
    this.setBallViewForOffset = function(ballView, x, y)
    {
        var item = this.getItemAtOffset(x, y);
        item.ball = ballView;
    }


    this.updateBallTypes = function()
    {
        this.availableBallTypes = [];
        var hash = {};
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];

            if (item.type != 0 && item.type != BallInfo.BallTypeBlack) {
                if (!hash[item.type]) {
                    hash[item.type] = true;
                    this.availableBallTypes.push(item.type);
                }
            }
        }
    }

    //------------------------------------------------------------------------
    // Getting data
    //------------------------------------------------------------------------

    this.getBallCount = function()
    {
        return 0;
    }


    this.getItemAtOffset = function(x, y)
    {
        return this.items[x + y * this.horizontalItemCount];
    }


    this.shouldSkipOffset = function(x, y)
    {
        return (y % 2 != 0) && (x == this.horizontalItemCount - 1);
    }


    this.offsetIsValidForItems = function(x, y)
    {
        return !this.shouldSkipOffset(x, y) &&
                x >= 0 &&
                x < this.horizontalItemCount &&
                y >= 0;
    }


    this.offsetContainsBall = function(x, y)
    {
        if (y < this.numberOfLines) {
            var item = this.getItemAtOffset(x, y);
            return item.type != 0;
        }
        else {
            return false;
        }
    }


    this.offsetIsAvailableForLanding = function(x, y)
    {
        if (!this.offsetIsValidForItems(x, y) || this.offsetContainsBall(x, y)) {
            return false;
        }

        if (!this.levelIsCenterPinned &&
           (y != 0 && !self.hexModel.offsetHasNeighbours(x, y))) {

            return false;
        }

        return true;
    }


    this.offsetHasNeighbours = function(x, y)
    {
        var result = false,
            self = this;

        HexMath.iterateNeighbours(x, y, function(x, y) {
            if (self.offsetIsValidForItems(x, y) && self.offsetContainsBall(x, y)) {
                result = true;
                return true;
            }
        });

        return result;
    }

    //------------------------------------------------------------------------
    // Modification
    //------------------------------------------------------------------------

    this.checkForVictory = function()
    {
        if (!this.levelIsCenterPinned) {
            var emptyCount = 0;
            for (var i = 0; i < this.horizontalItemCount; i++) {
                if (this.items[i].type == 0) {
                    emptyCount++;
                }
            }

            if (emptyCount >= this.VICTORY_OPEN_ITEM_COUNT) {
                return true;
            }
        }

        return false;
    }


    this.landBall = function(ball)
    {
        var startLineNumber = this.numberOfLines;

        if (!this.offsetIsAvailableForLanding(ball.offsetX, ball.offsetY)) {
            this.throwError('Invalid landing ball coords: ' + ball.offsetX +', ' + ball.offsetY);
        }

        if (this.numberOfLines - ball.offsetY == 0) {
            this.addLine();
        }
        else if (this.numberOfLines - ball.offsetY < 0) {
            this.throwError('Trying to land a ball on an empty line: ' + ball.offsetX  + ', ' + ball.offsetY);
        }

        var item = this.getItemAtOffset(ball.offsetX, ball.offsetY);
        item.type = ball.type;
        this.emit(this.EVENT_BALL_LANDED, {
            item: item,
            offsetX: ball.offsetX,
            offsetY: ball.offsetY
        });

        var hasSimilarBalls = this.searchAndDestroySimilarBalls(ball.offsetX, ball.offsetY);

        if (startLineNumber != this.numberOfLines) {
            this.emit(this.EVENT_LINES_COUNT_CHANGED);
        }

        if (hasSimilarBalls && this.checkForVictory()) {
            this.levelIsCompleted = true;
            this.emit(this.EVENT_LEVEL_COMPLETED);
        }
    }

    this.addLine = function()
    {
        this.numberOfLines += 1;
        this.items.length = this.numberOfLines * this.horizontalItemCount;
        for (var i = 0; i < this.horizontalItemCount; i++) {
            this.items[i + (this.numberOfLines - 1) * this.horizontalItemCount] = { type: 0 }
        }
    }


    this.updateLineNumber = function(startIndex)
    {
        if (!startIndex) {
            startIndex = 0;
        }

        for (var j = startIndex; j < this.numberOfLines; j++) {
            var lineContainsItem = false;

            for (var i = 0; i < this.horizontalItemCount; i++) {
                if (this.offsetContainsBall(i, j)) {
                    lineContainsItem = true;
                }
            }

            if (!lineContainsItem) {
                this.numberOfLines = j;
                this.items.length = this.numberOfLines * this.horizontalItemCount;
                return;
            }
        }
    }


    this.searchAndDestroySimilarBalls = function(x, y)
    {
        var sameColorBalls = [];

        this.iterateAdjacentItems(x, y, true, function(item, x, y) {
            sameColorBalls.push({item: item, ball: item.ball, offsetX: x, offsetY: y});
        });
        this.resetLoopMarks();

        if (sameColorBalls.length >= 3) {
            var minRow = this.numberOfLines - 1;
            this.emit(this.EVENT_ITEMS_DESTROYED, sameColorBalls, x, y);
            for (var i = 0; i < sameColorBalls.length; i++) {
                sameColorBalls[i].item.type = 0;
                sameColorBalls[i].item.ball = undefined;
                if (sameColorBalls[i].offsetY < minRow) {
                    minRow = sameColorBalls[i].offsetY;
                }
            }

            this.searchAndFallSeparatedBalls();

            this.updateLineNumber(minRow);

            return true;
        }

        return false;
    }


    this.searchAndFallSeparatedBalls = function()
    {
        // Searching for adjacent cells of all the first line cells
        for (var i = 0; i < this.horizontalItemCount; i++) {
            if (this.offsetContainsBall(i, 0)) {
                this.iterateAdjacentItems(i, 0, false, null); // we don't need a callback
            }
        }

        // Now all cells that are connected to the top have loopMark set to true
        // Each cell that doesn't have this flag must be dropped down
        var cellsToDrop = [],
            minRow = this.numberOfLines - 1;

        for (i = 0; i < this.items.length; i++) {
            // No loopMark flag - drop and remove
            // For cells with ball only
            if (this.items[i].type != 0 && !this.items[i].loopMark) {
                var column = i % this.horizontalItemCount,
                    row = Math.floor(i / this.horizontalItemCount);
                cellsToDrop.push({
                    item: this.items[i],
                    ball: this.items[i].ball,
                    offsetX: column,
                    offsetY: row
                });

                this.items[i].type = 0;
                this.items[i].ball = undefined;

                if (row < minRow) {
                    minRow = row;
                }
            }
            // Restore loopMark flag
            else {
                this.items[i].loopMark = false;
            }
        }

        this.emit(this.EVENT_ITEMS_FALL, cellsToDrop);
        this.updateLineNumber(minRow);

        // We don't have to to call resetLoopMarks because they are restored
        // manualy in the loop above
    }

    /**
        After each call of this method resetLoopMarks MUST be called
    */
    this.iterateAdjacentItems = function(x, y, theSameColor, callback)
    {
        var item = this.getItemAtOffset(x, y);

        if (!item.loopMark) {
            if (callback) {
                callback(item, x, y);
            }
            item.loopMark = true;

            var self = this;
            HexMath.iterateNeighbours(x, y, function(nx, ny) {
                if (self.offsetIsValidForItems(nx, ny) && self.offsetContainsBall(nx, ny)) {
                    var nItem = self.getItemAtOffset(nx, ny);
                    if (!nItem.loopMark && (!theSameColor || nItem.type == item.type)) {
                        self.iterateAdjacentItems(nx, ny, theSameColor, callback);
                    }
                }
            });
        }
    }

    this.resetLoopMarks = function()
    {
        // reset state
        for (var i = 0; i < this.items.length; i++) {
            this.items[i].loopMark = undefined;
        }
    }

    //------------------------------------------------------------------------
    // Utils
    //------------------------------------------------------------------------

    this.throwError = function(errorDescription)
    {
        throw new Error(errorDescription);
    }

});
