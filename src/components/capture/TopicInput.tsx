import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getProjects, createProject, Project } from '@/lib/pageService';

interface TopicInputProps {
  value: string;
  onChange: (value: string, projectId?: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function TopicInput({ value, onChange, placeholder = "Topic? (2-3 words)", autoFocus = false }: TopicInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load existing projects/topics
  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true);
      const data = await getProjects();
      setProjects(data);
      setIsLoading(false);
    }
    loadProjects();
  }, []);

  // Filter projects based on input
  useEffect(() => {
    if (!value.trim()) {
      setFilteredProjects(projects.slice(0, 5));
    } else {
      const searchTerm = value.toLowerCase();
      const filtered = projects
        .filter(p => p.name.toLowerCase().includes(searchTerm))
        .slice(0, 5);
      setFilteredProjects(filtered);
    }
  }, [value, projects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectProject = (project: Project) => {
    onChange(project.name, project.id);
    setIsOpen(false);
  };

  const handleCreateNew = async () => {
    if (!value.trim()) return;
    
    // Check if project already exists
    const existing = projects.find(p => p.name.toLowerCase() === value.toLowerCase().trim());
    if (existing) {
      onChange(existing.name, existing.id);
      setIsOpen(false);
      return;
    }

    // Create new project
    const newProject = await createProject(value.trim());
    if (newProject) {
      setProjects(prev => [newProject, ...prev]);
      onChange(newProject.name, newProject.id);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateNew();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const showCreateOption = value.trim() && 
    !projects.some(p => p.name.toLowerCase() === value.toLowerCase().trim());

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="pl-10 bg-secondary/50 border-border/50 focus:border-codex-gold/50"
        />
      </div>

      <AnimatePresence>
        {isOpen && (filteredProjects.length > 0 || showCreateOption) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden"
          >
            {/* Existing topics */}
            {filteredProjects.length > 0 && (
              <div className="py-1">
                <p className="px-3 py-1.5 text-xs text-muted-foreground uppercase tracking-wide">
                  Existing topics
                </p>
                {filteredProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2"
                  >
                    <span className="text-foreground">{project.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Create new option */}
            {showCreateOption && (
              <>
                {filteredProjects.length > 0 && (
                  <div className="border-t border-border" />
                )}
                <button
                  onClick={handleCreateNew}
                  className="w-full px-3 py-2.5 text-left text-sm hover:bg-codex-gold/10 transition-colors flex items-center gap-2 text-codex-gold"
                >
                  <Check className="w-4 h-4" />
                  <span>Create "{value.trim()}"</span>
                </button>
              </>
            )}

            {/* Loading state */}
            {isLoading && filteredProjects.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading topics...
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint text */}
      <p className="mt-2 text-sm text-foreground/70">
        What is this about? Keep it short (2-3 words)
      </p>
    </div>
  );
}
