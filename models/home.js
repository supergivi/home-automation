var Home = function (settings) {
    var home = this;

    if (typeof(settings) !== 'object') {
        settings = {};
    }

    home.name = settings.name;
    home.rooms = [];
    home.lastMotionAt = new Date(1);
    home.inHomeSwitcher = settings.inHomeSwitcher;
    home.inHomeSwitcherEnabler = settings.inHomeSwitcherEnabler;
    home.full = true;
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
        home.subscribeToInHomeSwitcher();
    };

    home.subscribeToInHomeSwitcher = function () {
        if (home.inHomeSwitcher) {
            console.log(home.name + ': subscribe to in home switcher');
            home.inHomeSwitcher.bind(function () {
                home.onInHomeSwitcherChange(this);
            });
        }
    };

    home.onInHomeSwitcherChange = function (level) {
        if (level.value && home.inHomeSwitcherEnabler.value ) {
            if (home.full) {
                home.full = false;

                //home.emptyTimeout = setTimeout(function () {
                home.rooms.forEach(function (room) {
                    room.forceEmpty();
                });
                //}, 120 * 1000)
            } else {
                home.full = true;
                home.rooms.forEach(function (room) {
                    room.disableForceEmpty();
                });
            }
        }
    };


};
