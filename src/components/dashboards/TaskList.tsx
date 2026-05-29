import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertTriangle, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, MinusCircle, ChevronDown, Calendar, AlignLeft, ListTodo, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Priority = 'High' | 'Medium' | 'Low';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
  description?: string;
  subtasks?: Subtask[];
  deadline?: string;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Initialize mesh connection', completed: false, priority: 'High', createdAt: Date.now() - 100000, description: 'Connect to E.M.M.A core and verify latency.', subtasks: [{ id: 's1', title: 'Ping central node', completed: true }, { id: 's2', title: 'Verify TLS handshake', completed: false }] },
    { id: '2', title: 'Run system diagnostics', completed: true, priority: 'Medium', createdAt: Date.now() - 200000, subtasks: [] },
    { id: '3', title: 'Update documentation', completed: false, priority: 'Low', createdAt: Date.now() - 300000, subtasks: [] },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Medium');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority,
      createdAt: Date.now(),
      subtasks: [],
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addSubtask = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: [...(t.subtasks || []), { id: Math.random().toString(36).substring(2, 9), title: newSubtaskTitle.trim(), completed: false }]
        };
      }
      return t;
    }));
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: (t.subtasks || []).map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
        };
      }
      return t;
    }));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: (t.subtasks || []).filter(st => st.id !== subtaskId)
        };
      }
      return t;
    }));
  };

  const changePriority = (id: string, newPriority: Priority) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, priority: newPriority } : t));
  };

  const priorityConfig = {
    High: { icon: ArrowUpCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    Medium: { icon: MinusCircle, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    Low: { icon: ArrowDownCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-8 gap-6 font-mono overflow-y-auto">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-lucy-primary" />
            Task <span className="font-light text-slate-400">Manager</span>
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Global Priority Queue</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        <form onSubmit={addTask} className="flex gap-4 items-center bg-slate-900 border border-slate-800 p-4 rounded-lg shadow-lg">
          <input 
            type="text" 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Describe the new task..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-lucy-primary/50 transition-colors"
          />
          <select 
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
            className="bg-slate-950 border border-slate-700 rounded px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-lucy-primary/50"
          >
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="bg-lucy-primary/20 text-lucy-primary border border-lucy-primary/30 px-6 py-2 rounded text-sm hover:bg-lucy-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold"
          >
            <Plus className="w-4 h-4" /> Add Idea
          </button>
        </form>

        <div className="space-y-3">
          <AnimatePresence>
            {tasks.map(task => {
              const PConfig = priorityConfig[task.priority];
              const PriorityIcon = PConfig.icon;
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex flex-col p-4 rounded-lg border \${task.completed ? 'bg-slate-900/50 border-slate-800/50 opacity-60' : 'bg-slate-900 border-slate-800'} transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <button onClick={() => toggleTask(task.id)} className="text-slate-500 hover:text-lucy-primary transition-colors">
                        {task.completed ? <CheckCircle2 className="w-5 h-5 text-lucy-success" /> : <Circle className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                        className={`text-sm text-left flex-1 hover:text-lucy-primary transition-colors \${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}
                      >
                        {task.title}
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      {expandedTaskId === task.id && (
                        <div className="flex bg-slate-950 rounded border border-slate-800 overflow-hidden text-xs">
                          {(['Low', 'Medium', 'High'] as Priority[]).map(p => (
                            <button
                              key={p}
                              onClick={() => changePriority(task.id, p)}
                              className={`px-3 py-1.5 transition-colors \${task.priority === p ? \`\${priorityConfig[p].bg} \${priorityConfig[p].color} font-bold\` : 'text-slate-500 hover:bg-slate-800'}`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold \${PConfig.bg} \${PConfig.border} \${PConfig.color} border w-24 justify-center`}>
                         <PriorityIcon className="w-3.5 h-3.5" />
                         {task.priority}
                      </div>

                      {task.deadline && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 hidden md:flex">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      )}

                      <button 
                        onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                        className="text-slate-400 hover:text-slate-200 transition-colors p-2"
                      >
                        <ChevronDown className={`w-4 h-4 transition-transform \${expandedTaskId === task.id ? 'rotate-180' : ''}`} />
                      </button>

                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-500 hover:text-red-500 transition-colors p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedTaskId === task.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-slate-800/50"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                          {/* Left Column: Descriptions and Details */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <AlignLeft className="w-3.5 h-3.5" /> Description
                              </label>
                              <textarea
                                value={task.description || ''}
                                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                                placeholder="Add a description..."
                                rows={3}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-lucy-primary/50 focus:bg-slate-950 transition-all resize-none"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Deadline
                              </label>
                              <input
                                type="date"
                                value={task.deadline || ''}
                                onChange={(e) => updateTask(task.id, { deadline: e.target.value })}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-2 text-sm text-slate-300 focus:outline-none focus:border-lucy-primary/50 transition-all"
                              />
                            </div>
                          </div>

                          {/* Right Column: Subtasks */}
                          <div className="space-y-4">
                            <label className="text-xs text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <ListTodo className="w-3.5 h-3.5" /> Subtasks
                            </label>
                            
                            <div className="space-y-2 bg-slate-950/30 rounded-lg p-1 border border-transparent">
                              {task.subtasks?.map(subtask => (
                                <div key={subtask.id} className="flex items-center justify-between bg-slate-950 border border-slate-800/60 p-2 rounded group hover:border-slate-700 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <button 
                                      onClick={() => toggleSubtask(task.id, subtask.id)}
                                      className="text-slate-500 hover:text-lucy-primary transition-colors"
                                    >
                                      {subtask.completed ? <CheckCircle2 className="w-4 h-4 text-lucy-success" /> : <Circle className="w-4 h-4" />}
                                    </button>
                                    <span className={`text-sm \${subtask.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                                      {subtask.title}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => deleteSubtask(task.id, subtask.id)}
                                    className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                              
                              <form onSubmit={(e) => addSubtask(task.id, e)} className="flex items-center gap-2 mt-2">
                                <input
                                  type="text"
                                  value={newSubtaskTitle}
                                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                  placeholder="New subtask..."
                                  className="flex-1 bg-transparent border-b border-slate-800 p-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-lucy-primary/50 transition-all"
                                />
                                <button
                                  type="submit"
                                  disabled={!newSubtaskTitle.trim()}
                                  className="text-lucy-primary disabled:opacity-30 disabled:cursor-not-allowed hover:bg-lucy-primary/10 p-1.5 rounded transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {tasks.length === 0 && (
            <div className="text-center text-slate-500 p-8 border border-slate-800 border-dashed rounded-lg">
              No active tasks available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
