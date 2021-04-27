import AnimationObject from "./AnimationObject"

class SceneryInteraction {
    animationTool: AnimationObject
    animationTarget: AnimationObject

    constructor(
        animationTool: AnimationObject,
        animationTarget: AnimationObject
    ) {
        this.animationTool = animationTool
        this.animationTarget = animationTarget
    }
}

export default SceneryInteraction
