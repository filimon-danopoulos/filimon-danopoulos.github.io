(function() {
    var Handler = (function() {
        var getArchiveData;
    
        function Handler() {
            this.index = {};
        };
        
        Handler.prototype.init = function() {
            getArchiveData.call(this);
        };
        
        getArchiveData = function() {
            $.get("/archive/index.json")
            .done(function(data) {
                alert("Loaded data: "+data);
                this.index = JSON.parse(data);
            })
            .fail(function() {
                alert("Could not load archive data!");
            });
        }
        
    })();
    
    
    $(document).ready(function() {
        var handler = new Handler();
        handler.init();
    });
})();
