import type { Project, SheetSpec, Unit } from './types';
import { AppNavbar } from './components/AppNavbar';
import { SheetPanel } from './components/SheetPanel';
import { usePersistentState } from './hooks/usePersistentState';
import { useTheme } from './hooks/useTheme';
import { DEFAULT_PROJECT, PROJECT_KEY } from './lib/project';

export default function App() {
  const theme = useTheme();
  const [project, setProject] = usePersistentState<Project>(PROJECT_KEY, DEFAULT_PROJECT);

  const updateSheet = (patch: Partial<SheetSpec>) => {
    setProject((current) => ({ ...current, sheet: { ...current.sheet, ...patch } }));
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
          </div>
        </div>
      </main>
    </>
  );
}
