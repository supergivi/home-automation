// Room model

var Room = function (settings) {
    var room = this;

    if (typeof(settings) !== 'object') {
        settings = {};
    }


    room.start = function () {
        console.log(room.name + ': initialize room');
        room.setEmpty();
        room.subscribeToMotionSensor();
        room.subscribeToLuxSensor();
        room.subscribeToTemperatureSensor();
        room.subscribeToSwitcher();
    };

    room.illuminate = function () {
        console.log(room.name + ': turn light on');
        room.lamp.on();
        room.illuminationIsOn = true;
    };

    room.turnOffLamp = function () {
        console.log(room.name + ': turn light off');
        room.lamp.off();
        room.illuminationIsOn = false;
        room.temporaryIlluminationIsOn = false;
    };

    room.subscribeToMotionSensor = function () {
        console.log(room.name + ': subscribe to motion sensor');
        if (room.motionSensor) {
            room.motionSensor.bind(function () {
                room.onMotionDetect(this)
            });
        }
    };

    room.onMotionDetect = function (level) {
        console.log(room.name + ': receive data from motion sensor');
        if (level.value) {
            console.log(room.name + ': motion detect');
            if (room.isEmpty && room.neighbors) {
                room.neighbors.forEach(function (neighbor) {
                    neighbor.onMotionNear();
                });
            }
            room.isEmpty = false;
            room.lastMotionAt = new Date();
            room.firstMotionNearAt = null;
            if (!room.illuminationIsOn && room.isDark) {
                room.illuminate();

            }
        }

    };

    room.onLuxChange = function (level) {
        if (!room.illuminationIsOn && !room.temporaryIlluminationIsOn) {
            room.currentLux = level.value;
            room.isDark = (room.currentLux < room.minLux);
            console.log(room.name + ': lux changed');
        }
    };

    room.subscribeToLuxSensor = function () {
        if (room.luxSensor) {
            console.log(room.name + ': subscribe to lux sensor');
            room.luxSensor.bind(function () {
                room.onLuxChange(this);
            });
        }
    };

    room.onSwitcherChange = function (level) {
        //console.log(room.name + ': switcher changed ' + level);
        //if (room.autoSwitch) {
        //
        //} else {
        //    console.log(room.name + ': switcher pressed manually ' + level);
        //    room.switchPressedAt = new Date();
        //    room.switcher = level;
        //    if (room.switcher) {
        //        room.illuminate();
        //    } else {
        //        room.turnOffLamp();
        //    }
        //    //room.onChangesDetect();
        //}

    };

    room.subscribeToSwitcher = function () {
        if (room.switcher) {
            console.log(room.name + ': subscribe to switch');
            room.switcher.bind(function () {
                room.onSwitcherChange(this);
            });
        }
    };

    room.onTemperatureChange = function (level) {
        console.log(room.name + ': temperature changed');
        room.currentTemperature = level.value;
    };

    room.subscribeToTemperatureSensor = function () {
        if (room.temperatureSensor) {
            console.log(room.name + ': subscribe to temperature sensor');
            room.temperatureSensor.bind(function () {
                room.onTemperatureChange(this)
            });
        }
    };

    room.onMotionNear = function () {
        console.log(room.name + ': detect near motion');
        if (!room.firstMotionNearAt) {
            room.firstMotionNearAt = new Date();
        }
    };

    room.setEmpty = function () {
        room.isEmpty = true;
        room.firstMotionNearAt = null;
        room.lastMotionAt = null;
        room.turnOffLamp()
    };

    room.clockCycle = function () {
        if (
            !room.isEmpty &&
            room.firstMotionNearAt &&
            (room.firstMotionNearAt < (new Date() - (room.emptyRoomTimeout * 1000)))
        ) {
            room.setEmpty();
        }

        if (
            !room.isEmpty &&
            room.lastMotionAt &&
            (room.lastMotionAt < (new Date() - (room.emptyRoomTimeout * 1000 * 10)))
        ) {
            room.setEmpty();
        }

        if (room.isEmpty && room.illuminationIsOn) {
            room.setEmpty();
        }
    };


    room.name = settings.name;
    room.lamp = settings.lamp;
    room.motionSensor = settings.motionSensor;
    room.luxSensor = settings.luxSensor;
    room.temperatureSensor = settings.temperatureSensor;
    room.switcher = settings.switcher;
    room.minLux = settings.minLux;
    room.emptyRoomTimeout = settings.timeout;

    //Defaults

    room.illuminationIsOn = false;
    room.currentLux = 0;
    room.currentTemperature = 0;
    room.isEmpty = true;
    room.motionIsNear = false;
    room.isDark = true;
    room.lastMotionAt = null;
    room.switchPressedAt = new Date(1);
    room.firstMotionNearAt = null;
};

