import { Color } from 'three'
import { BubbleData } from '../webgl/data/BubbleData';

// TODO : Find a better way to do that
export const handleColorChange = ( color: Color ) => {
    return function ( value: any ) {
        if ( typeof value === 'string' ) {
            value = value.replace( '#', '0x' )
        }
        color.setHex( value )
        console.log(BubbleData.color)
    }
}