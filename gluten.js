(function() {
    var root = this;

    // initialize Gluten
    var Gluten;

    // Export gluten if exports are available
    if(typeof exports !== 'undefined') {
        Gluten = exports;
    } else {
        Gluten = root.Gluten = {};
    }

    Gluten.VERSION = '0.1.0';

    // Alias Array Prototypes
    var slice  = Array.prototype.slice,
        each   = Array.prototype.forEach;

    // Initialize the settings object
    var settings = Gluten.settings = {
        debug: true,
        breaks: {
            small  : 560,
            medium : 760,
            large  : 1200
        },
        resizeTimer: 100,
        classPrefix: "screen-"
    };

    var caches = {
         rules  : [],
         detach : [],
         global : []
    };

    var debug = function(s) {
        if (settings.debug) console.log(s); 
    };

    var init = Gluten.init = function(breaks, cb) {

        /* Config Method 
         * @param object breaks
         * @param cb function (callback)
         * @return this
         * 
         * Method will take provided breakpoints and add it to the settings object
         * Method will also initialize the resize listener
         * */

        var settings = this.settings;

        this.currentSize = 0;
        this.currentId = "small";

        // extend the current breaks with @param breaks
        if(breaks) { helpers.extend(settings.breaks, breaks); }

        settings.breaks = helpers.sort(settings.breaks);
        Gluten.currentSize = window.innerWidth;
        Gluten.currentId = helpers.getSizeId(Gluten.currentSize);

        var doc = document.getElementsByTagName('html')[0];
        doc.classList.add(settings.classPrefix+Gluten.currentId);

        debug("> Init");
        debug(". Landing size is "+Gluten.currentId+" ("+Gluten.currentSize+")");

        // initialize the resize listener
        windowResize.init(function(width) {
            var lastId = Gluten.currentId;
            Gluten.currentSize = width;

            helpers.getSizeId(width);

            if (Gluten.currentId !== lastId) {
                debug("\n! Window resized to "+Gluten.currentId+ " ("+width+")");

                if (settings.classPrefix) {

                  var doc = document.getElementsByTagName('html')[0];
                  doc.classList.remove(settings.classPrefix+Gluten.currentId);
                }

                binds.refresh();
            } else {
                debug(". Window size didn't change ("+width+")");
            }
        });

        // Fire callback if provided
        if(cb && typeof(cb) !== 'undefined') {
            cb.call(this);
        }

        return this;
    };


    // Binding methods
    var binds = Gluten.binds = {
        
        extend: function (bindRules) {
            caches.rules = helpers.extend(caches.rules, bindRules);

            return this;
        },

        refresh: function (cb) {
            binds.detach();
            binds.attach();

            if(cb && typeof(cb) !== 'undefined') {
                cb.call(this);
            }

            return this;
        },

        attach: function () {
            var settings = Gluten.settings;

            caches.rules.forEach(function(ruleObj) {
                var allSizes = false;

                if (typeof ruleObj.sizes == "undefined") {
                    allSizes = true;
                }

                if (allSizes || (ruleObj.sizes.indexOf(Gluten.currentId) >= 0)) {
                    if (typeof ruleObj.selector !== "undefined") {

                        // A bind
                        if (caches.global.indexOf(ruleObj.event) < 0) {
                            debug("+ attaching "+ruleObj.event+" ("+allSizes+")");

                            var els = document.querySelectorAll(ruleObj.selector);
                            var event = ruleObj.event.split('.')[0];

                            if ( ruleObj.live ) {
                              var live = document.querySelectorAll(ruleObj.live);

                              for ( var i = 0; i < live.length; i++ ) {
                                live[i].addEventListener(event, function (e) {
                                  var sel = ruleObj.selector;
                                  var el = e.target;

                                  if ( el.className === sel.split('.')[1] || el.id === sel.split('#')[1]) {
                                      ruleObj.handler();
                                  }
                                }, false);

                              }
                            }


                            for ( var i = 0; i < els.length; i++ ) {
                              els[i].addEventListener(event, ruleObj.handler, false);
                            }
                        }

                        if (!allSizes) { 
                           caches.detach.push({
                                    "selector":ruleObj.selector,
                                    "event":ruleObj.event,
                                    "handler": ruleObj.handler
                            });

                        } else {
                            caches.global.push(ruleObj.event);
                        }
                    } else {
                        // Just a function
                        ruleObj.event();
                    }
                }
            });

            return this;
        },

        detach: function () {
            caches.detach.forEach(function(data) {
                debug("- detaching "+data.event);

                var els = document.querySelectorAll(data.selector);
                var event = data.event.split('.');

                for ( var i = 0; i < els.length; i++ ) {
                  els[i].removeEventListener(event[0], data.handler, false);
                }
            });

            caches.detach = [];

            return this;
        },

        rule: function (selector, event, live, sizes, handler ) {
          var ruleObj = {};

          ruleObj.selector = selector;
          ruleObj.event = event;

          console.log(live);
          if ( typeof live === 'object' ) {
            ruleObj.sizes = live;
            ruleObj.handler = sizes;
          } else if ( typeof live === 'function' ) {
            ruleObj.handler = live;
          } else {
            ruleObj.live = live;

            if ( typeof sizes === 'function' ) {
              ruleObj.handler = sizes;
            } else {
              ruleObj.sizes = sizes;
              ruleObj.handler = handler;
            }
          }

          binds.extend([ruleObj]);
          return ruleObj;
        }
    };

    var windowResize = {
        init: function (cb) {
            windowResize.vars.complete = cb;
            windowResize.event(window, "resize", windowResize.listener);

            return this;
        },

        vars: {
            check: new Date(1, 1, 2000, 12, 0, 0),
            timeout: false,
            timer: settings.resizeTimer,
            complete: false
        },

        event: function (el, type, eventHandle) {
            if(el === null || el === undefined) {
                return;
            }

            if(el.addEventListener) {
                el.addEventListener(type, eventHandle, false);
            } else if (el.attachEvent) {
                el.attachEvent("on"+type, eventHandle);
            } else {
                el["on"+type]=eventHandle;
            }
        },

        listener: function () {
            windowResize.vars.check = new Date();

            if(windowResize.vars.timeout === false) {
                windowResize.vars.timeout = true;

                setTimeout(windowResize.complete, windowResize.vars.timer);
            }

            return this;
        },

        complete: function () {
            if(new Date() - windowResize.vars.check < windowResize.vars.timer) {
                setTimeout(windowResize.complete, windowResize.vars.timer);
            } else {
                windowResize.vars.timeout = false;

                if(typeof windowResize.vars.complete === "function") {
                    windowResize.vars.complete(window.innerWidth);
                }
            }

            return this;
        }
    };

    var helpers = {
        sort: function (obj) {
            var cache = [];
            for(var prop in obj) {
                if(obj.hasOwnProperty(prop)) {
                    cache.push({
                        "id": prop,
                        "max": obj[prop]
                    });
                }
            }

            cache.sort(function(a,b) { return a.max - b.max; });

            return cache;
        },

        getSizeId: function(pixels) {
            var settings = Gluten.settings;

            for(a=0; a < settings.breaks.length; a+=1) {
                var thisSize = settings.breaks[a],
                    nextSize = settings.breaks[a+1];

                Gluten.currentId = thisSize.id;

                if(pixels < thisSize.max) {
                    break;
                }
            }

            return(thisSize.id);
        },

        extend: function(obj) {
            each.call(slice.call(arguments, 1), function(source) {
                if(source) {
                    for(var prop in source) {
                        obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        }

    };

    Gluten.rules = binds.extend;
    Gluten.refresh = binds.refresh;
    Gluten.rule = binds.rule;
    Gluten.cache = caches;


}).call(this);
