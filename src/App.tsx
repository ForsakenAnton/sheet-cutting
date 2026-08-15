import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { Part, Project, Settings, SheetSpec, Unit } from './types';
import { AppNavbar } from './components/AppNavbar';
import { SheetPanel } from './components/SheetPanel';
import { PartsPanel } from './components/PartsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { SummaryPanel } from './components/SummaryPanel';
import { ActionsPanel } from './components/ActionsPanel';
import { LayoutView } from './components/LayoutView';
import { CutList } from './components/CutList';
import { usePersistentState } from './hooks/usePersistentState';
import { useTheme } from './hooks/useTheme';
import { computeLayout } from './lib/layout';
import { DEFAULT_PROJECT, PROJECT_KEY } from './lib/project';
import { exportSvg } from './lib/exportSvg';

export default function App() {
  const theme = useTheme();
  const [project, setProject] = usePersistentState<Project>(PROJECT_KEY, DEFAULT_PROJECT);
  const [printing, setPrinting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const deferredProject = useDeferredValue(project);
  const result = useMemo(() => computeLayout(deferredProject), [deferredProject]);
  const computing = deferredProject !== project;

  useEffect(() => {
    if (!printing) {
      document.documentElement.setAttribute('data-bs-theme', theme.resolved);
      return;
    }
    document.documentElement.setAttribute('data-bs-theme', 'light');
    const timer = window.setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [printing, theme.resolved]);

  const updateSheet = (patch: Partial<SheetSpec>) => {
    setProject((current) => ({ ...current, sheet: { ...current.sheet, ...patch } }));
  };

  const updateSettings = (patch: Partial<Settings>) => {
    setProject((current) => ({ ...current, settings: { ...current.settings, ...patch } }));
  };

  const updateParts = (parts: Part[]) => {
    setProject((current) => ({ ...current, parts }));
  };

  const updateUnit = (unit: Unit) => {
    setProject((current) => ({ ...current, unit }));
  };

  const newProject = () => {
    if (!window.confirm('Start a new project? Current sheet and parts will be reset.')) return;
    setProject({ ...DEFAULT_PROJECT, parts: DEFAULT_PROJECT.parts.map((part) => ({ ...part })) });
  };

  const downloadPdf = async () => {
    const { exportPdf } = await import('./lib/exportPdf');
    exportPdf(deferredProject, result, 'cutting-plan.pdf');
  };

  return (
    <div className="app-shell">
      <AppNavbar
        unit={project.unit}
        onUnitChange={updateUnit}
        theme={theme.choice}
        onThemeChange={theme.setChoice}
        onNewProject={newProject}
      />

      <main className="app-main container-fluid py-3">
        <div className="row g-3 app-row">
          <div className="col-12 col-xl-3 app-col vstack gap-3 d-print-none">
            <SheetPanel sheet={project.sheet} unit={project.unit} onChange={updateSheet} />
            <PartsPanel
              parts={project.parts}
              unit={project.unit}
              allowRotation={project.settings.allowRotation}
              onChange={updateParts}
              onRotationChange={(value) => updateSettings({ allowRotation: value })}
            />
            <SettingsPanel
              settings={project.settings}
              unit={project.unit}
              onChange={updateSettings}
            />
          </div>

          <div className="col-12 col-xl-6 app-col vstack gap-3 print-wide">
            <LayoutView
              project={deferredProject}
              result={result}
              computing={computing}
              dark={theme.resolved === 'dark' && !printing}
              canvasRef={canvasRef}
            />
            <CutList project={deferredProject} result={result} />
          </div>

          <div className="col-12 col-xl-3 app-col vstack gap-3 print-wide">
            <SummaryPanel project={deferredProject} result={result} />
            <ActionsPanel
              disabled={result.sheets.length === 0}
              onExportPdf={downloadPdf}
              onExportSvg={() => exportSvg(canvasRef.current, 'cutting-plan.svg')}
              onPrint={() => setPrinting(true)}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
