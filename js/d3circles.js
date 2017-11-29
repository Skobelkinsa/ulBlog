'use strict';

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function ie_ver() {
    var iev = false;
    var ieold = (/MSIE (\d+\.\d+);/.test(navigator.userAgent));
    var trident = !!navigator.userAgent.match(/Trident\/7.0/);
    var rv = navigator.userAgent.indexOf("rv:11.0");
    if (ieold)
        iev = Number(RegExp.$1);
    if (navigator.appVersion.indexOf("MSIE 10") !== -1)
        iev = 10;
    if (trident && rv !== -1)
        iev = 11;

    return iev;
}

function findRadius(size) {
    var dmax = 200;
    var dmin = 70;
    var max = 21853;
    var min = 295;
    var k = max / (max - min);

    var dn = ((size - min) / max) * k;

    return Math.round(dn * (dmax - dmin) + dmin) / 2;
}

function getRandomArbitary() {
    var result = "";
    result += ((0xffffffff * Math.random()) >>> 4) & 0x7fffff;
    result += ((0xffffffff * Math.random()) >>> 4) & 0x7fffff;
    return result;
}

//html для блоков с кругами. В зависимости от конфига
//создается/не создается список с названиями кругов
function createHTMLWrap(wrap_id, root) {
    var wrap = document.getElementById(wrap_id);

    if (!wrap) {
        return false;
    }

    var arena = document.createElement('DIV');
    arena.id = 'd3arena-' + getRandomArbitary();
    arena.classList.add('d3circles-wrap');

    if (wrap.firstChild) {
        wrap.insertBefore(arena, wrap.firstChild);
    } else {
        wrap.appendChild(arena);
    }

    if (root.name) {
        var title = document.createElement('H2');
        title.textContent = root.name;
        title.classList.add('bubble-block__title');
        wrap.insertBefore(title, arena);
    }

    if (root.list) {
        var items_list = document.createElement('UL');
        items_list.id = 'd3list-' + getRandomArbitary();
        items_list.classList.add('bubble-block__list');
        wrap.appendChild(items_list);
        arena.classList.add('bubble-block__arena');
        return {
            'arena': arena.id,
            'list': items_list.id
        }
    } else {
        //если нет списка то это блок с кругами на главной
        return {
            'arena': arena.id
        }
    }
}

