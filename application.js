executeFile('custom/models/home.js');
executeFile('custom/models/room.js');
executeFile('custom/models/probki.js');

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

var probki = new Probki({
    devices: [zway.devices[3]]
});
probki.start();
