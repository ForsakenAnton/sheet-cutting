import { useDeferredValue, useMemo, useRef } from 'react';
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
import { PROJECT_KEY, createDefaultProject, loadProject } from './lib/project';
import { exportSvg } from './lib/exportSvg';

export default function App() {
  const theme = useTheme();
  const [project, setProject] = usePersistentState<Project>(PROJECT_KEY, loadProject);
  const canvasRef = useRef<HTMLDivElement>(null);

  const deferredProject = useDeferredValue(project);
  const result = useMemo(() => computeLayout(deferredProject), [deferredProject]);
  const computing = deferredProject !== project;

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
    setProject((current) => createDefaultProject(current.unit));
  };

  const downloadPdf = async () => {
    try {
      const { exportPdf } = await import('./lib/exportPdf');
      exportPdf(deferredProject, result, 'cutting-plan.pdf');
    } catch {
      window.alert('Could not create the PDF. Reload the page and try again.');
    }
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
          <div className="col-12 col-lg-5 col-xl-4 col-xxl-3 app-col vstack gap-3 d-print-none">
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

          <div className="col-12 col-lg-7 col-xl-8 col-xxl-9 app-col app-results print-wide">
            <div className="row g-3">
              <div className="col-12 col-xl-8 app-subcol vstack gap-3 print-wide">
                <LayoutView
                  project={deferredProject}
                  result={result}
                  computing={computing}
                  canvasRef={canvasRef}
                />
                <CutList project={deferredProject} result={result} />
              </div>

              <div className="col-12 col-xl-4 app-subcol vstack gap-3 print-wide">
                <SummaryPanel project={deferredProject} result={result} />
                <ActionsPanel
                  disabled={result.sheets.length === 0}
                  onExportPdf={downloadPdf}
                  onExportSvg={() => exportSvg(canvasRef.current, 'cutting-plan.svg')}
                  onPrint={() => window.print()}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
