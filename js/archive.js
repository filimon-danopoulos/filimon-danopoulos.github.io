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
            helpers = new Helpers(this);
        };
        
        Handler.prototype.init = function() {o
            initSearchFormHandlers.call(this);
        };
        
        Handler.prototype.filterByTopic = function(text) {
            var topics;
            topics = text.replace(/ /g, '').split(',');
            $.makeArray($('.archive-entry > .archive-entry-topics'))
                .filter(function(element) {
                    return $(element).text()
                        .replace(/ /g, '')
                        .split(',')
                        .every(function(topic) {
                            return topics.indexOf(topic) === -1;
                        });
                }).forEach(function(element) {
                    $(element).parent().hide();
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
