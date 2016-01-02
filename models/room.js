// Room model

var Room = function (settings) {
    var room = this;

    if (typeof(settings) !== 'object') {
        settings = {};
    }


    room.start = function () {
        console.log(room.name + ': initialize room');
        room.autoSwitch = true;
        clearTimeout(room.autoSwitchTimeout);
        room.autoSwitchTimeout = setTimeout(function () {
            room.autoSwitch = false;
        }, 10000);
        room.setEmpty();
        room.subscribeToMotionSensor();
        room.subscribeToLuxSensor();
        room.subscribeToTemperatureSensor();
        room.subscribeToSwitcher();
    };

    room.turnLampOn = function () {
        console.log(room.name + ': turn light on');
        room.autoSwitch = true;
        clearTimeout(room.autoSwitchTimeout);
        room.autoSwitchTimeout = setTimeout(function () {
            room.autoSwitch = false;
        }, 5000);
        room.lamp.on();
        room.illuminationIsOn = true;
    };

    room.turnLampOff = function () {
        console.log(room.name + ': turn light off');
        room.autoSwitch = true;
        clearTimeout(room.autoSwitchTimeout);
        room.autoSwitchTimeout = setTimeout(function () {
            room.autoSwitch = false;
        }, 5000);
        room.lamp.off();
        room.illuminationIsOn = false;
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
            if (!room.illuminationIsOn && room.isDark && !room.isStopAutomation) {
                room.turnLampOn();
            }
            if (room.isEmpty) {
                room.neighbors.forEach(function (neighbor) {
                    neighbor.onFirstMotionNear();
                });
            }

            room.neighbors.forEach(function (neighbor) {
                neighbor.onMotionNear();
            });
            room.isEmpty = false;
            room.lastMotionAt = (new Date() + (60 * 60 * 1000));
            room.firstMotionNearAt = null;

        } else {
            console.log(room.name + ': motion not detect');
            room.lastMotionAt = new Date();
        }
    };

    room.onLuxChange = function (level) {
        if (!room.illuminationIsOn && !room.isBacklight()) {
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
        console.log(room.name + ': switcher changed ' + level);
        if (room.autoSwitch) {

        } else if (room.manuallySwitch) {
            console.log(room.name + ': switcher pressed manually ' + level);
            room.switcher1CallbackDone = false;
            room.switcher2CallbackDone = false;

            if (!room.manuallySwitchTimer) {
                room.manuallySwitchTimer = setTimeout(function () {
                    zway.devices[10].instances[1].commandClasses[37].Get(function () {
                        console.log(room.name + ': switcher 1 callback ' + this.level + ' ' + this.value + ' ' + this);

                        room.switcher1 = zway.devices[10].instances[1].commandClasses[37].data.level.value;
                        room.switcher1CallbackDone = true;
                        room.afterSwitchersCallbacks();
                    });
                    zway.devices[10].instances[2].commandClasses[37].Get(function () {
                        console.log(room.name + ': switcher 2 callback ' );

                        room.switcher2 = zway.devices[10].instances[2].commandClasses[37].data.level.value;
                        room.switcher2CallbackDone = true;
                        room.afterSwitchersCallbacks();
                    });
                }, 3000);
            }
        }
    };

    room.afterSwitchersCallbacks = function(){
        if (!room.switcher1CallbackDone || !room.switcher2CallbackDone){
            return;
        }
        console.log(room.name + ': after switcher callbacks ' + room.switcher1 + ' ' + room.switcher2);

        if (room.switcher2 === room.switcher1) {
            room.isStopAutomation = true;
            if (room.switcher2) {
                room.turnLampOn();
            } else {
                room.turnLampOff();
            }
        } else {
            room.isStopAutomation = false;
        }
        console.log(room.name + ': stop automation ' + room.isStopAutomation);

        room.manuallySwitchTimer = null;
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

    room.onFirstMotionNear = function () {
        if (room.isEmpty && room.isDark && !room.isStopAutomation) {
            room.turnLampOn();
            room.backlightAt = new Date();
        }
    };

    room.setEmpty = function () {
        room.isEmpty = true;
        room.firstMotionNearAt = null;
        room.lastMotionAt = null;
        room.turnLampOff()
    };

    room.clockCycle = function () {
        if (!room.isStopAutomation) {
            if (
                !room.isEmpty && !room.isBacklight() &&
                room.firstMotionNearAt &&
                room.lastMotionAt && (room.lastMotionAt < new Date()) &&
                (room.firstMotionNearAt < (new Date() - (room.emptyRoomTimeout * 1000)))
            ) {
                room.setEmpty();
            }

            if (
                !room.isEmpty &&
                room.lastMotionAt && !room.isBacklight() &&
                (room.lastMotionAt < (new Date() - (room.emptyRoomTimeout * 1000 * 10)))
            ) {
                room.setEmpty();
            }

            if (
                room.isEmpty &&
                room.illuminationIsOn && !room.isBacklight()
            ) {
                room.setEmpty();
            }

            if (
                !room.isEmpty && !room.illuminationIsOn &&
                room.isDark
            ) {
                room.turnLampOn();
            }

            if (
                room.illuminationIsOn && !room.isDark
            ) {
                room.turnLampOff();
            }
        }
    };


    room.isBacklight = function () {
        return !!(room.backlightAt && room.backlightAt > (new Date() - 20000))
    };


    room.manuallySwitch = settings.manuallySwitch;
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
    room.firstMotionNearAt = null;
};

