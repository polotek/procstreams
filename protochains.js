var slice = Array.prototype.slice;

var mixin = function(target) {
  var args = slice.call(arguments,1);

  args.forEach(function(p) {
    if(!p) { return; }

    Object.keys(p)
      .forEach(function(k) {
        target[k] = p[k];
      });
  });

  return target;
}

var getOwnDescriptors = function() {
  var args = slice.call(arguments)
    , proto = {};

  args.forEach(function(p) {
    if(!p) { return; }

    Object.getOwnPropertyNames(p)
      .forEach(function (k) {
        proto[k] = Object.getOwnPropertyDescriptor(p, k);
      });
  });

  return proto;
}

var extend = function(o, parent, plus) {
  var proto = getOwnDescriptors(parent, plus);

  Object.keys(proto).forEach(function(k) {
    Object.defineProperty(o, k, proto[k]);
  });

  return o;
}

var create = function(parent, ctor) {
  var obj = Object.create(parent, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  mixin(obj, ctor.prototype);

  return Object.create(obj);
}

var enhance = function(o, plus) {
  return extend(o, this.prototype, plus);
}

exports.mixin = mixin;
exports.extend = extend;
exports.create = create;
exports.enhance = enhance;
