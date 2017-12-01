// Room model

var Room = function (settings) {
    var room = this;

    if (typeof(settings) !== 'object') {
        settings = {};
    }

    room.start = function () {
        console.log(room.name + ': initialize room');
        room.turnHeatOff();
        room.subscribeToMotionSensor();
        room.subscribeToLuxSensor();
        room.subscribeToTemperatureSensor();
        room.subscribeToSwitcher();
        room.subscribeToDoorSwitcher();
        room.subscribeToStopAutomationSwitcher();
    };

    room.turnLampOn = function () {
        console.log(room.name + ': turn light on');
        room.lamp.on();
        room.pushLampOnLog(new Date())
    };


    room.turnLampOff = function () {
        console.log(room.name + ': turn light off');
        room.lamp.off();
        room.pushLampOffLog(new Date())
    };

    room.turnHeatOn = function () {
        console.log(room.name + ': turn heat on');
        if (room.heat) {
            room.heat.Set(1);
        }
        room.pushHeatOnLog(new Date())
    };


    room.turnHeatOff = function () {
        console.log(room.name + ': turn heat off');
        if (room.heat) {
            room.heat.Set(0);
        }
        room.pushHeatOffLog(new Date())
    };


    [
        'lampOnLog',
        'lampOffLog',
        'heatOnLog',
        'heatOffLog',
        'motionDetectLog',
        'motionNoDetectLog',
        'automationSwitchOnLog',
        'automationSwitchOffLog',
        'doorSwitcherOnLog',
        'doorSwitcherOffLog',
        'switcherOnLog',
        'switcherOffLog',
        'motionNearLog',
        'firstMotionNearLog'
    ].forEach(function (method) {
        methodName = 'push' + method.charAt(0).toUpperCase() + method.slice(1);
        room[methodName] = function (date) {
            room[method].unshift(date);
            if (room[method].length > 100) {
                room[method].length = 100;
            }
        }
    });


    room.subscribeToMotionSensor = function () {
        if (Object.prototype.toString.call(room.motionSensors) === '[object Array]') {
            console.log(room.name + ': subscribe to motion sensors');

            room.motionSensors.forEach(function (sensor) {
                sensor.bind(function () {
                    room.onMotionDetect(this)
                });
            });
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


    room.subscribeToDoorSwitcher = function () {
        if (room.doorSwitcher) {
            console.log(room.name + ': subscribe to door switch');
            room.doorSwitcher.bind(function () {
                room.onDoorSwitcherChange(this);
            });
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

    room.subscribeToTemperatureSensor = function () {
        if (Object.prototype.toString.call(room.temperatureSensors) === '[object Array]') {
            room.temperatureSensors.forEach(function (sensor, index) {
                console.log(room.name + ': subscribe to temperature sensor');
                sensor.bind(function () {
                    room.onTemperatureChange(index, this)
                });
            });
        }
    };


    room.onMotionDetect = function (level) {
        console.log(room.name + ': receive data from motion sensor');
        if (level.value) {
            console.log(room.name + ': motion detect');
            room.motionStack += 1;
            if (room.motionStack > room.motionSensors.length) {
                room.motionStack = 1;
            }
            room.callNeighbors();
            room.pushMotionDetectLog(new Date())
        } else {
            console.log(room.name + ': motion not detect');
            room.motionStack -= 1;
            if (room.motionStack < 0) {
                room.motionStack = 0;
            }

            room.pushMotionNoDetectLog(new Date())
        }
        room.clockCycle();
    };

    room.onLuxChange = function (level) {
        if (!room.isLampOn()) {
            room.currentLux = level.value;
            console.log(room.name + ': lux changed');
        }
        room.clockCycle();
    };

    room.onStopAutomationSwitcherChange = function (level) {
        console.log(room.name + ': stop automation switcher changed');
        if (level.value) {
            console.log(room.name + ': automation switch on');
            room.pushAutomationSwitchOnLog(new Date());
        } else {
            console.log(room.name + ': automation switch off');
            room.pushAutomationSwitchOffLog(new Date());
        }
        room.clockCycle();
    };


    room.onDoorSwitcherChange = function (level) {
        console.log(room.name + ': door changed');
        if (level.value) {
            console.log(room.name + ': door opened');
            room.callNeighbors();
            room.pushDoorSwitcherOnLog(new Date());
        } else {
            console.log(room.name + ': door closed');
            room.pushDoorSwitcherOffLog(new Date());
        }
        room.clockCycle();
    };

    room.onSwitcherChange = function (level) {
        console.log(room.name + ': switcher changed ' + level);
        if (level.value) {
            console.log(room.name + ': switcher on');
            room.pushSwitcherOnLog(new Date());
        } else {
            console.log(room.name + ': switcher off');
            room.pushSwitcherOffLog(new Date());
        }
        room.clockCycle();
    };


    room.onTemperatureChange = function (index, level) {
        console.log(room.name + ': temperature changed');
        room.currentTemperature[index] = level.value;
        if (room.name === 'big room') {
            http.request({
                url: 'http://localhost:4567/room.json',
                method: 'POST',
                data: JSON.stringify({current_temperature: room.averageTemperature()}),
                async: true
            });
        }
        room.clockCycle();
    };


    room.onMotionNear = function () {
        console.log(room.name + ': detect near motion');
        room.pushMotionNearLog(new Date());
        room.clockCycle();
    };

    room.onFirstMotionNear = function () {
        console.log(room.name + ': detect first near motion');
        room.pushFirstMotionNearLog(new Date());
        room.clockCycle();
    };

    room.forceEmpty = function () {
        room.forcedEmpty = true;
        room.turnHeatOff();
        room.turnLampOff();
        room.clockCycle();
    };

    room.disableForceEmpty = function () {
        room.forcedEmpty = false;
        room.clockCycle();
    };

    room.clockCycle = function () {
        console.log(room.name + ': debug automation ' + room.isAutomationOn() + ' dark ' + room.isDark() + ' lamp ' + room.isLampOn() + ' full ' + room.isFull() + ' backlight ' + room.isBackLight() + ' average temperature ' + room.averageTemperature() + ' cond status: ' + room.condStatus + ' heat: ' + room.isHeatOn() + ', forced empty: ' + room.forcedEmpty);

        if (room.isAutomationOn() && room.isDark() && room.isLampOff() && room.isFull()) {
            room.turnLampOn();
        }

        if (room.isAutomationOn() && room.isLampOn() && room.isEmpty() && !room.isBackLight()) {
            room.turnLampOff();
        }

        if (room.isAutomationOn() && room.isDark() && room.isLampOff() && room.isBackLight()) {
            room.turnLampOn();
        }

        //if (!room.isAutomationOn() && room.isLampOn()) {
        //    room.turnLampOff();
        //}

        if (room.isFull() && room.averageTemperature() && room.averageTemperature() < room.optimumTemperature() && !room.isHeatOn()) {
            room.turnHeatOn();
        }

        if (room.isEmpty() && room.isHeatOn()) {
            room.turnHeatOff();
        }

        if (room.isEmpty() && room.isCondOn()) {
            room.turnCondOff();
        }

        if (room.averageTemperature() && room.averageTemperature() > room.optimumTemperature() && room.isHeatOn()) {
            room.turnHeatOff();
        }

    };

    room.setCondStatus = function (status) {
        room.condStatus = status;
        room.condStatusTime = new Date();
    };

    room.getCondStatus = function (woTimeout) {
        if (!woTimeout && room.condStatusTime < (new Date() - 600000)) {
            return 'timeout';
        } else {
            return room.condStatus;
        }
    };

    room.isEmpty = function () {
        return !room.isFull();
    };

    room.isCondOn = function () {
        return !!room.condStatus;
    };

    room.turnCondOff = function () {
        room.condStatus = false;
        room.irBlasterSend('cond_off')
    };


    room.irBlasterSend = function (command) {
        if (room.irBlaster) {
            [1].forEach(function (time) {
                setTimeout(function () {
                    http.request({
                        url: room.irBlaster + 'raw_code=' + command + '&rand=' + new Date().getTime(),
                        method: 'GET',
                        async: true
                    });
                }, time);
            });
        }
    };

    room.isFull = function () {
        if (room.alwaysFull) {
            return true;
        }
        if (room.forcedEmpty) {
            return false;
        }
        if (!room.isAutomationOn()) {
            return true;
        }
        if (room.motionStack > 0) {
            return true;
        }
        if (room.motionDetectLog[0] > room.motionNoDetectLog[0]) {
            return true;
        }
        if (room.motionNearLog[0] > room.motionNoDetectLog[0] - 60 * 1000) {
            return room.motionNoDetectLog[0] > (new Date() - (room.emptyRoomTimeout * 1000));
        }
        return room.motionNoDetectLog[0] > (new Date() - (room.emptyRoomTimeout * 10 * 1000));

    };

    room.isBackLight = function () {
        if (room.forcedEmpty) {
            return false;
        }
        var nearMotion = room.firstMotionNearLog[0] > (new Date() - (20 * 1000));
        var doorSwitcher = room.doorSwitcherOnLog[0] > (new Date() - (20 * 1000));
        return nearMotion || doorSwitcher;
    };

    room.isDark = function () {
        return room.currentLux < room.minLux;
    };

    room.isAutomationOn = function () {
        if (!room.isAutomationSwitchOn()) {
            return false;
        }

        if (room.isAutomationSwitchOn() && room.automationSwitchOnLog[0] > (new Date() - 5 * 60 * 1000)) {
            return false;
        }

        return true;
    };

    room.isLampOn = function () {
        return room.lampOnLog[0] > room.lampOffLog[0];
    };


    room.isLampOff = function () {
        return !room.isLampOn();
    };

    room.isHeatOn = function () {
        return room.heatOnLog[0] > room.heatOffLog[0];
    };

    room.isAutomationSwitchOn = function () {
        return room.automationSwitchOnLog[0] > room.automationSwitchOffLog[0];
    };

    room.callNeighbors = function () {
        if (room.isEmpty()) {
            room.neighbors.forEach(function (neighbor) {
                neighbor.onFirstMotionNear();
            });
        }

        room.neighbors.forEach(function (neighbor) {
            neighbor.onMotionNear();
        });
    };

    room.optimumTemperature = function () {
        var time = new Date();
        var hours = time.getHours();
        var clodHours = [22,23,0,1,2,3,4,5,6,7,8];
        if (clodHours.indexOf(hours) !== -1) {
            return 19;
            //} else if (time.getHours() >= 11 && time.getHours() <= 12) {  // 11:00 - 12:59
            //    return 24;
        } else {
            return 22.8;
        }
    };

    room.averageTemperature = function () {
        var temps = 0;
        room.currentTemperature.forEach(function (temp) {
            temps += temp;
        });
        if (room.currentTemperature.length) {
            return temps / room.currentTemperature.length;
        }

        return false
    };



    room.name = settings.name;
    room.lamp = settings.lamp;
    room.heat = settings.heat;
    room.irBlaster = settings.irBlaster;
    room.motionSensors = settings.motionSensors;
    room.luxSensor = settings.luxSensor;
    room.temperatureSensors = settings.temperatureSensors;

    room.switcher = settings.switcher;
    room.doorSwitcher = settings.doorSwitcher;
    room.stopAutomationSwitcher = settings.stopAutomationSwitcher;
    room.minLux = settings.minLux;
    room.currentLux = 0;
    room.emptyRoomTimeout = settings.timeout;
    room.alwaysFull = settings.alwaysFull;


    //Defaults

    room.currentTemperature = [];
    room.setTemperature = 23;

    room.lampOnLog = [new Date(1)];
    room.lampOffLog = [new Date(2)];
    room.heatOnLog = [new Date(1)];
    room.heatOffLog = [new Date(2)];
    room.motionNoDetectLog = [new Date(2)];
    room.motionDetectLog = [new Date(1)];
    room.automationSwitchOffLog = [new Date(1)];
    room.automationSwitchOnLog = [new Date(2)];
    room.doorSwitcherOffLog = [new Date(1)];
    room.doorSwitcherOnLog = [new Date(2)];
    room.switcherOffLog = [new Date(2)];
    room.switcherOnLog = [new Date(1)];
    room.firstMotionNearLog = [new Date(1)];
    room.motionNearLog = [new Date(1)];
    room.motionStack = 0;


};

