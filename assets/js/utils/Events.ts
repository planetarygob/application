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
    SELECTED_SYSTEM: 'gl:selected_system',
    CLICK_PLANET: 'gl:click_planet',
    MOUSE_OVER_PLANET: 'gl:mouse_over_planet',
    MOUSE_OUT_PLANET: 'gl:mouse_out_planet',
    TOGGLE_ORBIT_CONTROLS: 'gl:toggle_orbit_controls',
    SETUP_SCENERY_INTERACTION: 'gl:setup_scenery_interaction'
}

export const UIEvents = {
    SHOW_SYSTEM_TEXTS: 'ui:show_system_texts',
    SHOW_PLANET: 'ui:show_planet',
    SHOW_PLANET_DIALOG: 'ui:show_planet_dialog',
    SHOW_PLANET_MODAL: 'ui:show_planet_modal',
    SELECTED_PLANET_INFOS: 'ui:selected_planet_infos',
    UPDATE_LOADER: 'ui:update_loader',
    TOGGLE_LOADER: 'ui:toggle_loader',
    RESET_PLANET_DIALOG: 'ui:reset_planet_dialog'
}

export const AnimationEvents = {
    NEXT_SYSTEM: 'animation:next_system',
    PREVIOUS_SYSTEM: 'animation:previous_system',
    DISCOVER_SYSTEM: 'animation:discover_system',
    SYSTEM_ZOOM_FINISHED: 'animation:system_zoom_finished',
    PLANET_ZOOM_FINISHED: 'animation:planet_zoom_finished',
    BACK: 'animation:back'
}