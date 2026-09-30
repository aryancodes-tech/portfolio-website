/* eslint-disable react/prop-types */
import { FaRegCopy } from 'react-icons/fa6'
import { FaCheckCircle } from 'react-icons/fa'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard'

/**
 * Copies `content` to the clipboard when clicked.
 * @param {{ content: string }} props
 */
const CopyToClipboardButton = ({ content }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  const label = isCopied ? 'Email copied' : 'Copy email address'

  return (
    <button
      type="button"
      onClick={() => copyToClipboard(content)}
      aria-label={label}
      className="inline-flex items-center justify-center rounded p-1 text-[hsl(var(--faint))] transition-colors hover:text-[hsl(var(--ink))]"
    >
      {isCopied ? <FaCheckCircle size={12} aria-hidden /> : <FaRegCopy size={12} aria-hidden />}
    </button>
  )
}

export default CopyToClipboardButton
