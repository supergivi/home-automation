var Lamp = function (lamps) {
    var lamp = this;

    lamp.status = 'off';
    lamp.off();

    lamp.lamps = lamps;

    lamp.on = function () {
        lamp.lamps.forEach(function (l) {
            l.Set(1);
        });
        lamp.status = 'on';

    };

    lamp.off = function () {
        lamp.lamps.forEach(function (l) {
            l.Set(0);
        });
        lamp.status = 'off';

    };


};