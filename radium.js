var Samarium = {};

Class(Samarium ,'Promise').includes(CustomEventSupport)({
    prototype: {
        _events : {},
        _once   : false,//function
        _each   : null,//function
        _then   : null,//function
        init : function(options,Sm){
            this._events = options.events;
            this._once = options.once || false,
            this._then = null,
            this._each = null,
            this._Sm = Sm;


        },
        resolve : function(){
            var event = arguments[1];
            event.type = arguments[0];

            this._events[event.type].status = 'resolved';    

            if(typeof this._each === 'function'){
                this._each(event);
            };

            if(this.isPromiseCompleted() && typeof this._then === 'function'){
                this._then();

                if(this._once){
                    this._then = function(){};
                }

                if(this._name){
                    this._Sm.get(this._name).unique('Completed');
                }
            }
        },
        each : function(f){
            this._each = f;

            return this;
        },
        then : function(f){
            if(this.isPromiseCompleted()){
                f();
            }

            this._then = f;
            return this;
        },
        setName: function(name){
            this._name = name;
            return this;
        },
        isPromiseCompleted : function(){
            for(var i in this._events){
                if(this._events[i].status !== 'resolved'){
                    return false;
                }
            }
            return true;
        },
        status : function(){
            return $.extend(true, {}, this._events);
        }
    }
});

Class( Samarium , 'Manager').includes(CustomEventSupport)({    
    prototype: {
        _config : {},
        _factories : {},
        init : function(config){
            this._config = config || {};
        },
        get : function (name){
            if(this._factories[name]){
                return this._factories[name]
            }else{
                var SSF = new Samarium.StateFactory(name);
                return this._factories[name] = SSF;
            }
        },
        on : function(){
            var self = this;
            var events = this.buildEvents(arguments);
            var dfd = new Samarium.Promise({
                events : events
            },self);

            $(arguments).each(function(i,eventName){
                var e = eventName.split(':');
                self.get(e[0]).bind(e[1],function(eventObject){
                    dfd.resolve(eventName,eventObject);
                });
            });

            return dfd;
        },
        once : function(){
            var self = this;
            var events = this.buildEvents(arguments);
            var dfd = new Samarium.Promise({
                events : events,
                once : true
            },self);

            $(arguments).each(function(i,eventName){
                var e = eventName.split(':');
                self.get(e[0]).bind(e[1],function(eventObject){
                    dfd.resolve(eventName,eventObject);
                });
            });

            return dfd;
        },
        buildEvents : function(events){
            var self = this;
            var e = {};
            $(events).each(function(i, item){
                var en = item.split(':');
                e[item] = {status:''}    
                if(self.get(en[0]).isUnique(en[1])){
                    e[item] = {status:'resolved'}       
                }
            });

            return e;
        },
        link : function(event, eventName){
            var self = this;
            var en = eventName.split(':');
            event(function(e){
                self.get(en[0]).trigger(en[1],e);
                //console.log('Linking',e,en)
            });
            return this;
        },
        Instances : function(){
            var instances = [];
            for(var name in this._factories){
                instances.push(name)
            }

            return instances;
        },
        is : function(eventName){
            var en = eventName.split(':');
            return this.get(en[0]).isUnique(en[1])|| false;
        }
    }
});

Class( Samarium , 'StateFactory').includes(CustomEventSupport)({
    prototype: {
        _events : {},
        _name : '',
        init : function(name){
            this._events = {};
            this._name = name || '';
        },
        unique : function(eventName,data){
            this.addEvent(eventName);
            this.setAsUnique(eventName);
            this.dispatch(eventName,data);         
        },
        trigger : function(eventName,data){
            this.addEvent(eventName);
            this.dispatch(eventName,data);
        },
        addEvent : function(eventName){
            if( !this._events[eventName]){
                this._events[eventName] = {
                    isUnique : false,
                    times : 0
                }
            }else{
                this._events[eventName].times++;
            }
        },
        setAsUnique : function(eventName){
            this._events[eventName].isUnique = true;
        },
        isUnique : function(eventName){
            return this._events[eventName] && this._events[eventName].isUnique;
        },
        status : function(){
            return $.extend(true, {}, this._events);
        }
    }
})


/*
var Radium = {};

Radium.StateMachine = Class(Radium, 'State').includes(CustomEventSupport)({
    states : {},
    prototype: {    
        status : 'First state',
        bindings : {},
        init: function(config) {
            var stateMachine = this;
            _.each(config.states,function(f,stateName){
                stateMachine[stateName] = function(data){
                    f(data);
                    stateMachine.trigger(stateName);
                    stateMachine.status = stateName;
                };
                stateMachine['after' + stateName] = function(callback){
                    stateMachine.bind(stateName,function(){
                        callback();
                    });
                }
            });

            _.each(config.bindings,function(bindTo,bindingName){
                if($.isArray(bindTo)){
                    console.log('binding to several events');
                    _.each(bindTo,function(item){
                        console.log(item);
                    });
                }else{
                    bindTo(function(){
                        stateMachine[bindingName]();
                    });
                }
            });
        }
    }
});

Radium.State = Class(Radium, 'State').includes(CustomEventSupport)({
    waitingFor: '__waiting_for',
    prototype: {
        _req_queue: [],
        _req_in: {},
        _push_queue: [],
        _push_in: {},
        init: function(config) {
            this.requirements = config.requirements || [];
            this.code = config.code;
            this.name = config.name;
            this.handleRequirements();
        },
        toString: function() {
            return "STATE(" + this.name + ")";
        },
        waitFor: function() {
            var state = this;
            var args = Array.prototype.slice.call(arguments);
            var returnFunction = args.pop();
            var waitForStates = args;
            var queue = waitForStates.slice(0);
            _(waitForStates).each(function(wait){
                state._push_queue.push(wait);
                console.log("Binding promise", wait);
                wait.bind('complete', function(event) {
                    console.log("Receiving promise", wait, "with", event);
                    var result = event.result;
                    var index = _(queue).indexOf(wait);
                    queue.splice(index, 1);
                    state._push_in[wait] = result;
                    if(queue.length === 0) {
                        var sortedResults = _(waitForStates).map(function(k) { return state._push_in[k] });
                        console.log("Will apply promises, with", sortedResults );
                        var totalResult = returnFunction.apply(state, sortedResults);
                        state.dispatch('complete', { result : totalResult });
                    }
                })
            });
            return this.constructor.waitingFor;
        },
        handleRequirements: function() {
            var state = this;
            var queue = this.requirements.slice(0);
            _(this.requirements).each(function(req) {
                state._req_queue.push(req);
                req.bind('complete', function(event) {
                    console.log("Met requirement", req, "with result", event);
                    var result = event.result;
                    var index = _(queue).indexOf(req);
                    queue.splice(index, 1);
                    state._req_in[req] = result;
                    if(queue.length === 0) {
                        var sortedResults = _(state.requirements).map(function(k) { return state._req_in[k] });
                        state.code.apply(state, sortedResults);
                    }
                });
            });
        },
        runCode: function(args){
            var result = this.code(args);
            // var result = this.code.apply(this, this._req_in);
            if(result !== this.constructor.waitingFor) {
                this.dispatch('complete', { result : result });
            }
        },
        start: function() {
            this.code.apply(this, arguments);
        }
    }
});
*/