import { svgImages } from '../assets/datas/images'

class Svg {
  constructor (viewBox = [0, 0, 64, 64], color = 'transparent', opacity = 1.0, width = '100%', height = '100%', stroke) {
    this.template = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="${viewBox[0]} ${viewBox[1]} ${viewBox[2]} ${viewBox[3]}" fill="${stroke ? 'none' : color}" stroke="${stroke ? color : 'none'}" opacity="${opacity}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`
    this.cursor = this.template.length
    this.template += `</svg>`
  }
  _add (element) {
    this.template = [this.template.slice(0, this.cursor), element, this.template.slice(this.cursor)].join('')
    this.cursor += element.length
  }
  /* Fluent builders */
  icon (icon, moustaches = {}) {
    if (!icon) return this
    // Replace moustaches in svg defs
    const element = icon.svg.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => moustaches[key] || '')
    this._add(element)
    return this
  }
  circle (centerX = 0, centerY = 0, radius = 6, fill = 'transparent', stroke = 'transparent', strokeWidth = 0) {
    const element = `<circle cx="${centerX}" cy="${centerY}" r="${radius}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="${fill}" />`
    this._add(element)
    return this
  }
  progressCircularIndeterminate (size = 66, strokeWidth = 6) {
    const center = Math.floor(size / 2)
    const radius = Math.floor((size - strokeWidth) / 2)
    const element = `<style type="text/css" ><![CDATA[@keyframes rotator {0% {-webkit-transform: rotate(0deg); transform: rotate(0deg);} 100% {-webkit-transform: rotate(270deg); transform: rotate(270deg);}} @keyframes dash {0% {stroke-dashoffset: 187;} 50% {stroke-dashoffset: 46.75; -webkit-transform: rotate(135deg); transform: rotate(135deg);} 100% {stroke-dashoffset: 187; -webkit-transform: rotate(450deg); transform: rotate(450deg);}} circle {stroke-dasharray: 187; stroke-dashoffset: 0; -webkit-transform-origin: center; -ms-transform-origin: center; transform-origin: center; -webkit-animation: dash 1.4s ease-in-out infinite; animation: rotator 1.4s linear infinite, dash 1.4s ease-in-out infinite;}]]></style><circle fill="none" stroke-width="${strokeWidth}" stroke-linecap="round" cx="${center}" cy="${center}" r="${radius}"/>`
    this._add(element)
    return this
  }
  text (text = '', width = 20, height = 20, halign = 'center', valign = 'center', textFontWeight = 'normal', textColor = '#5f6368', textSize = 12) {
    let x = 0
    let y = 0
    let baseline = 'text-before-edge'
    let anchor = 'start'
    switch (halign) {
      case 'start':
        break
      case 'center':
        x = Math.floor(width / 2)
        anchor = 'middle'
        break
      case 'end':
        x = width
        anchor = 'end'
        break
      default:
    }
    switch (valign) {
      case 'start':
        break
      case 'center':
        y = Math.floor(height / 2)
        baseline = 'central'
        break
      case 'end':
        y = height
        baseline = 'text-after-edge'
        break
      default:
    }
    const element = `
      <text
        x="${x}"
        y="${y}"
        font-size="${textSize}px"
        font-family="Roboto,RobotoDraft,Helvetica,Arial,sans-serif"
        font-weight="${textFontWeight}"
        dominant-baseline="${baseline}"
        text-anchor="${anchor}"
        fill="${textColor}">
        ${text}
      </text>`
    this._add(element)
    return this
  }
  spacer (width = 10) {
    const element = `<rectangle width="${width}"/>`
    this._add(element)
    return this
  }
  /* Ending renderers */
  render () {
    return this.template
  }
  toURI () {
    return `data:image/svg+xml;utf8,${encodeURIComponent(this.render())}`
  }
  toBase64 () {
    // can be heavier than simple svg template
    return window.btoa(this.render())
  }
  toBase64URI () {
    // can be heavier than simple svg template
    return `data:image/svg+xml;base64,${this.toBase64()}`
  }
  override ($parent = window.document, selector = ':scope > *', overridingClasses = []) {
    const toOverride = $parent.querySelector(selector)
    if (!toOverride) return this
    overridingClasses.map(oClass => toOverride.classList.add(oClass))
    toOverride.innerHTML = this.render()
  }
  overrideURI ($parent = window.document, selector = ':scope > *', overridingClasses = []) {
    const toOverride = $parent.querySelector(selector)
    if (!toOverride) return this
    overridingClasses.map(oClass => toOverride.classList.add(oClass))
    toOverride.setAttribute('src', this.toURI())
  }
}
/* References to defs */
Svg.ARROW_LEFT = svgImages.arrow_left
Svg.ARROW_RIGHT = svgImages.arrow_right

export default Svg