import { useControls } from 'leva'

/**
 * Custom hook để kiểm soát transform của nhẫn (rotation, position, scale)
 * Hiển thị controls trong Leva GUI
 */
export function useRingTransform() {
  const transform = useControls('Ring Transform', {
    // Rotation controls (đơn vị: radian)
    rotationX: {
      value: 0,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Rotation X'
    },
    rotationY: {
      value: 0,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Rotation Y'
    },
    rotationZ: {
      value: 0,
      min: -Math.PI,
      max: Math.PI,
      step: 0.01,
      label: 'Rotation Z'
    },

    // Position controls
    positionX: {
      value: 0,
      min: -5,
      max: 5,
      step: 0.1,
      label: 'Position X'
    },
    positionY: {
      value: -0.12,
      min: -5,
      max: 5,
      step: 0.1,
      label: 'Position Y'
    },
    positionZ: {
      value: 0,
      min: -5,
      max: 5,
      step: 0.1,
      label: 'Position Z'
    },

    // Scale control
    scale: {
      value: 0.1,
      min: 0.01,
      max: 1,
      step: 0.01,
      label: 'Scale'
    }
  })

  return {
    rotation: [transform.rotationX, transform.rotationY, transform.rotationZ],
    position: [transform.positionX, transform.positionY, transform.positionZ],
    scale: transform.scale
  }
}
