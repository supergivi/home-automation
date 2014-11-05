function Room(settings) {
    var room = this;
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
    //Lamp

    room.illuminate = function () {
        console.log(room.name + ': Включаю свет');
        room.lamp.Set(1);
        room.illuminationIsOn = true;
    };

    room.turnOffLamp = function () {
        console.log(room.name + ': Выключаю свет');
        room.lamp.Set(0);
        room.illuminationIsOn = false;
        room.temporaryIlluminationIsOn = false;
    };

    //Motion

    room.subscribeToMotionSensor = function () {
        console.log(room.name + ': Подписываюсь на датчик движения');
        if (room.motionSensor) {
            room.motionSensor.bind(room.onMotionDetect);
        }
    };

    room.onMotionDetect = function () {
        console.log(room.name + ': Получена информация от датчика движения');
        if (room.emptyRoomTimer) {
            clearTimeout(room.emptyRoomTimer);
        }
        if (this.value) {
            console.log(room.name + ': Есть движение в комнате');
            room.isEmpty = false;
            room.lastMotionAt = new Date();
        } else {
            room.emptyRoomTimer = setTimeout(function () {
                console.log(room.name + ': Нет движения в комнате');
                room.isEmpty = true;
                room.onChangesDetect();
            }, room.emptyRoomTimeout * 1000)
        }
        room.onChangesDetect();
    };

    //Lux

    room.onLuxChange = function () {
        if (!room.illuminationIsOn && !room.temporaryIlluminationIsOn) {
            room.currentLux = this.value;
            room.isDark = (room.currentLux < room.minLux);
            console.log(room.name + ': Изменилась освещенность');
        }
        room.onChangesDetect();
    };

    room.subscribeToLuxSensor = function () {
        if (room.luxSensor) {
            console.log(room.name + ': Подписываюсь на датчик освещенности');
            room.luxSensor.bind(room.onLuxChange);
        }
    };

    // Switcher

    room.onSwitcherChange = function () {
        console.log(room.name + ': Выключатель был нажат');

        room.onChangesDetect();
    };

    room.subscribeToSwitcher = function () {
        if (room.switcher) {
            console.log(room.name + ': Подписываюсь на выключатель');
            room.switcher.bind(room.onSwitcherChange);
        }
    };


    //Temperature

    room.onTemperatureChange = function () {
        console.log(room.name + ': Изменилась температура');
        room.currentTemperature = this.value;
        room.onChangesDetect();
    };

    room.subscribeToTemperatureSensor = function () {
        if (room.temperatureSensor) {
            console.log(room.name + ': Подписываюсь на датчик температуры');
            room.temperatureSensor.bind(room.onTemperatureChange);
        }
    };

    //Motion near

    room.onMotionNear = function () {
        console.log(room.name + ': Движение в помещении рядом');
        room.motionIsNear = true;
        room.onChangesDetect();
        room.motionIsNear = false;
    };

    //-------------------------------------------------------

    room.onChangesDetect = function () {
        console.log(room.name + ': Детектированы изменеия');
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
        if (room.motionIsNear) {
            if (!room.illuminationIsOn && room.isDark) {
                room.illuminate();
                setTimeout(function () {
                    if (room.isEmpty) {
                        room.turnOffLamp();
                    }
                }, 20 * 1000);
            }

        }

    };

    //init room

    console.log(room.name + ': Инициализирую помещение');
    room.turnOffLamp();
    room.subscribeToMotionSensor();
    room.subscribeToLuxSensor();
    room.subscribeToTemperatureSensor();
    //room.subscribeToSwitcher();


}
