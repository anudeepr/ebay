/**
 * Created by Rentala on 13-10-2016.
 */
var logEvent = function (e, text) {
    $.ajax({
        method: "POST",
        url: "/log",
        data: { event: e, text: text }
    }).done(function(res) {
            console.log(res)
    });

}
$(function () {
    $("body").on("click", "a" , function(e) {
        logEvent(e.target.innerText + " link", "Id: " + e.target.id +" link clicked "+ e.target.href)
    });
    $("body").on("click", "button" , function(e) {
        logEvent(e.target.innerText + " button", "Id: " + e.target.id +" form action "+ e.target.formAction + " form method" +e.target.formMethod )
    });
    $("body").on("click", "input" , function(e) {
        logEvent(e.target.innerText + " button", "Id: " + e.target.id +" form action "+ e.target.formAction + " form method" +e.target.formMethod )
    });
})
