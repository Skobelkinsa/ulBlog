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
                offset: '85%'
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
                circle.appendChild(svg);

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
                })
            }

        }
    })
}
$(document).ready(function () {
    openCloseSideMenu();
    showBlocksOnScroll();
    $('body').on('click', '.blog-head_search > .icon-search', function () {
        $(this).css('display', 'none');
        $(this).next('.blog-head_search-toggle').toggleClass('hidden');
    });

});