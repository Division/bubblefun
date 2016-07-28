import src.game.BallInfo as BallInfo;

var r = BallInfo.BallTypeRed,
    g = BallInfo.BallTypeGreen,
    b = BallInfo.BallTypeBlue,
    p = BallInfo.BallTypePurple,
    y = BallInfo.BallTypeYellow,
    z = BallInfo.BallTypeBlack;

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

    'three_color_group_rpy': {
        lines: [
            [r , r , p , y , y , p , r , r , r , y , y],
             [ r , p , p , y , p , p , r , r , r , y ]
        ]
    },

    'three_color_group2': {
        lines: [
            [y , y , b , r , r , g , p , p , y , b , b],
             [ y , b , b , r , g , g , p , y , y , b ]
        ]
    },

    'halfring_rgb': {
        lines: [
            [r , r , r , g , g , b , r , r , g , g , g],
             [ r , r , g , g , b , b , r , r , g , g ]
        ]
    },

    'vertial_stripes': {
        lines: [
            [0 , g , g , 0 , 0 , r , 0 , 0 , g , g , 0],
              [g , z , r , 0 , y , y , 0 , b , z , y],
            [0 , r , r , 0 , y , z , g , 0 , y , y , 0],
              [0 , y , 0 , 0 , g , g , 0 , 0 , g , 0],
            [0 , g , g , 0 , 0 , b , 0 , 0 , r , r , 0],
              [b , z , g , 0 , r , y , 0 , r , z , g],
            [0 , b , b , 0 , 0 , r , 0 , 0 , g , g , 0],
              [0 , y , 0 , 0 , g , g , 0 , 0 , g , 0],
        ]
    },

    'hex_cells': {
        lines: [
            [0 , z , p , p , b , z , b , g , g , z , 0],
              [r , r , 0 , 0 , g , g , 0 , 0 , p , p],
            [r , z , b , 0 , g , z , p , 0 , b , z , p],
              [b , b , r , r , p , p , g , g , b , b],
            [0 , 0 , r , z , r , 0 , g , z , g , 0 , 0],
              [g , g , r , r , b , b , g , g , p , p],
            [g , z , g , 0 , b , z , b , 0 , p , z , p],
              [g , g , 0 , 0 , b , b , 0 , 0 , p , p],
        ]
    }

}