function CreateCirclesPack(id, root) {
    var _this = this;

    var is_ie = ie_ver();

    // переменные is_line_pack,is_large_pack меняют значение при вызове
    // соответсвующих функций перестраивающих круги
    // от значения переменных зависят параметры simulation
    // задаваемые при наведении курсора на круги
    var is_line_pack = false;
    var is_large_pack = false;

    var elems = createHTMLWrap(id, root);

    var plh = document.getElementById(elems.arena);

    if (!plh) {
        throw new Error('id not found');
    }

    var plh_width = plh.offsetWidth;

    //------------------
    //set params
    //------------------

    var distance_params = {
        'padding': 12,
        'rscale': 26
    };

    var padding = distance_params.padding; // дистанция между группами, нужно чтобы при увеличении круга они не пресекались
    var radius_scale = distance_params.rscale;

    //forces
    var f_charge = 100;
    var f_charge_hover = 600;
    var f_gravity = 20;

    var nodes = d3.hierarchy(root, children)
        .sum(function (d) {
            return d.r;
        })
        // .sort(function (a, b) {
        .sort(function () {
            return (0.5 - Math.random());
            // return b.data.r - a.data.r;
        });

    //------------------
    //create pack layout
    //------------------

    var canvas = {
        'width': plh_width,
        'height': setCanvasHeight(plh_width, nodes)
    };

    var pack = d3.pack()
        .size([canvas.width, canvas.height])
        .radius(function (d) {
            return d.data.r;
        })
        .padding(padding * 5);

    function children(d) {
        var children = d.children;

        for (var key in children) {
            if (children.hasOwnProperty(key)) {
                children[key].r = findRadius(children[key].size) + padding; //вычисление радиуса круга
                children[key].items = children[key].size; // еденицы в зависимости от которых рассчитывается радиус
                children[key].title = d.title; //текст в круге
                children[key].id = 'circle' + getRandomArbitary();
            }
        }

        return children;
    }

    pack(nodes);

    //после создания pack устанавливается класс
    //от которого наследуется запуск анимции прозрачности для .circle-group
    plh.classList.add('svg-init');

    //------------------
    //create force
    //------------------

    var simulation = d3.forceSimulation()
        .nodes(nodes.children)
        .force("collide", d3.forceCollide(function (d) {
            return d.r;
        }).iterations(1))
        .force("gravity", d3.forceManyBody().strength(f_gravity))
        .force("charge", d3.forceManyBody().strength(f_charge))
        .force("center", d3.forceCenter(canvas.width / 2, canvas.height / 2))
        .alphaMin(.009)
        .on("tick", setPosOnTick);

    //-------------------------------------------
    // create and append elements to canvas
    //-------------------------------------------
    var svg = d3.select('#' + elems.arena)
        .append("svg")
        //.attr("class", "svg-debug")
        .attr("class", "d3circles-svg")
        .attr("width", canvas.width)
        .attr("height", canvas.height);

    var groups = svg
        .selectAll("g")
        .data(nodes.children)
        .enter().append("svg:g")
        .attr('class', 'circle-group')
        .attr('id', function (d) {
            return d.data.id;
        })
        .on('mouseenter', function (d) {
            if (!plh.classList.contains('svg-ready')) {
                addHTMLClasses();
            }

            d.fx = d.x;
            d.fy = d.y;
            d.r = +d.r + radius_scale;
            updateVis(true, this);
        })
        .on('mouseleave', function (d) {
            delete d.fx;
            delete d.fy;
            d.r = +d.r - radius_scale;
            updateVis(false, this);
        });

    var xlink = groups
        .append("a")
        .attr("xlink:href", function (d) {
            return d.data.link;
        });

    var circles = xlink
        .append("circle")
        .attr("r", function (d) {
            return d.r - padding;
        })
        .attr('class', function (d) {
            var base_class = 'd3circle';

            if (d.r >= 100) {
                base_class = base_class + ' d3circle-large';
            } else if (d.r <= 50) {
                base_class = base_class + ' d3circle-small';
            }

            if (d.data.border) {
                base_class = base_class + ' d3circle-' + d.data.border;
            }

            return base_class;
        });

    xlink
        .append('g')
        .attr("class", "d3circle-title")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .selectAll("tspan")
        .data(function (d) {
            var strings = [];
            var temp = d.data.shortname;
            if (!temp) {
                temp = d.data.name;
            }
            temp = temp.split(" ");
            var str = '';
            for (var i = 0; i < temp.length; i++) {
                if (temp[i].length > 3) {
                    if (str.indexOf(temp[i]) < 0) {
                        strings.push(temp[i]);
                    }
                } else {
                    str = temp[i] + ' ' + temp[i + 1];
                    strings.push(str);
                }
            }

            return strings;
        })
        .enter().append("tspan")
        .attr("x", 0)
        .attr('dy', function (d, i) {
            if (i > 0) {
                return '1em';
            } else {
                var p = this.parentNode;
                var c = p.childNodes.length;
                return 1.3 + (i - c / 2 - 0.5) + "em";
            }
        })
        .text(function (d) {
            return d;
        });

    xlink
        .append('g')
        .attr("class", "d3circle-data")
        .append("text")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr('y', function () {
            var prev = this.parentNode;
            prev = prev.previousElementSibling;
            prev = prev.childNodes[0];
            var rect = prev.getBoundingClientRect();
            if (prev.childNodes.length > 1) {
                return rect.height + 20;
            } else {
                return rect.height + 30;
            }
        })
        .selectAll("tspan")
        .data(function (d) {
            var strings = [];
            strings.push(d.data.items);
            strings.push(d.data.title);
            return strings;
        })
        .enter().append("tspan")
        .attr("x", 0)
        .attr('dy', function (d, i) {
            if (i > 0) {
                return '1.2em';
            } else {
                var p = this.parentNode;
                var c = p.childNodes.length;
                return 1.3 + (i - c / 2 - 0.5) + "em";
            }
        })
        .text(function (d) {
            return d;
        });

    //-------------------------------------------
    // create and append controls block
    //-------------------------------------------

    if (elems.list) {
        var controls_list = document.getElementById(elems.list);
        var controls = d3.select(controls_list);

        controls
            .selectAll('li')
            .data(nodes.children)
            .enter().append("li")
            .attr('class', 'bubble-block__list-item')
            .append('span')
            .attr('class', function (d) {
                var base_class = 'bubble-block__item-title';

                if (d.data.border) {
                    base_class = base_class + ' ' + base_class + '_' + d.data.border;
                }

                return base_class;

            })
            .attr('data-id', function (d) {
                return d.data.id;
            })
            .on('mouseenter', function (d) {
                var circle = document.getElementById(this.getAttribute('data-id'));
                d.fx = d.x;
                d.fy = d.y;
                d.r = +d.r + radius_scale;
                updateVis(true, circle);
            })
            .on('mouseleave', function (d) {
                var circle = document.getElementById(this.getAttribute('data-id'));
                delete d.fx;
                delete d.fy;
                d.r = +d.r - radius_scale;
                updateVis(false, circle);
            })
            .text(function (d) {
                return d.data.name;
            });
    }

    //-------------------------------------------
    // add css class "цветовое кодирование"
    // вариант когда при наведении устанавливается
    // цвет stroke и маркеров списка отличный от по-умолчанию
    // Цвет устанавливает только по ховеру,
    // в обычном состоянии цвет маркера списка по-умолчанию
    //-------------------------------------------

    if (root.colorcode) {
        //plh.classList.add('colorcode-'+root.colorcode);
        plh.parentNode.classList.add('colorcode-'+root.colorcode);
    }

    //-------------------------------------------
    // actions on hover
    //-------------------------------------------
    function updateVis(hover, el) {

        //в функции расчитываются позиции кругов при наведнеии на один - соседние сдвигаются влево/вправо
        // при использовании _linearPack, т.е. когда круги в линию выстроены
        // function setTransform(el, align, shift) {
        //     var style = window.getComputedStyle(el);
        //     var matrixX = parseFloat(style.transform.replace(/[^0-9\-.,]/g, '').split(',')[4]);
        //     var matrixY = style.transform.replace(/[^0-9\-.,]/g, '').split(',')[5];
        //     switch (align) {
        //         case 'prev':
        //             el.setAttribute('style', 'transform: translate(' + (matrixX + parseFloat(shift)) + 'px, ' + matrixY + 'px)');
        //             break;
        //
        //         case 'next':
        //             el.setAttribute('style', 'transform: translate(' + (matrixX - parseFloat(shift)) + 'px, ' + matrixY + 'px)');
        //             break;
        //     }
        // }

        // если есть список кругов
        // при hover на круге добавляем/удаляем классы менющие вид элементов списка

        if (root.list) {
            var list_id = el.id;
            var list_item = controls_list.querySelector('.bubble-block__item-title[data-id=' + list_id + ']');

            if (hover) {
                list_item.classList.add('is-circle-selected');
            } else {
                list_item.classList.remove('is-circle-selected');
            }
        }

        circles
            .each(function () {
                var title = el.querySelector('.d3circle-title');
                var data = el.querySelector('.d3circle-data');

                // если курсор попал в круг

                if (hover) {
                    //el.classList.add('is-hover');
                    addClass(el, 'is-hover');

                    var shift = data.getBoundingClientRect().height / 2;

                    title.setAttribute('style', 'transform: translateY(-' + shift + 'px)');
                    data.setAttribute('style', 'transform: translateY(-' + shift + 'px)');

                    // если компановка кругов в линию
                    // дальнейшие действия с simulation не нужны
                    if (is_line_pack) {
                        return;
                    }

                    // если широкая компановка кругов
                    // меняем параметры simulation
                    if (is_large_pack) {
                        simulation
                            .force("collide", d3.forceCollide(function (d) {
                                //return d.r + padding;
                                return d.r;
                            }).iterations(.3))
                            .velocityDecay(.2)
                            .alpha(.4)
                            .restart();

                        return;
                    }

                    // simulation для компаноуки по умолчанию - compact
                    simulation
                        .force("charge", d3.forceManyBody().strength(f_charge_hover))
                        .force("collide", d3.forceCollide(function (d) {
                            return d.r;
                        }).iterations(.3))
                        .velocityDecay(.2)
                        .alpha(.3)
                        .restart();

                    return;
                }

                //курсор ушел из круга

                //el.classList.remove('is-hover');
                removeClass(el, 'is-hover');

                title.setAttribute('style', 'transform: translateY(0)');

                if (is_line_pack) {
                    return;
                }

                if (is_large_pack) {
                    simulation
                        .force("collide", d3.forceCollide(function (d) {
                            return d.r;
                        }).iterations(.3))
                        .velocityDecay(.2)
                        .alpha(.4)
                        .restart();

                    return;
                }

                simulation
                    .force("collide", d3.forceCollide(function (d) {
                        return d.r;
                    }).iterations(1))
                    .alpha(.3)
                    .restart();
            });
    }

    //-------------------------------------------
    // set position on simulation
    //-------------------------------------------

    function setPosOnTick() {
        // не дожидаясь конца simulation, т.е. окончательного расчета позиций кругов
        // устанавливаем класс svg-ready
        // наследуясь от него работает css transition для svg элементов

        if (simulation.alpha() < .05) {
            addHTMLClasses();
        }

        groups
            .attr("style", function (d) {
                //TODO: нужно как-то привязать к соответсвующей компановке - vertical
                // этот костыль перезапускает simulation
                // для того чтобы круги как можно плотнее вписались в контейнер
                // условия указывают что работать должно для кругов со списком
                // на узких экранах. См. TO-DO выше
                //if (elems.list && document.documentElement.clientWidth < 480) {

                // немного изменю костыль - для всех маленьких контейнеров
                if (canvas.width < 640 || canvas.height < 640) {

                    if (d.x < d.r / 3 || d.y < d.r / 3) {
                        simulation
                            .alpha(.5)
                            .restart();
                    }
                }

                return "transform: translate(" + d.x + "px," + d.y + "px)";
            });

        // если браузер определен как IE для установки позиции
        // используется атрибут transform вместо css transform
        if (is_ie) {
            groups
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
        }
    }

    function addHTMLClasses() {
        // наследуясь от .svg-ready работает css transition для svg элементов
        if (!plh.classList.contains('svg-ready')) {
            plh.classList.add('svg-ready');
        }
    }

    //изменение размеров кругов при выборе компановки

    function resizeCirclesInPack(scale, reset) {
        if(reset){

            padding = distance_params.padding;
            radius_scale = distance_params.rscale;

            pack
                .radius(function (d) {
                    return findRadius(d.data.items) + padding;
                })
                .padding(padding * 5);

        }else{

            padding = padding * scale;
            radius_scale = radius_scale * scale;

            pack
                .radius(function (d) {
                    return d.data.r * scale;
                })
                .padding(padding * 5);
        }

        pack(nodes);

        circles
            .attr("r", function (d) {
                return d.r - padding;
            });
    }

    // в зависмости от выбранного типа компановки, ширины контейнера с кругами и кол-ва
    // кругов подбирается высота контейнера

    function setCanvasHeight(container_width, nodes, pack) {

        // все действия с устанавливаемой высотой вроде ужмножения
        // на .9, 1.5 - магия
        // вычисления на основе суммы радиусов тоже по сути магия, но хоть какой-то смысл в ней есть
        // высота контейнера в этих случаях подбиралась опытным путем
        // отталкиваясь от макс. кол-ва кругов, макс. и мин. диаметра кругов,
        // а также ширины контейнера в верстке

        var nodes_num = nodes.children.length;
        var height;
        var maxRadius;

        switch (pack) {
            case 'linear':
                maxRadius = d3.max(nodes.children, function (d) {
                    return d.data.r;
                });

                height = maxRadius * 2 + radius_scale;

                break;

            case 'vertical':
                var sumRadius = d3.sum(nodes.children, function (d) {
                    return d.data.r + padding;
                });

                if (nodes_num <= 4) {

                    height = sumRadius + padding * nodes.children.length;

                } else if (nodes_num > 4 && nodes_num <= 6) {

                    height = sumRadius;

                } else {

                    height = sumRadius * .9;

                }

                break;

            case 'large':
                maxRadius = d3.max(nodes.children, function (d) {
                    return d.data.r + radius_scale + padding;
                });

                if (nodes_num <= 6) {

                    height = maxRadius * 2;

                    if (container_width < 768 && nodes_num > 2) {

                        height = height * 1.14;
                    }

                } else {
                    height = container_width * .8 + radius_scale;

                    //if(container_width < 768){
                    // if(container_width < 600){
                    //
                    //     height = height * 1.5;
                    //
                    //     if(nodes_num > 9){
                    //         height = height * 1.5;
                    //     }
                    // }
                }

                break;

            default:
                //compact
                if (nodes_num <= 4) {

                    height = d3.max(nodes.children, function (d) {
                        return d.data.r;
                    });

                    height = height * nodes_num;

                } else if (nodes_num > 4 && nodes_num <= 6) {

                    height = d3.sum(nodes.children, function (d) {
                        return d.data.r + padding;
                    });

                } else {
                    height = d3.min(nodes.children, function (d) {
                        return d.data.r + padding;
                    });

                    height = height * nodes.children.length;
                }
                break;
        }

        return height;
    }

    // в зависимости от ширины экрана и ориентируясь на дизайн-макеты,
    // а так же тип блока с кругами - со списком (на внутренних)
    // или без списка (на главной)
    // выбирается вид компановки кругов - pack


    function chooseCirclePack(container) {
        var screen_w = document.documentElement.clientWidth;
        //var container_w = document.getElementById(container.arena).offsetWidth;
        var list = container.list;

        if (list) {

            if (screen_w < 480) {
                _this.verticalPack();

            } else if ((screen_w >= 480 && screen_w < 640) || (screen_w >= 768 && screen_w < 1024)) {
                _this.compactPack();

            } else if ((screen_w >= 640 && screen_w < 768) || screen_w >= 1024) {
                _this.largePack();
            }

        } else {

            if (screen_w < 480) {

                script(['jquery-2.1.1.min.js', 'jquery.kinetic.min'], 'kinetic');

                script.ready('kinetic', function () {

                    _this.linearPack();
                });

            } else if ((screen_w >= 480 && screen_w < 768) || screen_w >= 1024) {

                _this.largePack();

            } else if (screen_w >= 768 && screen_w < 1024) {

                _this.compactPack();

                // при не большой ширине контейнера лучше выбрать вертикальную компановку
                // актуально для слайдера на главной при ширине 768

                // if(container_w < 480){
                //     _this.verticalPack();
                // }else{
                //     _this.compactPack();
                // }
            }
        }
    }

    //_this.resetCirclesPos, _this.restartSimulation вызываются
    // при смене слайдов на главной странице
    // для появления/исчезновения кругов при каждой смене слайда
    // работает для компановки по умолчанию (compact),
    // т.к. в других компановках используются другие праметры simulation

    _this.resetCirclesPos = function () {

        if (is_line_pack) {
            return false;
        }

        pack(nodes);
        plh.classList.remove('svg-init');
        simulation
            .alpha(.6)
            .force("gravity", d3.forceManyBody().strength(0))
            .force("charge", d3.forceManyBody().strength(0))
            .restart();
    };

    _this.restartSimulation = function () {

        if (is_line_pack) {
            return false;
        }

        plh.classList.add('svg-init');
        simulation
            .force("collide", d3.forceCollide(function (d) {
                return d.r;
            }).iterations(1))
            .force("gravity", d3.forceManyBody().strength(f_gravity))
            .force("charge", d3.forceManyBody().strength(f_charge))
            .alphaMin(.009)
            .alpha(.9)
            .restart();
    };

    _this.defaultSimulation = function (gravity, charge, canvas) {

        plh.classList.add('svg-init');

        simulation
            .force("collide", d3.forceCollide(function (d) {
                return d.r;
            }).iterations(1))
            .force("x", d3.forceX(function () {
                return canvas.width / 2;
            }))
            .force("y", d3.forceY(function () {
                return canvas.height / 2;
            }))
            .force("gravity", d3.forceManyBody().strength(gravity))
            .force("charge", d3.forceManyBody().strength(charge))
            .force("center", d3.forceCenter(canvas.width / 2, canvas.height / 2))
            .alphaMin(.009)
            .alpha(.9)
            .restart();
    };

    // linearPack - круги просто выстроены в линию,
    // выровнены по центру по вертикали
    // плагин jquery.kinetic.min добавляет возможность
    // двигать контейнер с кругами влево/вправо внтури родительского блока
    // используется на главной странице

    _this.linearPack = function () {
        is_line_pack = true;

        simulation.stop();

        $(plh).kinetic({y: false});

        canvas.width = d3.sum(nodes.children, function (d) {
            return d.data.r * 2 + padding;
        });

        plh_width = plh.offsetWidth;

        canvas.height = setCanvasHeight(plh_width, nodes, 'linear');

        svg
            .attr('width', canvas.width)
            .attr('height', canvas.height)
            .attr('class', 'svg-ready');

        var xPaddingPlusRadius = padding + nodes.children[0].data.r;
        nodes.children[0].xPos = xPaddingPlusRadius;

        var accumulator = xPaddingPlusRadius;

        groups
            .attr('style', function (d, i) {
                var xpos;
                var ypos;
                if (i > 0) {
                    var previousRadius = nodes.children[i - 1].data.r;
                    var currentRadius = d.data.r;

                    var hypotenuseLength = previousRadius + currentRadius + padding;
                    var yLength = currentRadius - previousRadius;

                    //var increment = Math.sqrt(Math.pow(hypotenuseLength, 2) - Math.pow(yLength, 2));
                    accumulator += Math.sqrt(Math.pow(hypotenuseLength, 2) - Math.pow(yLength, 2));
                    d.xPos = accumulator;

                    xpos = accumulator;
                } else {
                    xpos = xPaddingPlusRadius
                }

                ypos = canvas.height / 2;

                return "transform: translate(" + xpos + "px," + ypos + "px)";
            });
    };

    // verticalPack - компановка для внтуренних страниц
    // похожа на compact, но с помощью simulation, установки высоты контейнера
    // и костыля описанного в setPosOnTick()
    // круги распологаются вытянуто по вертикали

    _this.verticalPack = function () {
        console.log('vertical');

        f_charge = 20;
        f_gravity = 440;

        simulation.stop();

        // var minRadius = d3.min(nodes.children, function (d) {
        //     return d.data.r;
        // });
        //
        // var maxRadius = d3.max(nodes.children, function (d) {
        //     return d.data.r;
        // });

        plh_width = plh.offsetWidth;

        canvas = {
            'width': plh_width,
            'height': setCanvasHeight(plh_width, nodes, 'vertical')
        };

        svg
            .attr("width", canvas.width)
            .attr("height", canvas.height);

        pack.size([canvas.width, canvas.height]);

        var y = d3.scaleLog()
            .rangeRound([0, 1]);

        y.domain(d3.extent(nodes.children, function (d) {
            return d.data.r;
        }));

        simulation
            .force("x", d3.forceX(function (d) {
                return canvas.width / 2;
            }))
            .force("y", d3.forceY(function (d) {
                return y(d.data.size);
            }).strength(0))
            .force("center", d3.forceCenter(canvas.width / 2, canvas.height / 2))
            .force("charge", d3.forceManyBody().strength(f_charge))
            .force("gravity", d3.forceManyBody().strength(f_gravity))
            .force("collide", d3.forceCollide(function (d) {
                return d.data.r;
            }).iterations(.3))
            .alpha(.4)
            .restart();
    };

    // compactPack - компановка по умолчанию
    // по сути взятый из примеров d3.js circle pack

    _this.compactPack = function () {
        console.log('compact');

        is_large_pack = false;
        simulation.stop();

        f_charge = 100;
        f_charge_hover = 600;
        f_gravity = 30;

        plh_width = plh.offsetWidth;

        canvas = {
            'width': plh_width,
            'height': setCanvasHeight(plh_width, nodes)
        };

        pack
            .size([canvas.width, canvas.height]);

        resizeCirclesInPack(.9);

        svg
            .attr("width", canvas.width)
            .attr("height", canvas.height);

        _this.defaultSimulation(f_charge, f_gravity, canvas);
    };

    // largePack - компановка для широких контейнеров
    // круги должны быть вытянуты горизонтально, как бэ по оси х
    // сделано по примеру scatterplot (вроде так) на d3.js
    // отступления от примера описаны в каментах внутри функции

    _this.largePack = function () {
        console.log('large');

        is_large_pack = true;
        f_charge_hover = -200;
        f_gravity = 30;

        simulation.stop();

        plh_width = plh.offsetWidth;

        canvas = {
            'width': plh_width,
            'height': setCanvasHeight(plh_width, nodes, 'large')
        };

        svg
            .attr("width", canvas.width)
            .attr("height", canvas.height);

        var minRadius = d3.min(nodes.children, function (d) {
            return d.data.r;
        });

        var maxRadius = d3.max(nodes.children, function (d) {
            return d.data.r;
        });

        //если круги со списком - расчет высоты svg
        //либо по высоте списка, либо в зависимости от максимально диаметра круга.
        if (elems.list && document.getElementById(elems.list).offsetHeight) {

            //resizeCirclesInPack(false, true);

            var list_height = document.getElementById(elems.list).offsetHeight;

            canvas.height = maxRadius * 2 + padding * 2;

            if (list_height > canvas.height) {
                canvas.height = list_height;
            }

            svg.attr("height", canvas.height);

            pack.size([canvas.width, canvas.height]);
        }

        if (nodes.children.length <= 4) {
            canvas.width = d3.sum(nodes.children, function (d) {
                return d.data.r * 2 + padding * nodes.children.length;
            });

            svg.attr("width", canvas.width);

            pack.size([canvas.width, canvas.height]);

            simulation
                .force("center", d3.forceCenter(canvas.width / 2, canvas.height / 2));
        }

        var x = d3.scaleLog()
            .rangeRound([minRadius, canvas.width - maxRadius * 2.6]);
        //.rangeRound([minRadius * 1.5, canvas.width - maxRadius * 2.6]);
        //.rangeRound([0, canvas.width - maxRadius * 2.6]);

        x.domain(d3.extent(nodes.children, function (d) {
            return d.data.size;
        }));

        simulation
            .force("x", d3.forceX(function (d) {
                return x(d.data.size);
            }).strength(.2))
            .force("y", d3.forceY(function () {
                return canvas.height / 2;
            }))
            .force("center", d3.forceCenter(canvas.width / 2.3, canvas.height / 2)) //!
            .force("gravity", d3.forceManyBody().strength(f_gravity))
            .force("collide", d3.forceCollide(function (d) {
                return d.data.r;
            }).iterations(.3))
            .alpha(.9)
            .restart();
    };

    chooseCirclePack(elems);

    window.addEventListener('resize', function () {
        //chooseCirclePack(elems);
        debounce(chooseCirclePack(elems), 500);
    });

}
