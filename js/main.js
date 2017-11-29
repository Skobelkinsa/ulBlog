'use strict';

function appendCSSLink(link) {
    var cssbasepath = document.getElementById('allcss');

    if (!cssbasepath) {
        throw new Error('all.css not found');
    }

    cssbasepath = cssbasepath.href;
    cssbasepath = cssbasepath.substr(0, cssbasepath.lastIndexOf('/') + 1);

    for (var i = 0; i < link.length; i++) {
        var newlink = document.createElement('link');
        newlink.href = cssbasepath + link[i];
        newlink.type = "text/css";
        newlink.rel = "stylesheet";

        document.getElementsByTagName('head')[0].appendChild(newlink);
    }
}

function moduleMainPage() {
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function hideNewsBlock() {
        var news = document.querySelectorAll('.js-main-news');

        if (!news) {
            return false;
        }

        var close;

        for (var i = 0; i < news.length; i++) {
            close = news[i].querySelector('.news__close');
            close.addEventListener('click', function () {
                closeCross();
            });
        }

        function closeCross() {
            for (var i = 0; i < news.length; i++) {
                news[i].classList.add('is-news-hide');
            }
        }
    }

    var $slider = document.getElementById('main-page-slider');

    if (!$slider) {
        return false;
    }

    var bg_set_class = 'slider-bg-set-';

    //$slider.classList.add(bg_set_class+getRandomInt(1,3));

    //appendCSSLink(['content-slider.css','main-page.css']);

    script(['hammer.min.js', 'mp-slider.js?v=2'], 'mp-slider');

    script.ready('mp-slider', function () {
        var ms = new maskSlider();
        var $slider_bg = ms.slidesInit();
        $slider_bg.bg[0].classList.add(bg_set_class + getRandomInt(1, 3));
        hideNewsBlock()
    });
}

function desctopPageHeader() {
    var MainHeader = $('#page-header');

    if (!MainHeader.length) {
        return false;
    }

    var $window = $(window);

    MainHeader.removeClass('header-fixed');

    function headerScroll(el) {
        if (el.scrollTop() > 5) {
            MainHeader.addClass('header-fixed').fadeIn('fast');
        } else {
            MainHeader.removeClass('header-fixed').fadeIn('fast');
        }
    }

    $window.on('scroll', function () {
        headerScroll($(this));
    });

    headerScroll($window);
}

