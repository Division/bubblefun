import ui.View;
import src.Config as Config;
import src.game.GameLogics as GameLogics;
import src.game.BallView as BallView;
import src.game.HexView as HexView;
import src.game.BallLauncher as BallLauncher;
import src.utils.Point as Point;
import src.game.BallDynamics as BallDynamics;
import src.game.BallInfo as BallInfo;
import ui.ViewPool as ViewPool;
import src.game.HexModel as HexModel;

exports = Class(ui.View, function (supr)
{
    //---------------
    // Var

    this.BALL_LAUNCHER_WIDTH = 110;

    this.hexModel = null;
    this.hexView = null;
    this.ballLauncher = null;
    this.ballDynamics = null;
    this.ballPool = null;
    this.gameLogics = null;

    //------------------------------------------------------------------------
    // init
    //------------------------------------------------------------------------

    this.init = function(options)
    {
        supr(this, 'init', [options]);

        this.blockEvents = true; // Child views don't need event handling

        this.hexModel = new HexModel();

        this.hexView = new HexView({
            superview: this,
            model: this.hexModel,
            width: Config.screenWidth,
            height: Config.screenHeight,
            zIndex: 2
        });

        this.ballLauncher = new BallLauncher({
            superview: this,
            ballRadius: Config.ballRadius,
            width: this.BALL_LAUNCHER_WIDTH,
            height: 100,
            x: Config.screenWidth / 2 - this.BALL_LAUNCHER_WIDTH / 2,
            y: Config.screenHeight - 230
        });


        this.gameLogics = new GameLogics({
            model: this.hexModel,
            ballLauncher: this.ballLauncher,
            hexView: this.hexView
        });


        this.ballPool = new ViewPool({
            ctor: BallView,
            initCount: 100,
            initOpts: {
                parent: this,
                width: Config.ballRadius * 2,
                height: Config.ballRadius * 2,
                zIndex: 3
            }
        });

        this.ballDynamics = new BallDynamics({
            ballContainer: this,
            ballPool: this.ballPool,
            hexView: this.hexView,
            model: this.hexModel,
            ballRadius: Config.ballRadius
        });

        var self = this;
        this.ballLauncher.on('fire', function(data) {
            self.ballDynamics.fireBall(data.position, data.direction, data.type);
        });

        this.loadLevel(1);
    };


    //------------------------------------------------------------------------
    // Input
    //------------------------------------------------------------------------

    this.handleTapStart = function(point)
    {
        var ballLauncherPoint = point;
        this.ballLauncher.style.localizePoint(ballLauncherPoint);
        this.ballLauncher.setTargetPoint(ballLauncherPoint);
    };


    this.handleTapMove = function(point)
    {
        var ballLauncherPoint = point;
        this.ballLauncher.style.localizePoint(ballLauncherPoint);
        this.ballLauncher.setTargetPoint(ballLauncherPoint);
    };


    this.handleTapEnd = function(point)
    {
        var ballLauncherPoint = point;
        this.ballLauncher.style.localizePoint(ballLauncherPoint);
        this.ballLauncher.fire(ballLauncherPoint);
    };

    //------------------------------------------------------------------------
    // Level loading
    //------------------------------------------------------------------------

    this.loadLevel = function(levelNumber)
    {
        this.hexModel.loadLevelByNumber(levelNumber);
    }

    //------------------------------------------------------------------------
    // Update
    //------------------------------------------------------------------------

    this.tick = function(dtMS)
    {
        var dt = dtMS / 1000;
        this.ballDynamics.update(dt);
    }

});
