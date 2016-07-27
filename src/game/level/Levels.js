import src.game.BallInfo as BallInfo;

var r = BallInfo.BallTypeRed,
    g = BallInfo.BallTypeGreen,
    b = BallInfo.BallTypeBlue,
    p = BallInfo.BallTypePurple,
    y = BallInfo.BallTypeYellow,
    z = BallInfo.BallTypeBlack;

exports =
[
    // 1
    {
        lines: [
            // 'three_color_group1',
            // 'lines_ry',
            // 'three_color_group1',
            // 'lines_ry',
            // 'three_color_group1',
            // 'lines_ry',
            // 'three_color_group1',
            // 'lines_ry',
            // 'three_color_group1',
            'lines_ry',
            'lines_pb',
            [0 , g , b , r , g , b , r , g , b , r , 0],
             [ r , p , p ],
            [ b , 0 ],
              [ p , 0 ],
        ]
    },

    // 2
    {
        lines: [
           /**/
           [p , g , g , p , r , r , y , y , g , g , p],
             [p , y , r , 0 , y , r , 0 , b , z , y],
           'vertial_stripes',
           'vertial_stripes',
           'vertial_stripes',
           [0 , 0 , 0 , 0 , 0 , r , 0 , 0 , 0 , 0 , 0],
             [0 , 0 , 0 , 0 , p , p , 0 , 0 , 0 , 0],
           [0 , 0 , 0 , 0 , 0 , y , 0 , 0 , 0 , 0 , 0],

/*
           [0 , r , r , 0 , y , z , g , 0 , y , y , 0],
             [0 , 0 , 0 , 0 , g , g , 0 , 0 , 0 , 0],
           [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0],
             [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0],
           [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0],
             [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0], */

        ]
    }
]
