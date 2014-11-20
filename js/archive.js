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
        
        Handler.prototype.init = function() {
            initSearchFormHandlers.call(this);
        };
        
        Handler.prototype.filterByTopic = function(text) {
            var topics;
            if (text === "") {
                $('.archive-entry').removeClass('archive-topics-hidden')
                return;
            }
            topics = text.replace(/ /g, '').split(',');
            $('.archive-entry > .archive-entry-topics')
                .filter(function() {
                    var element = $(this);
                    return $(element).text()
                        .replace(/ /g, '')
                        .split(',')
                        .every(function(topic) {
                            return topics.indexOf(topic) === -1;
                        });
                }).each(function() {
                    $(this).parent().addClass('archive-topics-hidden');
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
