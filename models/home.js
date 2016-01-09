var Home = function (settings) {
    var home = this;

    if (typeof(settings) !== 'object') {
        settings = {};
    }

    home.name = settings.name;
    home.rooms = [];
    home.lastMotionAt = new Date(1);


    home.addRoom = function (room) {
        home.rooms.push(room);
    };

    //home.getLastMotion = function () {
    //    var _lastMotionAt = new Date(1);
    //    var _lastMotionRoom = {};
    //    home.rooms.forEach(function (room) {
    //        if (room.lastMotionAt > _lastMotionAt) {
    //            _lastMotionAt = new Date(room.lastMotionAt.getTime());
    //            _lastMotionRoom = room;
    //        }
    //    });
    //    home.lastMotionAt = _lastMotionAt;
    //    home.lastMotionRoom = _lastMotionRoom;
    //};

    home.start = function () {
        home.rooms.forEach(function (room) {
            room.start();
        });

        home.interval = setInterval(function () {
            //home.getLastMotion();
            //console.log('last motion: ' + home.lastMotionAt + ' в ' + home.lastMotionRoom.name);
            home.rooms.forEach(function (room) {
                room.clockCycle();
            });
        }, 1000 * 10);
    };


    //home.turnLampsOn = function(){
    //    home.rooms.forEach(function (room) {
    //        room.illuminate();
    //    });
    //};
    //
    //home.turnLampsOff = function(){
    //    home.rooms.forEach(function (room) {
    //        room.turnOffLamp();
    //    });
    //};
};
