executeFile('custom/models/home.js');
executeFile('custom/models/room_advanced.js');
executeFile('custom/models/probki.js');
executeFile('custom/models/lamp.js');
executeFile('custom/models/rc.js');

// 8:0:48:10
var home = new Home({
    name: 'Дом',
    //inHomeSwitcher: zway.devices[3].instances[0].commandClasses[156].data[0].sensorState,
    //inHomeSwitcherEnabler: zway.devices[3].instances[0].commandClasses[48].data[1].level,


});

var lamps = {
    kitchen: new Lamp([zway.devices[4].instances[2].SwitchBinary]),
    wc: new Lamp([zway.devices[7].instances[2].SwitchBinary]),
    bathroom: new Lamp([zway.devices[7].instances[1].SwitchBinary]),
    corridor: new Lamp([zway.devices[4].instances[1].SwitchBinary]),
    bigRoom: new Lamp([zway.devices[11].instances[1].SwitchBinary, zway.devices[11].instances[2].SwitchBinary]),
    //littleRoom: new Lamp([]),
    bigRoomFake: new Lamp([])

};

var kitchen = new Room(
    {
        name: 'kitchen',
        lamp: lamps.kitchen,
        motionSensors: [ zway.devices[2].instances[0].commandClasses[48].data[1].level],
        luxSensor: zway.devices[2].instances[0].commandClasses[49].data[3].val,
        temperatureSensors: [zway.devices[2].instances[0].commandClasses[49].data[1].val],
        switcher: zway.devices[4].instances[2].commandClasses[37].data.level,
        minLux: 100,
        timeout: 300
    }
);

var wc = new Room(
    {
        name: 'wc',
        lamp: lamps.wc,
        motionSensors: [zway.devices[12].instances[0].commandClasses[48].data[12].level],
        luxSensor: zway.devices[12].instances[0].commandClasses[49].data[3].val,
        temperatureSensors: [ zway.devices[12].instances[0].commandClasses[49].data[1].val],
        switcher: zway.devices[7].instances[2].commandClasses[37].data.level,
        minLux: 100,
        timeout: 120
    }
);

//var wc = new Room(
//    {
//        name: 'wc',
//        lamp: lamps.wc,
//        motionSensor: zway.devices[5].instances[0].commandClasses[48].data[1].level,
//        luxSensor: zway.devices[5].instances[0].commandClasses[49].data[3].val,
//        temperatureSensors: [zway.devices[5].instances[0].commandClasses[49].data[1].val],
//        switcher: zway.devices[7].instances[2].commandClasses[37].data.level,
//        minLux: 100,
//        timeout: 120
//    }
//);

var bathroom = new Room(
    {
        name: 'bathroom',
        lamp: lamps.bathroom,
        motionSensors: [ zway.devices[6].instances[0].commandClasses[48].data[1].level],
        luxSensor: zway.devices[6].instances[0].commandClasses[49].data[3].val,
        temperatureSensors: [zway.devices[6].instances[0].commandClasses[49].data[1].val],
        switcher: zway.devices[7].instances[1].commandClasses[37].data.level,
        minLux: 100,
        timeout: 120
    }
);

var corridor = new Room(
    {
        name: 'corridor',
        lamp: lamps.corridor,
        motionSensors: [ zway.devices[3].instances[0].commandClasses[48].data[1].level],
        luxSensor: zway.devices[3].instances[0].commandClasses[49].data[3].val,
        temperatureSensors: [zway.devices[3].instances[0].commandClasses[49].data[1].val],
        switcher: zway.devices[4].instances[1].commandClasses[37].data.level,
        minLux: 50,
        timeout: 120,
        doorSwitcher: zway.devices[9].instances[0].commandClasses[48].data[10].level
    }
);

var bigRoom = new Room(
    {
        name: 'big room',
        lamp: lamps.bigRoom,
        //motionSensors: [ zway.devices[9].instances[0].commandClasses[48].data[12].level, zway.devices[5].instances[0].commandClasses[48].data[1].level],
        luxSensor: zway.devices[5].instances[0].commandClasses[49].data[3].val,
        //temperatureSensors: [zway.devices[9].instances[0].commandClasses[49].data[1].val,  zway.devices[8].instances[0].commandClasses[49].data[1].val],
        temperatureSensors: [zway.devices[5].instances[0].commandClasses[49].data[1].val],
        switcher: zway.devices[11].instances[0].commandClasses[37].data.level,
        minLux: 100,
        timeout: 900,
        //stopAutomationSwitcher: zway.devices[9].instances[0].commandClasses[48].data[10].level,
        //heat: zway.devices[10].instances[2].SwitchBinary,
        alwaysFull: true
    }
);

//var littleRoom = new Room(
//    {
//        name: 'little room',
//        lamp: lamps.littleRoom,
//        motionSensor: zway.devices[8].instances[0].commandClasses[48].data[12].level,
//        luxSensor: zway.devices[8].instances[0].commandClasses[49].data[3].val,
//        temperatureSensors: [zway.devices[8].instances[0].commandClasses[49].data[1].val],
//        switcher: zway.devices[10].instances[0].commandClasses[37].data.level,
//        minLux: 8, // here percents/ not lux
//        timeout: 300,
//        doorSwitcher: zway.devices[8].instances[0].commandClasses[48].data[10].level
//
//    }
//);

home.addRoom(wc);
home.addRoom(bathroom);
home.addRoom(kitchen);
home.addRoom(corridor);
home.addRoom(bigRoom);
//home.addRoom(littleRoom);
corridor.neighbors = [kitchen, wc, bathroom, bigRoom];
wc.neighbors = [corridor];
bathroom.neighbors = [corridor];
kitchen.neighbors = [corridor];
bigRoom.neighbors = [corridor];
//littleRoom.neighbors = [corridor];

var probki = new Probki({
    devices: [zway.devices[3]]
});

var rc = new Rc();
rc.start();
home.start();
probki.start();
