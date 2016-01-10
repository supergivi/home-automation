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

    room.pushLampOnLog = function (date) {
        room.lampOnLog.unshift(date);
        if (room.lampOnLog.length > 100) {
            room.lampOnLog.length = 100;
        }
    };

    room.pushLampOffLog = function (date) {
        room.lampOffLog.unshift(date);
        if (room.lampOffLog.length > 100) {
            room.lampOffLog.length = 100;
        }
    };

    room.pushHeatOnLog = function (date) {
        room.heatOnLog.unshift(date);
        if (room.heatOnLog.length > 100) {
            room.heatOnLog.length = 100;
        }
    };

    room.pushHeatOffLog = function (date) {
        room.heatOffLog.unshift(date);
        if (room.heatOffLog.length > 100) {
            room.heatOffLog.length = 100;
        }
    };

    room.pushMotionDetectLog = function (date) {
        room.motionDetectLog.unshift(date);
        if (room.motionDetectLog.length > 100) {
            room.motionDetectLog.length = 100;
        }
    };

    room.pushMotionNoDetectLog = function (date) {
        room.motionNoDetectLog.unshift(date);
        if (room.motionNoDetectLog.length > 100) {
            room.motionNoDetectLog.length = 100;
        }
    };

    room.pushAutomationSwitchOnLog = function (date) {
        room.automationSwitchOnLog.unshift(date);
        if (room.automationSwitchOnLog.length > 100) {
            room.automationSwitchOnLog.length = 100;
        }
    };

    room.pushAutomationSwitchOffLog = function (date) {
        room.automationSwitchOffLog.unshift(date);
        if (room.automationSwitchOffLog.length > 100) {
            room.automationSwitchOffLog.length = 100;
        }
    };


    room.pushDoorSwitcherOnLog = function (date) {
        room.doorSwitcherOnLog.unshift(date);
        if (room.doorSwitcherOnLog.length > 100) {
            room.doorSwitcherOnLog.length = 100;
        }
    };

    room.pushDoorSwitcherOffLog = function (date) {
        room.doorSwitcherOffLog.unshift(date);
        if (room.doorSwitcherOffLog.length > 100) {
            room.doorSwitcherOffLog.length = 100;
        }
    };

    room.pushSwitcherOnLog = function (date) {
        room.switcherOnLog.unshift(date);
        if (room.switcherOnLog.length > 100) {
            room.switcherOnLog.length = 100;
        }
    };

    room.pushSwitcherOffLog = function (date) {
        room.switcherOffLog.unshift(date);
        if (room.switcherOffLog.length > 100) {
            room.switcherOffLog.length = 100;
        }
    };

    room.pushMotionNearLog = function (date) {
        room.motionNearLog.unshift(date);
        if (room.motionNearLog.length > 100) {
            room.motionNearLog.length = 100;
        }
    };

    room.pushFirstMotionNearLog = function (date) {
        room.firstMotionNearLog.unshift(date);
        if (room.firstMotionNearLog.length > 100) {
            room.firstMotionNearLog.length = 100;
        }
    };


    room.subscribeToMotionSensor = function () {
        console.log(room.name + ': subscribe to motion sensor');
        if (room.motionSensor) {
            room.motionSensor.bind(function () {
                room.onMotionDetect(this)
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
        if (room.temperatureSensor) {
            console.log(room.name + ': subscribe to temperature sensor');
            room.temperatureSensor.bind(function () {
                room.onTemperatureChange(this)
            });
        }
    };


    room.onMotionDetect = function (level) {
        console.log(room.name + ': receive data from motion sensor');
        if (level.value) {
            console.log(room.name + ': motion detect');
            room.callNeighbors();
            room.pushMotionDetectLog(new Date())
        } else {
            console.log(room.name + ': motion not detect');
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


    room.onTemperatureChange = function (level) {
        console.log(room.name + ': temperature changed');
        room.currentTemperature = level.value;
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
        console.log(room.name + ': debug automation ' + room.isAutomationOn() + ' dark ' + room.isDark() + ' lamp ' + room.isLampOn() + ' full ' + room.isFull() + ' backlight ' + room.isBackLight());

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

        if (room.isFull() && room.currentTemperature < 22 && !room.isHeatOn()){
            room.turnHeatOn();
        }

        if (room.isEmpty()  && room.isHeatOn()) {
            room.turnHeatOff();
        }

        if (room.currentTemperature > 22 && room.isHeatOn()){
            room.turnHeatOff();
        }

    };

    room.isEmpty = function () {
        return !room.isFull();
    };

    room.isFull = function(){
        if (!room.isAutomationOn()){
            return true;
        }
        if (room.motionDetectLog[0] > room.motionNoDetectLog[0]){
            return true;
        }
        if (room.motionNearLog[0] > room.motionNoDetectLog[0] - 60 * 1000 ){
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
        if (!room.isAutomationSwitchOn()){
            return false;
        }

        if (room.isAutomationSwitchOn() && room.automationSwitchOnLog[0] > (new Date() - 2 * 60 * 1000)){
            return false;
        }

        return true;
    };

    room.isLampOn = function () {
        return room.lampOnLog[0] > room.lampOffLog[0];
    };


    room.isLampOff = function(){
      return !room.isLampOn();
    };

    room.isHeatOn = function () {
        return room.heatOnLog[0] > room.heatOffLog[0];
    };

    room.isAutomationSwitchOn = function () {
        return room.automationSwitchOnLog[0] > room.automationSwitchOffLog[0];
    };

    room.callNeighbors = function(){
        if (room.isEmpty()) {
            room.neighbors.forEach(function (neighbor) {
                neighbor.onFirstMotionNear();
            });
        }

        room.neighbors.forEach(function (neighbor) {
            neighbor.onMotionNear();
        });
    };

    room.name = settings.name;
    room.lamp = settings.lamp;
    room.heat = settings.heat;
    room.motionSensor = settings.motionSensor;
    room.luxSensor = settings.luxSensor;
    room.temperatureSensor = settings.temperatureSensor;
    room.switcher = settings.switcher;
    room.doorSwitcher = settings.doorSwitcher;
    room.stopAutomationSwitcher = settings.stopAutomationSwitcher;
    room.minLux = settings.minLux;
    room.currentLux = 0;
    room.emptyRoomTimeout = settings.timeout;

    //Defaults

    room.currentLux = 0;
    room.currentTemperature = 0;
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
    room.motionNearLog = [new Date(1)]


};