function initSwiper() {
    if ($('#swiper-community').length) {
        var swiperCommunity = new Swiper('#swiper-community', {
            slidesPerView: 3,
            breakpoints: {
                360: {
                    slidesPerView: 1.2
                },
                480: {
                    slidesPerView: 1.5
                },
                767: {
                    slidesPerView: 2.5
                },
                768: {
                    slidesPerView: 3
                }
            }
        });
    }

    if ($('#swiper-conf').length) {
        var swiperConf = new Swiper('#swiper-conf', {
            slidesPerView: 'auto',
            loop: true,
            loopedSlides: 9,
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev'
        });
    }

    if ($('#swiper-sec-page').length) {
        var swiperSecPage = new Swiper('#swiper-sec-page', {
            slidesPerView: 'auto',
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev'
        });
    }

    var $galSwiper = $('#swiper-gallery');
    if ($galSwiper.length) {
        var screenWidth = $(window).width();

        galleryPack($galSwiper, screenWidth);

        var swiperGalSettings = {
            loop: true,
            slidesPerView: 1,
            pagination: '.swiper-pagination',
            paginationClickable: true,
            spaceBetween: 30,
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev'
        };

        var swiperGallery = new Swiper($galSwiper, swiperGalSettings);
    }

    function galleryPack(swiper, screenWidth) {
        var container = swiper.find('.gallery').eq(0);

        if (screenWidth >= 768) {
            swiper.addClass('galbig');
            container.prepend(createSlide(container));

            while (container.children('.swiper-slide').last().next().length > 0) {
                container.append(createSlide(container));
            }
        } else {
            swiper.addClass('galmin');
            container.children().wrap('<div class="swiper-slide"></div>');
        }

        function createSlide(container) {
            var pack = container.children('.gallery__item').slice(0, 5);
            var slide = $('<div class="swiper-slide"></div>');
            pack.appendTo(slide);
            return slide;
        }
    }

    function initGallery(screenWidth, swiperGallery, swiperElem, settings) {
        if (!swiperGallery) {
            return false;
        }

        var swiper = $(swiperGallery.container);

        var wrapper = $(swiperGallery.wrapper);

        if (screenWidth < 768 && swiper.hasClass('galbig')) {
            swiper.removeClass('galbig').addClass('galmin');
            swiperGallery.destroy(true, true);
        } else if (screenWidth >= 768 && swiper.hasClass('galmin')) {
            swiper.removeClass('galmin').addClass('galbig');
            swiperGallery.destroy(true, true);
        }

        resetGallery();

        function resetGallery() {
            swiperElem.find('.swiper-slide-duplicate').remove();
            swiperElem.find('.gallery__item').appendTo(wrapper);
            swiperElem.find('.swiper-slide').remove();

            galleryPack(swiperElem, screenWidth);

            var new_settings = {
                onSlideChangeEnd: function (swiper) {
                    swiper.updateProgress();
                    swiper.updatePagination();
                    swiper.updateClasses();

                    $(swiper.paginationContainer)
                        .children().eq(swiper.activeIndex)
                        .addClass(swiper.bulletActiveClass)
                        .siblings()
                        .removeClass(swiper.bulletActiveClass);
                }
            };

            swiperGallery = new Swiper(swiperElem, $.extend(settings, new_settings));

            //swiperGallery.update();
        }
    }


    var contentSwiper;

    function initContentSwiper() {
        var screenWidth = $(window).width();
        if (screenWidth > 479 && screenWidth < 768 && contentSwiper == undefined) {
            contentSwiper = new Swiper('.js-swiperblock', {
                slidesPerView: 3,
                spaceBetween: 15,

                breakpoints: {
                    360: {
                        slidesPerView: 1.2
                    },
                    767: {
                        slidesPerView: 1.5
                    }
                }
            });
        } else if ((screenWidth < 480 || screenWidth > 768) && contentSwiper != undefined) {
            // mySwiper.destroy(true, true);
            contentSwiper = undefined;
            $('.swiper-wrapper').removeAttr('style');
            $('.swiper-slide').removeAttr('style');
        }
    }

    initContentSwiper();

    var swiper3items = $('.js-swiper3items');

    if (swiper3items.length) {
        var arr3items = [];

        swiper3items.each(function (index) {
            arr3items[index] = new Swiper($(this), {
                loop: true,
                slidesPerView: 3,

                nextButton: '.swiper-button-next',
                prevButton: '.swiper-button-prev',

                breakpoints: {
                    480: {
                        slidesPerView: 1
                    }
                }
            })
        });
    }
    /*if ($('.js-swiper3items').length) {
        var swiper3items = new Swiper('.js-swiper3items', {
            slidesPerView: 'auto',
            loop: true,
            loopedSlides: 5,
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev'
        });
    }*/

    // function on_resize(c,t){onresize=function(){clearTimeout(t);t=setTimeout(c,50)};return c};
    //
    // on_resize(function() {
    //     initGallery($(this).width(), swiperGallery, $galSwiper, swiperGalSettings);
    // });

    $(window).on('resize', function () {
        initContentSwiper();
        initGallery($(this).width(), swiperGallery, $galSwiper, swiperGalSettings);
    });
}

function cycleMethodology() {
    var $mtdblock = document.getElementById('mtd-tbl');

    if (!$mtdblock) {
        //throw new Error('id mtd-tbl not found');
        return false;
    }

    script('cycle-methodology.js', 'cycle-methodology');

    script.ready('cycle-methodology', function () {
        MethodologyInteractive($mtdblock);
    })
}

function contactsMap() {
    var $contacts_map = document.getElementById('map');

    if ($contacts_map) {
        script('https://api-maps.yandex.ru/2.1/?lang=ru_RU', 'yamap');

        script.ready('yamap', function () {
            ymaps.ready(init);
            var myMap;

            function init() {
                myMap = new ymaps.Map("map", {
                    center: [55.807273, 37.629502],
                    zoom: 16,
                    controls: []
                });

                var myPlacemark = new ymaps.Placemark([55.807050, 37.630000], {
                        hintContent: 'ул. Годовикова, д.9, стр.12',
                        balloonContent: 'Офис компании USABILITYLAB'
                    },
                    {preset: 'islands#redIcon'}
                );

                myMap.geoObjects.add(myPlacemark);
            }
        });
    }
}

