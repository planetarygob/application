export const GLEvents = {
    UPDATE : 'gl:update',
    UPDATE_CUBE_CAMERA : 'gl:update_cube_camera',
    UPDATE_INTERACTION_MANAGER : 'gl:update_interaction_manager',
    CLICK : 'gl:click',
    SELECTED_SYSTEM: 'gl:selected_system',
    CLICK_PLANET: 'gl:click_planet',
    MOUSE_OVER_PLANET: 'gl:click_planet',
    MOUSE_OUT_PLANET: 'gl:click_planet'
}

export const UIEvents = {
    SHOW_SYSTEM_TEXTS: 'ui:show_system_texts',
    SHOW_PLANET: 'ui:show_planet'
}

export const AnimationEvents = {
    NEXT_SYSTEM: 'animation:next_system',
    PREVIOUS_SYSTEM: 'animation:previous_system',
    DISCOVER_SYSTEM: 'animation:discover_system',
    SYSTEM_ZOOM_FINISHED: 'animation:system_zoom_finished',
    PLANET_ZOOM_FINISHED: 'animation:planet_zoom_finished',
}