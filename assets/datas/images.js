const svgImages = {}

svgImages.arrow_left = {
  svg: '<svg width="29" height="16" viewBox="0 0 29 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28 8L0.999992 8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 1L1 8L8 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  viewBox: [0, 0, 28, 28]
}

svgImages.arrow_right = {
  svg: '<svg width="29" height="16" viewBox="0 0 29 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 8L28 8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 1L28 8L21 15" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  viewBox: [0, 0, 28, 28]
}

svgImages.back = {
  svg: `<svg width="49" height="49" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="24.5" cy="24.5" r="24.5" fill="white"/>
  <path d="M26 30L20.1974 24.1974L26 18.3947" stroke="#120C23" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

export { svgImages }