function createEntity(properties, components) {
  var prop;
  var entity = {
    properties: {},
    components: []
  }
  return createEntityFromTemplate(entity);
}

function getAllMethodNames(obj) {
  let methods = new Set();
  while (obj = Reflect.getPrototypeOf(obj)) {
    let keys = Reflect.ownKeys(obj)
    keys.forEach((k) => methods.add(k));
  }
  return methods;
}

function createEntityFromTemplate(templateObj) {
  /**
   * A way to fake inheritance with composition.
   */

  var prop;
  console.log(templateObj);
  // Merge in the properties dict. Why is this here again?
  for (prop in templateObj.properties) {
    templateObj[prop] = templateObj.properties[prop];
  }

  templateObj.components.forEach(function(component) {
    // loop over any properties
    for (prop in component) {
      if (templateObj.hasOwnProperty(prop)) {
        // check overriding
        console.log("has " + prop);
        if(templateObj.overRide !== undefined && templateObj.overRide[prop] === component.type ){
          console.log("setting precedence" + prop)
          templateObj[prop] = component[prop];
        }
          // throw "Entity property conflict! " + prop;
      } else if (templateObj.overload[prop] !== undefined) {
        // Covers old style class objects i.e. Obj.prototype
        let name = component.constructor.name;
        templateObj.overload[prop][component.constructor.name] = component[prop].bind(templateObj);
      } else {
        templateObj[prop] = component[prop];
      }
    }

    // loop over all the methods
    let componentMethods = getAllMethodNames(component);
    for (overload in templateObj.overload) {
      if(component[overload] === undefined) {
        continue;
      }
      let name = component.constructor.name;
      templateObj.overload[overload][name] = component[overload].bind(templateObj);
    }
  });

  return templateObj;
}
