/*
    iAccordion Plugin
*/

(function ($) {
    'use strict';

    $.fn.reverse = [].reverse;

    $.fn.iAccordion = function(options) {
        /* Default settings */
        var settings = $.extend({
            height                : null,                /* Accordion height - integer option */
            width                 : null,                /* Accordion width - integer option */
            transitionDelayStep   : 100,                 /* Transition delay step between slides */
            easing                : 'cubic-bezier(0.770, 0.000, 0.175, 1.000)', /* Easing function */
            transitionDuration    : null,                /* Transition duration */
            accordionCls          : 'iaccordion',        /* Accordion class */
            slideCls              : 'iaccordion__slide', /* Accordion slide class */
            mobile                : false,               /* Mobile version */
            mobileBreakpoint      : null,                /* Mobile breakpoint */
            arrNav                : false,               /* Arrows navigation */
            arrNavWrapperCls      : 'iaccordion__wrapperNav', /* Arrows navigation wrapper class */
            arrNavCls             : ['iaccordion__arrNav iaccordion__arrNav_prev', 'iaccordion__arrNav iaccordion__arrNav_next'], /* Arrows navigation class */
            buttonsText           : ['Prev', 'Next'],    /* Button previous text */
            buttonType            : 'span',              /* Button html - span or button */
            errors                : false,               /* Plugins errors */
            onReady: function () {                       /* Ready callback function */
                // helpers.log('iAccordion is ready');
            },
            endActiveSlideAnimate: function () {         /* End animate callback function */
                // helpers.log('End active slide animation');
            },
            endMovingSlidesAnimate: function () {              /* End slides animate callback function */
                // helpers.log('End slides animation');
            },
            endAllSlidesAnimate: function () {           /* End all slides animate callback function */
                
            }

        }, options);

        /* Helpers */
        var helpers = {
            toInteger: function (o) {
                if (o !== null) {
                    return parseFloat(o, 10);
                }
            },
            log(obj) {
                return console.log(obj);
            },
            percentage: function (dividend, divider) {
                return dividend / divider * 100;
            }
        }

        var pluginName = 'iAccordion';

        /* Errors */
        var errorMessage =  {
            height      : pluginName + ': wrapper height must be defined',
            heightValue : pluginName + ': height option value must be integer',
            widthValue  : pluginName + ': width option value must be integer'
        }

        return this.each(function() {
            /* Declare "global" variables */
            var $accordion        = $(this),
                $slides           = $accordion.children(),
                $actSlide         = $slides.first(),
                activeSlideCls    = '_active',
                animateSlideCls   = '_animate',
                movingSlideCls    = '_moving',
                movedSlideCls     = '_moved',
                mobileCls         = '_mobile',
                wrapperCls        = 'iaccordion__wrapSlides',
                isAnimate         = false,
                activeSlideWidth,
                stepWidth,
                movingSlidesLength,
                clicked,
                activeSlides,
                delaymovingSlides;

            init();

            /**
            * Init accordion
            */
            function init() {
                activeSlideWidth = helpers.percentage($actSlide.outerWidth(), $accordion.outerWidth());
                $actSlide.addClass(activeSlideCls);

                $accordion.addClass(settings.accordionCls);
                $slides.addClass(settings.slideCls);

                /* Create wrapper */
                $accordion.find('.' + settings.slideCls).wrapAll('<div class="' + wrapperCls + '"></div>');

                accordionSetWidth();
                accordionSetHeight();
                setSlideTransition();
                eventHandlerNav();

                if (settings.arrNav) {
                    createNavigation();
                }

                /* Dynamic step width */
                stepWidth = (100 - activeSlideWidth) / ($slides.length - 1);

                /* Setup slides settings */
                $slides.each(function(i) {
                    $(this).addClass(settings.slideCls).css({
                        left: (100 - activeSlideWidth) / ($slides.length - 1) * i + '%',
                        transitionDelay: i * settings.transitionDelayStep + 'ms',
                        zIndex: ($slides.length - i) + $slides.length
                    });
                });

                /* Accordion is ready */
                if ($.isFunction(settings.onReady)) {
                    settings.onReady.call(this);
                }

                setActiveSlide();
                endAnimateActiveSlide();
                endAnimateSlides();
            }

            /**
            * Set accordion width
            */
            function accordionSetWidth() {
                if (settings.width && isNaN(helpers.toInteger(settings.width))) {
                    if (settings.errors) {
                        helpers.log(errorMessage.widthValue);
                    }

                    return false;
                }

                if (settings.width) {
                    $accordion.width(settings.width);
                }
            }

            /**
            * Set accordion height
            */
            function accordionSetHeight() {
                if ($accordion.height() === 0 && settings.height === null) {
                    if (settings.errors) {
                        helpers.log(errorMessage.height);
                    }

                    return false;
                } else if ($accordion.height() === 0 && settings.height !== null && isNaN(helpers.toInteger(settings.height))) {
                    if (settings.errors) {
                        helpers.log(errorMessage.heightValue);
                    }
                    
                    return false;
                } else if ($accordion.height() > 0 && settings.height !== null && isNaN(helpers.toInteger(settings.height))) {
                    if (settings.errors) {
                        helpers.log(errorMessage.heightValue);
                    }
                } else {
                    $accordion.height(settings.height);
                }
            }

            /**
            * Create navigation
            */
            function createNavigation() {
                var buttonTypes = ['span', 'button'];

                // for (var i = 0; i <= buttonTypes.length; i++) {
                //     if (settings.buttonType !== buttonTypes[i]) {
                //         return false;
                //     }
                // }

                $accordion
                    .append($('<div />', {
                        class: settings.arrNavWrapperCls
                    }).append($('<' + settings.buttonType + '/>', {
                        class: settings.arrNavCls[0],
                        text: settings.buttonsText[0]
                    })).append(
                        $('<' + settings.buttonType + '/>', {
                            'class': settings.arrNavCls[1],
                            'text': settings.buttonsText[1]
                        })
                    ));
            }

            /**
            * Set slide transition
            */
            function setSlideTransition() {
                if ($slides.css('transition-duration')) {
                    return false;
                } else {
                    $slides.css({
                        transitionDuration: settings.transitionDuration
                    });
                }
            }

            /**
            * Set active slide
            */
            function setActiveSlide() {
                $accordion.on('click', '.' + settings.slideCls + ':not(".' + activeSlideCls + '")', function (e) {
                    if (isAnimate) {
                        return false;
                    }

                    var $self = $(this);
                    // clicked = $self.index();

                    goToSlide($self);
                });
            }

            /**
            * Event handler nav
            */
            function eventHandlerNav() {
                $accordion.on('click', '.iaccordion__arrNav', function () {
                    if (isAnimate) {
                        return;
                    }

                    ($(this).hasClass('iaccordion__arrNav_next')) ? goToSlide($accordion.find('.' + activeSlideCls).next()) : goToSlide($accordion.find('.' + settings.slideCls).last());
                });
            }

            /**
            * Go to slide
            */
            function goToSlide(activeSlide) {
                isAnimate = true;
                clicked = activeSlide.index();

                var $cloned = null,
                    timeout = activeSlide.next().css('transitionDelay'),

                $cloned = activeSlide.prevAll().clone().reverse();

                console.log($cloned)

                activeSlide.css({
                    left: 0 + '%'
                });

                var timer = setTimeout(function () {
                    $cloned.removeClass(activeSlideCls + ' ').each(function (i) {
                        $(this).css({
                            left: stepWidth * (i + $slides.length - $cloned.length) + '%',
                        });
                    });

                    $accordion
                        .find('.' + wrapperCls)
                        .append($cloned)
                        .end()
                        .find('.' + settings.slideCls)
                        .each(function (i) {
                            $(this).css({
                                transitionDelay: settings.transitionDelayStep * i + 'ms',
                                zIndex: ($slides.length - i) + $slides.length
                            });
                    });
                }, timeout);

                $accordion.find('.' + settings.slideCls).removeClass(activeSlideCls + ' ' + movedSlideCls).addClass(animateSlideCls);
                movingSlidesLength = activeSlide.prevAll().length;

                activeSlide.addClass(activeSlideCls).prevAll().addClass(movingSlideCls);

                if (activeSlide.nextAll().length) {
                    activeSlide.nextAll().addClass(animateSlideCls).each(function (i) {
                        $(this).css({
                            left: (i + 1) * stepWidth + '%',
                        });
                    });
                }
            }

            /**
            * End animate active slide
            */
            function endAnimateActiveSlide() {
                $accordion.on('transitionend', '.' + activeSlideCls, function() {
                    if ($.isFunction(settings.endActiveSlideAnimate)) {
                        settings.endActiveSlideAnimate.call(this);
                    }
                });
            }

            /**
            * End animate slides
            */
            function endAnimateSlides() {
                activeSlides = $accordion.children().not('.' + movingSlideCls);
                delaymovingSlides = 0;

                $accordion.on('transitionend', '.' + animateSlideCls, function () {
                    $(this).removeClass(animateSlideCls);

                    if (!$accordion.find('.' + animateSlideCls).length) {
                        isAnimate = false;

                        if ($.isFunction(settings.endAllSlidesAnimate)) {
                            settings.endAllSlidesAnimate.call(this);
                        }
                    }
                });

                $accordion.on('transitionend', '.' + movingSlideCls, function () {
                    var $self = $(this);

                    $self.remove();
                    clicked--;                  
                });
            }

            if (settings.mobile) {
                $(window).resize(function() {
                    if ($(window).width() < settings.mobileBreakpoint) {
                        $accordion.addClass(mobileCls);
                    }
                });
            }
        });

        /**
        * Destroy accordion
        */
        function destroy() {
            console.log('destroy');
        }

        // $.fn.iAccordion.moveToSlide = moveToSlide;
        // $.fn.iAccordion.destroy = destroy;

        // if (methods[method]) {
        //     return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        // } else if ( typeof method === 'object' || ! method ) {
        //     return methods.init.apply( this, arguments );
        // } else {
        //     $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
        // }
    };
})(jQuery);