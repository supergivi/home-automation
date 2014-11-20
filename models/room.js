// Room model

var Room = function (settings) {
    var room = this;

    if (typeof(settings) !== 'object') {
        settings = {};
    }

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

// Start

Room.prototype.start = function () {
    console.log(this.name + ': Инициализирую помещение');
    this.turnOffLamp();
    this.subscribeToMotionSensor();
    this.subscribeToLuxSensor();
    this.subscribeToTemperatureSensor();
    //room.subscribeToSwitcher();
};

// Lamp

Room.prototype.illuminate = function () {
    console.log(this.name + ': Включаю свет');
    this.lamp.Set(1);
    this.illuminationIsOn = true;
};

Room.prototype.turnOffLamp = function () {
    console.log(this.name + ': Выключаю свет');
    this.lamp.Set(0);
    this.illuminationIsOn = false;
    this.temporaryIlluminationIsOn = false;
};

//Motion

Room.prototype.subscribeToMotionSensor = function () {
    console.log(this.name + ': Подписываюсь на датчик движения');
    var _this = this;
    if (this.motionSensor) {
        this.motionSensor.bind(function () {
            _this.onMotionDetect(this)
        });
    }
};

Room.prototype.onMotionDetect = function (level) {
    console.log(this.name + ': Получена информация от датчика движения');

    if (this.emptyRoomTimer) {
        clearTimeout(this.emptyRoomTimer);
    }
    if (level.value) {
        console.log(this.name + ': Есть движение в комнате');
        this.isEmpty = false;
        this.lastMotionAt = new Date();
    } else {
        var _this = this;
        this.emptyRoomTimer = setTimeout(function () {
            console.log(_this.name + ': Нет движения в комнате');
            _this.isEmpty = true;
            _this.onChangesDetect();
        }, this.emptyRoomTimeout * 1000)
    }
    this.onChangesDetect();
};

//Lux

Room.prototype.onLuxChange = function (level) {
    if (!this.illuminationIsOn && !this.temporaryIlluminationIsOn) {
        this.currentLux = level.value;
        this.isDark = (this.currentLux < this.minLux);
        console.log(this.name + ': Изменилась освещенность');
    }
    this.onChangesDetect();
};

Room.prototype.subscribeToLuxSensor = function () {
    var _this = this;
    if (this.luxSensor) {
        console.log(this.name + ': Подписываюсь на датчик освещенности');
        this.luxSensor.bind(function () {
            _this.onLuxChange(this);
        });
    }
};

// Switcher

Room.prototype.onSwitcherChange = function (level) {
    console.log(this.name + ': Выключатель был нажат');

    this.onChangesDetect();
};

Room.prototype.subscribeToSwitcher = function () {
    var _this = this;
    if (this.switcher) {
        console.log(this.name + ': Подписываюсь на выключатель');
        this.switcher.bind(function () {
            _this.onSwitcherChange(this);
        });
    }
};

//Temperature

Room.prototype.onTemperatureChange = function (level) {
    console.log(this.name + ': Изменилась температура');
    this.currentTemperature = level.value;
    this.onChangesDetect();
};

Room.prototype.subscribeToTemperatureSensor = function () {
    var _this = this;
    if (this.temperatureSensor) {
        console.log(this.name + ': Подписываюсь на датчик температуры');
        this.temperatureSensor.bind(function(){
            _this.onTemperatureChange(this)
        });
    }
};

//Motion near

Room.prototype.onMotionNear = function () {
    console.log(this.name + ': Движение в помещении рядом');
    this.motionIsNear = true;
    this.onChangesDetect();
    this.motionIsNear = false;
};

//-------------------------------------------------------

Room.prototype.onChangesDetect = function () {
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
            var _this = this;
            this.illuminate();
            setTimeout(function () {
                if (_this.isEmpty) {
                    _this.turnOffLamp();
                }
            }, 20 * 1000);
        }

    }

};
