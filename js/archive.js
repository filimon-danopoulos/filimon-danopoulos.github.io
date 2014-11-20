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
        
        // This method is quite in-effective might cause an issue with many posts.
        Handler.prototype.filterByTopic = function(text) {
            var topics;
            $('.archive-entry').removeClass('archive-topics-hidden')
            if (text === "") {
                return;
            }
            var inputTopics = text.toLowerCase().replace(/ /g, '').split(',');
            $('.archive-entry > .archive-entry-topics')
                .filter(function() {
                    var element = $(this),
                        topics = $(element).text().toLowerCase().replace(/ /g, '');
                        
                    return inputTopics.every(function(inputTopic) {
                        return topics.indexOf(inputTopic) === -1;
                    })
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
