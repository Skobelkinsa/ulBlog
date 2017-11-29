$(document).ready(function(){

    if ($('.block_rings').length)
    {
        var WindowWidth = $(window).width();
        var WindowHeight = $(window).height();

        if (WindowWidth <= 767)
            $('.block_rings').css('display', 'none');
        else
        {
            /// START ANIMATION
            $('.ring-container.ring-1 .ring-dash')[0].classList.add("running");
            $('.ring-container.ring-5 .ring-dash')[0].classList.add("running");
            setTimeout(function(){
                $('.ring-container.ring-2 .ring-dash')[0].classList.add("running");
                setTimeout(function(){
                    $('.ring-container.ring-3 .ring-dash')[0].classList.add("running");
                }, 2500);
            }, 1000);
            setTimeout(function(){
                $('.ring-container.ring-4 .ring-dash')[0].classList.add("running");
            }, 5000);

            $('.circle-inner-1').animate({ 'opacity' : 1}, 300, function(){
                $('.circle-inner-0').animate({ 'opacity' : 1}, 300);
                $('.circle-inner-2').animate({ 'opacity' : 1}, 300, function(){
                    $('.circle-inner-3').animate({ 'opacity' : 1}, 300, function(){
                        $('.circle-inner-4').animate({ 'opacity' : 1}, 300, function(){
                            $('.circle-inner-5').animate({ 'opacity' : 1}, 300);
                            $('.icon-1').animate({ 'opacity' : 1}, 300);
                            $('.icon-2').animate({ 'opacity' : 1}, 300);
                            $('.icon-3').animate({ 'opacity' : 1}, 300, function(){

                                $('.circle-outer-0').animate({ 'opacity' : 1}, 300);
                                $('.circle-outer-1').animate({ 'opacity' : 1}, 300);
                                $('.circle-outer-2').animate({ 'opacity' : 1}, 300);
                                $('.circle-outer-3').animate({ 'opacity' : 1}, 300);
                                $('.circle-outer-4').animate({ 'opacity' : 1}, 300);
                                $('.circle-outer-5').animate({ 'opacity' : 1}, 300);
                                $('.circle-outer-6').animate({ 'opacity' : 1}, 300);
                                $('.circle-outer-7').animate({ 'opacity' : 1}, 300);
                                $('.circle-outer-8').animate({ 'opacity' : 1}, 300);

                                $('.icon-4').animate({ 'opacity' : 1}, 300);
                                $('.icon-5').animate({ 'opacity' : 1}, 300);
                                $('.icon-6').animate({ 'opacity' : 1}, 300);

                            });
                        });
                    });
                });
            });

            /// HOVER ANIMATION
            $('.border-1').hover(function(e){
                $('.marker-1').addClass('visible');

                $('.marker-line-hover-1')[0].addEventListener("animationend", function(){
                    $('.marker-line-hover-2')[0].classList.add("running");
                }, false);
                $('.marker-line-hover-1')[0].addEventListener("webkitAnimationEnd", function(){
                    $('.marker-line-hover-2')[0].classList.add("running");
                }, false);
                $('.marker-line-hover-2')[0].addEventListener("animationend", function(){
                    $('.marker-circle-1').addClass('visible');
                }, false);
                $('.marker-line-hover-2')[0].addEventListener("webkitAnimationEnd", function(){
                    $('.marker-circle-1').addClass('visible');
                }, false);

                $('.marker-line-hover-1')[0].classList.add("running");

            }, function(e){
                $('.marker-1').removeClass('visible');
                $('.marker-line-hover-1')[0].classList.remove("running");
                $('.marker-line-hover-2')[0].classList.remove("running");
                $('.marker-circle-1').removeClass('visible');
            });

            $('.border-2').hover(function(e){
                $('.marker-2').addClass('visible');

                $('.marker-line-hover-3')[0].addEventListener("animationend", function(){
                    $('.marker-circle-2').addClass('visible');
                }, false);
                $('.marker-line-hover-3')[0].addEventListener("webkitAnimationEnd", function(){
                    $('.marker-circle-2').addClass('visible');
                }, false);

                $('.marker-line-hover-3')[0].classList.add("running");

            }, function(e){
                $('.marker-2').removeClass('visible');
                $('.marker-line-hover-3')[0].classList.remove("running");
                $('.marker-circle-2').removeClass('visible');
            });

        }
    }
});

function DegressToRadians (Angle) {
    return Angle *180 / Math.PI;
}