function sendAjaxForm(subject) {

    var classes = {
        'valid_state': 'is-valid',
        'invalid_state': 'is-invalid',
        'valid': 'field-wrap_valid',
        'invalid': 'field-wrap_invalid',
        'filled_state': 'is-filled',
        'message_elem': 'field-message'
    };

    var error_message = {
        'empty': 'Введите информацию',
        'email': 'Неправильный адрес',
        'phone': 'Неправильный телефон'
    };

    function findWrapper(el) {
        return el.parents('.field-wrap');
    }

    function checkIsEmpty(field) {
        return !field.val();
    }

    function checkIsContacts(field) {
        var val = field.val();

        var res = {};
        var phone_test = !/[^\d\s()-]/.test(val);
        var mail_test = /.+@.+\..+/.test(val);
        // console.log('phone '+phone_test);
        // console.log('mail '+mail_test);

        if (!phone_test && !mail_test) {
            res.type = 'string';
            res.valid = phone_test;
        } else if (!!phone_test && !mail_test) {
            res.type = 'phone';
            res.valid = phone_test;
        } else if (!phone_test && !!mail_test) {
            res.type = 'email';
            res.valid = mail_test;
        }

        // console.log('validate '+res.valid);
        // console.log('type '+res.type);
        return res;
    }

    function setErrorMessage(el, message) {
        el.find('.' + classes.message_elem).remove();
        $('<div class="' + classes.message_elem + '">' + message + '</div>').appendTo(el);
    }

    function addFieldState(field, state, message) {
        switch (state) {
            case 'valid':
                field.addClass(classes.valid_state);
                findWrapper(field).addClass(classes.valid);
                break;
            case 'invalid':
                field.addClass(classes.invalid_state);
                var wrap = findWrapper(field).addClass(classes.invalid);
                if (message) {
                    setErrorMessage(wrap, message);
                }
                break;
            case 'clear':
                //console.log(field);
                    field.removeClass(classes.invalid_state + ' ' + classes.valid_state + ' ' + classes.filled_state);
                    findWrapper(field)
                        .removeClass(classes.invalid + ' ' + classes.valid)
                        .find('.' + classes.message_elem).remove();
                break;
        }
    }

    function itemValidate(item, timeout) {
        var flag = false;

        if (!checkIsEmpty(item)) {

            if (item.hasClass('js-field-contacts')) {
                var check = checkIsContacts(item);

                if (check.valid === true) {
                    addFieldState(item, 'valid');

                    flag = true;
                } else {
                    switch (check.type) {
                        case 'string':
                        case 'email':
                            addFieldState(item, 'invalid', error_message.email);
                            break;
                        case 'phone':
                            addFieldState(item, 'invalid', error_message.phone);
                            break;
                    }
                }
            } else {
                addFieldState(item, 'valid');
                flag = true;
            }

        } else {
            addFieldState(item, 'invalid', error_message.empty);
        }

        if (timeout && flag===true) {
            setTimeout(function () { 
                addFieldState(item, 'clear');
                //console.log("item timeaut!!!!!!! flag:"+item);
            }, 3000);
        }

        return flag;
    }

    function checkFields(form) {
        var flag = false;
        var fields = form.find('.js-form-field');

        fields.on('blur', function () {

            var $this = $(this);

            flag = itemValidate($this, true);
        });


        fields.on('focus', function () {
            addFieldState($(this), 'clear');
        });

        return flag;
    }

    function showPostResult(form, state, statustxt, num = 1) {
        var error_block = $('#error-block');
        var success_block = $('#success-block');
        var counter = $('#msg-number');

        switch (state) {
            case 'error':
                if (!error_block.length) {
                    alert(statustxt.error);
                    return false;
                }

                error_block.addClass('is-msg-visible');

                break;
            case 'done':
                if (!success_block.length) {
                    alert(statustxt.done);
                    return false;
                }
                counter.text(num);
                success_block.addClass('is-msg-visible');
                break;
            case 'onemore':
                error_block.removeClass('is-msg-visible');
                form.removeClass('is-form-hidden');

                return false;
                break;
        }

        form.addClass('is-form-hidden');
    }

    /**
     * @return {boolean}
     */
    function Send(submitform) {
        var fields = submitform.find('.js-form-field');
        var flag = true;

        fields.each(function () {
            if (!itemValidate($(this))) {
                flag = false;
            }

        });
		var myArr = [];
submitform.find('input').each(function () {
	var $fld = $(this);
	myArr[$fld.attr('name')] = $fld.attr('value')
	//alert ($fld.attr('name')+'->'+$fld.attr('value'));
	if ($fld.attr('name') == 'prj-contact');
	myArr['contact'] = $fld.val();
	});
	//alert (myArr['form_id']);
	//alert (myArr['contact']);
	
	
        if (!flag) return flag;
		
//GA
if (myArr['form_id'] == 'prj-form') {
	gtag('event', 'send-form', {'event_category': 'form', 'event_label': myArr['contact']});
}	
        fields.each(function () {
            addFieldState($(this), 'clear');
        });

        function getFormData() {
            var data = [];
            var data_key, data_val, obj, $field;

            submitform.find('input, textarea').each(function () {
                $field = $(this);

                switch ($field.attr('type').toLowerCase()) {
                    case 'checkbox':
                        if ($field.is(':checked')) {

                        }
                        break;

                    default:
                        data_key = $field.data('name');

                        if (data_key === 'undefined') {
                            data_key = $field.attr('name');
                        }

                        data_val = $field.val();
                        obj = {name: data_key, value: data_val};
                }

                data.push(obj);
            });

            return data;
        }

        $.ajax({
            type: "POST",
            dataType: 'json',
            cache: false,
            url: submitform.attr('action'),
            //data: getFormData(),
            data: submitform.serializeArray(),
            // beforeSend: function () {
            //     console.log('go');
            // },
            error: function () {
                showPostResult(submitform, 'error', form_send_status);
            },
            success: function (msg) {
                switch (msg.result) {
                    case 'error':
                        showPostResult(submitform, msg.result, form_send_status);
                        break;
                    case 'done':
                        showPostResult(submitform, msg.result, form_send_status, msg.number);
                        submitform[0].reset();
                        break;
                }
            }
        });
    }

    var $form = $('.js-ajax-form');

    if (!$form.length) {
        return false;
    }

    $form.find('input[type="hidden"]').map(function () {
        var $this = $(this);
        switch ($this.attr('name')) {
            case 'page_uri':
                $this.attr('value', window.location.href);
                break;
            case 'page_title':
                $this.attr('value', document.title);
                break;
        }
    });

    if (subject) {
        $form.addClass(subject);
        $('<input type="hidden" name="mess_subject" value="' + subject + '" />').prependTo($form);
    }

    checkFields($form);

    $form.on('submit', function (e) {
        e.preventDefault();
        Send($(this));
    });

    var form_send_status = {
        "error": "Произошла ошибка, сообщение не было отправлено. Пожалуйста попробуйте позже или обратитесь к администрации сайта.",
        "done": "Ваше сообщение отправлено"
    };

    $('#btn-onemore-send').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        showPostResult($form, 'onemore', form_send_status);
    })
}

