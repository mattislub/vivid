import React, { useState, useEffect } from 'react';
import type { Project } from '../types/project';
import { fetchJson, resolveApiUrl } from '../lib/api';

const Admin = () => {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    image: '',
    tags: '',
    link: '',
    github: ''
  });

  const loadProjects = async () => {
    const endpoint = '/api/projects';
    const resolvedUrl = resolveApiUrl(endpoint);

    try {
      const data = await fetchJson<Project[]>(endpoint);
      setProjects(data);
    } catch (error) {
      console.error('[Admin] Failed to load projects', {
        endpoint: resolvedUrl,
        error,
      });
      setProjects([]);
    }
  };

  useEffect(() => {
    if (authed) {
      loadProjects();
    }
  }, [authed]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      setAuthed(true);
    }
  };

  const addProject = async () => {
    const body = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    try {
      const response = await fetch(resolveApiUrl('/api/projects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': password,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setForm({ title: '', category: '', description: '', image: '', tags: '', link: '', github: '' });
      loadProjects();
    } catch (error) {
      console.error('[Admin] Failed to add project', error);
    }
  };

  const deleteProject = async (id: number) => {
    try {
      const response = await fetch(resolveApiUrl(`/api/projects/${id}`), {
        method: 'DELETE',
        headers: { 'x-admin-secret': password },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      loadProjects();
    } catch (error) {
      console.error('[Admin] Failed to delete project', error);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <form onSubmit={login} className="bg-slate-800 p-8 rounded-lg shadow-lg space-y-4">
          <h2 className="text-white text-xl">Admin Login</h2>
          <input
            type="password"
            className="w-full p-2 rounded"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-white text-slate-900 p-2 rounded">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white">
      <h1 className="text-2xl mb-4">Portfolio Admin</h1>

      <div className="mb-8 space-y-2">
        <input
          className="w-full p-2 rounded text-slate-900"
          placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="w-full p-2 rounded text-slate-900"
          placeholder="Category"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        />
        <input
          className="w-full p-2 rounded text-slate-900"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="w-full p-2 rounded text-slate-900"
          placeholder="Image URL"
          value={form.image}
          onChange={e => setForm({ ...form, image: e.target.value })}
        />
        <input
          className="w-full p-2 rounded text-slate-900"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={e => setForm({ ...form, tags: e.target.value })}
        />
        <input
          className="w-full p-2 rounded text-slate-900"
          placeholder="Link"
          value={form.link}
          onChange={e => setForm({ ...form, link: e.target.value })}
        />
        <input
          className="w-full p-2 rounded text-slate-900"
          placeholder="Github"
          value={form.github}
          onChange={e => setForm({ ...form, github: e.target.value })}
        />
        <button onClick={addProject} className="bg-white text-slate-900 px-4 py-2 rounded">Add Project</button>
      </div>

      <ul className="space-y-2">
        {projects.map(p => (
          <li key={p.id} className="flex justify-between items-center bg-slate-800 p-2 rounded">
            <span>{p.title}</span>
            <button onClick={() => deleteProject(p.id)} className="text-red-400">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
