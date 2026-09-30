/* eslint-disable react/prop-types */
import { TECH_ICONS } from '../constants/data/techIcons'

/**
 * Tool name with its brand mark. Renders label-only for tools without a mark.
 * @param {{ name: string, size?: number }} props
 */
const TechChip = ({ name, size = 13 }) => {
  const brand = TECH_ICONS[name]

  return (
    <span className="chip">
      {brand && (
        <brand.Icon size={size} style={brand.color ? { color: brand.color } : undefined} aria-hidden />
      )}
      {name}
    </span>
  )
}

export default TechChip
