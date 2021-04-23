<template>
  <span
    ref="svg"
    :class="{'clickable': clickable}"
    v-on="clickable ? { click: () => this.$emit('click') } : {}"
    v-html="html"/>
</template>
<script>

import SVG from '../libs/svg'
import { svgImages } from '../assets/datas/images'

export default {
  props: {
    svgName: {
      type: String,
      required: true
    },
    moustaches: {
      type: Object,
      required: false,
      default: () => {}
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: false,
      default: 0
    },
    color: {
      type: String,
      required: false,
      default: '#FFFFFF'
    },
    fillOpacity: {
      type: Number,
      required: false,
      default: 1.0
    },
    disabledColor: {
      type: String,
      required: false,
      default: '#FFFFFF'
    },
    disabledClass: {
      type: String,
      required: false,
      default: null
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    clickable: {
      type: Boolean,
      required: false,
      default: false
    },
    stroke: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    html () {
        const svgName = this.svgName.replace('/"','/');
        const image = svgImages[svgName]
        if (!image) return null
        const color = this.disabled ? this.disabledColor : this.color
        return new SVG(image.viewBox, color || '#FFFFFF', this.fillOpacity || 1.0, this.width, this.height || 'auto', this.stroke || false)
            .icon(image, this.moustaches)
            .render()
        }
  },
  beforeDestroy () {
    while (this.$refs.svg.firstChild) {
      this.$refs.svg.removeChild(this.$refs.svg.firstChild)
    }
  }
}
</script>
<style lang="css" scoped>
  .clickable {
    cursor: pointer !important
  }
</style>