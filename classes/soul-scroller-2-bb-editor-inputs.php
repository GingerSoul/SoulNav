<?php
if(!class_exists('Soul_Scroller2_Add_BB_Settings')){
    class Soul_Scroller2_Add_BB_Settings{
        
        public function __construct(){
            self::load_hooks();
        }
        
        public static function load_hooks(){
            // add our SoulScroller2 controls to the BB editors for each type of content
            add_filter('fl_builder_register_settings_form', array(__CLASS__, 'add_soulscroller2_settings_to_bb_forms'), 99, 2);

            // add our SoulScroller2 navigation classes to any elements that have them
            add_filter('fl_builder_column_custom_class', array(__CLASS__, 'filter_classes'), 10, 2);
            add_filter('fl_builder_row_custom_class', array(__CLASS__, 'filter_classes'), 10, 2);
            add_filter('fl_builder_module_custom_class', array(__CLASS__, 'filter_classes'), 10, 2);

            // add our SoulScroller2 Floating Nav Menu item title data attribute to any elements that have them
            add_filter('fl_builder_column_attributes', array(__CLASS__, 'filter_attributes'), 10, 2);
            add_filter('fl_builder_row_attributes', array(__CLASS__, 'filter_attributes'), 10, 2);
            add_filter('fl_builder_module_attributes', array(__CLASS__, 'filter_attributes'), 10, 2);
            
        }
        
        /**
         * Adds the SoulScroller2 settings to the editor forms for the BB columns, rows, and modules
         **/
        public static function add_soulscroller2_settings_to_bb_forms($form, $id){
            // exit if there's no form or we're in the admin screen
            if(empty($form) || is_admin()){
                return $form;
            }
            
            if('col' === $id){
                $form = self::add_soulscroller2_settings_to_columns($form, $id);
            }elseif('row' === $id){
                $form = self::add_soulscroller2_settings_to_rows($form, $id);
            }elseif('module_advanced' === $id){
                $form = self::add_soulscroller2_settings_to_modules($form, $id);
            }
            
            return $form;
        }

        /**
         * Adds the SoulScroller2 settings to BB Columns' Advanced editor tab 
         **/
        public static function add_soulscroller2_settings_to_columns($form, $id){
            global $global_settings;
            
            if(empty($global_settings)){
                $global_settings = FLBuilderModel::get_global_settings();
            }
            if(isset($form['tabs']) && isset($form['tabs']['advanced']) && !isset($form['tabs']['advanced']['sections']['soul_scroller2_settings'])){
                $form['tabs']['advanced']['sections']['soul_scroller2_settings'] = array(
                    'title'  => __( 'Soul Scroller2 Settings', 'soul-scroller-2' ),
                    'fields' => array(
                        'soul_scroller2_is_nav_element' => array(
                            'type'      => 'select',
                            'label'     => __('Is SoulScroller2 Nav Element?', 'soul-scroller-2'),
                            'options'   => array(
                                ''      => __('No', 'soul-scroller-2'),
                                'yes'   => __('Yes', 'soul-scroller-2')
                            ),
                            'default'    => '',
                            'toggle'  => array(
								'yes' => array(
									'fields' => array('soul_scroller2_nav_title'),
								)
							),
							'preview' => array(
								'type' => 'none',
							),
                        ),
                        'soul_scroller2_nav_title'  => array(
                            'type'      => 'text',
                            'label'     => __('SoulScroller2 Nav Menu Title for this element', 'soul-scroller-2'),
                            'help'      => __('The SoulScroller2 Nav Menu makes a list of Menu Items from all the nav elements on the page, and it uses these titles to create the names for the Menu items. If you don\'t enter a title, SoulScroller won\'t be able to create the Menu Item in the Floating Nav Menu.', 'soul-scroller-2'),
                            'default'   => '',
                            'placeholder'   => __('A short and simple title works well. Ex: for the section that\'s about hiring you, "Hire Me" is clear and to the point.', 'soul-scroller-2'),
							'preview'   => array(
								'type'  => 'none',
							),
                        
                        ),
                    ),
                );
            }
            
            return $form;
            
        }

        /**
         * Adds the SoulScroller2 settings to BB Rows' Advanced editor tab 
         **/
        public static function add_soulscroller2_settings_to_rows($form, $id){
            global $global_settings;

            if(empty($global_settings)){
                $global_settings = FLBuilderModel::get_global_settings();
            }
            if(isset($form['tabs']) && isset($form['tabs']['advanced']) && !isset($form['tabs']['advanced']['sections']['soul_scroller2_settings'])){
                $form['tabs']['advanced']['sections']['soul_scroller2_settings'] = array(
                    'title'  => __('Soul Scroller2 Settings', 'soul-scroller-2'),
                    'fields' => array(
                        'soul_scroller2_is_nav_element' => array(
                            'type'      => 'select',
                            'label'     => __('Is SoulScroller2 Nav Element?', 'soul-scroller-2'),
                            'options'   => array(
                                ''      => __('No', 'soul-scroller-2'),
                                'yes'   => __('Yes', 'soul-scroller-2')
                            ),
                            'default'    => '',
                            'toggle'  => array(
								'yes' => array(
									'fields' => array('soul_scroller2_nav_title'),
								)
							),
							'preview' => array(
								'type' => 'none',
							),
                        ),
                        'soul_scroller2_nav_title'  => array(
                            'type'      => 'text',
                            'label'     => __('SoulScroller2 Nav Menu Title for this element', 'soul-scroller-2'),
                            'help'      => __('The SoulScroller2 Nav Menu makes a list of Menu Items from all the nav elements on the page, and it uses these titles to create the names for the Menu items. If you don\'t enter a title, SoulScroller won\'t be able to create the Menu Item in the Floating Nav Menu.', 'soul-scroller-2'),
                            'default'   => '',
                            'placeholder'   => __('A short and simple title works well. Ex: for the section that\'s about hiring you, "Hire Me" is clear and to the point.', 'soul-scroller-2'),
							'preview'   => array(
								'type'  => 'none',
							),
                        ),
                    ),
                );
            }

            return $form;
        }

        /**
         * Adds the SoulScroller2 settings to BB Modules' Advanced editor tab 
         **/
        public static function add_soulscroller2_settings_to_modules($form, $id){
            global $global_settings;

            if(empty($global_settings)){
                $global_settings = FLBuilderModel::get_global_settings();
            }

            if(isset($form['sections']) && !isset($form['sections']['soul_scroller2_settings'])){
                $form['sections']['soul_scroller2_settings'] = array(
                    'title'  => __('Soul Scroller2 Settings', 'soul-scroller-2'),
                    'fields' => array(
                        'soul_scroller2_is_nav_element' => array(
                            'type'      => 'select',
                            'label'     => __('Is SoulScroller2 Nav Element?', 'soul-scroller-2'),
                            'options'   => array(
                                ''      => __('No', 'soul-scroller-2'),
                                'yes'   => __('Yes', 'soul-scroller-2')
                            ),
                            'default'    => '',
                            'toggle'  => array(
                                'yes' => array(
                                    'fields' => array('soul_scroller2_nav_title'),
                                )
                            ),
                            'preview' => array(
                                'type' => 'none',
                            ),
                        ),
                        'soul_scroller2_nav_title'  => array(
                            'type'      => 'text',
                            'label'     => __('SoulScroller2 Nav Menu Title for this element', 'soul-scroller-2'),
                            'help'      => __('The SoulScroller2 Nav Menu makes a list of Menu Items from all the nav elements on the page, and it uses these titles to create the names for the Menu items. If you don\'t enter a title, SoulScroller won\'t be able to create the Menu Item in the Floating Nav Menu.', 'soul-scroller-2'),
                            'default'   => '',
                            'placeholder'   => __('A short and simple title works well. Ex: for the section that\'s about hiring you, "Hire Me" is clear and to the point.', 'soul-scroller-2'),
                            'preview'   => array(
                                'type'  => 'none',
                            ),
                        ),
                    ),
                );
            }

            return $form;
        }


        /**
         * Applies the 'soul-scroller-2-nav' tracking class to the elements that the user has designated as nav elements
         **/
        public static function filter_classes($classes, $node){
            if(isset($node->settings->soul_scroller2_is_nav_element) && 'yes' === $node->settings->soul_scroller2_is_nav_element){
                $classes .= ( ' soul-scroller-2-nav' );
            }
            return $classes;
        }

        /**
         * Applies the 'soul-scroller-2-nav-title' data attribute to each element that has a SoulScroller2 nav menu title.
         * This attribute it used to create the nav item in the floating menu
         **/
        public static function filter_attributes($attributes, $node){
            
            if(isset($node->settings->soul_scroller2_is_nav_element) && 'yes' === $node->settings->soul_scroller2_is_nav_element && !empty($node->settings->soul_scroller2_nav_title)){
                $attributes['data-soul-scroller-2-nav-title'] = esc_attr($node->settings->soul_scroller2_nav_title);
            }
            return $attributes;
        }
    }
    
    new Soul_Scroller2_Add_BB_Settings;
}

