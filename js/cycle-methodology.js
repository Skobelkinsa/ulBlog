/**
 * Created by mann-aa on 31.08.2016.
 */

function MethodologyInteractive($mtdblock) {
    //console.log($mtdblock);

    appendSvgCircles();

    var stopAnim = new StopRestartArtefactAnim;

    function showHint() {
        var $hints_btn = $mtdblock.querySelectorAll('.js-mtd-hint');

        for (var i = 0; i < $hints_btn.length; i++) {
            $hints_btn[i].addEventListener('click', function (e) {
                findShowHint(e.target, $hints_btn);
            });
        }

        function findShowHint(el, collection) {
            var $hint, id;

            id = el.getAttribute('data-hintid');

            if (id === null) {
                return false;
            }

            $hint = document.getElementById(id);

            var hint_pos = el.offsetTop + el.offsetHeight * 1.5;

            if (el.classList.contains('active')) {
                el.classList.remove('active');
                el.parentNode.style.zIndex = '';
                $hint.classList.remove('active');
            } else {
                el.classList.add('active');
                el.parentNode.style.zIndex = '7';
                $hint.classList.add('active');
                $hint.style.top = hint_pos+'px';
            }

            for (var i = 0; i < collection.length; i++) {
                var cid = collection[i].getAttribute('data-hintid');

                if (cid === null || cid === id) {
                    continue;
                }

                collection[i].classList.remove('active');
                $hint = document.getElementById(cid);
                $hint.classList.remove('active');
            }

        }
    }

    function setMethodologyCircleDimentions() {
        var circles = $mtdblock.querySelectorAll('.js-method-circle');

        if (!circles.length) {
            return false;
            //throw new Error('not found .method-table .circle');
        }

        setHeight(circles);

        function setHeight(elems) {
            var dimentions, item;

            for (var i = 0; i < elems.length; i++) {
                item = elems[i];
                dimentions = item.getBoundingClientRect();
                item.setAttribute('style', 'height:' + dimentions.width + 'px')

            }
        }

        window.addEventListener('resize', function () {
            setHeight(circles);
        })
    }

    function appendSvgCircles() {
        function createSvg(n, v) {
            n = document.createElementNS("http://www.w3.org/2000/svg", n);

            for (var p in v){
                if (v.hasOwnProperty(p)) {
                    n.setAttributeNS(null, p.replace(/[A-Z]/g, function(m, p, o, s) { return "-" + m.toLowerCase(); }), v[p]);
                }
            }
            return n
        }

        var plh = $mtdblock.querySelectorAll('.circle-artefact');

        for(var i = 0; i < plh.length; i++){
            var svg = createSvg('svg',{
                version: '1.1',
                class: 'circle-artefact__circle js-method-circle',
                viewBox: '0 0 200 200'
            });

            var circle = createSvg('circle',{
                class: 'js-mtd-spin',
                r: '46%',
                cx:'50%',
                cy:'50%'
            });

            svg.appendChild(circle);
            plh[i].appendChild(svg);
        }
    }

    function hightlightColumn() {
        var $overlay = document.getElementById('mtd-overlay');

        if (!$overlay) {
            return false;
        }

        var cells = $mtdblock.querySelectorAll('.js-mtd-cell');

        for (var i = 0; i < cells.length; i++) {
            cells[i].addEventListener('mouseenter', function (e) {
                showHigthlight(e.target, $overlay);
            });
        }

        $overlay.addEventListener('mouseout', function (e) {
            hideHigthlight(e.target);
        });

        function showHigthlight(el, overlay) {
            var w = el.offsetWidth + 50;
            var lpos = el.offsetLeft - 25;
            overlay.classList.add('is-visible');
            overlay.style.width = w + 'px';
            overlay.style.left = lpos + 'px';
            stopAnim.action('stop');
        }

        function hideHigthlight(overlay) {
            //overlay.style.left = '-100%';
            overlay.classList.remove('is-visible');
            stopAnim.action('run');
        }
    }

    function StopRestartArtefactAnim() {
        var circles = $mtdblock.querySelectorAll('.js-mtd-spin');

        this.action = function (state) {
            switch (state){
                case 'run':
                    for(var i = 0; i < circles.length; i++){
                        removeClass(circles[i], 'is-stop');
                        //circles[i].classList.remove('is-stop');
                    }
                    break;
                case 'stop':
                    for(i = 0; i < circles.length; i++){
                        addClass(circles[i],'is-stop');
                        //circles[i].classList.add('is-stop');
                    }
                    break
            }
        }
    }

    hightlightColumn();
    showHint();
    setMethodologyCircleDimentions();
}