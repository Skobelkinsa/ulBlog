$(document).ready(function(){
    function VInfo(param,value){
        $.cookie.json = true;
        
        if($.cookie('js_version_info') === undefined)
            var vi = {};
        else    vi = $.cookie('js_version_info');
        
        if(value === undefined && param === undefined) return vi;
		if(value === undefined) return vi[param];
		
        if(vi[param] !== value){
            vi[param] = value;
            $.cookie('js_version_info', vi, { expires: 7, path: '/' });   
        }
    }

/* vision open версия для слабовидящих, открытие*/
  $(document).on('click', '.js-version-open', function (e) {
    e.preventDefault();
    $('.js-version-bg').show();
    $('.js-version-block').show();
    $('body').addClass('fixed');
  });

/* vision close версия для слабовидящих, закрыть */
  $(document).on('click', '.js-version-close', function (e) {
    e.preventDefault();
    $('.js-version-block').hide();
    $('.js-version-bg').hide();
    $('body').removeClass('fixed');
  });

/* vision buttons версия для слабовидящих, переключение кнопок и версий */
  $(document).on('click', '.js-version-btn', function (e) {
    var $this = $(this);
    $this.parents('.js-version-parents').find('.js-version-btn').removeClass('active');
    $this.addClass('active');
    $('.js-version-bg').hide();
    $('body').removeClass('fixed');
  });

  var classCollection = {};
   $(".js-version-parents").each(function() {
     var $elem = $(this);
     var key = $elem.attr('data-param');
     classCollection[key] = [];
     $elem.find(".js-version-btn").each(function() {
       var className = $(this).attr('data-val');
       className = key + '-' + className;
       classCollection[key].push(className);
     });
     
     /* Перебираем куку по ключам */
     var saved = VInfo(key);
     if(saved !== undefined){
         $('body').addClass(saved);  
         
         var vals = saved.split('-');
         $('.js-version-parents[data-param="' + vals[0] + '"] .version_button').removeClass('active');
         $('.js-version-parents[data-param="' + vals[0] + '"] .version_button[data-val="' + vals[1] + '"]').addClass('active');
     }
  });
     
  
  

  $(".js-version-btn").click(function() {
    var $elem = $(this);
    var key = $elem.parents(".js-version-parents").attr('data-param');
    var className = $elem.attr('data-val');
    $('body').removeClass(classCollection[key].join(' ')).addClass(key + '-' + className);
    
    VInfo(key, key + '-' + className);
  });

/* mobile version версия для слабовидящих, раскрытие кнопок при клике на заголовок на мобильной версии */
  if($(window).width() < 767){
    $(".js-version-mobile").click(function() {
      var $this = $(this);
      $this.toggleClass('active');
      $this.next('.js-version-actions').slideToggle();
      $('body').addClass("mobile");
    });
  }


});
