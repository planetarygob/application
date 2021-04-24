import { BubbleData } from "../../webgl/data/BubbleData"
import { handleColorChange } from "../Changes"
import GUI from "./GUI"

let isBubbleAlreadyInit = false

// TODO : Do everyhting in the same GUI class
export const initGUI = () => {
    initBubbleGUI()
}

const initBubbleGUI = () => {
    isBubbleAlreadyInit = true
    if (!isBubbleAlreadyInit) {
        const bubbleFolder = GUI.addFolder('Bubble')

        const geoBubbleFolder = bubbleFolder.addFolder('geometry')
        geoBubbleFolder.add(BubbleData, 'speed', 0, 1, 0.1)
        geoBubbleFolder.add(BubbleData, 'density', 0, 1, 0.1)
        geoBubbleFolder.add(BubbleData, 'strength', 0, 1, 0.1)

        const matBubbleFolder = bubbleFolder.addFolder('material')
        matBubbleFolder.add(BubbleData, 'envMapIntensity', 0, 10, 1)
        matBubbleFolder.add(BubbleData, 'transmission', 0, 1, 0.01)
        matBubbleFolder.addColor(BubbleData, 'color').onChange(handleColorChange(BubbleData.color))
    }
}