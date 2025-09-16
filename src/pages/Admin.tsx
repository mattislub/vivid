import React, { useCallback, useEffect, useState } from 'react';
import { buildApiUrl } from '../utils/api';

interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
  github: string;
}

type ProjectForm = {
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string;
  link: string;
  github: string;
};

const CATEGORY_OPTIONS = [
  { value: 'branding', label: 'Branding & Identity' },
  { value: 'digital', label: 'Digital Marketing' },
  { value: 'social', label: 'Social Media' },
  { value: 'campaigns', label: 'Campaign Management' },
  { value: 'content', label: 'Content Marketing' }
];

const createEmptyForm = (): ProjectForm => ({
  title: '',
  category: '',
  description: '',
  image: '',
  tags: '',
  link: '',
  github: ''
});

const getCategoryLabel = (value: string) => {
  const option = CATEGORY_OPTIONS.find((item) => item.value === value);
  return option ? option.label : value;
};

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read file.'));
        return;
      }

      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Invalid image data.'));
        return;
      }

      resolve(base64);
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read file.'));
    };
    reader.readAsDataURL(file);
  });

const Admin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ProjectForm>(createEmptyForm);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const expectedPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  const loadProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch(buildApiUrl('/api/projects'));
      if (!response.ok) {
        throw new Error(`Failed to load projects (${response.status})`);
      }

      const data: Project[] = await response.json();
      const sorted = [...data]
        .map((project) => ({
          ...project,
          tags: Array.isArray(project.tags) ? project.tags : []
        }))
        .sort((a, b) => b.id - a.id);

      setProjects(sorted);
    } catch (error) {
      console.error('[Admin] Failed to load projects', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load projects.');
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      loadProjects();
    }
  }, [authed, loadProjects]);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    setStatusMessage('');
    setErrorMessage('');

    if (!password.trim()) {
      setAuthError('Please enter the admin password.');
      return;
    }

    if (!expectedPassword) {
      console.warn('[Admin] VITE_ADMIN_PASSWORD is not defined. Unlocking dashboard for local use.');
      setStatusMessage('Admin password not configured. Dashboard unlocked for local development.');
      setAuthed(true);
      return;
    }

    if (password === expectedPassword) {
      setAuthed(true);
      return;
    }

    setAuthError('Incorrect password. Please try again.');
  };

  const handleFieldChange = (
    field: keyof ProjectForm
  ) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Missing admin password. Please log in again.');
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    setUploadingImage(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const base64 = await readFileAsBase64(file);

      const response = await fetch(buildApiUrl('/api/uploads'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': password
        },
        body: JSON.stringify({
          data: base64,
          filename: file.name,
          mimeType: file.type
        })
      });

      let payload: { url?: string; filename?: string; error?: string } | null = null;
      try {
        payload = await response.json();
      } catch (parseError) {
        console.error('[Admin] Failed to parse upload response', parseError);
      }

      if (!response.ok || !payload) {
        throw new Error(payload?.error || `Failed to upload image (${response.status})`);
      }

      const rawUrl = payload.url || '';
      if (!rawUrl) {
        throw new Error('Upload response missing image URL.');
      }

      const finalUrl = rawUrl.startsWith('http') ? rawUrl : buildApiUrl(rawUrl);
      setForm((prev) => ({ ...prev, image: finalUrl }));
      setStatusMessage('Image uploaded successfully.');
    } catch (error) {
      console.error('[Admin] Image upload failed', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleSubmitProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.description.trim() ||
      !form.image.trim()
    ) {
      setErrorMessage('Please fill in all required fields (title, category, description, image).');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Missing admin password. Please log in again.');
      return;
    }

    setIsSavingProject(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        link: form.link || '#',
        github: form.github || '#'
      };

      const response = await fetch(buildApiUrl('/api/projects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': password
        },
        body: JSON.stringify(payload)
      });

      let body: (Project & { error?: string }) | { error?: string } | null = null;
      try {
        body = await response.json();
      } catch (parseError) {
        console.error('[Admin] Failed to parse create response', parseError);
      }

      if (!body) {
        throw new Error(`Failed to add project (${response.status})`);
      }

      if (!response.ok) {
        const errorResponse = (body as { error?: string }).error;
        throw new Error(errorResponse || `Failed to add project (${response.status})`);
      }

      if (typeof (body as Project).id !== 'number') {
        throw new Error('Invalid response from server.');
      }

      const project = body as Project;
      setProjects((prev) => [
        { ...project, tags: Array.isArray(project.tags) ? project.tags : [] },
        ...prev.filter((existing) => existing.id !== project.id)
      ]);
      setStatusMessage('Project added successfully.');
      setForm(createEmptyForm());
    } catch (error) {
      console.error('[Admin] Failed to add project', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add project.');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to delete this project?');
      if (!confirmed) {
        return;
      }
    }

    setStatusMessage('');
    setErrorMessage('');

    if (!password.trim()) {
      setErrorMessage('Missing admin password. Please log in again.');
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/projects/${projectId}`), {
        method: 'DELETE',
        headers: {
          'x-admin-secret': password
        }
      });

      let payload: { ok?: boolean; error?: string } | null = null;
      try {
        payload = await response.json();
      } catch (parseError) {
        console.error('[Admin] Failed to parse delete response', parseError);
      }

      if (!response.ok || (payload && payload.error)) {
        throw new Error(payload?.error || `Failed to delete project (${response.status})`);
      }

      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      setStatusMessage('Project deleted successfully.');
    } catch (error) {
      console.error('[Admin] Failed to delete project', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete project.');
    }
  };

  const isFormValid = Boolean(
    form.title.trim() &&
    form.category.trim() &&
    form.description.trim() &&
    form.image.trim()
  );

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/70 p-10 text-white shadow-2xl shadow-slate-950/60 backdrop-blur-xl">
          <div className="mb-8 space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Secure Access</p>
            <h1 className="text-3xl font-semibold">Portfolio Admin</h1>
            <p className="text-sm text-slate-400">Enter the administrator password to manage portfolio projects.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium text-slate-200">
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {authError && <p className="text-sm text-rose-300">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition-transform hover:scale-[1.01] hover:shadow-emerald-400/50"
            >
              Enter dashboard
            </button>

            {!expectedPassword && (
              <p className="text-center text-xs text-slate-500">
                VITE_ADMIN_PASSWORD is not configured. Using local development mode.
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  const projectCount = projects.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-16 px-4 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.5em] text-emerald-300/70">Portfolio Console</p>
          <h1 className="text-3xl font-semibold md:text-4xl">Curate your success stories</h1>
          <p className="max-w-3xl text-sm text-slate-400 md:text-base">
            Upload new projects with dedicated imagery directly to the server, organise them by category and keep your portfolio fresh in a few clicks.
          </p>
        </header>

        {(statusMessage || errorMessage) && (
          <div
            className={`rounded-3xl border px-6 py-4 text-sm backdrop-blur-xl ${
              errorMessage
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
            }`}
          >
            {errorMessage || statusMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[2fr,1.2fr]">
          <form
            onSubmit={handleSubmitProject}
            className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Create a new project</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">New Entry</span>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-200">
                    Project title <span className="text-rose-400">*</span>
                  </span>
                  <input
                    type="text"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="Campaign title"
                    value={form.title}
                    onChange={handleFieldChange('title')}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-200">
                    Category <span className="text-rose-400">*</span>
                  </span>
                  <select
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    value={form.category}
                    onChange={handleFieldChange('category')}
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-200">
                  Short description <span className="text-rose-400">*</span>
                </span>
                <textarea
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="What made this project stand out?"
                  rows={4}
                  value={form.description}
                  onChange={handleFieldChange('description')}
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-200">Project link</span>
                  <input
                    type="url"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="https://example.com/project"
                    value={form.link}
                    onChange={handleFieldChange('link')}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-200">Github / Case study URL</span>
                  <input
                    type="url"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="https://github.com/your-team/project"
                    value={form.github}
                    onChange={handleFieldChange('github')}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-200">Tags (comma separated)</span>
                <input
                  type="text"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Brand Strategy, Paid Media, ..."
                  value={form.tags}
                  onChange={handleFieldChange('tags')}
                />
              </label>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">
                    Project image <span className="text-rose-400">*</span>
                  </span>
                  {uploadingImage && <span className="text-xs text-slate-400 animate-pulse">Uploading…</span>}
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-6 text-center transition-colors hover:border-emerald-400/60">
                    <span className="text-sm font-medium text-white">Upload image</span>
                    <span className="text-xs text-slate-400">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Or paste image URL</span>
                    <input
                      type="url"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      placeholder="https://cdn.yoursite.com/project.jpg"
                      value={form.image}
                      onChange={handleFieldChange('image')}
                    />
                  </div>
                </div>

                {form.image && (
                  <div className="overflow-hidden rounded-2xl border border-slate-800/70">
                    <img
                      src={form.image}
                      alt="Project preview"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={!isFormValid || isSavingProject || uploadingImage}
                className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 transition-transform hover:scale-[1.01] hover:shadow-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingProject ? 'Saving project…' : 'Add project'}
              </button>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Total: {projectCount}
              </span>
            </div>
          </form>

          <section className="space-y-5 rounded-3xl border border-slate-800/60 bg-slate-900/40 p-6 shadow-xl shadow-slate-950/40 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Existing projects</h2>
              <button
                type="button"
                onClick={loadProjects}
                className="text-xs uppercase tracking-[0.3em] text-slate-500 transition-colors hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isLoadingProjects}
              >
                {isLoadingProjects ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
            <p className="text-sm text-slate-400">Review your live projects, open the public links or delete outdated case studies.</p>

            <div className="max-h-[600px] space-y-4 overflow-y-auto pr-1">
              {isLoadingProjects && projects.length === 0 ? (
                <div className="animate-pulse text-sm text-slate-400">Loading projects…</div>
              ) : projects.length === 0 ? (
                <div className="text-sm text-slate-400">No projects yet. Add your first success story.</div>
              ) : (
                projects.map((project) => (
                  <article
                    key={project.id}
                    className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 shadow-lg shadow-slate-950/30 transition-shadow hover:border-emerald-400/50 hover:shadow-emerald-500/20"
                  >
                    <div className="h-40 w-full overflow-hidden bg-slate-800/60">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                          <p className="text-sm text-slate-400">{project.description}</p>
                        </div>
                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                          {getCategoryLabel(project.category)}
                        </span>
                      </div>

                      {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col text-xs text-slate-500">
                          {project.link && project.link !== '#' && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noreferrer"
                              className="transition-colors hover:text-emerald-300"
                            >
                              Live link
                            </a>
                          )}
                          {project.github && project.github !== '#' && (
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noreferrer"
                              className="transition-colors hover:text-emerald-300"
                            >
                              Repository
                            </a>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-sm font-medium text-rose-300 transition-colors hover:text-rose-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Admin;
