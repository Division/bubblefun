import ui.widget.ButtonView as ButtonView;

exports = {
    createButton: function(parent, centerX, centerY, width, height, title)
    {
        return new ButtonView({
            superview: parent,
            x: centerX - width / 2,
            y: centerY - height / 2,
            width: width,
            height: height,
            scaleMethod: "9slice",
            toggleSelected: false,
            images: {
                up: 'resources/images/Button_default.png',
                selected: 'resources/images/Button_default.png',
                unselected: 'resources/images/Button_default.png',
                down: 'resources/images/Button_down.png'
            },
            sourceSlices: {
                horizontal: {left: 10, center: 10, right: 10},
                vertical: {top: 10, middle: 10, bottom: 10}
            },
            title: title,
            text: {
                color: 'white',
                autoFontSize: false,
                autoSize: false,
                size: 40,
                fontFamily: 'Arial'
            }
        });
    }
}
