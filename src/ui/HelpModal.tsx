import { Modal } from './Modal'

type HelpModalProps = {
  open: boolean
  onClose: () => void
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal
      open={open}
      title="Help & controls"
      onClose={onClose}
      actions={
        <button className="btn" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="helpModalGrid">
        <div className="helpBlock">
          <h3 className="helpH3">Mouse</h3>
          <ul className="helpUl">
            <li>
              <span className="helpKey">Left click</span> reveal
            </li>
            <li>
              <span className="helpKey">Right click</span> flag
            </li>
            <li>
              <span className="helpKey">Middle click</span> chord (reveal neighbors)
            </li>
            <li>
              <span className="helpKey">Shift + click</span> chord (alternative)
            </li>
          </ul>
        </div>

        <div className="helpBlock">
          <h3 className="helpH3">Keyboard</h3>
          <ul className="helpUl">
            <li>
              <span className="helpKey">Arrows</span> move focus
            </li>
            <li>
              <span className="helpKey">Enter</span> reveal focused tile
            </li>
            <li>
              <span className="helpKey">F</span> flag focused tile
            </li>
            <li>
              <span className="helpKey">Space</span> chord focused tile
            </li>
            <li>
              <span className="helpKey">R</span> restart
            </li>
            <li>
              <span className="helpKey">1 / 2 / 3</span> presets
            </li>
          </ul>
        </div>

        <div className="helpBlock">
          <h3 className="helpH3">Touch</h3>
          <p className="helpP">
            Tap to reveal. Long-press to flag. Two-finger tap on a revealed
            number to chord.
          </p>
        </div>
      </div>
    </Modal>
  )
}
