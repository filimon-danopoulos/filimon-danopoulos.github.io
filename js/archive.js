(function() {
    var Handler = (function() {
        "use strict";
        var getArchiveData, initSearchFormHandlers, throttle, throttleState;
    
        function Handler() {
            this.index = {};
        };
        
        Handler.prototype.init = function() {
            getArchiveData.call(this);
            initSearchFormHandlers.call(this);
        };
        
        getArchiveData = function() {
            $.get("/archive/index.json")
            .done(function(data) {
                this.index = data;
            })
            .fail(function() {
                alert("Could not load archive data!");
            });
        };
        
        initSearchFormHandlers = function() {
            var topicInput;
            topicInput = $('#topic-input');
            topicInput.on('keyup', throttle.call(this, function(e) {
                var text = topicInput.text();
                alert(text)
            }));
        };
        
        throttle = function(callback) {
            var self = this;
            return function() {
                var args = [].slice(arguments);
                if (throttleState) {
                    window.clearInterval(throttleState);
                }
                throttleState window.setTimeout(function() {
                    callback.apply(self, args)
                }, 300);
            };
        };
        
        return Handler;
    })();
    
    
    $(document).ready(function() {
        var handler = new Handler();
        handler.init();
    });
})();
