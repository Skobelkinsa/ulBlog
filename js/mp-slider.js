'use strict';

var transitionEnd = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';

var maskSlider = function () {
    var func = this;
    func.first_init = true;

    func.classnames = {
        'slider': 'v-scroll',
        'slide': 'v-scroll-item',
        'active_slide': 'active-slide',
        'active_bg': 'is-bg-visible',
        'content': 'v-scroll-content',
        'arrow': 'v-scroll-arrow'
    };

    func.showSlideBackground = function (slide) {
        var id = '#bg-' + slide.data('slide');

        $(id).addClass(func.classnames.active_bg)
            .siblings('.' + func.classnames.active_bg)
            .removeClass(func.classnames.active_bg);
    };

    func.zLevels = function (action, slide) {
        var level;
        var $slide = slide || $('.active-slide').eq(0);
        var $n_slide;

        $slide.css('z-index', func.slides_num + 1);

        switch (action) {
            case 'init':
                func.slides.each(function (i) {
                    level = func.slides_num - i;
                    $(this).css('z-index', level).data('z-level', level);
                });
                break;

            case 'up':
                $slide.nextAll('.v-scroll-item').css('z-index', '1');
                $n_slide = $slide.next('.v-scroll-item');
                $n_slide.css('z-index', func.slides_num);
                break;

            case 'down':
                $slide.prevAll('.v-scroll-item').css('z-index', '1');
                $n_slide = $slide.prev('.v-scroll-item');
                $n_slide.css('z-index', func.slides_num);
                break;
        }

    };

    func.changeSlidesStates = function (direction, n_slide) {
        var $slide = $('.' + func.classnames.active_slide).eq(0);
        var $n_slide = n_slide;

        switch (direction) {
            case 'up':

                if (!$n_slide) {
                    $n_slide = $slide.prev('.' + func.classnames.slide + ':visible');
                }


                if (!$n_slide.length) {

                    if (parseInt($slide.attr('data-i')) !== 0) {
                        $n_slide = $slide.prevUntil('.' + func.classnames.slide + ':visible').prev('.' + func.classnames.slide).last();
                    } else {
                        return false;
                    }
                }

                $n_slide.addClass(func.classnames.active_slide);
                $slide.removeClass(func.classnames.active_slide);

                break;

            case 'down':
                if (!$n_slide) {
                    $n_slide = $slide.next('.' + func.classnames.slide + ':visible');
                }

                if (!$n_slide.length) {
                    if (parseInt($slide.attr('data-i')) !== func.slides_num - 1) {
                        $n_slide = $slide.nextUntil('.' + func.classnames.slide + ':visible').next('.' + func.classnames.slide).last();
                    } else {
                        return false;
                    }
                }

                $n_slide.addClass(func.classnames.active_slide);
                $slide.removeClass(func.classnames.active_slide);
                break;
        }
        func.showSlideBackground($n_slide);
        animateSlideContent($n_slide, $slide);

        return $n_slide;
    };

    func.slidesInit = function () {
        var dir,
            $n_slide,
            $slider = $('#main-page-slider');

        //коллекция элементов с фонами слайдов
        var $bg_slider = $('<div id="bg-main" class="bg-main"></div>');

        $bg_slider.insertBefore($slider);

        func.animationEndFlag = true;
        func.allSlides = $('.' + func.classnames.slide);
        func.slides = func.allSlides.filter(':visible');

        var $slide_item, slide_name;

        func.allSlides.each(function () {
            slide_name = $(this).data('slide');

            //создаются элементы с id и class из атрибута data-slide
            //к имени класса в стилях назначено фоновое изображение
            //по id будет выбираться элемент при смене слайда
            $bg_slider.append($('<div id="bg-' + slide_name + '" class="bg-main__item bg-main-' + slide_name + '"></div>'));
        });

        func.slides.each(function (i) {
            $slide_item = $(this);
            slide_name = $slide_item.data('slide');

            $slide_item.attr('data-i', i)
                .removeClass(func.classnames.active_slide)
                .css('z-index', '');
        });


        func.slides_num = func.slides.length;
        func.slides.eq(0).addClass(func.classnames.active_slide).css('z-index', func.slides_num + 1);
        func.slides.eq(1).css('z-index', func.slides_num);

        func.showSlideBackground(func.slides.eq(0));

        //init pagination
        var pag = new func.setPagination();
        pag.update(0);

        //add click event
        //var $arrow = $slider.children('.' + func.classnames.arrow).eq(0);
        var $arrow = $('.' + func.classnames.arrow);
        //$arrow.attr('data-dir', 'down');

        $arrow.on('animationend', function (e) {
            switch (e.originalEvent.animationName) {
                case 'v-scroll-arrow':
                    $arrow.removeClass('main-slider-intro-animation');
                    $arrow.addClass('is-intro');
                    break;
            }
        });

        func.setArrowDirection = function (el, pos) {
            var dir;
            
            if (pos.first) {
                /*dir = 'down';*/
                //$arrow.filter('.is-dir-up').addClass('hidden');
                $arrow.parents('.arrov-container').removeClass('bottom').addClass('top');
            }
            else if (pos.last) {
                /*dir = 'up';*/
                //$arrow.filter(':not(.is-dir-up)').addClass('hidden');
                $arrow.parents('.arrov-container').removeClass('top').addClass('bottom');
            }
            else {
                $arrow.parents('.arrov-container').removeClass('bottom').removeClass('top');
            }
                
        };

        function setArrowEvents() {
		gtag('event', 'flip', {
	'event_category': 'slider-mainpage',
	'event_label': 'arrow',
});
        var _this = $(this);
            dir = _this.attr('data-dir');

            if (!func.animationEndFlag) {
                return false;
            }

            $n_slide = func.changeSlidesStates(dir);

            if (!$n_slide) {
                return false;
            }

            func.zLevels(dir, $n_slide);
            var pag_pos = pag.update($n_slide.attr('data-i'));

            func.setArrowDirection(_this, pag_pos);
	
        }

        $arrow.on('click', setArrowEvents);

        //set mouse wheel events

        $slider.off('wheel');

        var wheelcounter = (function() {
            var count = 0;
            return function(amount) {
                return count+=amount;
            }
        }());

        var timeout = null;
        var speed = 200; //ms
        var canScroll = true;
        $('body').on('wheel', function (event) {
			gtag('event', 'flip', {
				'event_category': 'slider-mainpage',
				'event_label': 'scroll',
			});            
			event.preventDefault();
            // Timeout active? do nothing
            if (timeout !== null) {
                return false;
            }

            var wheel_delta = Math.abs(event.originalEvent.deltaY);

            if (!func.animationEndFlag) {
                return false;
            }

            //if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            if (event.originalEvent.deltaY < 0) {
                // scroll up
                dir = 'up';
            }
            else {
                // scroll down
                dir = 'down';
            }


            if(wheelcounter(wheel_delta) < wheel_delta * 4){
                return false;
            }else{
                wheelcounter(wheelcounter(wheel_delta * -1));
            }


            $n_slide = func.changeSlidesStates(dir);

            wheelcounter(0);

            if (!$n_slide) {
                return false;
            }

            func.zLevels(dir, $n_slide);
            var pag_pos = pag.update($n_slide.attr('data-i'));
            func.setArrowDirection($arrow, pag_pos);

            if (canScroll) {
                timeout = setTimeout(function(){timeout = null;}, speed);
                event.preventDefault();
                return false;
            }
        });

        //add swipe events

        var mc = new Hammer($slider[0]);
        mc.get('swipe').set({
            direction: Hammer.DIRECTION_VERTICAL,
            threshold : 15,
            velocity: 0.3
        });

        mc.on("swipeup swipedown", function (ev) {

            switch (ev.type) {
                case 'swipeup':
                    dir = 'down';
                    break;

                case 'swipedown':
                    dir = 'up';
                    break;
            }

            $n_slide = func.changeSlidesStates(dir);

            if (!$n_slide) {
                return false;
            }

            func.zLevels(dir, $n_slide);
            var pag_pos = pag.update($n_slide.attr('data-i'));
            func.setArrowDirection($arrow, pag_pos);
        });

        function setPaginationEvents() {
gtag('event', 'flip', {
	'event_category': 'slider-mainpage',
	'event_label': 'circle'
});
            var point = $(this);

            function findDirection(el) {
                var prev = el.prevAll().filter('.is-current');
                var next = el.nextAll().filter('.is-current');

                if (prev.length) {
                    prev.removeClass('is-current');
                    return 'down';
                }

                if (next.length) {
                    next.removeClass('is-current');
                    return 'up';
                }
            }

            var dir = findDirection(point);
            point.addClass('is-current');


            $n_slide = $slider.children('[data-i="' + point.index() + '"]');
            $n_slide = func.changeSlidesStates(dir, $n_slide);

            if (!$n_slide) {
                return false;
            }

            func.zLevels(dir, $n_slide);
            var pag_pos = pag.update($n_slide.attr('data-i'));
            func.setArrowDirection($arrow, pag_pos);
        }

        for (var i = 0; i < pag.points.length; i++) {
            $(pag.points[i]).on('click', setPaginationEvents);
        }

        return {
            'bg': $bg_slider
        }
    };

    func.setPagination = function () {
        var pag = this;
        var $slider = $('.' + func.classnames.slider).eq(0);
        var $pagwrapper = $('#v-scroll-pag');

        if ($pagwrapper.length) {
            $pagwrapper.empty();
        } else {
            $pagwrapper = $('<div id="v-scroll-pag" class="v-scroll-pag main-slider-intro-animation"></div>');
            $pagwrapper.appendTo($slider);
        }

        var i, item;

        for (i = 0; i < func.slides_num; i++) {
            item = $('<div class="v-scroll-pag__item"></div>');
            item.appendTo($pagwrapper);
        }

        pag.update = function (index) {
            var $items = $pagwrapper.children();
            var $current = $items.eq(index);

            $items.removeClass('is-current');
            $current.addClass('is-current');

            return {
                'first': $current.is(':first-child'),
                'last': $current.is(':last-child')
            };
        };

        return {
            'update': pag.update,
            'points': $pagwrapper.children()
        }
    };

    function animateSlideContent(n_slide, slide) {
        var anim_class = 'main-block-animation';
        var content_class = 'main';

        n_slide.find('.' + content_class).addClass(anim_class);
        slide.find('.' + content_class).removeClass(anim_class);
        var circle_box = slide.find('.slider-circles-box');
        var n_circle_box = n_slide.find('.slider-circles-box');

        if (circle_box.length && circle_box[0].d3instance !== undefined) {
            circle_box[0].d3instance.resetCirclesPos();
        }

        if (n_circle_box.length && n_circle_box[0].d3instance !== undefined) {
            n_circle_box[0].d3instance.restartSimulation();
        }
    }
};
