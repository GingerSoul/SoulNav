jQuery(document).ready(function($){
    
    SoulScroller2 = {
        waypoints: {},
        storedNavs: {},
        previousNav: null,
        currentNav: null,
        currentNavIndex: null,
        nextNav: null,
        animationTargetNavId: null,
        isScrolling: false,
        buttonClickWaiter: null,
        waitingForButtonCooldown: false,
        waitingForScrollStop: null,
        animatedScroll: null,
        animationSpeed: 0.5, // animation speed in seconds. Can be decimal
        
        /**
         * Initializes the SoulScroller2 element navigation system
         **/
        init: function(){
            // initialize the waypoints
            SoulScroller2.setupWaypoints();
            // make a list of all nav elements
            SoulScroller2.setupNavList();
            // find the nav element that the window is closest to and set it as the active one
            SoulScroller2.setupClosestWaypoint();
            // create the SoulScroller2 navigation buttons
            SoulScroller2.createNavButtons();
            // todo possibly add a listener that checks to see if more nav elements have been added to the page, and updates the nav element list //actually, the system handles additional navs pretty well, I think it just needs to have the waypoints refreshed when more navs are added. And that should be as easy as calling setupWaypoints after the elements are added
            // create the floating nav menu
//            SoulScroller2.createNavMenu(); // todo: temp disabled
        },
        
        /**
         * Sets up the SoulScroller2 waypoints on the page's designated nav elements.
         * Elements are designated with a "soul-scroller-2-nav" css class.
         **/
        setupWaypoints: function(){
            // try getting the nav elements
            var navs = $('.soul-scroller-2-nav');

            // exit if there's no nav elements
            if(navs.length < 1){
                return;
            }

            // create waypoints for when to say that the element is in view of the user
            SoulScroller2.waypoints['top']      = navs.waypoint(SoulScroller2.handleElementFocusTop, {continuous: false, group: 'soulScroller2Navs'});                                                      
//            SoulScroller2.waypoints['bottom']   = navs.waypoint(SoulScroller2.handleElementFocusBottom, {offset: 'bottom-in-view', continuous: false, group: 'soulScroller2Navs'}); // may be somewhat useful for calculating what's being looked at by focusing on the bottom of the elements, but has conflicts with the 'top' set if they're both active.

            // create waypoints specifically for updating the nav menu's highlighted items
            SoulScroller2.waypoints['menuFocus'] = [];
            SoulScroller2.waypoints['menuFocus']['top'] = navs.waypoint(SoulScroller2.handleNavMenuElementEnter,    {offset: function(){ return (($(window).height()/2) - 15) }, continuous: false, group: 'soulScroller2Navs'});
            SoulScroller2.waypoints['menuFocus']['bottom'] = navs.waypoint(SoulScroller2.handleNavMenuElementEnter, {offset: function(){ return -( this.element.clientHeight - ($(window).height()/2) ) }, continuous: false, group: 'soulScroller2Navs'});
        },

        /**
         * Tags the current nav element that the user is looking at and
         * sets up which nav elements come before and after the current one.
         **/
        handleElementFocusTop: function(direction){
            if(SoulScroller2.isScrolling){
                return;
            }
            // remove any existing focus classes and tag the current element with the class
            $('.soul-scroller-2-nav').removeClass('soul-scroller-2-in-focus');
            $(this.element).addClass('soul-scroller-2-in-focus');

            // store the current nav for use by the nav buttons
            SoulScroller2.currentNav = this.element;
            
            // set the id for the currently focused nav
            var focus = this.element;
            SoulScroller2.currentNavIndex = '';
            $(SoulScroller2.storedNavs).each(function(index, element){ if(focus === element){ SoulScroller2.currentNavIndex = index;} });

            // store the preceeding and following elements for use by the nav buttons
            SoulScroller2.handlePreviousAndNextNavs(this);

            // set the nav button availability
            SoulScroller2.handleNavButtonAvailability();
            
            // set the nav menu focus
            SoulScroller2.handleNavMenuElementFocus();
        },

        /**
         * Tags which nav element came before the current one and which one comes after.
         * Stores the respective elements in the object for use by the nav buttons
         **/
        handlePreviousAndNextNavs: function(waypoint){
            // clear any existing next/previous element classes
            $('.soul-scroller-2-nav-previous').removeClass('soul-scroller-2-nav-previous');
            $('.soul-scroller-2-nav-next').removeClass('soul-scroller-2-nav-next');

            // find the currently focused nav and the navs preceeding and following it
            var previous = null,
            next = null;
            SoulScroller2.storedNavs.each(function(index, element){
                // if we've found the focused nav
                if($(element).hasClass('soul-scroller-2-in-focus')){
                    // and there is a nav before it
                    if(index > 0 && SoulScroller2.storedNavs[(index - 1)]){
                        // save that nav as the previous one
                        previous = $(SoulScroller2.storedNavs[(index - 1)]).addClass('soul-scroller-2-nav-previous');
                    }else{
                        previous = null;
                    }

                    // if there is a nav after this one...
                    if( (index + 1) < SoulScroller2.storedNavs.length && SoulScroller2.storedNavs[(index + 1)] ){
                        // save it as the next one
                        next = $(SoulScroller2.storedNavs[(index + 1)]).addClass('soul-scroller-2-nav-next');
                    }else{
                        next = null;
                    }
                }
            });

            // if there is a "previous" nav element, store it for future use
            if(previous && previous.length > 0){
                SoulScroller2.previousNav = previous;
            }else{
                // if there isn't, store null to disable trying to switch to the prior nav
                SoulScroller2.previousNav = null;
            }

            // if there is a "next" nav element, store it for future use
            if(next && next.length > 0){
                SoulScroller2.nextNav = next;
            }else{
                // if there isn't, store null to disable trying to switch to the next nav
                SoulScroller2.nextNav = null;
            }
        },

        /**
         * Disables the nav buttons when the end of the nav element list is reached.
         * So when the user is focused on the first nav, this disables the "Up" button.
         * And when the user is focused on the last nav, this disables the "Down" button.
         * When the user moves away from the ends of the nav list, this re-enables the disabled buttons.
         **/
        handleNavButtonAvailability: function(){

            if(!SoulScroller2.previousNav){
                $('.soul-scroller-2-nav-button .up').addClass('soul-scroller-2-disabled');
            }else{
                $('.soul-scroller-2-nav-button .up').removeClass('soul-scroller-2-disabled');
            }

            if(!SoulScroller2.nextNav){
                $('.soul-scroller-2-nav-button .down').addClass('soul-scroller-2-disabled');
            }else{
                $('.soul-scroller-2-nav-button .down').removeClass('soul-scroller-2-disabled');
            }
        },

        /**
         * Sets the nav menu's highlighted item class for the item that the user has navigated to.
         * Either by clicking a up/down button, clicking on a nav menu item, or by scrolling the page so that one of the "element in view"
         * waypoints are triggered.
         **/
        handleNavMenuElementFocus: function(){
            if(!SoulScroller2.currentNav || SoulScroller2.currentNav.length < 1){
                return;
            }

            $('.soul-scroller-2-nav-menu-item').removeClass('soul-scroller-2-highlit-menu-item');

            var menuItemId  = $(SoulScroller2.currentNav).attr('data-soul-scroller-2-menu-id'),
                menuItem    = $('.soul-scroller-2-nav-menu-item[data-soul-scroller-2-menu-item="' + menuItemId + '"]');

            if(menuItem.length > 0){
                $(menuItem).addClass('soul-scroller-2-highlit-menu-item');
            }
        },

        /**
         * Helper function. Highlights nav menu items when the user scrolls "up" into a nav element.
         * Doesn't actually update the previous/current/next element listing, so if an element is highlit and the user clicks "Up",
         * the page scrolls to the top of the currently highlit element.
         **/
        handleNavMenuElementEnter: function(direction){
            if(SoulScroller2.isScrolling){
                return;
            }

            $('.soul-scroller-2-nav-menu-item').removeClass('soul-scroller-2-highlit-menu-item');

            var menuItemId  = $(this.element).attr('data-soul-scroller-2-menu-id'),
                menuItem    = $('.soul-scroller-2-nav-menu-item[data-soul-scroller-2-menu-item="' + menuItemId + '"]');

            if(menuItem.length > 0){
                $(menuItem).addClass('soul-scroller-2-highlit-menu-item');
            }
        },

        /**
         * Finds the closest nav element in the waypoint list and calls its focus handler to set it as the closest nav element and
         * to trigger the setting of the next and previous elements.
         **/
        setupClosestWaypoint: function(){
            // look through the available waypoints and find the one who's closest to the top of the user's browser
            var closestTop = {'element': null, 'position': 100000000};
            for(var i in SoulScroller2.waypoints['top']){
                // get the absolute distance from the top of the broswer window
                var elementTop = Math.abs(SoulScroller2.waypoints['top'][i].element.getBoundingClientRect().top);

                // if the current waypoint is closer then the last one, store the current one
                if(elementTop < closestTop.position){
                    closestTop['element']   = SoulScroller2.waypoints['top'][i].element;
                    closestTop['position']  = elementTop;
                    closestTop['object']    = SoulScroller2.waypoints['top'][i];
                }
            }

            // if we found an element
            if(closestTop.element){
                // activate its callback to fire the focus functions
                if(closestTop['object']['callback']){
                    closestTop['object'].callback();
                }else if(closestTop['object']['waypoints']){
                    // if we're using the Waypoints Inview script on the waypoints, fire the callback on the first of the Inview waypoints
                    closestTop['object']['waypoints'][0].callback();
                }
            }
        },

        /**
         * Creates the list of all the page's nav elements.
         **/
        setupNavList: function(){
            SoulScroller2.storedNavs = $('.soul-scroller-2-nav');
        },

        /**
         * Creates floating navigation buttons for controlling the up and down navigation of the nav elements.
         **/
        createNavButtons: function(){
            // exit if there aren't any nav elements
            if(SoulScroller2.storedNavs.length < 1){
                return;
            }

            // create the nav buttons and attach them to the page's body
            $('body').append('<div class="soul-scroller-button-container">\
                                <div class="soul-scroller-2-nav-button">\
                                    <a class="up soul-nav-scroll-button" data="soul-nav-scroll-button" href="#">↑</a>\
                                    <a class="down soul-nav-scroll-button" data="soul-nav-scroll-button" href="#">↓</a>\
                                </div>\
                            </div>');

            // listen for clicks on the newly created buttons
            SoulScroller2.setupNavClicks();

            // also listen for scrolling events generated by the user to cancel the animation on
            SoulScroller2.setupScrollAnimationKillEvents();
        },

        /**
         * Attaches the listeners for the navigation button clicks.
         **/
        setupNavClicks: function(){
            $('.soul-scroller-2-nav-button .up').on('click', SoulScroller2.scrollUp);
            $('.soul-scroller-2-nav-button .down').on('click', SoulScroller2.scrollDown);
        },

        /**
         * Listens for the user doing any sort of page scrolling and makes a call to killAnimation if any page scrolling occurs while an animation is in progress.
         **/
        setupScrollAnimationKillEvents: function(){
            $(window).on('touchstart', function(e){ if(SoulScroller2.isScrolling){ SoulScroller2.killAnimation(e); } });
            $(window).on('click',       function(e){ if(SoulScroller2.isScrolling){ SoulScroller2.killAnimation(e); } });
            $(window).on('wheel',       function(e){ if(SoulScroller2.isScrolling){ SoulScroller2.killAnimation(e); } });
            $(window).on('mousewheel',  function(e){ if(SoulScroller2.isScrolling){ SoulScroller2.killAnimation(e); } });
            $(window).on('keydown',     function(e){ if(SoulScroller2.isScrolling){ SoulScroller2.killAnimation(e); } });
        },

        /**
         * Kills any animation in progress.
         * Ignores when the user clicks on the scroll buttons.
         **/
        killAnimation: function(e){
            // exit if the event target isn't defined or the user clicked on a scroll button
            if(!e || !e.target || e.target.classList.contains('soul-nav-scroll-button')){
                return;
            }

            // kill the current animation
            SoulScroller2.animatedScroll.kill();
            SoulScroller2.animatedScroll = null;
            // make the call to the animation "completed" function to setup the scroll data
            SoulScroller2.scrollStop();
        },

        /**
         * Handles the "move up" navigation events.
         * When the user clicks on an "Up" button, this function runs the process of navigating to the prior nav element if ones available
         **/
        scrollUp: function(e){
            e.preventDefault();

            // exit if the "Up" button is disabled or we're waiting for it to cool down after the last click
            if($(this).hasClass('soul-scroller-2-disabled') || SoulScroller2.waitingForButtonCooldown){
                return;
            }

            // set the button cool down so the button can't be clicked too fast //Ex: On a touch screen, it's possible to fire the click event 2-4 times if the tap isn't really fast
            SoulScroller2.setNavClickWaiter();

            var doNav = false;
            // if we aren't currently animating and there is one nav down from the currently focused one
            if( (SoulScroller2.currentNavIndex > 0) && false === SoulScroller2.isScrolling){
                // set the navigation target for the nav above the current one
                doNav = true;
                SoulScroller2.animationTargetNavId = SoulScroller2.currentNavIndex - 1;
                
            }else if( (SoulScroller2.animationTargetNavId > 0) &&  true === SoulScroller2.isScrolling){
                // if we are animating, and there's a nav after the one we're naving to

                // set the animation target for the nav above the current target
                SoulScroller2.animationTargetNavId -= 1;
                doNav = true;
            }
            

            // if we have a "next" nav
            if(doNav){
                // navigate to it
                SoulScroller2.animatedScroll = TweenMax.to(window, SoulScroller2.animationSpeed, {scrollTo: {y:$(SoulScroller2.storedNavs[SoulScroller2.animationTargetNavId]).offset().top, autoKill: false, /*onAutoKill: SoulScroller2.handleCanceledAnimation*/}, ease:Power4.easeOut, onStart: SoulScroller2.scrollStart, onComplete: SoulScroller2.scrollStop});

                // output where we're going
                //console.log('Animating up to index: ' + SoulScroller2.animationTargetNavId);
            }
        },

        /**
         * Handles the "move down" navigation events.
         * When the user clicks on an "Down" button, this function runs the process of navigating to the next nav element if ones available
         **/
        scrollDown: function(e){
            e.preventDefault();

            // exit if the "Down" button is disabled or we're waiting for it to cool down after the last click
            if($(this).hasClass('soul-scroller-2-disabled') || SoulScroller2.waitingForButtonCooldown){
                return;
            }

            // set the button cool down so the button can't be clicked too fast 
            SoulScroller2.setNavClickWaiter();

            
            var doNav = false;
            // if we aren't currently animating and there is one nav down from the currently focused one
            if( (SoulScroller2.storedNavs.length > SoulScroller2.currentNavIndex + 1) && false === SoulScroller2.isScrolling){
                // set the navigation target for the nav below the current one
                SoulScroller2.animationTargetNavId = SoulScroller2.currentNavIndex + 1;
                doNav = true;
            }else if( (SoulScroller2.storedNavs.length > SoulScroller2.animationTargetNavId + 1) &&  true === SoulScroller2.isScrolling){
                // if we are currently animating, and there's a nav after the one we're naving to
                
                // set the animation target for the nav below the current target
                SoulScroller2.animationTargetNavId += 1;
                doNav = true;
            }

            // if we have a "next" nav
            if(doNav){
                // navigate to it
                SoulScroller2.animatedScroll = TweenMax.to(window, SoulScroller2.animationSpeed, {scrollTo: {y:$(SoulScroller2.storedNavs[SoulScroller2.animationTargetNavId]).offset().top, autoKill: false/*onAutoKill: SoulScroller2.handleCanceledAnimation*/}, ease:Power4.easeOut, onStart: SoulScroller2.scrollStart, onComplete: SoulScroller2.scrollStop});

                // output where we're going
                //console.log('Animating down to index: ' + SoulScroller2.animationTargetNavId);
            }
        },

        /**
         * Helper function. Sets a boolean to indicate that there's a scroll animation in progress
         **/
        scrollStart: function(){
            SoulScroller2.isScrolling = true;
        },

        /**
         * Helper function. Clears the boolean that says a scroll animation is in progress.
         * Also makes a slightly delayed call to setupClosestWaypoint to do a live calculation of which is the closest nav at the end of the animation.
         * This is to make sure the list of stored navs is accurately tagged with "previous", "current", and "next"
         **/
        scrollStop: function(){
            SoulScroller2.isScrolling = false;
            clearTimeout(SoulScroller2.waitingForScrollStop);
            SoulScroller2.waitingForScrollStop = setTimeout(function(){SoulScroller2.setupClosestWaypoint();}, 15);
        },

        /**
         * Helper function. Clears the boolean that says a scroll animation is in progress.
         * And calls setupClosestWaypoint to get which nav is the closest
         **/
        handleCanceledAnimation: function(){
            SoulScroller2.isScrolling = false;
            clearTimeout(SoulScroller2.waitingForScrollStop);
            SoulScroller2.waitingForScrollStop = setTimeout(function(){SoulScroller2.setupClosestWaypoint();}, 15);
        },

        /**
         * Helper function. Creates a button click cooldown so a button doesn't get clicked multiple times in a single click attempt.
         **/
        setNavClickWaiter: function(){
            // exit if we're already waiting after a button push
            if(SoulScroller2.waitingForButtonCooldown){
                return;
            }

            // setup or button cooldown waiter
            SoulScroller2.waitingForButtonCooldown = true;
            buttonClickWaiter = setTimeout(function(){ SoulScroller2.waitingForButtonCooldown = false; }, 1);
        },

        /**
         * Creates the SoulScroller2 Nav Menu if there's nav elements and they've been titled.
         **/
        createNavMenu: function(){
            var titledElements  = $('.soul-scroller-2-nav[data-soul-scroller-2-nav-title]'),
                navMenu         = '',
                menuItems       = '';

            // if we've found titled elements
            titledElements.each(function(index, element){
                // get the element's title and tag it with a data index so we can corrolate menu clicks
                var title = $(element).attr('data-soul-scroller-2-nav-title');
                $(element).attr('data-soul-scroller-2-menu-id', index);

                // skip the current item if there's no title
                if(!title || title.length < 1){
                    return;
                }

                // create the nav item for the current element and add it to the nav menu's list of elements
                menuItems += '<li class="soul-scroller-2-nav-menu-item" data-soul-scroller-2-menu-item="' + index + '"><a href="#" class="soul-scroller-2-nav-menu-link">' + title + '</a></li>';
            });

            // exit if we weren't able to make any nav items
            if(!menuItems || menuItems.length < 1){
                return;
            }

            // create the full nav menu with the nav items
            navMenu += '<div class="soul-scroll-2-nav-menu-wrapper">\
                            <div class="soul-scroller-2-nav-menu-container">\
                                <ul class="soul-scroller-2-nav-menu">\
                                    ' + menuItems + '\
                                </ul>\
                            </div>\
                        </div>';

            // and attach the whole thing to the page's body
            $('body').append(navMenu);

            // setup click listening for the nav menu now that it's created
            SoulScroller2.setupNavMenuClicks();

            // and disable clicks on the menu anchors
            SoulScroller2.disableNavAnchorClicks();
        },

        /**
         * Listens for clicks on the nav menu's items.
         **/
        setupNavMenuClicks: function(){
            $('.soul-scroller-2-nav-menu-item').on('click', SoulScroller2.handleNavMenuClicks);
        },

        /**
         * Handles clicks on the nav menu's items and scrolls the page to the element that the nav item relates to if its available.
         **/
        handleNavMenuClicks: function(){
            var itemId = $(this).attr('data-soul-scroller-2-menu-item'),
                navElement = $('.soul-scroller-2-nav[data-soul-scroller-2-menu-id="' + itemId + '"]');
            
            if(navElement && navElement.length > 0){
                // navigate to it
                SoulScroller2.animatedScroll = TweenMax.to(window, SoulScroller2.animationSpeed, {scrollTo: {y:navElement.offset().top, onAutoKill: SoulScroller2.handleCanceledAnimation}, ease:Power2.easeOut, onStart: SoulScroller2.scrollStart, onComplete: SoulScroller2.scrollStop});

                // remove any existing nav highlight classes
                $('.soul-scroller-2-highlit-menu-item').removeClass('soul-scroller-2-highlit-menu-item');

                // and tag the clicked nav as the focused one
                $(this).addClass('soul-scroller-2-highlit-menu-item');
            }
        },

        /**
         * Helper function. Disables the default link action when one of the menu items's anchor tags is clicked on.
         **/
        disableNavAnchorClicks: function(){
            $('.soul-scroller-2-nav-menu-link').on('click', function(e){ e.preventDefault(); });
        },

        end: {} // todo remove when done, just using it as a bookend
    };
    
    SoulScroller2.init();
});
