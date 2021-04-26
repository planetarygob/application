export const GLEvents = {
    UPDATE : 'gl:update',
    UPDATE_CUBE_CAMERA : 'gl:update_cube_camera',
    UPDATE_ANIMATION_MIXER: 'gl:update_animation_mixer',
    ANIMATION_MIXER_REQUIRED: 'gl:animation_mixer_required',
    HIGHLIGHT_MANAGER_REQUIRED: 'gl:highlight_manager_required',
    CLICK : 'gl:click',
    SELECTED_SYSTEM: 'gl:selected_system',
    CLICK_PLANET: 'gl:click_planet',
    MOUSE_OVER_PLANET: 'gl:mouse_over_planet',
    MOUSE_OUT_PLANET: 'gl:mouse_out_planet',
    TOGGLE_ORBIT_CONTROLS: 'gl:toggle_orbit_controls'
}

export const UIEvents = {
    SHOW_SYSTEM_TEXTS: 'ui:show_system_texts',
    SHOW_PLANET: 'ui:show_planet',
    SHOW_PLANET_DIALOG: 'ui:show_planet_dialog',
    SHOW_PLANET_MODAL: 'ui:show_planet_modal',
    SELECTED_PLANET_INFOS: 'ui:selected_planet_infos',
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