var Probki = function (settings) {
    var self = this;

    if (typeof(settings) !== 'object') {
        settings = {};
    }
    self.regionId = typeof settings.regionId !== 'undefined' ? settings.regionId : '2';
    self.timeout = typeof settings.timeout !== 'undefined' ? settings.timeout : 30;
    self.green = typeof settings.green !== 'undefined' ? settings.green : 14;
    self.yellow = typeof settings.yellow !== 'undefined' ? settings.yellow : 16;
    self.red = typeof settings.red !== 'undefined' ? settings.red : 13;
    self.unknown = typeof settings.unknown !== 'undefined' ? settings.unknown : 12;

    self.rawValue = 0;
    self.value = self.unknown;
    self.responseData = '';
    self.regions = [];
    self.region = {};
    self.url = "jgo.maps.yandex.net/trf/stat.js?=";

    self.get = function () {
        http.request({
            url: self.url + new Date().getTime(),
            method: 'GET',
            async: true,
            success: self.processSuccessResponse,
            error: self.precessErrorResponse
        });
    };

    self.processSuccessResponse = function(response){
        self.responseData = response.data;
        self.extractData();
        self.findRegion();
        self.setValues();
    };

    self.precessErrorResponse = function(response){
        console.log("Can not make request: " + response.statusText);
    };

    self.extractData = function () {
        var data = self.responseData.slice(68, -3);
        data = data.replace(/{/g, '{"');
        data = data.replace(/:"/g, '":"');
        data = data.replace(/",/g, '","');
        self.regions = JSON.parse(data);
    };

    self.findRegion = function () {
        self.regions.forEach(function (_region) {
            if (typeof(_region) === 'object' && _region['regionId'] == ('' + self.regionId)) {
                self.region = _region;
            }
        });
    };

    self.setValues = function () {
        self.rawValue = parseInt(self.region['level']);
        if (self.rawValue <= 3) {
            self.value = self.green;
        } else if (self.rawValue >= 4 && self.rawValue <= 6) {
            self.value = self.yellow;
        } else if (self.rawValue >= 7) {
            self.value = self.red;
        } else {
            self.value = self.unknown;
        }
        zway.devices[3].instances[0].commandClasses[112].Set(80, self.value, 1);
        console.log('Пробки YANDEX: ' + self.rawValue + ' color ' + self.value);
    };
    self.start = function () {
        self.get();
        setInterval(self.get, 1000 * 60 * self.timeout);
    }
};


function Home(settings) {
    var home = this;
    home.name = settings.name;
    home.rooms = [];
    home.lastMotionAt = new Date(1);


    home.addRoom = function (room) {
        home.rooms.push(room);
    };

    home.getLastMotion = function () {
        var _lastMotionAt = new Date(1);
        var _lastMotionRoom = {};
        home.rooms.forEach(function (room) {
            if (room.lastMotionAt > _lastMotionAt) {
                _lastMotionAt = new Date(room.lastMotionAt.getTime());
                _lastMotionRoom = room;
            }
        });
        home.lastMotionAt = _lastMotionAt;
        home.lastMotionRoom = _lastMotionRoom;
    };

    home.interval = setInterval(function () {
        home.getLastMotion();
        console.log('Последнее движение: ' + home.lastMotionAt + ' в ' + home.lastMotionRoom.name)
    }, 1000 * 10);
}


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

var home = new Home({name: 'Дом'});

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


var probki = new Probki();
probki.start();


