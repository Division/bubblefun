import src.utils.Point as Point;

exports = {

    offsetToCube: function(x, y)
    {
        var cubeX = x - (y - (y & 1)) / 2,
            cubeY = y,
            cubeZ = -cubeX -cubeY;

        return {
            cubeX: cubeX,
            cubeY: cubeY,
            cubeZ: cubeZ
        }
    },

    cubeToOffset: function(cubeX, cubeY, cubeZ)
    {
        return new Point(
            cubeX + (cubeZ - (cubeZ & 1)) / 2,
            cubeZ
        );
    },

    axialToCube: function(q, r)
    {
        var cubeX = q,
            cubeZ = r,
            cubeY = -cubeX -cubeZ;

        return {
            cubeX: cubeX,
            cubeY: cubeY,
            cubeZ: cubeZ
        }
    },

    cubeRound: function(cubeX, cubeY, cubeZ)
    {
        var rx = Math.round(cubeX);
        var ry = Math.round(cubeY);
        var rz = Math.round(cubeZ);

        var x_diff = Math.abs(rx - cubeX);
        var y_diff = Math.abs(ry - cubeY);
        var z_diff = Math.abs(rz - cubeZ);

        if ((x_diff > y_diff) && (x_diff > z_diff)) {
            rx = -ry-rz
        }
        else if (y_diff > z_diff) {
            ry = -rx-rz
        }
        else {
            rz = -rx-ry
        }

        return {
            cubeX: rx,
            cubeY: ry,
            cubeZ: rz
        }
    },

    offsetToPixel: function(x, y, radius)
    {
        return new Point(
            radius * Math.sqrt(3) * (x + 0.5 * (y & 1)),
            radius * 3/2 * y
        );
    },

    pixelToOffset: function(x, y, radius)
    {
        var q = (x * Math.sqrt(3) / 3 - y / 3) / radius,
            r = y * 2 / 3 / radius;

        var cube = this.axialToCube(q,r);
        cube = this.cubeRound(cube.cubeX, cube.cubeY, cube.cubeZ);
        return this.cubeToOffset(cube.cubeX, cube.cubeY, cube.cubeZ);
    },

    getHexWidth: function(radius)
    {
        return radius * Math.sqrt(3);
    },

    getHexRadiusByWidth: function(width)
    {
        return width / Math.sqrt(3);
    },

    iterateNeighbours: function(x, y, callback)
    {
        var hOffset = y % 2 == 0 ? 0 : 1;
        if (callback(x - 1 + hOffset, y - 1)) { return };
        if (callback(x - 1, y)) { return };
        if (callback(x - 1 + hOffset, y + 1)) { return };
        if (callback(x + hOffset, y + 1)) { return };
        if (callback(x + 1, y)) { return };
        callback(x + hOffset, y - 1);
    }



}
