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
  obj = Reflect.getPrototypeOf(obj);
  while (obj.constructor.name !== "Object" ) {
    let keys = Reflect.ownKeys(obj).filter(k => k !== "constructor");
    keys.forEach( k => methods.add(k));
    obj = Reflect.getPrototypeOf(obj);
  }

  return methods;
}

function createEntityFromTemplate(templateObj) {
  /**
   * A way to fake inheritance with composition. I'm not sure How much
   * I like this now
   */

  var prop;
  // Merge in the properties dict. Why is this here again?
  for (prop in templateObj.properties) {
    templateObj[prop] = templateObj.properties[prop];
  }

  templateObj.components.forEach(function(component) {
    // first, get the first level method from the component
    let componentMethods = getAllMethodNames(component);

    for(let method of componentMethods.values()) {
      // Base obj doesn't have the component method, add it to the base
      // TODO: This could stomp on properties with the same name.
      if (typeof templateObj[method] !== 'function') {
        templateObj[method] = component[method];
      }
      // else if it does have the property, it will be handled in the
      // over ride step below
    }

    // loop over any properties
    for (prop in component) {
      if (templateObj.hasOwnProperty(prop)) {
        // check overriding
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
    for (overload in templateObj.overload) {
      if(component[overload] === undefined) {
        continue;
      }
      let name = component.constructor.name;
      templateObj.overload[overload][name] = component[overload].bind(templateObj);
    }
  });

  console.log(templateObj);
  return templateObj;
}
