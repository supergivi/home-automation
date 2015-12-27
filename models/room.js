// Room model

var Room = function (settings) {
    var room = this;

    if (typeof(settings) !== 'object') {
        settings = {};
    }


    room.start = function () {
        console.log(room.name + ': initialize room');
        room.turnOffLamp();
        room.subscribeToMotionSensor();
        room.subscribeToLuxSensor();
        room.subscribeToTemperatureSensor();
        room.subscribeToSwitcher();
    };

    room.illuminate = function () {
        console.log(room.name + ': turn light on');
        room.autoSwitch = true;
        console.log(room.name + ': set autoswitch ' + room.autoSwitch);
        room.lamp.on();
        setTimeout(function () {
            room.autoSwitch = false;
            console.log(room.name + ': timeout set autoswitch ' + room.autoSwitch);
        }, 10000);
        room.illuminationIsOn = true;
    };

    room.turnOffLamp = function () {
        console.log(room.name + ': turn light off');
        room.autoSwitch = true;
        console.log(room.name + ': set autoswitch ' + room.autoSwitch);
        room.lamp.off();
        setTimeout(function () {
            room.autoSwitch = false;
            console.log(room.name + ': timeout set autoswitch ' + room.autoSwitch);
        }, 10000);
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

        if (room.emptyRoomTimer) {
            clearTimeout(room.emptyRoomTimer);
        }
        if (level.value) {
            console.log(room.name + ': motion detect');
            room.isEmpty = false;
            room.lastMotionAt = new Date();
        } else {
            room.emptyRoomTimer = setTimeout(function () {
                console.log(room.name + ': motion not detect');
                room.isEmpty = true;
                room.onChangesDetect();
            }, room.emptyRoomTimeout * 1000)
        }
        room.onChangesDetect();
    };

    room.onLuxChange = function (level) {
        if (!room.illuminationIsOn && !room.temporaryIlluminationIsOn) {
            room.currentLux = level.value;
            room.isDark = (room.currentLux < room.minLux);
            console.log(room.name + ': lux changed');
        }
        room.onChangesDetect();
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
        console.log(room.name + ': switcher changed ' + level);
        console.log(room.name + ': autoswitch ' + room.autoSwitch);
        if (room.autoSwitch) {
            room.autoSwitch = false;
            console.log(room.name + ': set autoswitch ' + room.autoSwitch);
        } else {
            console.log(room.name + ': switcher pressed manually ' + level);

            room.onChangesDetect();
        }

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
        room.onChangesDetect();
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
        //console.log(room.name + ': detect near motion');
        //room.motionIsNear = true;
        //room.onChangesDetect();
        //room.motionIsNear = false;
    };

    room.onChangesDetect = function () {
        console.log(room.name + ': changes detected');
        if (!room.isEmpty && !room.illuminationIsOn && room.isDark) {

            room.illuminate();
            if (room.neighbors) {
                room.neighbors.forEach(function (neighbor) {
                    neighbor.onMotionNear();
                });
            }
        }
        if (room.isEmpty && room.illuminationIsOn) {
            room.turnOffLamp();
        }
        //if (room.motionIsNear) {
        //    if (!room.illuminationIsOn && room.isDark) {
        //        room.illuminate();
        //        setTimeout(function () {
        //            if (room.isEmpty) {
        //                room.turnOffLamp();
        //            }
        //        }, 20 * 1000);
        //    }
        //
        //}

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
    room.lastMotionAt = new Date(1);
};