function ajaxMagnificPopup() {

    var $mfp_links = $('.js-mfp');

    if (!$mfp_links.length) {
        return false;
    }

    script('jquery.magnific.min.js', 'magnific');

    script.ready('magnific', function () {

        var mfp_opts = {
            preloader: true,
            type: 'inline',
            closeBtnInside: false,
            showCloseBtn: true,
            fixedContentPos: true,
            fixedBgPos: true,
            closeMarkup: '<div class="mfp-close"></div>',
            callbacks: {
                ajaxContentAdded: function () {
                    if ($(this.content[0]).find('.js-ajax-form').length || $(this.content[0]).hasClass('js-ajax-form')) {
                        var form_title = false;

                        if ($(this.ev).data('subject')) {
                            form_title = $(this.ev).data('subject')
                        }

                        sendAjaxForm(form_title);
                    }
                }
            }
        };

        $mfp_links.on('click', function (e) {
            e.preventDefault();

            var _this = $(this);

            switch ($(this).data('mfp-type')) {
                case 'ajax':
                    mfp_opts.type = 'ajax';
                    break;
            }

            $(this).magnificPopup(mfp_opts);
            $(this).magnificPopup('open');
        });
    });
}

function moduleTblExpiriens() {
    var $tbl = document.getElementById('tbl-expa');

    if (!$tbl) {
        //throw new Error('id mtd-tbl not found');
        return false;
    }

    script('tbl-expa.js', 'tbl-expa');

    script.ready('tbl-expa', function () {
        tblExpa($tbl);
    })
}

