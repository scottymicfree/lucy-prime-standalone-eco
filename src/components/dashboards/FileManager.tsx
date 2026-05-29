import React, { useState, useEffect, useRef } from "react";
import { Folder, File, HardDrive, Search, Lock, ShieldCheck, Link2, Download, ExternalLink, ChevronRight, ChevronDown, ArrowUp, UploadCloud, Target, Edit2, Check, X, Trash, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const TreeNode: React.FC<{ name: string, relPath: string, onSelect: (p: string) => void, currentPath: string }> = ({ name, relPath, onSelect, currentPath }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [children, setChildren] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Auto-open if current path is under this node
    useEffect(() => {
        const isSelectedOrChild = currentPath === relPath || currentPath.startsWith(relPath + '\\') || currentPath.startsWith(relPath + '/');
        if (isSelectedOrChild && !isOpen) {
            setIsOpen(true);
            if (children.length === 0) fetchChildren();
        }
    }, [currentPath]);

    const fetchChildren = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/kernel/sandbox/listdir', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ path: relPath })
            });
            const data = await res.json();
            if (data.success) {
                setChildren(data.items || []);
            }
        } catch(err) {
           console.error(err);
        }
        setLoading(false);
    };

    const toggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen && children.length === 0) {
            fetchChildren();
        }
        setIsOpen(!isOpen);
    };

    const isSelected = currentPath === relPath;

    return (
        <div className="pl-3">
            <div 
               className={`flex items-center gap-2 py-1 cursor-pointer hover:text-white group transition-colors ${isSelected ? 'text-lucy-primary bg-lucy-primary/10 rounded px-1 -ml-1' : 'text-slate-400'}`}
               onClick={(e) => { 
                   e.stopPropagation();
                   onSelect(relPath); 
                   if (!isOpen) { setIsOpen(true); if (children.length === 0) fetchChildren(); }
               }}
            >
               <span onClick={toggle} className="w-4 h-4 flex items-center justify-center opacity-70 hover:opacity-100 hover:text-white">
                   {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
               </span>
               <Folder className={`w-3.5 h-3.5 ${isSelected ? 'text-lucy-primary' : 'text-slate-500 group-hover:text-lucy-primary'}`} />
               <span className="text-[11px] font-mono whitespace-nowrap overflow-hidden text-ellipsis">{name || 'Root'}</span>
            </div>
            {isOpen && (
                <div className="pl-2 border-l border-slate-800/50 ml-1.5 mt-0.5 space-y-0.5">
                    {loading && <div className="text-[10px] text-slate-500 pl-4 py-1 italic">Loading...</div>}
                    {!loading && children.map(child => (
                        child.isDir ? (
                            <TreeNode 
                               key={child.relPath} 
                               name={child.name} 
                               relPath={child.relPath} 
                               onSelect={onSelect} 
                               currentPath={currentPath}
                            />
                        ) : (
                            <div key={child.relPath} className={`flex items-center gap-2 py-1 pl-6 text-slate-500 hover:text-cyan-400 cursor-default transition-colors`}>
                                <File className="w-3 h-3 text-slate-600" />
                                <span className="text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis">{child.name}</span>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default function FileManager() {
  const [sandboxRoot, setSandboxRoot] = useState("C:\\LucySandbox");
  const [fivemRoot, setFivemRoot] = useState("C:\\LucySandbox\\FiveM-Framework");
  
  // Dynamic fetch tree
  const [tree, setTree] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState("");

  const loadDir = async (relPath: string = '') => {
      try {
          const res = await fetch('/api/kernel/sandbox/listdir', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ path: relPath })
          });
          const data = await res.json();
          if (data.success) {
              setTree(data.items || []);
              setCurrentPath(relPath);
          }
      } catch(e) {
          console.error("Failed to fetch sandbox dir", e);
      }
  };

  // Initially load root
  useEffect(() => {
     loadDir('');
  }, []);

  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Rename state
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'rename', payload: any } | null>(null);

  useEffect(() => {
    if (editingPath && renameInputRef.current) {
        renameInputRef.current.focus();
    }
  }, [editingPath]);

  const startEdit = (e: React.MouseEvent, item: any) => {
      e.stopPropagation();
      setEditingPath(item.relPath);
      setEditName(item.name);
  };

  const cancelEdit = (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setEditingPath(null);
      setEditName("");
  };

  const startDelete = (e: React.MouseEvent, item: any) => {
      e.stopPropagation();
      setConfirmAction({ type: 'delete', payload: item });
  };

  const submitEdit = async (e: React.MouseEvent | React.KeyboardEvent, item: any) => {
      e.stopPropagation();
      if (editName.trim() === "" || editName === item.name) {
          cancelEdit();
          return;
      }
      setConfirmAction({ type: 'rename', payload: { item, newName: editName } });
  };

  const confirmPendingAction = async () => {
    if (!confirmAction) return;
    const { type, payload } = confirmAction;

    if (type === 'rename') {
        const { item, newName } = payload;
        const parts = item.relPath.split(/[/\\]/).filter(Boolean);
        parts.pop();
        parts.push(newName);
        const newPath = parts.join('\\');
        
        try {
            const res = await fetch('/api/kernel/sandbox/rename', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldPath: item.relPath, newPath: newPath })
            });
            const data = await res.json();
            if (data.success) {
                loadDir(currentPath);
            } else {
                console.error("Rename failed:", data.error);
            }
        } catch (err) {
            console.error("Rename error:", err);
        }
        cancelEdit();
    } else if (type === 'delete') {
        const item = payload;
        try {
            const res = await fetch('/api/kernel/sandbox/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: item.relPath })
            });
            const data = await res.json();
            if (data.success) {
                loadDir(currentPath);
            } else {
                console.error("Delete failed:", data.error);
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    }
    setConfirmAction(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const files = Array.from(e.dataTransfer.files) as globalThis.File[];
      if (files.length === 0) return;

      setUploading(true);
      // Handle file uploads
      for (const file of files) {
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
              reader.onload = async (event) => {
                  const content = event.target?.result as string;
                  // Construct correct path separator
                  const targetPath = currentPath ? `${currentPath}\\${file.name}` : file.name;
                  
                  await fetch('/api/kernel/sandbox/upload', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ path: targetPath, content })
                  });
                  resolve();
              };
              reader.readAsDataURL(file);
          });
      }
      setUploading(false);
      loadDir(currentPath); // Refresh the directory tree
  };

  const handleHumanOverride = async () => {
      await fetch('/api/kernel/sandbox/open', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: currentPath || 'root' })
      });
  };

  const goUp = () => {
      if (!currentPath) return;
      const parts = currentPath.split(/[/\\]/).filter(Boolean);
      parts.pop();
      loadDir(parts.join('\\'));
  };

  const parts = currentPath.split(/[/\\]/).filter(Boolean);

  return (
    <div className="flex flex-col h-full bg-transparent p-8 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex justify-between items-end border-b border-slate-800 pb-4"
      >
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
             <HardDrive className="w-8 h-8 text-lucy-primary" />
             Workspace <span className="font-light text-slate-400">Manager</span>
           </h2>
           <p className="text-xs text-lucy-success font-mono mt-1 uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck className="w-4 h-4" /> Sandbox Locked & Enforced
           </p>
        </div>
        <div className="relative">
           <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
           <input type="text" placeholder="Search workspace..." className="bg-slate-900 border border-slate-700 rounded pl-9 pr-4 py-1.5 text-sm outline-none focus:border-lucy-primary text-slate-200" />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 text-xs font-mono"
      >
         <div className="bg-slate-900 border border-lucy-primary/30 p-3 rounded flex items-center gap-3 group">
            <Lock className="w-4 h-4 text-lucy-primary group-hover:scale-110 transition-transform" />
            <div>
               <div className="text-slate-400 uppercase tracking-widest text-[9px] mb-0.5">Sandbox Root</div>
               <div className="text-white">{sandboxRoot}</div>
            </div>
         </div>
         <div className="bg-slate-900 border border-lucy-primary/30 p-3 rounded flex items-center gap-3 group">
            <Lock className="w-4 h-4 text-lucy-primary/60 group-hover:scale-110 transition-transform" />
            <div>
               <div className="text-slate-400 uppercase tracking-widest text-[9px] mb-0.5">FiveM Framework Root</div>
               <div className="text-white">{fivemRoot}</div>
            </div>
         </div>
         <div className="bg-slate-900 border border-cyan-700 p-3 rounded flex items-center gap-3 group col-span-2">
            <Link2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="flex-1">
               <div className="text-slate-400 uppercase tracking-widest text-[9px] mb-0.5">Primary FiveM Scripting Handbook Enforced</div>
               <div className="text-cyan-200 truncate w-full">https://docs.fivem.net/docs/scripting-manual/</div>
            </div>
         </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="flex-1 grid grid-cols-[250px_1fr_300px] gap-6 min-h-0"
      >
         {/* LEFT PANEL: TREE VIEW */}
         <div className="flex flex-col bg-slate-900/50 border border-slate-800 rounded-md p-4 overflow-hidden">
             <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Folder className="w-4 h-4" /> Workspace Tree
             </h3>
             <div className="flex-1 overflow-y-auto custom-scrollbar -ml-2 pr-2 pt-1">
                 <TreeNode name="LucySandbox" relPath="" onSelect={loadDir} currentPath={currentPath} />
             </div>
         </div>

         <div className="flex flex-col bg-slate-900/50 border border-slate-800 rounded-md p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Folder className="w-4 h-4" /> Directory Explorer
              </h3>
              <div className="flex items-center gap-2">
                 {currentPath && (
                    <button onClick={goUp} className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors bg-slate-800 px-2 py-1 rounded">
                       <ArrowUp className="w-3 h-3" /> UP
                    </button>
                 )}
                 <button onClick={() => loadDir(currentPath)} className="text-[10px] text-lucy-primary bg-lucy-primary/10 px-2 py-1 rounded hover:bg-lucy-primary hover:text-slate-900 transition-colors uppercase font-bold">Refresh</button>
              </div>
            </div>

            {/* Breadcrumb Navigation */}
            <div className="flex flex-wrap items-center gap-1 text-xs font-mono text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800 mb-4 shrink-0">
                <button 
                    onClick={() => loadDir('')}
                    className="hover:text-lucy-primary px-1.5 py-0.5 rounded transition-colors flex items-center tracking-widest uppercase"
                >
                    Sandbox Root
                </button>
                {parts.map((p, i) => {
                    const navPath = parts.slice(0, i + 1).join('\\');
                    return (
                        <React.Fragment key={navPath}>
                            <ChevronRight className="w-3 h-3 text-slate-600" />
                            <button 
                                onClick={() => loadDir(navPath)}
                                className="hover:text-lucy-primary px-1.5 py-0.5 rounded transition-colors"
                            >
                                {p}
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
               {tree.length === 0 && <div className="text-slate-600 text-xs italic mt-4 text-center w-full">Directory is empty</div>}
               
               <AnimatePresence>
               {tree.map((item, idx) => (
                   <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      key={item.relPath} 
                      className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-white/5 rounded transition-colors group border border-transparent hover:border-slate-800"
                      onClick={() => { if (!editingPath && item.isDir) loadDir(item.relPath) }}
                   >
                       {item.isDir ? <Folder className="w-5 h-5 text-slate-400 group-hover:text-lucy-primary transition-colors shrink-0"/> : <File className="w-4 h-4 ml-0.5 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0"/>}
                       
                       {editingPath === item.relPath ? (
                           <div className="flex flex-1 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                               <input 
                                   ref={renameInputRef}
                                   type="text" 
                                   value={editName}
                                   onChange={(e) => setEditName(e.target.value)}
                                   onKeyDown={(e) => {
                                       if (e.key === 'Enter') submitEdit(e, item);
                                       if (e.key === 'Escape') cancelEdit(e as any);
                                   }}
                                   className="flex-1 bg-slate-900 border border-lucy-primary rounded px-2 py-1 text-sm text-white font-mono outline-none"
                               />
                               <button onClick={(e) => submitEdit(e, item)} className="p-1 hover:bg-lucy-primary/20 text-lucy-primary rounded transition-colors">
                                  <Check className="w-4 h-4" />
                               </button>
                               <button onClick={cancelEdit} className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors">
                                  <X className="w-4 h-4" />
                               </button>
                           </div>
                       ) : (
                           <>
                               <span className={`text-sm font-mono flex-1 truncate ${!item.isDir ? "text-slate-400 group-hover:text-cyan-100" : "text-slate-300 group-hover:text-lucy-primary"}`}>
                                  {item.name}
                               </span>
                               <button 
                                  onClick={(e) => startEdit(e, item)} 
                                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-all"
                                  title="Rename"
                               >
                                  <Edit2 className="w-3.5 h-3.5" />
                               </button>
                               <button 
                                  onClick={(e) => startDelete(e, item)} 
                                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-all ml-1"
                                  title="Delete"
                               >
                                  <Trash className="w-3.5 h-3.5" />
                               </button>
                           </>
                       )}
                   </motion.div>
               ))}
               </AnimatePresence>
            </div>
         </div>
         <div 
            className={`bg-slate-900/20 border rounded-md p-8 border-dashed flex flex-col items-center justify-center text-slate-500 relative transition-all duration-300 ${
              isDragging ? "border-lucy-primary bg-lucy-primary/10 shadow-[0_0_30px_rgba(6,182,212,0.2)] scale-[1.02]" : "border-slate-800"
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
         >
            <Lock className="w-48 h-48 mb-4 opacity-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            {uploading ? (
               <div className="flex flex-col items-center justify-center z-10 animate-pulse text-lucy-primary">
                  <UploadCloud className="w-16 h-16 mb-4" />
                  <p className="font-bold tracking-widest text-xs uppercase text-center">Uploading to Sandbox...</p>
               </div>
            ) : (
               <>
                  <HardDrive className={`w-16 h-16 mb-6 z-10 transition-colors ${isDragging ? "text-lucy-primary" : "opacity-30"}`} />
                  <p className={`z-10 font-bold mb-2 tracking-widest text-sm uppercase text-center ${isDragging ? "text-lucy-primary glow-blue" : "text-white"}`}>
                     {isDragging ? "Drop to Upload" : "Sandbox Isolated"}
                  </p>
                  <p className="z-10 text-xs text-center max-w-xs leading-relaxed opacity-70">
                     Drag and drop files here to upload to the current relative path. No operations can escape the <span className="text-white">{sandboxRoot}</span> boundary. 
                  </p>
               </>
            )}
            
            <div className="flex flex-col gap-3 mt-8 z-10 pointer-events-auto w-full max-w-[200px]">
               <button className="flex items-center justify-center gap-2 bg-lucy-primary/20 text-lucy-primary border border-lucy-primary/50 px-4 py-2.5 rounded text-xs hover:bg-lucy-primary/40 transition-colors uppercase tracking-widest">
                 <Download className="w-4 h-4" /> Export Zip
               </button>
               <button 
                 onClick={handleHumanOverride}
                 className="flex items-center justify-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2.5 rounded text-xs hover:bg-slate-700 transition-colors uppercase tracking-widest" 
                 title="Open in physical File Explorer"
               >
                 <ExternalLink className="w-4 h-4" /> Native OS Open
               </button>
            </div>
         </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmAction(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <AlertCircle className={confirmAction.type === 'delete' ? 'text-red-400' : 'text-lucy-primary'} />
                  Confirm Action
                </h3>
              </div>
              <div className="p-5 text-sm text-slate-300">
                {confirmAction.type === 'delete' ? (
                  <p>Are you sure you want to delete <span className="text-white font-mono">{confirmAction.payload?.name}</span>? This action cannot be undone.</p>
                ) : (
                  <p>Are you sure you want to rename <span className="text-white font-mono">{confirmAction.payload.item?.name}</span> to <span className="text-white font-mono">{confirmAction.payload.newName}</span>?</p>
                )}
              </div>
              <div className="p-4 bg-slate-800/50 flex justify-end gap-3">
                <button 
                  onClick={() => setConfirmAction(null)}
                  className="px-4 py-2 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmPendingAction}
                  className={`px-4 py-2 rounded text-white text-sm font-medium transition-colors ${
                    confirmAction.type === 'delete' 
                      ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                      : 'bg-lucy-primary hover:bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  {confirmAction.type === 'delete' ? 'Delete' : 'Rename'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

