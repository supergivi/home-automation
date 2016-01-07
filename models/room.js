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
        room.subscribeToDoorSwitcher();
        room.subscribeToStopAutomationSwitcher();

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
            if (!room.illuminationIsOn && room.isDark && !room.isStopAutomation()) {
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


    room.subscribeToStopAutomationSwitcher = function () {
        if (room.stopAutomationSwitcher) {
            console.log(room.name + ': subscribe to stop automation switch');
            room.stopAutomationSwitcher.bind(function () {
                room.onStopAutomationSwitcherChange(this);
            });
        }
    };


    room.onStopAutomationSwitcherChange = function (level) {
        console.log(room.name + ': stop automation switcher changed');
        if (level.value) {
            room.automationStartedAt = new Date();
            console.log(room.name + ': automation started');
        } else {
            if (room.isStopAutomation) {
                room.automationStartedAt = new Date(1);
            } else {
                room.automationStoppedAt = new Date();
            }
            console.log(room.name + ': automation ended');
        }
    };


    room.subscribeToDoorSwitcher = function () {
        if (room.doorSwitcher) {
            console.log(room.name + ': subscribe to door switch');
            room.doorSwitcher.bind(function () {
                room.onDoorSwitcherChange(this);
            });
        }
    };
    room.onDoorSwitcherChange = function (level) {
        console.log(room.name + ': door changed');
        if (level.value) {
            room.doorOpenedAt = new Date();
            room.onMotionDetect({value: 255});
            console.log(room.name + ': door opened');
        } else {
            room.doorClosedAt = new Date();
            console.log(room.name + ': door closed');
        }
    };

    room.onSwitcherChange = function (level) {
        console.log(room.name + ': switcher changed ' + level);
        if (room.autoSwitch) {

        } else {
            console.log(room.name + ': switcher pressed manually ' + level);
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
        if (room.isEmpty && room.isDark && !room.isStopAutomation()) {
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

    room.isStopAutomation = function () {
        return room.isAutomationSwitchOff() && room.automationStoppedAt < (new Date() - 2 * 60 * 1000) ||
            !room.isAutomationSwitchOff() && room.automationStartedAt > (new Date() - 2 * 60 * 1000)

    };

    room.isAutomationSwitchOff = function () {
        return room.automationStartedAt < room.automationStoppedAt;
    };

    room.clockCycle = function () {

        if (room.isStopAutomation()) {
            if (room.illuminationIsOn) {
                room.turnLampOff();
            }
        } else {
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
        return !!(room.backlightAt && room.backlightAt > (new Date() - 20 * 1000))
    };

    room.name = settings.name;
    room.lamp = settings.lamp;
    room.motionSensor = settings.motionSensor;
    room.luxSensor = settings.luxSensor;
    room.temperatureSensor = settings.temperatureSensor;
    room.switcher = settings.switcher;
    room.doorSwitcher = settings.doorSwitcher;
    room.stopAutomationSwitcher = settings.stopAutomationSwitcher;
    room.minLux = settings.minLux;
    room.emptyRoomTimeout = settings.timeout;

    //Defaults

    room.illuminationIsOn = false;
    room.currentLux = 0;
    room.currentTemperature = 0;
    room.isEmpty = true;
    room.isDark = true;
    room.lastMotionAt = null;
    room.firstMotionNearAt = null;
    room.automationStartedAt = new Date(2);
    room.automationStoppedAt = new Date(1);

};

