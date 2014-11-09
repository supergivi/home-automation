executeFile('custom/models/home.js');
executeFile('custom/models/room.js');
executeFile('custom/models/probki.js');

var home = new Home({name: 'Дом'});
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
    //Lamp


    //init room

    console.log(room.name + ': Инициализирую помещение');
    room.turnOffLamp();
    room.subscribeToMotionSensor();
    room.subscribeToLuxSensor();
    room.subscribeToTemperatureSensor();
    //room.subscribeToSwitcher();


};

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

var kitchen = new Room(
    {
        name: 'Кухня',
        lamp: zway.devices[4].instances[2].SwitchBinary,
        motionSensor: zway.devices[2].instances[0].commandClasses[48].data[1].level,
        luxSensor: zway.devices[2].instances[0].commandClasses[49].data[3].val,
        temperatureSensor: zway.devices[2].instances[0].commandClasses[49].data[1].val,
        switcher: zway.devices[4].instances[2].commandClasses[37].data.level,
        minLux: 100,
        timeout: 300
    }
);

var corridor = new Room(
    {
        name: 'Коридор',
        lamp: zway.devices[4].instances[1].SwitchBinary,
        motionSensor: zway.devices[3].instances[0].commandClasses[48].data[1].level,
        luxSensor: zway.devices[3].instances[0].commandClasses[49].data[3].val,
        temperatureSensor: zway.devices[3].instances[0].commandClasses[49].data[1].val,
        switcher: zway.devices[4].instances[1].commandClasses[37].data.level,
        minLux: 50,
        timeout: 60
    }
);

home.addRoom(kitchen);
home.addRoom(corridor);

corridor.neighbors = [kitchen];

var probki = new Probki({
    devices: [zway.devices[3]]
});
probki.start();
