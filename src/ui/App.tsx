export default function App() {
  return (
    <div className="app" data-app>
      <header className="appHeader">
        <div className="appHeaderInner">
          <div className="appTitleBlock">
            <h1 className="appTitle">Minesweeper Studio</h1>
            <p className="appSubtitle">
              Play Minesweeper, then optionally dial in themes, textures,
              typography, motion, HUD, cursor, and ambience.
            </p>
          </div>
        </div>
      </header>

      <main className="appMain">
        <section className="panel" aria-label="Game panel">
          <h2 className="panelTitle">Game</h2>
          <div className="placeholder">
            Milestone 0: bootstrapped. Engine + playable board coming next.
          </div>
        </section>

        <section className="panel" aria-label="Settings panel">
          <h2 className="panelTitle">Settings</h2>
          <div className="placeholder">
            All beautification features will be optional, reversible, and saved.
          </div>
        </section>
      </main>

      <footer className="appFooter">
        <small>
          Keyboard shortcuts (coming soon): R restart, 1/2/3 difficulties.
        </small>
      </footer>
    </div>
  )
}

