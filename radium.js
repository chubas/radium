Radium = {};
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