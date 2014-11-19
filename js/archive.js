(function() {
    "use strict";
    var Handler, Helpers;
    
    Helpers = (function() {
        var throttleState;
        function Helpers(scope) {
            this.scope = scope;
        }
        
        Helpers.prototype.throttle = function(callback) {
            var self = this;
            return function() {
                var args = [].slice(arguments);
                if (throttleState) {
                    window.clearInterval(throttleState);
                }
                throttleState = window.setTimeout(function() {
                    callback.apply(self.scope, args)
                }, 300);
            };
        }; 
        
        return Helpers;
    })();
    
    Handler = (function() {
        var getArchiveData, initSearchFormHandlers, helpers, filterByTopic;
        
        function Handler() {
            this.index = {};
            helpers = new Helpers(this);
        };
        
        Handler.prototype.init = function() {
            getArchiveData.call(this);
            initSearchFormHandlers.call(this);
        };
        
        Handler.prototype.filterByTopic = function(text) {
            var topics;
            topics = text.replace(/ /g, '').split(',');
            this.index.archive.entries
                .filter(function(entry) {
                    return entry.topics.some(function(topic) {
                        return topics.indexOf(topic) === -1;
                    });
                }).map(function(entry) {
                    return entry.id;
                }).forEach(function(id) {
                    $('#'+id).hide();
                });
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
            topicInput.on('keyup', helpers.throttle(function(e) {
                var text = topicInput.val();
                this.filterByTopic(text)
            }));
        };
        
        
        return Handler;
    })();
    
    
    $(document).ready(function() {
        var handler = new Handler();
        handler.init();
    });
})();
