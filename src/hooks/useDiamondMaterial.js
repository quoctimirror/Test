import { useState, useEffect } from 'react'
import * as THREE from 'three'

/**
 * Hook để load và parse file .dmat (Diamond Material)
 * @param {string} dmatPath - Path tới file .dmat trong public folder
 * @returns {object} Material props cho MeshRefractionMaterial
 */
export function useDiamondMaterial(dmatPath = '/gem_env/diamond-material.dmat') {
  const [materialProps, setMaterialProps] = useState(null)

  useEffect(() => {
    if (!dmatPath) return

    fetch(dmatPath)
      .then(res => res.json())
      .then(dmat => {
        // Convert color từ decimal sang THREE.Color
        const color = new THREE.Color(dmat.color)

        // Map properties từ .dmat sang MeshRefractionMaterial props
        const props = {
          color: color,
          envMapIntensity: dmat.envMapIntensity || 1,
          ior: dmat.refractiveIndex || 2.4, // Index of Refraction
          bounces: dmat.rayBounces || 3, // Số lần bounce của ray
          aberrationStrength: dmat.dispersion || 0.01, // Chromatic aberration
          fresnel: dmat.reflectivity || 0, // Fresnel effect
          toneMapped: false,
        }

        setMaterialProps(props)
      })
      .catch(err => {
        console.error('Failed to load .dmat file:', err)
        // Fallback to default props
        setMaterialProps({
          color: '#ffffff',
          ior: 2.4,
          bounces: 3,
          aberrationStrength: 0.01,
          toneMapped: false,
        })
      })
  }, [dmatPath])

  return materialProps
}
