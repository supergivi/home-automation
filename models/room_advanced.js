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
    ].forEach(function(method){
        methodName = 'push' + method.charAt(0).toUpperCase() + method.slice(1);
        room[methodName] = function(date){
            room[method].unshift(date);
            if (room[method].length > 100){
                room[method].length = 100;
            }
        }
    });

    //room.pushLampOnLog = function (date) {
    //    room.lampOnLog.unshift(date);
    //    if (room.lampOnLog.length > 100) {
    //        room.lampOnLog.length = 100;
    //    }
    //};
    //
    //room.pushLampOffLog = function (date) {
    //    room.lampOffLog.unshift(date);
    //    if (room.lampOffLog.length > 100) {
    //        room.lampOffLog.length = 100;
    //    }
    //};
    //
    //room.pushHeatOnLog = function (date) {
    //    room.heatOnLog.unshift(date);
    //    if (room.heatOnLog.length > 100) {
    //        room.heatOnLog.length = 100;
    //    }
    //};
    //
    //room.pushHeatOffLog = function (date) {
    //    room.heatOffLog.unshift(date);
    //    if (room.heatOffLog.length > 100) {
    //        room.heatOffLog.length = 100;
    //    }
    //};
    //
    //room.pushMotionDetectLog = function (date) {
    //    room.motionDetectLog.unshift(date);
    //    if (room.motionDetectLog.length > 100) {
    //        room.motionDetectLog.length = 100;
    //    }
    //};
    //
    //room.pushMotionNoDetectLog = function (date) {
    //    room.motionNoDetectLog.unshift(date);
    //    if (room.motionNoDetectLog.length > 100) {
    //        room.motionNoDetectLog.length = 100;
    //    }
    //};
    //
    //room.pushAutomationSwitchOnLog = function (date) {
    //    room.automationSwitchOnLog.unshift(date);
    //    if (room.automationSwitchOnLog.length > 100) {
    //        room.automationSwitchOnLog.length = 100;
    //    }
    //};
    //
    //room.pushAutomationSwitchOffLog = function (date) {
    //    room.automationSwitchOffLog.unshift(date);
    //    if (room.automationSwitchOffLog.length > 100) {
    //        room.automationSwitchOffLog.length = 100;
    //    }
    //};
    //
    //
    //room.pushDoorSwitcherOnLog = function (date) {
    //    room.doorSwitcherOnLog.unshift(date);
    //    if (room.doorSwitcherOnLog.length > 100) {
    //        room.doorSwitcherOnLog.length = 100;
    //    }
    //};
    //
    //room.pushDoorSwitcherOffLog = function (date) {
    //    room.doorSwitcherOffLog.unshift(date);
    //    if (room.doorSwitcherOffLog.length > 100) {
    //        room.doorSwitcherOffLog.length = 100;
    //    }
    //};
    //
    //room.pushSwitcherOnLog = function (date) {
    //    room.switcherOnLog.unshift(date);
    //    if (room.switcherOnLog.length > 100) {
    //        room.switcherOnLog.length = 100;
    //    }
    //};
    //
    //room.pushSwitcherOffLog = function (date) {
    //    room.switcherOffLog.unshift(date);
    //    if (room.switcherOffLog.length > 100) {
    //        room.switcherOffLog.length = 100;
    //    }
    //};
    //
    //room.pushMotionNearLog = function (date) {
    //    room.motionNearLog.unshift(date);
    //    if (room.motionNearLog.length > 100) {
    //        room.motionNearLog.length = 100;
    //    }
    //};
    //
    //room.pushFirstMotionNearLog = function (date) {
    //    room.firstMotionNearLog.unshift(date);
    //    if (room.firstMotionNearLog.length > 100) {
    //        room.firstMotionNearLog.length = 100;
    //    }
    //};


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

    room.clockCycle = function () {
        console.log(room.name + ': debug automation ' + room.isAutomationOn() + ' dark ' + room.isDark() + ' lamp ' + room.isLampOn() + ' full ' + room.isFull() + ' backlight ' + room.isBackLight() + ' average temperature ' + room.averageTemperature() + ' cond status: ' + room.condStatus);

        if (room.isAutomationOn() && room.isDark() && room.isLampOff() && room.isFull()) {
            room.turnLampOn();
        }

        if (room.isAutomationOn() && room.isLampOn() && room.isEmpty() && !room.isBackLight()) {
            room.turnLampOff();
        }

        if (room.isAutomationOn() && room.isDark() && room.isLampOff() && room.isBackLight()) {
            room.turnLampOn();
        }

        if (!room.isAutomationOn() && room.isLampOn()) {
            room.turnLampOff();
        }

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


        //if (room.isFull() && room.optimumTemperature() === 23 && room.averageTemperature()) {
        //    if (room.averageTemperature() < 22.3 && room.getCondStatus() !== 'heat') {
        //        room.setCondStatus('heat');
        //        room.irBlasterSend('cond_30_heat_max_one_way');
        //    } else if (room.averageTemperature() > 23.2 && room.getCondStatus() !== 'cool') {
        //        room.setCondStatus('cool');
        //        room.irBlasterSend('cond_16_cool_max_one_way');
        //    } else if (room.averageTemperature() > 22.5 && room.getCondStatus(true) === 'heat') {
        //        room.setCondStatus(false);
        //        room.irBlasterSend('cond_off');
        //    } else if (room.averageTemperature() < 23.0 && room.getCondStatus(true) === 'cool') {
        //        room.setCondStatus(false);
        //        room.irBlasterSend('cond_off');
        //    }
        //
        //
        //}


        if (room.isFull() && room.averageTemperature()) {
            if (room.averageTemperature() < (room.setTemperature - 0.4) && room.getCondStatus() !== 'heat') {
                room.setCondStatus('heat');
                room.irBlasterSend('cond_30_heat_max_one_way');
            } else if (room.averageTemperature() > (room.setTemperature + 0.4) && room.getCondStatus() !== 'cool') {
                room.setCondStatus('cool');
                room.irBlasterSend('cond_16_cool_max_one_way');
            } else if (room.averageTemperature() > (room.setTemperature - 0.2) && room.getCondStatus(true) === 'heat') {
                room.setCondStatus(false);
                room.irBlasterSend('cond_off');
            } else if (room.averageTemperature() < (room.setTemperature + 0.2) && room.getCondStatus(true) === 'cool') {
                room.setCondStatus(false);
                room.irBlasterSend('cond_off');
            }


        }


        //if (room.isFull() && room.optimumTemperature() === 20 && room.averageTemperature()) {
        //    if (room.averageTemperature() < 19.3 && room.getCondStatus() !== 'heat') {
        //        room.setCondStatus('heat');
        //        room.irBlasterSend('cond_30_heat_max_all');
        //    } else if (room.averageTemperature() > 20.2 && room.getCondStatus() !== 'cool') {
        //        room.setCondStatus('cool');
        //        room.irBlasterSend('cond_16_cool_max_all');
        //    } else if (room.averageTemperature() > 19.5 && room.getCondStatus(true) === 'heat') {
        //        room.setCondStatus(false);
        //        room.irBlasterSend('cond_off');
        //    } else if (room.averageTemperature() < 20 && room.getCondStatus(true) === 'cool') {
        //        room.setCondStatus(false);
        //        room.irBlasterSend('cond_off');
        //    }
        //
        //
        //}


        if (room.isAutomationOn() && room.isEmpty() && room.getCondStatus(true)) {
            room.setCondStatus(false);
            room.irBlasterSend('cond_off');
        }

        if (room.isFull() && !room.tvStatus) {
            room.tvStatus = true;
        }

        if (room.isEmpty() && room.tvStatus) {
            room.tvStatus = false;
            room.irBlasterSend('lg_tv_power_off');
        }
        room.getOptimumTemperature();

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
        if (room.isAutomationOn()) {
            return 23;
        } else {
            if (time.getHours() >= 0 && time.getHours() <= 10) {
                return 20;
                //} else if (time.getHours() >= 11 && time.getHours() <= 12) {  // 11:00 - 12:59
                //    return 24;
            } else {
                return 23;
            }
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

    room.getOptimumTemperature = function(){
        http.request({
            url: 'http://localhost:4567/room.json',
            method: 'GET',
            async: true,
            success: function(resp){
                room.setTemperature = resp.data.set_temperature;
            }
        });
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

