var Probki = function (settings) {
    var self = this;

    if (typeof(settings) !== 'object') {
        settings = {};
    }

    self.regionId = typeof settings.regionId !== 'undefined' ? settings.regionId : '2'; //Saint-Petersburg
    self.timeout = typeof settings.timeout !== 'undefined' ? settings.timeout : 30;

    // defaults for Fibaro Motion Sensor
    self.green = typeof settings.green !== 'undefined' ? settings.green : 14;
    self.yellow = typeof settings.yellow !== 'undefined' ? settings.yellow : 16;
    self.red = typeof settings.red !== 'undefined' ? settings.red : 13;
    self.unknown = typeof settings.unknown !== 'undefined' ? settings.unknown : 12;
    self.devices = typeof settings.devices !== 'undefined' ? settings.devices : [];


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

    self.processSuccessResponse = function (response) {
        self.responseData = response.data;
        self.extractData();
        self.findRegion();
        self.setValues();
        self.setupDevices();
    };

    self.precessErrorResponse = function (response) {
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
        console.log('Yandex probki: ' + self.rawValue + ' color ' + self.value);
    };

    self.setupDevices = function () {
        self.devices.forEach(function (device) {
            device.instances[0].commandClasses[112].Set(80, self.value, 1); // Fibaro Motion Sensor
        });
    };

    self.start = function () {
        self.get();
        setInterval(self.get, 1000 * 60 * self.timeout);
    }
};