function openCloseSideMenu() {
    var open_btn = document.getElementById('open-side-menu');
    var close_btn = document.getElementById('close-side-menu');
    var sidemenu = document.getElementById('side-menu');

    if (!open_btn || !close_btn || !sidemenu) {
        return false;
    }

    open_btn.addEventListener('click', function () {
        sidemenu.classList.add('is-side-menu-open');
        this.classList.add('is-state-close');
    });

    close_btn.addEventListener('click', function () {
        sidemenu.classList.remove('is-side-menu-open');
        open_btn.classList.remove('is-state-close');
    });
}

function showBlocksOnScroll() {
    //var waypoints = document.querySelectorAll('.js-waypoint');
    var waypoints = document.querySelectorAll('.c-block');

    if (!waypoints) {
        return false;
    }

    function createSvg(n, v) {
        n = document.createElementNS("http://www.w3.org/2000/svg", n);

        for (var p in v){
            if (v.hasOwnProperty(p)) {
                n.setAttributeNS(null, p.replace(/[A-Z]/g, function(m, p, o, s) { return "-" + m.toLowerCase(); }), v[p]);
            }
        }
        return n
    }

    script('waypoints.min.js', 'waypoints');

    script.ready('waypoints', function () {
        
        for (var i = 0; i < waypoints.length; i++) {
            console.log(waypoints[i]);
            var waypoint = new Waypoint({
                element: waypoints[i],
                handler: function (direction) {
                    if (direction === 'down') {
                        this.element.classList.add('is-waypoint-visible');
                        if(this.element.querySelector('.circle-title-dash') != null){
                            if($(window).width() >= 767){
                                var svg = this.element.querySelector('.circle-title-dash');
                                svg.classList.toggle('is-running');
                            }
                        }
                    }

                },
                offset: '0%'
            });

            var circle = waypoints[i].querySelector('.js-circle-run');

            if (circle) {
                var svg = createSvg('svg',{
                    version: '1.1',
                    class: 'circle-title-svg',
                    viewBox: '0 0 132 132'
                });

                var circle_bg = createSvg('circle',{
                    class: 'circle-title-bg',
                    r: '64',
                    cx:'65',
                    cy:'65'
                });

                var circle_dash = createSvg('circle',{
                    class: 'circle-title-dash',
                    r: '64',
                    cx:'65',
                    cy:'65'
                });

                svg.appendChild(circle_bg);
                svg.appendChild(circle_dash);
                /*circle.appendChild(svg);

                circle_dash.addEventListener('animationend', function (e) {
                    switch (e.animationName) {
                        case 'circle-dash':
                            this.classList.remove('is-running');
                            break;
                    }
                });

                var circle_waypoint = new Waypoint({
                    element: circle,
                    handler: function (direction) {
                        if (direction == 'up' && $(window).width() >= 767) {
                            var svg = this.element.querySelector('.circle-title-dash');
                            svg.classList.toggle('is-running');
                        }
                    },
                    offset: '0'
                })*/
            }

        }
    })
}

function magnificPopupGallery() {

    var $mfp_gallery = $('#swiper-gallery');

    if (!$mfp_gallery.length) {
        return false;
    }

    script('jquery.magnific.min.js', 'magnific');

    script.ready('magnific', function () {
        $('.gallery').magnificPopup({
            delegate: 'a',
            disableOn: 768,
            type: 'image',
            gallery: {
                enabled: true,
                arrowMarkup: '<div class="mfp-arrow-%dir%"></div>', // markup of an arrow button
            },
            image: {
                markup: '<div class="mfp-figure">' +
                '<div class="mfp-close"></div>' +
                '<div class="mfp-img"></div>' +
                '</div>'
            },
            closeMarkup: '<div class="mfp-close mfp-close_blue"></div>'
        });
    });
}

function methodTabs() {
    var $tabs = $('.js-list-tabs');

    if (!$tabs.length) {
        return false;
    }

    $tabs.each(function () {
        initTabs($(this))
    });

    function initTabs(tabs) {
        var $tab  = tabs.find('.js-tabs').children();

        function setPointerPos(el, parent) {
            var pointer_pos = el.position().top;
            parent.find('.js-pointer').css('top', pointer_pos);
        }

        function findTabBlock(parent, id) {
            return parent.find('[data-id="' + id + '"]');
        }

        function setActiveTab(el){
            el.addClass('is-active')
                .siblings()
                .removeClass('is-active');
        }

        function runTabEvents(el, parent){
            setActiveTab(el);

            var curtab = findTabBlock(parent, el.data('id'));

            setActiveTab(curtab);

            setPointerPos(el, parent);
        }

        $tab.on('click', function () {
            runTabEvents($(this), tabs);
			gtag('event', 'flip', {
	'event_category': 'method-art'});
        });
    }
}

