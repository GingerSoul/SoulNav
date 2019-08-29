<?php
if(!class_exists('Soul_Scroller2_Enqueue_Scripts')){
    class Soul_Scroller2_Enqueue_Scripts{

        public function __construct(){
            self::load_hooks();
        }

        public static function load_hooks(){
            add_action('wp_enqueue_scripts', array(__CLASS__, 'enqueue_soul_scroller_2_scripts'), 99);
            add_action('wp_enqueue_scripts', array(__CLASS__, 'enqueue_soul_scroller_2_styles'));
        }

        public static function enqueue_soul_scroller_2_scripts(){
            // todo check if TweenMAX is present, and if it's not, enqueue our own version

            // if waypoints isn't already enqueued, enqueue one for our use
            if(!wp_script_is('jquery-waypoints2', 'enqueued')){
                wp_enqueue_script('jquery-waypoints2', SOUL_SCROLLER2_URL_PATH . 'assets/js/jquery.waypoints.min.js');
            }

            // enqueue the main file that does the nav magic
            wp_enqueue_script('soul-scroller-2-main-script', SOUL_SCROLLER2_URL_PATH . 'assets/js/soul-scroller-2-main-script.js', array('jquery'), false, true);
            // enqueue the waypoints.js inview shortcut script
//            wp_enqueue_script('soul-scroller-2-waypoint-inview', SOUL_SCROLLER2_URL_PATH . 'assets/js/inview.min.js', array('jquery-waypoints'), false, true);
        }

        public static function enqueue_soul_scroller_2_styles(){
            wp_enqueue_style('soul-scroller-2-main-styles', SOUL_SCROLLER2_URL_PATH . 'assets/css/soul-scroller-2-main-styles.css');
        }
    }

    new Soul_Scroller2_Enqueue_Scripts;
}


?>
