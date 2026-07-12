import { useMemo } from 'react';
import type { Part, Project, Settings, SheetSpec, Unit } from './types';
import { AppNavbar } from './components/AppNavbar';
import { SheetPanel } from './components/SheetPanel';
import { PartsPanel } from './components/PartsPanel';
import { LayoutView } from './components/LayoutView';
import { CutList } from './components/CutList';
import { SummaryPanel } from './components/SummaryPanel';
import { usePersistentState } from './hooks/usePersistentState';
import { useTheme } from './hooks/useTheme';
import { computeLayout } from './lib/layout';
import { DEFAULT_PROJECT, PROJECT_KEY } from './lib/project';

export default function App() {
  const theme = useTheme();
  const [project, setProject] = usePersistentState<Project>(PROJECT_KEY, DEFAULT_PROJECT);
  const result = useMemo(() => computeLayout(project), [project]);

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

  return (
    <>
      <AppNavbar
        unit={project.unit}
        onUnitChange={updateUnit}
        theme={theme.choice}
        onThemeChange={theme.setChoice}
        onNewProject={newProject}
      />

      <main className="container-fluid py-3">
        <div className="row g-3">
          <div className="col-12 col-xl-3 vstack gap-3">
            <SheetPanel sheet={project.sheet} unit={project.unit} onChange={updateSheet} />
            <PartsPanel
              parts={project.parts}
              unit={project.unit}
              allowRotation={project.settings.allowRotation}
              onChange={updateParts}
              onRotationChange={(value) => updateSettings({ allowRotation: value })}
            />
          </div>

          <div className="col-12 col-xl-6 vstack gap-3">
            <LayoutView project={project} result={result} dark={theme.resolved === 'dark'} />
            <CutList project={project} result={result} />
          </div>

          <div className="col-12 col-xl-3 vstack gap-3">
            <SummaryPanel project={project} result={result} />
          </div>
        </div>
      </main>
    </>
  );
}