function workedMore() {
    var $worked = $('.worked');
    var $worked_items = $('.worked .grid-col-6');
    var $more = $("#woked-more");
    var visible_item = 16; //количество элементов для показа сразу, остальные скроются

    if (!$worked.length) {
        return false;
    }

    if ($worked_items.length <= visible_item) 
        $more.css('display','none');

    $worked_items.each(function (i, e) {
        if (visible_item - 1 < i) {
            $(e).css('display','none');
        }
    });
    
    $more.data('visible-pages',1);
    $more.on('click', function(){
        var full_pages = Math.ceil($worked_items.length / visible_item);
        
        if($more.data('visible-pages') < full_pages){
            var n = ($more.data('visible-pages') * visible_item);
            var _n = $worked_items.length - n;
            
            for(var i = 0; i < (_n >= visible_item ? visible_item : _n) ;i++){
                $worked_items.eq(n + i).fadeIn();
            }
            
            $more.data('visible-pages',$more.data('visible-pages') + 1);
            
            if(full_pages === $more.data('visible-pages')){
                $(this).text("Вернуть как было");
            }
        }
        else{
            $more.data('visible-pages', 1);
            
            for(var i = $worked_items.length-1; i >= visible_item ;i--){
                $worked_items.eq(i).fadeOut();
            }
            
            $(this).text("Показать все");
        }
        
        //$more.css('display','none');
        //$worked_items.fadeIn();
        return false;
    });
}

function slideRating() {
    var $block = $('.ratings-block .slide.control');

    if (!$block.length) {
        return false;
    }

    $('.ratings-block .buble-right').on('click', function () {
        $('.ratings-block .rate.left').css('display','none');
        $('.ratings-block .rate.right').fadeIn();
        $('.ratings-block .buble').removeClass('active');
        $('.ratings-block .buble-right').addClass('active');
        return false;
    });
    $('.ratings-block .buble-left').on('click', function () {
        $('.ratings-block .rate.right').css('display','none');
        $('.ratings-block .rate.left').fadeIn();
        $('.ratings-block .buble').removeClass('active');
        $('.ratings-block .buble-left').addClass('active');
        return false;
    });
}

function animateScrollTo() {
    var $block = $('.menu-tabs');

    if (!$block.length) {
        return false;
    }

    if (window.location.hash) {
        var $top = $(window.location.hash).offset().top - 50;
        $('html, body').animate({scrollTop: $top}, 500);
    }

    $('.menu-tabs a').click(function () {
        var $top = $($(this).attr('href')).offset().top - 50;
        $('html, body').animate({scrollTop: $top}, 500);
        return false;
    });    
	

}

function CoolScrollTo() {
		$('a.anchor').click(function () {
		var WdTh = document.body.clientWidth;
		if(WdTh < 1024) {
			var Header = 80;
		} else {
			var Header = 85;
		};
        var $top = $($(this).attr('href')).offset().top - Header;
        $('html, body').animate({scrollTop: $top}, 500);
        return false;
    });
}


$(document).ready(function () {
    moduleMainPage();
    desctopPageHeader();
    initSwiper();
    cycleMethodology();
    contactsMap();
    sendAjaxForm();
    ajaxMagnificPopup();
    moduleTblExpiriens();
    openCloseSideMenu();
    showBlocksOnScroll();
    magnificPopupGallery();
    methodTabs();
    workedMore();
    slideRating();
    animateScrollTo();
	CoolScrollTo();
    if($(".zaglushka-svg")){
        setInterval(function() {
              $(".zaglushka-svg").attr('src', '/media/zaglushka2.svg');
        }, 11000);
    }

var root1 = $('#exp');
var a = $('circle',  root1);

var i = 0;
for(i = 0; i < a.length; i++){
a[i].onclick = function(){
gtag('event', 'click', {
	'event_category': 'services-tags'
});
}
}


var root2 = $('#clients-1');
var a = $('circle',  root2);

var i = 0;
for(i = 0; i < a.length; i++){
a[i].onclick = function(){
gtag('event', 'click', {
	'event_category': 'branches-tags'
});
}
}


});