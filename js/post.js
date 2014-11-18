$(document).ready(function() {
    $('.back-link').on('click', function(e) {
        history.go(-1);
        e.prevenDefault();
        return false;
    });
});
