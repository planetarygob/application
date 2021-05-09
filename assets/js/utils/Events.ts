export const GLEvents = {
    UPDATE : 'gl:update',
    UPDATE_CUBE_CAMERA : 'gl:update_cube_camera',
    UPDATE_ANIMATION_MIXER: 'gl:update_animation_mixer',
    UPDATE_HIGHLIGHT_MANAGER: 'gl:update_highlight_manager',
    UPDATE_INTERACTION_MANAGER: 'gl:update_interaction_manager',
    UPDATE_TOOL_SCALE: 'gl:update_tool_scale',
    ANIMATION_MIXER_REQUIRED: 'gl:animation_mixer_required',
    HIGHLIGHT_MANAGER_REQUIRED: 'gl:highlight_manager_required',
    INTERACTION_MANAGER_REQUIRED: 'gl:interaction_manager_required',
    CLICK : 'gl:click',
    RESIZE : 'gl:resize',
    SELECTED_SYSTEM: 'gl:selected_system',
    CLICK_PLANET: 'gl:click_planet',
    MOUSE_OVER_PLANET: 'gl:mouse_over_planet',
    MOUSE_OUT_PLANET: 'gl:mouse_out_planet',
    TOGGLE_ORBIT_CONTROLS: 'gl:toggle_orbit_controls',
    TOGGLE_BLUR : 'gl:toggle_blur',
    SETUP_SCENERY_INTERACTION: 'gl:setup_scenery_interaction',
    SCENE_CLICKED: 'gl:scene_clicked'
}

export const UIEvents = {
    SHOW_SYSTEM_TEXTS: 'ui:show_system_texts',
    SHOW_PLANET: 'ui:show_planet',
    SHOW_PLANET_DIALOG: 'ui:show_planet_dialog',
    SHOW_PLANET_MODAL: 'ui:show_planet_modal',
    SELECTED_PLANET_INFOS: 'ui:selected_planet_infos',
    UPDATE_LOADER: 'ui:update_loader',
    TOGGLE_LOADER: 'ui:toggle_loader',
    RESET_PLANET_DIALOG: 'ui:reset_planet_dialog',
    SHOW_SCENERY_INTERACTION_INSTRUCTION: 'ui:show_scenery_interaction_instruction',
    RELAUNCH_ROCK_ANIMATION: 'ui:relaunch_rock_animation',
    SHOW_INFORMATIONS_DIALOG: 'ui:show_informations_dialog',
    ROCK_ANIMATION_IS_ENDED: 'ui:rock_animation_is_ended',
    TOGGLE_DISCOVER_CURSOR: 'ui:toggle_discover_cursor',
    TOGGLE_BUTTON_CURSOR: 'ui:toggle_button_cursor',
    TOGGLE_OPEN_CURSOR: 'ui:toggle_open_cursor',
    TOGGLE_GRAB_CURSOR: 'ui:toggle_grab_cursor',
}

export const AnimationEvents = {
    NEXT_SYSTEM: 'animation:next_system',
    PREVIOUS_SYSTEM: 'animation:previous_system',
    DISCOVER_SYSTEM: 'animation:discover_system',
    SYSTEM_ZOOM_FINISHED: 'animation:system_zoom_finished',
    PLANET_ZOOM_FINISHED: 'animation:planet_zoom_finished',
    BACK: 'animation:back',
    BACK_ON_SYSTEM_CHOICE: 'animation:back_on_system_choice'
}

export const ProgressBarEvents = {
    SHOW_SELECTED_SYSTEM: 'progress_bar:show_selected_system',
    SHOW_ALL_SYSTEMS: 'progress_bar:show_all_systems',
    UPDATE_PROGRESS_BAR: 'progress_bar:update_progress_bar',
    SHOW_PROGRESS_BAR: 'progress_bar:show_progress_bar'
}