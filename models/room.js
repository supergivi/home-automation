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

    //init room

    console.log(room.name + ': Инициализирую помещение');
    room.turnOffLamp();
    room.subscribeToMotionSensor();
    room.subscribeToLuxSensor();
    room.subscribeToTemperatureSensor();
    //room.subscribeToSwitcher();


}

Room.prototype = {
    onChangesDetect: function () {
        console.log(this.name + ': Детектированы изменеия');
        if (!this.isEmpty && !this.illuminationIsOn && this.isDark) {

            this.illuminate();
            if (this.neighbors) {
                this.neighbors.forEach(function (neighbor) {
                    neighbor.onMotionNear();
                });
            }
        }
        if (this.isEmpty && this.illuminationIsOn) {
            this.turnOffLamp();
        }
        if (this.motionIsNear) {
            if (!this.illuminationIsOn && this.isDark) {
                this.illuminate();
                setTimeout(function () {
                    if (this.isEmpty) {
                        this.turnOffLamp();
                    }
                }.bind(this), 20 * 1000);
            }

        }

    },

    illuminate: function () {
        console.log(this.name + ': Включаю свет');
        this.lamp.Set(1);
        this.illuminationIsOn = true;
    },

    turnOffLamp: function () {
        console.log(this.name + ': Выключаю свет');
        this.lamp.Set(0);
        this.illuminationIsOn = false;
        this.temporaryIlluminationIsOn = false;
    },

//Motion

    subscribeToMotionSensor: function () {
        console.log(this.name + ': Подписываюсь на датчик движения');
        if (this.motionSensor) {
            this.motionSensor.bind(this.onMotionDetect);
        }
    },

    onMotionDetect: function () {
        console.log(this.name + ': Получена информация от датчика движения');
        if (this.emptyRoomTimer) {
            clearTimeout(this.emptyRoomTimer);
        }
        if (this.value) {
            console.log(this.name + ': Есть движение в комнате');
            this.isEmpty = false;
            this.lastMotionAt = new Date();
        } else {
            this.emptyRoomTimer = setTimeout(function () {
                console.log(this.name + ': Нет движения в комнате');
                this.isEmpty = true;
                this.onChangesDetect();
            }.bind(this), this.emptyRoomTimeout * 1000)
        }
        this.onChangesDetect();
    },

//Lux

    onLuxChange: function () {
        if (!this.illuminationIsOn && !this.temporaryIlluminationIsOn) {
            this.currentLux = this.value;
            this.isDark = (this.currentLux < this.minLux);
            console.log(this.name + ': Изменилась освещенность');
        }
        this.onChangesDetect();
    },

    subscribeToLuxSensor: function () {
        if (this.luxSensor) {
            console.log(this.name + ': Подписываюсь на датчик освещенности');
            this.luxSensor.bind(this.onLuxChange);
        }
    },

// Switcher

    onSwitcherChange: function () {
        console.log(this.name + ': Выключатель был нажат');

        this.onChangesDetect();
    },

    subscribeToSwitcher: function () {
        if (this.switcher) {
            console.log(this.name + ': Подписываюсь на выключатель');
            this.switcher.bind(this.onSwitcherChange);
        }
    },


//Temperature

    onTemperatureChange: function () {
        console.log(this.name + ': Изменилась температура');
        this.currentTemperature = this.value;
        this.onChangesDetect();
    },

    subscribeToTemperatureSensor: function () {
        if (this.temperatureSensor) {
            console.log(this.name + ': Подписываюсь на датчик температуры');
            this.temperatureSensor.bind(this.onTemperatureChange);
        }
    },

//Motion near

    onMotionNear: function () {
        console.log(this.name + ': Движение в помещении рядом');
        this.motionIsNear = true;
        this.onChangesDetect();
        this.motionIsNear = false;
    }

//-------------------------------------------------------


};
