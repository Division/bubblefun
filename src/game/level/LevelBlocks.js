import src.game.BallInfo as BallInfo;

var r = BallInfo.BallTypeRed,
    g = BallInfo.BallTypeGreen,
    b = BallInfo.BallTypeBlue,
    p = BallInfo.BallTypePurple,
    y = BallInfo.BallTypeYellow

exports =
{
    'lines_ry': {
        lines: [
            [0 , r , r , r , r , r , r , r , r , r , 0],
             [ 0 , y , y , y , y , y , y , y , y , 0, 0 ]
        ]
    },

    'lines_pb': {
        lines: [
            [p , p , p , p , p , p , p , p , p , p , p],
             [ b , b , b , b , b , b , b , b , b , b ]
        ]
    },

    'three_color_group1': {
        lines: [
            [r , r , g , y , y , p , b , b , r , g , g],
             [ r , g , g , y , p , p , b , r , r , g ]
        ]
    },

    'three_color_group2': {
        lines: [
            [y , y , b , r , r , g , p , p , y , b , b],
             [ y , b , b , r , g , g , p , y , y , b ]
        ]
    },

    'halfring_rg': {
        lines: [
            [r , r , r , y , y , p , r , r , g , g , g],
             [ r , r , y , y , b , b , r , r , g , g ]
        ]
    },

}
