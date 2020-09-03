var Rc = function () {
  var self = this;

  self.start = function () {
    zway.devices[13].instances[0].commandClasses[91].data.currentScene.bind(function () {
      var keyStatus = zway.devices[13].instances[0].commandClasses[91].data.keyAttribute.value;
      if (this.value === 4 && keyStatus === 0) {
        zway.devices[11].instances[1].SwitchBinary.Set(1);
      }

      if (this.value === 4 && keyStatus === 2) {
        zway.devices[11].instances[1].SwitchBinary.Set(0);
      }


      if (this.value === 1 && keyStatus === 0) {
        zway.devices[11].instances[1].SwitchBinary.Set(0);
        zway.devices[11].instances[2].SwitchBinary.Set(0);
        zway.devices[10].instances[2].SwitchBinary.Set(1);
        zway.devices[14].instances[1].SwitchBinary.Set(1);
      }

      if (this.value === 2 && keyStatus === 0) {
        zway.devices[10].instances[2].SwitchBinary.Set(1);

      }

      if (this.value === 2 && keyStatus === 2) {
        zway.devices[10].instances[2].SwitchBinary.Set(0);
      }

      if (this.value === 3 && keyStatus === 0) {
        zway.devices[11].instances[1].SwitchBinary.Set(1);
        zway.devices[11].instances[2].SwitchBinary.Set(1);
        zway.devices[10].instances[2].SwitchBinary.Set(1);
        zway.devices[14].instances[1].SwitchBinary.Set(1);
      }

      if (this.value === 3 && keyStatus === 2) {
        zway.devices[11].instances[1].SwitchBinary.Set(0);
        zway.devices[11].instances[2].SwitchBinary.Set(0);
        zway.devices[10].instances[2].SwitchBinary.Set(0);
        zway.devices[14].instances[1].SwitchBinary.Set(0);
      }

      if (this.value === 5 && keyStatus === 0) {
        http.request({
          url: "http://192.168.0.23/2/on?" + new Date().getTime(),
          method: 'GET',
          async: true
        });

        http.request({
          url: "http://192.168.0.23/1/on?" + new Date().getTime(),
          method: 'GET',
          async: true
        });
      }

      if (this.value === 5 && keyStatus === 2) {
        http.request({
          url: "http://192.168.0.23/2/off?" + new Date().getTime(),
          method: 'GET',
          async: true
        });

        http.request({
          url: "http://192.168.0.23/1/off?" + new Date().getTime(),
          method: 'GET',
          async: true
        });
      }

    });
  }


};
