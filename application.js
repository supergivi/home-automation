executeFile('custom/models/home.js');
executeFile('custom/models/room.js');
executeFile('custom/models/probki.js');
executeFile('custom/models/lamp.js');

var home = new Home({name: 'Дом'});

var lamps = {
    kitchen: new Lamp([zway.devices[4].instances[2].SwitchBinary]),
    wc: new Lamp([zway.devices[7].instances[2].SwitchBinary]),
    bathroom: new Lamp([zway.devices[7].instances[1].SwitchBinary]),
    corridor: new Lamp([zway.devices[4].instances[1].SwitchBinary]),
    bigRoom: new Lamp([zway.devices[11].instances[1].SwitchBinary])
};

var kitchen = new Room(
    {
        name: 'kitchen',
        lamp: lamps.kitchen,
        motionSensor: zway.devices[2].instances[0].commandClasses[48].data[1].level,
        luxSensor: zway.devices[2].instances[0].commandClasses[49].data[3].val,
        temperatureSensor: zway.devices[2].instances[0].commandClasses[49].data[1].val,
        switcher: zway.devices[4].instances[2].commandClasses[37].data.level,
        minLux: 100,
        timeout: 300
    }
);

var wc = new Room(
    {
        name: 'wc',
        lamp: lamps.wc,
        motionSensor: zway.devices[5].instances[0].commandClasses[48].data[1].level,
        luxSensor: zway.devices[5].instances[0].commandClasses[49].data[3].val,
        temperatureSensor: zway.devices[5].instances[0].commandClasses[49].data[1].val,
        switcher: zway.devices[7].instances[2].commandClasses[37].data.level,
        minLux: 100,
        timeout: 5 //120
    }
);

var bathroom = new Room(
    {
        name: 'bathroom',
        lamp: lamps.bathroom,
        motionSensor: zway.devices[6].instances[0].commandClasses[48].data[1].level,
        luxSensor: zway.devices[6].instances[0].commandClasses[49].data[3].val,
        temperatureSensor: zway.devices[6].instances[0].commandClasses[49].data[1].val,
        switcher: zway.devices[7].instances[1].commandClasses[37].data.level,
        minLux: 100,
        timeout: 120
    }
);

var corridor = new Room(
    {
        name: 'corridor',
        lamp: lamps.corridor,
        motionSensor: zway.devices[3].instances[0].commandClasses[48].data[1].level,
        luxSensor: zway.devices[3].instances[0].commandClasses[49].data[3].val,
        temperatureSensor: zway.devices[3].instances[0].commandClasses[49].data[1].val,
        switcher: zway.devices[4].instances[1].commandClasses[37].data.level,
        minLux: 50,
        timeout: 120
    }
);

//var bigRoom = new Room(
//    {
//        name: 'big room',
//        lamp: lamps.bigRoom,
//        motionSensor: zway.devices[9].instances[0].commandClasses[48].data[12].level,
//        luxSensor: zway.devices[9].instances[0].commandClasses[49].data[3].val,
//        temperatureSensor: zway.devices[9].instances[0].commandClasses[49].data[1].val,
//        switcher: zway.devices[11].instances[1].commandClasses[37].data.level,
//        minLux: 100,
//        timeout: 5
//    }
);
home.addRoom(wc);
home.addRoom(bathroom);
home.addRoom(kitchen);
home.addRoom(corridor);
//home.addRoom(bigRoom);
corridor.neighbors = [kitchen, wc, bathroom];

var probki = new Probki({
    devices: [zway.devices[3]]
});
home.start();
probki.start();
