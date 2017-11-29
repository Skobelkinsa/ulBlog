/**
 * Created by mann-aa on 22.09.2016.
 */
function tblExpa(el) {
    function showHideText(title) {
        var $row = title.parentNode;
        var $circle = $row.querySelectorAll('.circle-project');
        var $text = $row.querySelectorAll('.view-project__item');

        for(var i = 0; i < $circle.length; i++){
            //$circle[i].classList.toggle('is-hidden');
            $text[i].classList.toggle('is-visible');
        }

    }

    function showHideTextCircle(el) {
        el.querySelector('.view-project__item').classList.toggle('is-visible');
    }

    var $rowtitles = el.querySelectorAll('.js-expa-title');

    for(var i = 0; i < $rowtitles.length; i++){
        $rowtitles[i].addEventListener('mouseenter', function () {
            showHideText(this);
        });

        $rowtitles[i].addEventListener('mouseleave', function () {
            showHideText(this);
        })
    }

    var $circle = el.querySelectorAll('.tbl-expa__cell');

    for(var i = 0; i < $circle.length; i++){
        $circle[i].addEventListener('mouseenter', function () {
            showHideTextCircle(this);
        });

        $circle[i].addEventListener('mouseleave', function () {
            showHideTextCircle(this);
        })
    }
}