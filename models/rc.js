var Rc = function () {
  var self = this;

  self.start = function () {
    zway.devices[13].instances[0].commandClasses[91].data.currentScene.bind(function () {
      if (this.value === 4 && zway.devices[13].instances[0].commandClasses[91].data.keyAttribute.value === 0) {
        if (self.toggle4) {
          zway.devices[11].instances[1].SwitchBinary.Set(0)
          self.toggle4 = false;
        } else {
          zway.devices[11].instances[1].SwitchBinary.Set(1)
          self.toggle4 = true;
        }
      }

    });
  }
  self.toggle4 = false;


};
