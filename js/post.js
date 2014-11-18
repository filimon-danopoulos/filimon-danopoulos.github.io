$(document).ready(function() {
    $('.back-button').on('click', function(e) {
        history.go(-1);
        e.prevenDefault();
        return false;
    });
});
