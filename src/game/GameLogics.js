import event.Emitter as Emitter;

exports = Class(Emitter, function (supr)
{

    this.DEFAULT_BALL_COUNT = 30;

    this.hexModel = null;
    this.ballLauncher = null;
    this.hexView = null;

    this.ballCount = 0;

    this.init = function(options)
    {
        supr(this, 'init', [options]);

        this.hexModel = options.model;
        this.ballLauncher = options.ballLauncher;
        this.hexView = options.hexView;

        var self = this;
        this.hexModel.on(this.hexModel.EVENT_BALL_LANDED, function() {
            self.handleBallLanded();
        });
        this.hexModel.on(this.hexModel.EVENT_LEVEL_LOADED, function() {
            self.handleLevelLoaded();
        });
        this.hexView.on(this.hexView.EVENT_LEVEL_START, function() {
            self.handleLevelStart();
        });
    }


    this.handleLevelLoaded = function()
    {
        var ballCount = this.hexModel.getBallCount();
        if (!ballCount) {
            this.ballCount = this.DEFAULT_BALL_COUNT;
        }

        // this.ballLauncher.startupWithBall(this.getNextBall());
        this.ballLauncher.startupWithBall(2);
    }


    this.handleLevelStart = function()
    {
        console.log('start');
        this.ballLauncher.chargeBall(this.getNextBall());
    }


    this.handleBallLanded = function()
    {
        this.ballLauncher.chargeBall(this.getNextBall());
    }


    this.getNextBall = function()
    {
        return Math.floor(Math.random() * 5 + 1);
    }


});
