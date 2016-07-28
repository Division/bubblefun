import src.game.BallInfo as BallInfo;

var r = BallInfo.BallTypeRed,
    g = BallInfo.BallTypeGreen,
    b = BallInfo.BallTypeBlue,
    p = BallInfo.BallTypePurple,
    y = BallInfo.BallTypeYellow,
    z = BallInfo.BallTypeBlack;

exports =
[

    {
        lines: [
           //
           [r , r , y , y , r , r , b , b , g , g , g],
             [b , 0 , 0 , 0 , 0 , 0 , 0 , b , 0 , 0],
           [0 , b , 0 , 0 , 0 , 0 , 0 , z , z , 0 , 0],
             [r , g , g , g , 0 , 0 , 0 , z , 0 , 0],
           [0 , r , 0 , 0 , y , y , r , 0 , 0 , 0 , 0],
             [z , z , 0 , 0 , b , 0 , r , r , g , g],
           [0 , z , 0 , 0 , b , g , 0 , 0 , 0 , g , 0],
             [0 , 0 , 0 , 0 , g , 0 , 0 , 0 , z , z],
           [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , z , 0],
             [0 , 0 , 0 , 0 , 0 , 0 , 0 , b , b , b],
           [0 , 0 , 0 , 0 , 0 , y , y , y , 0 , 0 , 0],
             [0 , 0 , g , g , b , 0 , 0 , r , 0 , 0],
           [r , r , g , 0 , b , 0 , 0 , g , r , 0 , 0],
             [r , 0 , 0 , z , z , 0 , 0 , g , 0 , 0],
           [z , z , 0 , 0 , z , 0 , 0 , 0 , 0 , 0 , 0],
             [z , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0],
           [b , b , b , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0],
             [0 , 0 , g , g , g , 0 , 0 , 0 , 0 , 0],
           [0 , 0 , g , 0 , 0 , r , r , r , 0 , 0 , 0],
             [0 , z , z , 0 , 0 , b , g , y , y , y],
           [0 , 0 , z , 0 , 0 , b , g , 0 , 0 , y , 0],
             [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , z , z],
           [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , z , 0],
             [0 , 0 , 0 , 0 , 0 , 0 , 0 , r , r , r],
           [0 , 0 , 0 , 0 , 0 , b , b , b , 0 , 0 , 0],
             [0 , 0 , y , y , y , 0 , 0 , y , 0 , 0],
           [r , r , g , 0 , 0 , y , 0 , g , y , 0 , 0],
             [0 , g , 0 , 0 , z , z , 0 , g , 0 , 0],
           [0 , b , b , 0 , 0 , z , 0 , 0 , 0 , 0 , 0],
             [0 , b , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0],
           [0 , y , y , y , 0 , 0 , 0 , 0 , 0 , 0 , 0],
             [0 , y , 0 , r , r , r , 0 , 0 , 0 , 0],
           [0 , 0 , y , 0 , 0 , b , b , b , 0 , 0 , 0],
             [0 , z , z , 0 , 0 , b , 0 , g , g , g],
           [0 , 0 , z , 0 , y , y , 0 , 0 , 0 , g , 0],
             [0 , 0 , 0 , y , 0 , 0 , 0 , 0 , z , z],
           [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , z , 0],
        ]
    },

    //
    {
        lines: [
           /**/
           [b , g , g , b , r , r , y , y , g , g , b],
             [b , y , r , 0 , y , r , 0 , b , z , y],
           'vertial_stripes',
           'vertial_stripes',
           'vertial_stripes',
           [0 , 0 , 0 , 0 , 0 , r , 0 , 0 , 0 , 0 , 0],
             [0 , 0 , 0 , 0 , g , g , 0 , 0 , 0 , 0],
           [0 , 0 , 0 , 0 , 0 , y , 0 , 0 , 0 , 0 , 0],
        ]
    },

    //
    {
        lines: [
            //
        //    [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0],
        //      [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0],
        //    [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0],
        //      [0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0],

           [p , g , g , r , r , p , g , g , b , b , g],
             [r , b , b , p , b , b , g , p , p , r],
           [0 , b , z , p , g , z , r , b , z , p , 0],
             [0 , p , p , 0 , g , r , 0 , b , b , 0 , 0],
           'hex_cells',
           'hex_cells',
        ]
    },

    //
    {
        lines: [
           'halfring_rgb',
           [p , p , p , g , g , g , 0 , 0 , 0 , 0 , 0],
             [p , p , z , z , g , b , 0 , 0 , 0 , 0],
           [g , p , z , z , z , b , b , 0 , 0 , 0 , 0],
             [g , g , z , z , p , b , b , 0 , 0 , 0],
           [0 , g , g , r , p , p , p , g , 0 , 0 , 0],
             [0 , g , r , r , p , p , g , g , 0 , 0],
           [0 , 0 , r , r , r , g , g , g , r , 0 , 0],
             [0 , 0 , b , b , z , z , z , r , r , 0],
           [0 , 0 , 0 , b , b , r , r , r , r , b , 0],
             [0 , 0 , 0 , b , g , g , p , p , p , b],
           [0 , 0 , 0 , 0 , g , g , g , p , p , g , g],
             [0 , 0 , 0 , 0 , r , r , r , z , z , g],
           [0 , 0 , 0 , 0 , 0 , r , r , z , z , z , g],
             [0 , 0 , 0 , 0 , 0 , b , g , z , z , p],
           [0 , 0 , 0 , 0 , 0 , 0 , g , g , g , p , p],
             [0 , 0 , 0 , 0 , 0 , g , g , g , r , p],
           [0 , 0 , 0 , 0 , 0 , r , b , b , r , r , b],
             [0 , 0 , 0 , 0 , r , r , b , r , r , b],
           [0 , 0 , 0 , 0 , b , b , g , g , g , p , p],
             [0 , 0 , 0 , r , b , g , g , g , r , p],
           [0 , 0 , 0 , r , r , b , b , b , r , r , 0],
             [0 , 0 , r , r , p , p , p , r , r , 0],
           [0 , 0 , g , r , p , p , p , b , b , 0 , 0],
             [0 , g , g , z , z , p , b , b , 0 , 0],
           [0 , p , g , z , z , z , g , b , 0 , 0 , 0],
             [p , p , r , z , z , g , g , 0 , 0 , 0],
           [p , p , r , r , r , g , g , 0 , 0 , 0 , 0],
        ]
    },

    {
        lines: [
            //
           'three_color_group_rpy',
           [y , p , p , r , z , z , z , y , p , p , r],
             [y , z , y , r , z , z , y , r , z , r],
           [0 , r , p , g , z , z , z , g , y , y , 0],
             [0 , p , z , g , y , p , r , z , p , 0],
           [0 , y , y , r , 0 , 0 , 0 , r , g , g , 0],
             [r , z , g , p , z , z , y , p , z , y],
           [0 , r , g , y , z , z , z , g , p , y , 0],
             [0 , y , y , p , r , y , g , g , g , 0],
           [0 , p , p , g , 0 , 0 , 0 , r , y , y , 0],
             [0 , r , y , g , z , z , r , g , p , 0],
           [0 , 0 , r , y , z , z , z , g , p , 0 , 0],
        ]
    },

    {
        lines: [
            //
           [b , y , p , b , b , b , y , y , b , r , y],
             [r , p , z , z , r , r , z , z , b , y],
           [p , r , z , z , z , b , z , z , z , r , b],
             [r , b , z , z , p , r , z , z , y , p],
           [y , y , r , r , r , b , p , p , p , b , b],
             [b , y , p , y , y , b , b , p , p , y],
           [b , r , r , y , y , p , b , b , p , b , y],
             [r , r , b , y , z , z , b , r , p , p],
           [p , b , b , r , z , z , z , p , r , r , b],
             [b , p , b , r , z , z , p , b , b , r],
           [y , b , b , b , y , y , y , r , r , r , p],
             [y , z , z , b , y , y , r , z , z , p],
           [y , r , z , p , b , r , r , y , z , b , p],
             [r , r , p , y , b , r , p , y , b , p],
           [b , p , r , r , y , y , p , b , b , r , r],
             [y , y , b , r , p , b , b , r , p , p],
           [p , p , r , r , p , p , b , b , b , y , y],
             [r , p , p , b , r , p , r , y , y , b],
           [r , z , z , p , b , 0 , r , y , z , z , b],
             [y , z , p , b , z , z , r , y , z , p],
           [p , y , p , b , z , z , z , r , p , p , 0],
             [p , p , b , y , z , z , p , r , y , y],
           [p , z , p , b , y , p , p , r , y , z , y],
             [p , p , b , r , y , p , r , r , y , y],
        ]
    },


]
