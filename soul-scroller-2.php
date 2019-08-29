<?php
/**
 * Plugin Name: Soul Scroller 2
 * Plugin URI:	...
 * Description: ...
 * Author:		Soul Plugins
 * Author URI:	URI: https://soulplugins.co
 * Version:		0.8
 * Text Domain: soul-scroller-2
 * Domain Path: /assets/lang/
 */

if(!class_exists('Soul_Scroller2')){
    class Soul_Scroller2{

        public function __construct(){
            self::load_constants();
            self::load_classes();
        }

        public static function load_constants(){
            define('SOUL_SCROLLER2_PLUGIN_VERSION', '1.0');
            define('SOUL_SCROLLER2_URL_PATH', trailingslashit(plugin_dir_url(__FILE__)));
            define('SOUL_SCROLLER2_PATH', trailingslashit(plugin_dir_path(__FILE__)));
        }

        public static function load_classes(){
            require(SOUL_SCROLLER2_PATH . 'classes/soul-scroller-2-enqueue-scripts.php');

            // if Beaver Builder is active, include our SoulScroller2 navigation inputs in the editor
            if(class_exists('FLBuilder')){
                require(SOUL_SCROLLER2_PATH . 'classes/soul-scroller-2-bb-editor-inputs.php');
            }
        }
    }

    add_action('plugins_loaded', function(){
        new Soul_Scroller2;
    }, 999);
}
?>
