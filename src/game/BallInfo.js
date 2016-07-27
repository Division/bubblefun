exports =
{
    BallTypeRed: 1,
    BallTypeBlue: 2,
    BallTypeGreen: 3,
    BallTypePurple: 4,
    BallTypeYellow: 5,
    BallTypeBlack: 6,

    getBallImagePath: function(ballType)
    {
        switch (ballType) {
            case this.BallTypeRed:
                return "resources/images/Red_Ball.png";
            case this.BallTypeBlue:
                return "resources/images/Blue_Ball.png";
            case this.BallTypeGreen:
                return "resources/images/Green_Ball.png";
            case this.BallTypePurple:
                return "resources/images/Purple_Ball.png";
            case this.BallTypeYellow:
                return "resources/images/Yellow_Ball.png";
            case this.BallTypeBlack:
                return "resources/images/Black_Ball.png";

        }

        return undefined;
    }
}
