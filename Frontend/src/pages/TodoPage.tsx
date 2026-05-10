// v 2 old style
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import ConfirmModal from '../components/ConfirmModal'
import { getTasksApi, createTaskApi, updateTaskApi, toggleTaskApi, deleteTaskApi } from '../services/api'
 
interface Task {
    id: number
    title: string
    description: string | null
    is_completed: boolean
    created_at: string
    due_date: string | null
    priority: string | null
}
 
export default function TodoPage() {
    const navigate = useNavigate()
    const [tasks, setTasks]             = useState<Task[]>([])
    const [loading, setLoading]         = useState(true)
    const [error, setError]             = useState('')
    const [newTitle, setNewTitle]       = useState('')
    const [newDesc, setNewDesc]         = useState('')
    const [adding, setAdding]           = useState(false)
    const [editId, setEditId]           = useState<number | null>(null)
    const [editTitle, setEditTitle]     = useState('')
    const [editDesc, setEditDesc]       = useState('')
    const [filter, setFilter]           = useState<'all' | 'active' | 'done'>('all')
    const [username, setUsername]       = useState('')
    const [deleteId, setDeleteId]       = useState<number | null>(null)
    const [deleteTitle, setDeleteTitle] = useState('')
    const [newDueDate, setNewDueDate]   = useState('')
    const [newPriority, setNewPriority] = useState('medium')
    const [search, setSearch]           = useState('')
 
    async function fetchTasks() {
        try {
            setLoading(true)
            const data = await getTasksApi()
            if (data.error) { navigate('/login'); return }
            setTasks(data)
        } catch { setError('โหลด task ไม่สำเร็จ') }
        finally { setLoading(false) }
    }
 
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUsername(payload.username)
        fetchTasks()
    }, [])
 
    async function handleCreate() {
        if (!newTitle.trim()) return
        try {
            setAdding(true)
            const task = await createTaskApi(newTitle, newDesc, newDueDate || undefined, newPriority)
            setTasks(prev => [task, ...prev])
            setNewTitle(''); setNewDesc(''); setNewDueDate(''); setNewPriority('medium')
        } catch { setError('สร้าง task ไม่สำเร็จ') }
        finally { setAdding(false) }
    }
 
    async function handleToggle(id: number) {
        const updated = await toggleTaskApi(id)
        setTasks(prev => prev.map(t => t.id === id ? updated : t))
    }
 
    function startEdit(task: Task) {
        setEditId(task.id); setEditTitle(task.title); setEditDesc(task.description || '')
    }
 
    async function handleSaveEdit(id: number) {
        if (!editTitle.trim()) return
        const updated = await updateTaskApi(id, { title: editTitle, description: editDesc })
        setTasks(prev => prev.map(t => t.id === id ? updated : t))
        setEditId(null)
    }
 
    function askDelete(task: Task) {
        setDeleteId(task.id)
        setDeleteTitle(task.title)
    }
 
    async function confirmDelete() {
        if (!deleteId) return
        await deleteTaskApi(deleteId)
        setTasks(prev => prev.filter(t => t.id !== deleteId))
        setDeleteId(null)
    }
 
    function handleLogout() {
        localStorage.removeItem('token'); navigate('/login')
    }
 
    const filtered = tasks
        .filter(t => filter === 'active' ? !t.is_completed : filter === 'done' ? t.is_completed : true)
        .filter(t => search.trim() === '' ? true : t.title.toLowerCase().includes(search.toLowerCase()))
 
    const doneCount = tasks.filter(t => t.is_completed).length
 
    return (
        <>
            <style>{`
                .todo-page {
                    min-height: 100vh;
                    min-height: 100dvh;
                    background: #0a0a0f;
                    font-family: 'DM Sans', system-ui, sans-serif;
                    color: #d4d4f0;
                }
                .todo-inner {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 28px 16px 60px;
                }
                .todo-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    gap: 12px;
                }
                .todo-header-left { flex: 1; }
                .todo-welcome { font-size: 12px; color: #3a3a5a; margin: 0 0 4px; }
                .todo-username {
                    font-size: clamp(20px, 5vw, 26px);
                    font-weight: 700; color: #f1f0ff;
                    margin: 0 0 4px; letter-spacing: -0.02em;
                }
                .todo-count { font-size: 12px; color: #3a3a5a; margin: 0; }
                .todo-logout {
                    background: none;
                    border: 1px solid rgba(255,255,255,0.08);
                    color: #4a4a6a; border-radius: 10px;
                    padding: 8px 16px; font-size: 13px;
                    cursor: pointer; flex-shrink: 0;
                    white-space: nowrap;
                    -webkit-tap-highlight-color: transparent;
                }
                .todo-input {
                    width: 100%; background: #0a0a0f; color: #d4d4f0;
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 12px; padding: 12px 16px;
                    font-size: 15px; outline: none;
                    box-sizing: border-box; margin-bottom: 10px;
                    -webkit-appearance: none; font-family: inherit;
                }
                .todo-input:focus { border-color: rgba(99,102,241,0.4); }
                .todo-search-wrap { position: relative; margin-bottom: 16px; }
                .todo-search-icon {
                    position: absolute; left: 14px; top: 50%;
                    transform: translateY(-50%); font-size: 14px;
                    color: #3a3a5a; pointer-events: none;
                }
                .todo-search-input {
                    width: 100%; background: #13131a; color: #d4d4f0;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px; padding: 12px 40px;
                    font-size: 14px; outline: none;
                    box-sizing: border-box; font-family: inherit;
                    -webkit-appearance: none;
                }
                .todo-search-clear {
                    position: absolute; right: 12px; top: 50%;
                    transform: translateY(-50%); background: none;
                    border: none; color: #3a3a5a; cursor: pointer;
                    font-size: 14px; padding: 4px;
                }
                .todo-add-card {
                    background: #13131a;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 16px; margin-bottom: 16px;
                }
                .todo-add-grid { display: block; }
                .todo-priority-row { display: flex; gap: 8px; margin-bottom: 12px; }
                .todo-priority-btn {
                    flex: 1; padding: 10px 6px; border-radius: 10px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    text-transform: capitalize; transition: all 0.15s;
                    font-family: inherit; -webkit-tap-highlight-color: transparent;
                }
                .todo-add-btn {
                    width: 100%; background: #4f46e5; color: #fff;
                    border: none; border-radius: 12px; padding: 13px;
                    font-size: 14px; font-weight: 600; cursor: pointer;
                    font-family: inherit; transition: background 0.15s;
                    -webkit-tap-highlight-color: transparent;
                }
                .todo-add-btn:active { background: #4338ca; }
                .todo-filters { display: flex; gap: 8px; margin-bottom: 16px; }
                .todo-filter-btn {
                    flex: 1; padding: 9px; border-radius: 10px;
                    font-size: 13px; font-weight: 500; cursor: pointer;
                    text-transform: capitalize; transition: all 0.15s;
                    font-family: inherit; -webkit-tap-highlight-color: transparent;
                }
                .todo-task-card {
                    background: #13131a;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px; padding: 14px; margin-bottom: 8px;
                    transition: border-color 0.15s;
                }
                .todo-task-row { display: flex; align-items: flex-start; gap: 12px; }
                .todo-task-check {
                    width: 20px; height: 20px; border-radius: 6px;
                    cursor: pointer; flex-shrink: 0; margin-top: 2px;
                    display: flex; align-items: center; justify-content: center;
                    padding: 0; transition: all 0.2s;
                    -webkit-tap-highlight-color: transparent;
                }
                .todo-task-content { flex: 1; min-width: 0; }
                .todo-task-title { margin: 0 0 3px; font-size: 15px; font-weight: 500; }
                .todo-task-desc { margin: 0 0 6px; font-size: 13px; color: #3a3a5a; }
                .todo-task-badges { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
                .todo-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 99px; }
                .todo-task-actions { display: flex; gap: 2px; flex-shrink: 0; }
                .todo-action-btn {
                    background: none; border: none; color: #3a3a5a;
                    cursor: pointer; padding: 6px; border-radius: 8px;
                    font-size: 14px; -webkit-tap-highlight-color: transparent;
                }
                .todo-edit-actions { display: flex; gap: 8px; margin-top: 4px; }
                .todo-edit-save {
                    flex: 1; background: #4f46e5; color: #fff; border: none;
                    border-radius: 10px; padding: 10px; font-size: 13px;
                    font-weight: 600; cursor: pointer; font-family: inherit;
                }
                .todo-edit-cancel {
                    flex: 1; background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.06);
                    color: #6a6a8a; border-radius: 10px; padding: 10px;
                    font-size: 13px; cursor: pointer; font-family: inherit;
                }
                @media (min-width: 540px) {
                    .todo-inner { padding: 36px 32px 60px; }
                    .todo-add-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 0 10px;
                    }
                    .todo-input-full { grid-column: 1 / -1; }
                }
                @media (max-width: 400px) {
                    .todo-priority-btn { padding: 9px 4px; font-size: 12px; }
                    .todo-task-title { font-size: 14px; }
                }
            `}</style>
 
            <div className="todo-page">
                <div className="todo-inner">
                    {/* Header */}
                    <div className="todo-header">
                        <div className="todo-header-left">
                            <p className="todo-welcome">Welcome back,</p>
                            <h1 className="todo-username">{username} 👋</h1>
                            <p className="todo-count">{doneCount} / {tasks.length} completed</p>
                        </div>
                        <button className="todo-logout" onClick={handleLogout}>Logout</button>
                    </div>
 
                    {/* Error */}
                    {error && (
                        <div style={{
                            fontSize: '12px', color: '#f87171',
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: '10px', padding: '10px 14px',
                            marginBottom: '16px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <span>{error}</span>
                            <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}>✕</button>
                        </div>
                    )}
 
                    {/* Search */}
                    <div className="todo-search-wrap">
                        <span className="todo-search-icon">🔍</span>
                        <input className="todo-search-input" type="text"
                            placeholder="Search tasks..." value={search}
                            onChange={e => setSearch(e.target.value)} />
                        {search && <button className="todo-search-clear" onClick={() => setSearch('')}>✕</button>}
                    </div>
 
                    {/* Add task */}
                    <div className="todo-add-card">
                        <div className="todo-add-grid">
                            <input className="todo-input todo-input-full" type="text"
                                placeholder="Task title..." value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCreate()} />
                            <input className="todo-input" type="text"
                                placeholder="Description (optional)" value={newDesc}
                                onChange={e => setNewDesc(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleCreate()} />
                            <input className="todo-input" type="date"
                                value={newDueDate} onChange={e => setNewDueDate(e.target.value)}
                                style={{ colorScheme: 'dark', marginBottom: '10px' }} />
                        </div>
 
                        {/* Priority */}
                        <div className="todo-priority-row">
                            {(['low', 'medium', 'high'] as const).map(p => {
                                const active = newPriority === p
                                const color = p === 'high' ? '#f87171' : p === 'low' ? '#4ade80' : '#fb923c'
                                const bgActive = p === 'high' ? 'rgba(248,113,113,0.15)' : p === 'low' ? 'rgba(74,222,128,0.15)' : 'rgba(251,146,60,0.15)'
                                return (
                                    <button key={p} type="button" className="todo-priority-btn"
                                        onClick={() => setNewPriority(p)}
                                        style={{
                                            background: active ? bgActive : '#0a0a0f',
                                            color: active ? color : '#3a3a5a',
                                            border: active ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.06)',
                                        }}>
                                        {p === 'high' ? '🔴' : p === 'medium' ? '🟠' : '🟢'} {p}
                                    </button>
                                )
                            })}
                        </div>
 
                        <button className="todo-add-btn" onClick={handleCreate}
                            disabled={adding || !newTitle.trim()}
                            style={{ opacity: adding || !newTitle.trim() ? 0.4 : 1 }}>
                            {adding ? 'Adding...' : '+ Add task'}
                        </button>
                    </div>
 
                    {/* Filters */}
                    <div className="todo-filters">
                        {(['all', 'active', 'done'] as const).map(f => (
                            <button key={f} className="todo-filter-btn" onClick={() => setFilter(f)}
                                style={{
                                    background: filter === f ? '#4f46e5' : '#13131a',
                                    color: filter === f ? '#fff' : '#4a4a6a',
                                    border: filter === f ? '1px solid #4f46e5' : '1px solid rgba(255,255,255,0.06)',
                                }}>
                                {f}
                            </button>
                        ))}
                    </div>
 
                    {/* Task list */}
                    {loading ? <Spinner /> : filtered.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#3a3a5a', fontSize: '14px', padding: '60px 0' }}>
                            {search ? `No tasks matching "${search}"` : filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
                        </p>
                    ) : (
                        <div>
                            {filtered.map(task => (
                                <div key={task.id} className="todo-task-card"
                                    style={{ borderColor: editId === task.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)' }}>
                                    {editId === task.id ? (
                                        <div>
                                            <input className="todo-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                                            <input className="todo-input" value={editDesc} onChange={e => setEditDesc(e.target.value)}
                                                placeholder="Description" style={{ marginBottom: '12px' }} />
                                            <div className="todo-edit-actions">
                                                <button className="todo-edit-save" onClick={() => handleSaveEdit(task.id)}>Save</button>
                                                <button className="todo-edit-cancel" onClick={() => setEditId(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="todo-task-row">
                                            <button className="todo-task-check" onClick={() => handleToggle(task.id)}
                                                style={{
                                                    border: task.is_completed ? 'none' : '1.5px solid #2a2a4a',
                                                    background: task.is_completed ? '#10b981' : 'transparent',
                                                }}>
                                                {task.is_completed && (
                                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                                        <path d="M1.5 5l2.5 2.5 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                )}
                                            </button>
                                            <div className="todo-task-content">
                                                <p className="todo-task-title" style={{
                                                    color: task.is_completed ? '#2a2a4a' : '#e8e8ff',
                                                    textDecoration: task.is_completed ? 'line-through' : 'none',
                                                }}>{task.title}</p>
                                                {task.description && <p className="todo-task-desc">{task.description}</p>}
                                                <div className="todo-task-badges">
                                                    <span className="todo-badge" style={{
                                                        background: task.priority === 'high' ? 'rgba(248,113,113,0.1)' : task.priority === 'low' ? 'rgba(74,222,128,0.1)' : 'rgba(251,146,60,0.1)',
                                                        color: task.priority === 'high' ? '#f87171' : task.priority === 'low' ? '#4ade80' : '#fb923c',
                                                        border: `1px solid ${task.priority === 'high' ? 'rgba(248,113,113,0.2)' : task.priority === 'low' ? 'rgba(74,222,128,0.2)' : 'rgba(251,146,60,0.2)'}`,
                                                    }}>
                                                        {task.priority === 'high' ? '🔴' : task.priority === 'low' ? '🟢' : '🟠'} {task.priority || 'medium'}
                                                    </span>
                                                    {task.due_date && (
                                                        <span className="todo-badge" style={{
                                                            fontWeight: 400,
                                                            background: new Date(task.due_date) < new Date() && !task.is_completed ? 'rgba(248,113,113,0.1)' : 'rgba(99,102,241,0.1)',
                                                            color: new Date(task.due_date) < new Date() && !task.is_completed ? '#f87171' : '#818cf8',
                                                            border: `1px solid ${new Date(task.due_date) < new Date() && !task.is_completed ? 'rgba(248,113,113,0.2)' : 'rgba(99,102,241,0.2)'}`,
                                                        }}>
                                                            📅 {new Date(task.due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            {new Date(task.due_date) < new Date() && !task.is_completed && ' · overdue'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="todo-task-actions">
                                                <button className="todo-action-btn" onClick={() => startEdit(task)}>✏️</button>
                                                <button className="todo-action-btn" onClick={() => askDelete(task)}>🗑️</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
 
            {deleteId && (
                <ConfirmModal
                    message={`"${deleteTitle}" will be permanently deleted.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </>
    )
}

// // v 3 separate style
// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Spinner from '../components/Spinner'
// import ConfirmModal from '../components/ConfirmModal'
// import { getTasksApi, createTaskApi, updateTaskApi, toggleTaskApi, deleteTaskApi } from '../services/api'

// interface Task {
//     id: number
//     title: string
//     description: string | null
//     is_completed: boolean
//     created_at: string
//     due_date: string | null
//     priority: 'low' | 'medium' | 'high' | null
// }

// const NAV_ITEMS = [
//     {
//         label: 'Dashboard',
//         icon: (
//             <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//                 <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
//             </svg>
//         ),
//     },
//     {
//         label: 'Tasks',
//         icon: (
//             <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//                 <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
//             </svg>
//         ),
//         active: true,
//     },
//     {
//         label: 'Calendar',
//         icon: (
//             <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//                 <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
//             </svg>
//         ),
//     },
//     {
//         label: 'Profile',
//         icon: (
//             <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
//             </svg>
//         ),
//     },
// ]

// function priorityConfig(p: string | null) {
//     if (p === 'high')   return { label: 'High',   text: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200',   dot: 'bg-red-400'    }
//     if (p === 'low')    return { label: 'Low',    text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400' }
//     return              { label: 'Medium', text: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200',  dot: 'bg-amber-400'  }
// }

// export default function TodoPage() {
//     const navigate = useNavigate()
//     const [tasks, setTasks]             = useState<Task[]>([])
//     const [loading, setLoading]         = useState(true)
//     const [error, setError]             = useState('')
//     const [newTitle, setNewTitle]       = useState('')
//     const [newDesc, setNewDesc]         = useState('')
//     const [adding, setAdding]           = useState(false)
//     const [editId, setEditId]           = useState<number | null>(null)
//     const [editTitle, setEditTitle]     = useState('')
//     const [editDesc, setEditDesc]       = useState('')
//     const [filter, setFilter]           = useState<'all' | 'active' | 'done'>('all')
//     const [username, setUsername]       = useState('')
//     const [deleteId, setDeleteId]       = useState<number | null>(null)
//     const [deleteTitle, setDeleteTitle] = useState('')
//     const [newDueDate, setNewDueDate]   = useState('')
//     const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
//     const [search, setSearch]           = useState('')
//     const [addOpen, setAddOpen]         = useState(false)

//     async function fetchTasks() {
//         try {
//             setLoading(true)
//             const data = await getTasksApi()
//             if (data.error) { navigate('/login'); return }
//             setTasks(data)
//         } catch { setError('Failed to load tasks') }
//         finally { setLoading(false) }
//     }

//     useEffect(() => {
//         const token = localStorage.getItem('token')
//         if (!token) { navigate('/login'); return }
//         const payload = JSON.parse(atob(token.split('.')[1]))
//         setUsername(payload.username)
//         fetchTasks()
//     }, [])

//     async function handleCreate() {
//         if (!newTitle.trim()) return
//         try {
//             setAdding(true)
//             const task = await createTaskApi(newTitle, newDesc, newDueDate || undefined, newPriority)
//             setTasks(prev => [task, ...prev])
//             setNewTitle(''); setNewDesc(''); setNewDueDate(''); setNewPriority('medium'); setAddOpen(false)
//         } catch { setError('Failed to create task') }
//         finally { setAdding(false) }
//     }

//     async function handleToggle(id: number) {
//         const updated = await toggleTaskApi(id)
//         setTasks(prev => prev.map(t => t.id === id ? updated : t))
//     }

//     function startEdit(task: Task) {
//         setEditId(task.id); setEditTitle(task.title); setEditDesc(task.description || '')
//     }

//     async function handleSaveEdit(id: number) {
//         if (!editTitle.trim()) return
//         const updated = await updateTaskApi(id, { title: editTitle, description: editDesc })
//         setTasks(prev => prev.map(t => t.id === id ? updated : t))
//         setEditId(null)
//     }

//     function askDelete(task: Task) { setDeleteId(task.id); setDeleteTitle(task.title) }

//     async function confirmDelete() {
//         if (!deleteId) return
//         await deleteTaskApi(deleteId)
//         setTasks(prev => prev.filter(t => t.id !== deleteId))
//         setDeleteId(null)
//     }

//     function handleLogout() { localStorage.removeItem('token'); navigate('/login') }

//     const filtered = tasks
//         .filter(t => filter === 'active' ? !t.is_completed : filter === 'done' ? t.is_completed : true)
//         .filter(t => search.trim() === '' ? true : t.title.toLowerCase().includes(search.toLowerCase()))

//     const doneCount   = tasks.filter(t => t.is_completed).length
//     const activeCount = tasks.filter(t => !t.is_completed).length
//     const overdueCount = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && !t.is_completed).length

//     const inputClass = 'w-full bg-white border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm outline-none transition-all focus:border-violet-500 focus:ring-4 focus:ring-violet-100 placeholder:text-gray-300 font-sans'

//     return (
//         <div className="min-h-screen flex font-sans bg-[#f7f5f0]">

//             {/* ── Sidebar ── */}
//             <aside className="hidden md:flex w-[200px] xl:w-[220px] bg-[#1a1a2e] flex-col justify-between px-6 py-8 flex-shrink-0">
//                 <div>
//                     <p className="text-[10px] tracking-[0.15em] uppercase text-white/30 mb-8">TaskFlow</p>
//                     {NAV_ITEMS.map(item => (
//                         <div key={item.label}
//                             className={`flex items-center gap-2.5 text-xs mb-4 cursor-pointer transition-colors duration-150 ${item.active ? 'text-white' : 'text-white/25 hover:text-white/50'}`}>
//                             {item.icon}
//                             <span>{item.label}</span>
//                             {item.active && <span className="ml-auto w-1.5 h-1.5 bg-violet-500 rounded-full" />}
//                         </div>
//                     ))}

//                     {/* Progress */}
//                     <div className="mt-8 pt-6 border-t border-white/[0.06]">
//                         <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Progress</p>
//                         <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
//                             <div
//                                 className="h-full bg-violet-500 rounded-full transition-all duration-500"
//                                 style={{ width: tasks.length ? `${Math.round((doneCount / tasks.length) * 100)}%` : '0%' }}
//                             />
//                         </div>
//                         <p className="text-[10px] text-white/25 mt-2">
//                             {tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0}% complete
//                         </p>
//                     </div>
//                 </div>

//                 {/* User + logout */}
//                 <div>
//                     <div className="flex items-center gap-2.5 mb-4">
//                         <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
//                             {username.slice(0, 2).toUpperCase()}
//                         </div>
//                         <span className="text-xs text-white/50 truncate">{username}</span>
//                     </div>
//                     <button
//                         onClick={handleLogout}
//                         className="w-full text-[11px] text-white/25 hover:text-white/50 border border-white/[0.06] hover:border-white/20 rounded-lg py-2 transition-all duration-150"
//                     >
//                         Sign out
//                     </button>
//                 </div>
//             </aside>

//             {/* ── Main ── */}
//             <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">

//                 {/* Top bar */}
//                 <div className="flex items-center justify-between px-8 xl:px-12 pt-8 pb-6">
//                     <div>
//                         <p className="text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-1">Your workspace</p>
//                         <h1 className="text-3xl xl:text-4xl font-black text-gray-900 tracking-tight leading-tight">
//                             Tasks<span className="text-violet-600">.</span>
//                         </h1>
//                     </div>
//                     {/* Mobile sign out */}
//                     <button onClick={handleLogout} className="md:hidden text-xs text-gray-400 border border-gray-200 rounded-lg px-3 py-2">
//                         Sign out
//                     </button>
//                     {/* Add task button */}
//                     <button
//                         onClick={() => setAddOpen(v => !v)}
//                         className="hidden md:flex items-center gap-2 bg-[#1a1a2e] hover:bg-violet-600 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors duration-200"
//                     >
//                         <span className="text-lg leading-none">+</span> New task
//                     </button>
//                 </div>

//                 <div className="px-8 xl:px-12 pb-12 flex-1">

//                     {/* Error */}
//                     {error && (
//                         <div className="flex items-center justify-between text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
//                             <span>{error}</span>
//                             <button onClick={() => setError('')} className="text-red-400 font-bold ml-3">✕</button>
//                         </div>
//                     )}

//                     {/* Stat cards */}
//                     <div className="grid grid-cols-3 gap-4 mb-8">
//                         {[
//                             { label: 'Total tasks', value: tasks.length,  color: 'text-gray-900' },
//                             { label: 'Active',       value: activeCount,   color: 'text-violet-600' },
//                             { label: 'Completed',    value: doneCount,     color: 'text-emerald-600' },
//                         ].map(s => (
//                             <div key={s.label} className="bg-white border border-gray-100 rounded-2xl px-5 py-4">
//                                 <p className={`text-3xl font-black ${s.color} mb-1`}>{s.value}</p>
//                                 <p className="text-[11px] uppercase tracking-widest text-gray-400">{s.label}</p>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Overdue banner */}
//                     {overdueCount > 0 && (
//                         <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-6">
//                             <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
//                             <p className="text-sm text-red-600 font-medium">
//                                 You have <strong>{overdueCount}</strong> overdue {overdueCount === 1 ? 'task' : 'tasks'}
//                             </p>
//                         </div>
//                     )}

//                     {/* Add task panel */}
//                     {addOpen && (
//                         <div className="bg-white border-2 border-violet-200 rounded-2xl p-6 mb-6">
//                             <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">New task</p>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
//                                 <input className={`${inputClass} sm:col-span-2`} type="text"
//                                     placeholder="Task title..." value={newTitle}
//                                     onChange={e => setNewTitle(e.target.value)}
//                                     onKeyDown={e => e.key === 'Enter' && handleCreate()} />
//                                 <input className={inputClass} type="text"
//                                     placeholder="Description (optional)" value={newDesc}
//                                     onChange={e => setNewDesc(e.target.value)} />
//                                 <input className={inputClass} type="date"
//                                     value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
//                             </div>

//                             {/* Priority */}
//                             <div className="flex gap-2 mb-4">
//                                 {(['low', 'medium', 'high'] as const).map(p => {
//                                     const c = priorityConfig(p)
//                                     const active = newPriority === p
//                                     return (
//                                         <button key={p} type="button"
//                                             onClick={() => setNewPriority(p)}
//                                             className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide border-2 transition-all duration-150 ${active ? `${c.bg} ${c.text} ${c.border}` : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200'}`}
//                                         >
//                                             {p}
//                                         </button>
//                                     )
//                                 })}
//                             </div>

//                             <div className="flex gap-3">
//                                 <button
//                                     className="flex-1 bg-[#1a1a2e] hover:bg-violet-600 text-white rounded-xl py-3 text-sm font-bold transition-colors duration-200 disabled:opacity-40"
//                                     onClick={handleCreate}
//                                     disabled={adding || !newTitle.trim()}
//                                 >
//                                     {adding ? 'Adding...' : 'Add task →'}
//                                 </button>
//                                 <button
//                                     className="px-5 text-sm text-gray-400 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all"
//                                     onClick={() => setAddOpen(false)}
//                                 >
//                                     Cancel
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Search + filters */}
//                     <div className="flex flex-col sm:flex-row gap-3 mb-6">
//                         <div className="relative flex-1">
//                             <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//                                 <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
//                             </svg>
//                             <input
//                                 className="w-full bg-white border-2 border-gray-100 text-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-all focus:border-violet-400 focus:ring-4 focus:ring-violet-50 placeholder:text-gray-300"
//                                 type="text" placeholder="Search tasks..."
//                                 value={search} onChange={e => setSearch(e.target.value)}
//                             />
//                         </div>
//                         <div className="flex gap-2">
//                             {(['all', 'active', 'done'] as const).map(f => (
//                                 <button key={f}
//                                     onClick={() => setFilter(f)}
//                                     className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide border-2 transition-all duration-150 ${filter === f ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'}`}
//                                 >
//                                     {f}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Mobile add button */}
//                     <button
//                         onClick={() => setAddOpen(v => !v)}
//                         className="md:hidden w-full flex items-center justify-center gap-2 bg-[#1a1a2e] text-white text-sm font-bold px-5 py-3.5 rounded-xl mb-4 transition-colors"
//                     >
//                         <span className="text-lg leading-none">+</span> New task
//                     </button>

//                     {/* Task list */}
//                     {loading ? <Spinner /> : filtered.length === 0 ? (
//                         <div className="text-center py-20">
//                             <p className="text-5xl mb-4">📋</p>
//                             <p className="text-gray-400 text-sm">
//                                 {search ? `No tasks matching "${search}"` : filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="space-y-3">
//                             {filtered.map(task => {
//                                 const pc = priorityConfig(task.priority)
//                                 const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed

//                                 return (
//                                     <div key={task.id}
//                                         className={`bg-white border-2 rounded-2xl p-5 transition-all duration-200 ${editId === task.id ? 'border-violet-300' : isOverdue ? 'border-red-200' : 'border-gray-100 hover:border-gray-200'}`}
//                                     >
//                                         {editId === task.id ? (
//                                             <div>
//                                                 <input className={inputClass + ' mb-3'} value={editTitle}
//                                                     onChange={e => setEditTitle(e.target.value)} />
//                                                 <input className={inputClass + ' mb-4'} value={editDesc}
//                                                     onChange={e => setEditDesc(e.target.value)} placeholder="Description" />
//                                                 <div className="flex gap-3">
//                                                     <button className="flex-1 bg-[#1a1a2e] hover:bg-violet-600 text-white rounded-xl py-3 text-sm font-bold transition-colors"
//                                                         onClick={() => handleSaveEdit(task.id)}>Save changes</button>
//                                                     <button className="flex-1 border-2 border-gray-200 text-gray-400 rounded-xl py-3 text-sm hover:border-gray-300 transition-all"
//                                                         onClick={() => setEditId(null)}>Cancel</button>
//                                                 </div>
//                                             </div>
//                                         ) : (
//                                             <div className="flex items-start gap-4">
//                                                 {/* Checkbox */}
//                                                 <button
//                                                     onClick={() => handleToggle(task.id)}
//                                                     className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 ${task.is_completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-violet-400'}`}
//                                                 >
//                                                     {task.is_completed && (
//                                                         <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
//                                                             <path d="M2 6l3 3 5-5" />
//                                                         </svg>
//                                                     )}
//                                                 </button>

//                                                 {/* Content */}
//                                                 <div className="flex-1 min-w-0">
//                                                     <p className={`text-[15px] font-semibold mb-1 ${task.is_completed ? 'text-gray-300 line-through' : 'text-gray-900'}`}>
//                                                         {task.title}
//                                                     </p>
//                                                     {task.description && (
//                                                         <p className="text-sm text-gray-400 mb-2">{task.description}</p>
//                                                     )}
//                                                     <div className="flex flex-wrap gap-2">
//                                                         {/* Priority pill */}
//                                                         <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${pc.bg} ${pc.text} ${pc.border}`}>
//                                                             <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
//                                                             {pc.label}
//                                                         </span>
//                                                         {/* Due date */}
//                                                         {task.due_date && (
//                                                             <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg border ${isOverdue ? 'bg-red-50 text-red-500 border-red-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
//                                                                 📅 {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
//                                                                 {isOverdue && <span className="font-bold"> · overdue</span>}
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </div>

//                                                 {/* Actions */}
//                                                 <div className="flex gap-1 flex-shrink-0">
//                                                     <button
//                                                         onClick={() => startEdit(task)}
//                                                         className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-violet-600 hover:bg-violet-50 transition-all text-sm"
//                                                     >✏️</button>
//                                                     <button
//                                                         onClick={() => askDelete(task)}
//                                                         className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all text-sm"
//                                                     >🗑️</button>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 )
//                             })}
//                         </div>
//                     )}
//                 </div>
//             </main>

//             {deleteId && (
//                 <ConfirmModal
//                     message={`"${deleteTitle}" will be permanently deleted.`}
//                     onConfirm={confirmDelete}
//                     onCancel={() => setDeleteId(null)}
//                 />
//             )}
//         </div>
//     )
// }

// // v 4
// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Spinner from '../components/Spinner'
// import ConfirmModal from '../components/ConfirmModal'
// import { getTasksApi, createTaskApi, updateTaskApi, toggleTaskApi, deleteTaskApi } from '../services/api'
// import { useTheme } from '../hooks/useTheme'

// interface Task {
//     id: number
//     title: string
//     description: string | null
//     is_completed: boolean
//     created_at: string
//     due_date: string | null
//     priority: 'low' | 'medium' | 'high' | null
// }

// const NAV_ITEMS = [
//     {
//         label: 'Dashboard',
//         icon: (
//             <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//                 <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
//             </svg>
//         ),
//     },
//     {
//         label: 'Tasks',
//         active: true,
//         icon: (
//             <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//                 <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
//             </svg>
//         ),
//     },
//     {
//         label: 'Calendar',
//         icon: (
//             <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//                 <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
//             </svg>
//         ),
//     },
//     {
//         label: 'Profile',
//         icon: (
//             <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
//                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
//             </svg>
//         ),
//     },
// ]

// function priorityConfig(p: string | null) {
//     if (p === 'high') return {
//         label: 'High', dot: 'bg-red-400',
//         light: 'bg-red-50 text-red-500 border-red-200',
//         dark:  'bg-red-500/10 text-red-400 border-red-500/20',
//     }
//     if (p === 'low') return {
//         label: 'Low', dot: 'bg-emerald-400',
//         light: 'bg-emerald-50 text-emerald-600 border-emerald-200',
//         dark:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
//     }
//     return {
//         label: 'Medium', dot: 'bg-amber-400',
//         light: 'bg-amber-50 text-amber-600 border-amber-200',
//         dark:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
//     }
// }

// // ── Theme toggle button ──────────────────────────────────────────────────────
// function ThemeToggle({ dark, toggle }: { dark: boolean; toggle: () => void }) {
//     return (
//         <button
//             onClick={toggle}
//             aria-label="Toggle theme"
//             className="relative w-14 h-7 rounded-full border-2 transition-all duration-300 focus:outline-none
//                 border-gray-200 bg-gray-100
//                 dark:border-white/10 dark:bg-white/10"
//         >
//             <span className={`absolute inset-0.5 rounded-full transition-all duration-300 ${dark ? 'bg-violet-600' : 'bg-gray-200'}`} />
//             <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 flex items-center justify-center text-[11px]
//                 ${dark ? 'left-[calc(100%-1.625rem)]' : 'left-0.5'}`}>
//                 {dark ? '🌙' : '☀️'}
//             </span>
//         </button>
//     )
// }

// export default function TodoPage() {
//     const { dark, toggle }          = useTheme()
//     const navigate = useNavigate()
//     const [tasks, setTasks]         = useState<Task[]>([])
//     const [loading, setLoading]     = useState(true)
//     const [error, setError]         = useState('')
//     const [newTitle, setNewTitle]   = useState('')
//     const [newDesc, setNewDesc]     = useState('')
//     const [adding, setAdding]       = useState(false)
//     const [editId, setEditId]       = useState<number | null>(null)
//     const [editTitle, setEditTitle] = useState('')
//     const [editDesc, setEditDesc]   = useState('')
//     const [filter, setFilter]       = useState<'all' | 'active' | 'done'>('all')
//     const [username, setUsername]   = useState('')
//     const [deleteId, setDeleteId]   = useState<number | null>(null)
//     const [deleteTitle, setDeleteTitle] = useState('')
//     const [newDueDate, setNewDueDate]   = useState('')
//     const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium')
//     const [search, setSearch]       = useState('')
//     const [addOpen, setAddOpen]     = useState(false)

//     async function fetchTasks() {
//         try {
//             setLoading(true)
//             const data = await getTasksApi()
//             if (data.error) { navigate('/login'); return }
//             setTasks(data)
//         } catch { setError('Failed to load tasks') }
//         finally { setLoading(false) }
//     }

//     useEffect(() => {
//         const token = localStorage.getItem('token')
//         if (!token) { navigate('/login'); return }
//         const payload = JSON.parse(atob(token.split('.')[1]))
//         setUsername(payload.username)
//         fetchTasks()
//     }, [])

//     async function handleCreate() {
//         if (!newTitle.trim()) return
//         try {
//             setAdding(true)
//             const task = await createTaskApi(newTitle, newDesc, newDueDate || undefined, newPriority)
//             setTasks(prev => [task, ...prev])
//             setNewTitle(''); setNewDesc(''); setNewDueDate(''); setNewPriority('medium'); setAddOpen(false)
//         } catch { setError('Failed to create task') }
//         finally { setAdding(false) }
//     }

//     async function handleToggle(id: number) {
//         const updated = await toggleTaskApi(id)
//         setTasks(prev => prev.map(t => t.id === id ? updated : t))
//     }

//     function startEdit(task: Task) {
//         setEditId(task.id); setEditTitle(task.title); setEditDesc(task.description || '')
//     }

//     async function handleSaveEdit(id: number) {
//         if (!editTitle.trim()) return
//         const updated = await updateTaskApi(id, { title: editTitle, description: editDesc })
//         setTasks(prev => prev.map(t => t.id === id ? updated : t))
//         setEditId(null)
//     }

//     function askDelete(task: Task) { setDeleteId(task.id); setDeleteTitle(task.title) }

//     async function confirmDelete() {
//         if (!deleteId) return
//         await deleteTaskApi(deleteId)
//         setTasks(prev => prev.filter(t => t.id !== deleteId))
//         setDeleteId(null)
//     }

//     function handleLogout() { localStorage.removeItem('token'); navigate('/login') }

//     const filtered = tasks
//         .filter(t => filter === 'active' ? !t.is_completed : filter === 'done' ? t.is_completed : true)
//         .filter(t => search.trim() === '' ? true : t.title.toLowerCase().includes(search.toLowerCase()))

//     const doneCount    = tasks.filter(t => t.is_completed).length
//     const activeCount  = tasks.filter(t => !t.is_completed).length
//     const overdueCount = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && !t.is_completed).length

//     const inputClass = `
//         w-full border-2 rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 font-sans
//         bg-white text-gray-900 border-gray-200 placeholder:text-gray-300
//         focus:border-violet-500 focus:ring-4 focus:ring-violet-100
//         dark:bg-white/5 dark:text-gray-100 dark:border-white/10 dark:placeholder:text-white/20
//         dark:focus:border-violet-400 dark:focus:ring-violet-500/20
//     `

//     const cardClass = `
//         border-2 rounded-2xl p-5 transition-all duration-200
//         bg-white border-gray-100 hover:border-gray-200
//         dark:bg-white/[0.03] dark:border-white/[0.06] dark:hover:border-white/10
//     `

//     return (
//         <div className="min-h-screen flex font-sans transition-colors duration-300
//             bg-[#f7f5f0] dark:bg-[#0d0d18]">

//             {/* ── Sidebar ── */}
//             <aside className="hidden md:flex w-[200px] xl:w-[220px] flex-col justify-between px-6 py-8 flex-shrink-0
//                 bg-[#1a1a2e] dark:bg-[#0a0a14] dark:border-r dark:border-white/[0.05]">
//                 <div>
//                     <p className="text-[10px] tracking-[0.15em] uppercase text-white/30 mb-8">TaskFlow</p>
//                     {NAV_ITEMS.map(item => (
//                         <div key={item.label}
//                             className={`flex items-center gap-2.5 text-xs mb-4 cursor-pointer transition-colors duration-150
//                                 ${item.active ? 'text-white' : 'text-white/25 hover:text-white/50'}`}>
//                             {item.icon}
//                             <span>{item.label}</span>
//                             {item.active && <span className="ml-auto w-1.5 h-1.5 bg-violet-500 rounded-full" />}
//                         </div>
//                     ))}

//                     {/* Progress bar */}
//                     <div className="mt-8 pt-6 border-t border-white/[0.06]">
//                         <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Progress</p>
//                         <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
//                             <div
//                                 className="h-full bg-violet-500 rounded-full transition-all duration-700"
//                                 style={{ width: tasks.length ? `${Math.round((doneCount / tasks.length) * 100)}%` : '0%' }}
//                             />
//                         </div>
//                         <p className="text-[10px] text-white/25 mt-2">
//                             {tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0}% complete
//                         </p>
//                     </div>

//                     {/* Theme toggle */}
//                     <div className="mt-6 pt-6 border-t border-white/[0.06]">
//                         <p className="text-[10px] text-white/25 uppercase tracking-widest mb-3">Appearance</p>
//                         <ThemeToggle dark={dark} toggle={toggle} />
//                         <p className="text-[10px] text-white/20 mt-2">{dark ? 'Dark mode' : 'Light mode'}</p>
//                     </div>
//                 </div>

//                 {/* User + logout */}
//                 <div>
//                     <div className="flex items-center gap-2.5 mb-3">
//                         <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
//                             {username.slice(0, 2).toUpperCase()}
//                         </div>
//                         <span className="text-xs text-white/40 truncate">{username}</span>
//                     </div>
//                     <button onClick={handleLogout}
//                         className="w-full text-[11px] text-white/25 hover:text-white/50 border border-white/[0.06] hover:border-white/20 rounded-lg py-2 transition-all duration-150">
//                         Sign out
//                     </button>
//                 </div>
//             </aside>

//             {/* ── Main ── */}
//             <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">

//                 {/* Top bar */}
//                 <div className="flex items-center justify-between px-8 xl:px-12 pt-8 pb-6">
//                     <div>
//                         <p className="text-[10px] tracking-[0.15em] uppercase mb-1
//                             text-gray-400 dark:text-white/25">Your workspace</p>
//                         <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight
//                             text-gray-900 dark:text-white">
//                             Tasks<span className="text-violet-600 dark:text-violet-400">.</span>
//                         </h1>
//                     </div>
//                     <div className="flex items-center gap-3">
//                         {/* Mobile theme toggle */}
//                         <div className="md:hidden">
//                             <ThemeToggle dark={dark} toggle={toggle} />
//                         </div>
//                         <button onClick={handleLogout}
//                             className="md:hidden text-xs border rounded-lg px-3 py-2 transition-colors
//                                 text-gray-400 border-gray-200 dark:text-white/30 dark:border-white/10">
//                             Sign out
//                         </button>
//                         <button onClick={() => setAddOpen(v => !v)}
//                             className="hidden md:flex items-center gap-2 text-white text-sm font-bold px-5 py-3 rounded-xl transition-colors duration-200
//                                 bg-[#1a1a2e] hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500">
//                             <span className="text-lg leading-none">+</span> New task
//                         </button>
//                     </div>
//                 </div>

//                 <div className="px-8 xl:px-12 pb-12 flex-1">

//                     {/* Error */}
//                     {error && (
//                         <div className="flex items-center justify-between text-sm rounded-xl px-4 py-3 mb-6 border
//                             text-red-600 bg-red-50 border-red-200
//                             dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20">
//                             <span>{error}</span>
//                             <button onClick={() => setError('')} className="font-bold ml-3 opacity-60 hover:opacity-100">✕</button>
//                         </div>
//                     )}

//                     {/* Stat cards */}
//                     <div className="grid grid-cols-3 gap-4 mb-8">
//                         {[
//                             { label: 'Total tasks', value: tasks.length,  color: 'text-gray-900 dark:text-white'        },
//                             { label: 'Active',       value: activeCount,   color: 'text-violet-600 dark:text-violet-400' },
//                             { label: 'Completed',    value: doneCount,     color: 'text-emerald-600 dark:text-emerald-400' },
//                         ].map(s => (
//                             <div key={s.label} className="rounded-2xl px-5 py-4 border transition-colors
//                                 bg-white border-gray-100
//                                 dark:bg-white/[0.03] dark:border-white/[0.06]">
//                                 <p className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</p>
//                                 <p className="text-[11px] uppercase tracking-widest
//                                     text-gray-400 dark:text-white/25">{s.label}</p>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Overdue banner */}
//                     {overdueCount > 0 && (
//                         <div className="flex items-center gap-3 rounded-xl px-5 py-3 mb-6 border
//                             bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20">
//                             <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
//                             <p className="text-sm font-medium text-red-600 dark:text-red-400">
//                                 You have <strong>{overdueCount}</strong> overdue {overdueCount === 1 ? 'task' : 'tasks'}
//                             </p>
//                         </div>
//                     )}

//                     {/* Add task panel */}
//                     {addOpen && (
//                         <div className="rounded-2xl p-6 mb-6 border-2 transition-colors
//                             bg-white border-violet-200
//                             dark:bg-white/[0.03] dark:border-violet-500/30">
//                             <p className="text-xs font-bold uppercase tracking-widest mb-4
//                                 text-gray-400 dark:text-white/25">New task</p>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
//                                 <input className={`${inputClass} sm:col-span-2`} type="text"
//                                     placeholder="Task title..." value={newTitle}
//                                     onChange={e => setNewTitle(e.target.value)}
//                                     onKeyDown={e => e.key === 'Enter' && handleCreate()} />
//                                 <input className={inputClass} type="text"
//                                     placeholder="Description (optional)" value={newDesc}
//                                     onChange={e => setNewDesc(e.target.value)} />
//                                 <input className={inputClass} type="date"
//                                     value={newDueDate} onChange={e => setNewDueDate(e.target.value)}
//                                     style={{ colorScheme: dark ? 'dark' : 'light' }} />
//                             </div>

//                             {/* Priority selector */}
//                             <div className="flex gap-2 mb-4">
//                                 {(['low', 'medium', 'high'] as const).map(p => {
//                                     const c = priorityConfig(p)
//                                     const active = newPriority === p
//                                     return (
//                                         <button key={p} type="button" onClick={() => setNewPriority(p)}
//                                             className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide border-2 transition-all duration-150
//                                                 ${active
//                                                     ? (dark ? c.dark : c.light)
//                                                     : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-200 dark:bg-white/5 dark:text-white/20 dark:border-white/[0.06] dark:hover:border-white/20'
//                                                 }`}>
//                                             {p}
//                                         </button>
//                                     )
//                                 })}
//                             </div>

//                             <div className="flex gap-3">
//                                 <button onClick={handleCreate} disabled={adding || !newTitle.trim()}
//                                     className="flex-1 text-white rounded-xl py-3 text-sm font-bold transition-colors duration-200 disabled:opacity-40
//                                         bg-[#1a1a2e] hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500">
//                                     {adding ? 'Adding...' : 'Add task →'}
//                                 </button>
//                                 <button onClick={() => setAddOpen(false)}
//                                     className="px-5 text-sm rounded-xl border-2 transition-all
//                                         text-gray-400 border-gray-200 hover:border-gray-300
//                                         dark:text-white/30 dark:border-white/10 dark:hover:border-white/20">
//                                     Cancel
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Search + filters */}
//                     <div className="flex flex-col sm:flex-row gap-3 mb-6">
//                         <div className="relative flex-1">
//                             <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4
//                                 text-gray-300 dark:text-white/20"
//                                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//                                 <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
//                             </svg>
//                             <input
//                                 className="w-full border-2 rounded-xl pl-11 pr-4 py-3 text-sm outline-none transition-all
//                                     bg-white text-gray-900 border-gray-100 placeholder:text-gray-300
//                                     focus:border-violet-400 focus:ring-4 focus:ring-violet-50
//                                     dark:bg-white/[0.03] dark:text-gray-100 dark:border-white/[0.06] dark:placeholder:text-white/20
//                                     dark:focus:border-violet-400 dark:focus:ring-violet-500/20"
//                                 type="text" placeholder="Search tasks..."
//                                 value={search} onChange={e => setSearch(e.target.value)}
//                             />
//                             {search && (
//                                 <button onClick={() => setSearch('')}
//                                     className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-300 hover:text-gray-500 dark:text-white/20 dark:hover:text-white/40">
//                                     ✕
//                                 </button>
//                             )}
//                         </div>
//                         <div className="flex gap-2">
//                             {(['all', 'active', 'done'] as const).map(f => (
//                                 <button key={f} onClick={() => setFilter(f)}
//                                     className={`px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide border-2 transition-all duration-150
//                                         ${filter === f
//                                             ? 'text-white bg-[#1a1a2e] border-[#1a1a2e] dark:bg-violet-600 dark:border-violet-600'
//                                             : 'text-gray-400 bg-white border-gray-100 hover:border-gray-300 dark:text-white/25 dark:bg-white/[0.03] dark:border-white/[0.06] dark:hover:border-white/20'
//                                         }`}>
//                                     {f}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Mobile add button */}
//                     <button onClick={() => setAddOpen(v => !v)}
//                         className="md:hidden w-full flex items-center justify-center gap-2 text-white text-sm font-bold px-5 py-3.5 rounded-xl mb-4 transition-colors
//                             bg-[#1a1a2e] dark:bg-violet-600">
//                         <span className="text-lg leading-none">+</span> New task
//                     </button>

//                     {/* Task list */}
//                     {loading ? <Spinner /> : filtered.length === 0 ? (
//                         <div className="text-center py-20">
//                             <p className="text-5xl mb-4">📋</p>
//                             <p className="text-sm text-gray-400 dark:text-white/25">
//                                 {search ? `No tasks matching "${search}"` : filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="space-y-3">
//                             {filtered.map(task => {
//                                 const pc = priorityConfig(task.priority)
//                                 const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed

//                                 return (
//                                     <div key={task.id} className={`
//                                         border-2 rounded-2xl p-5 transition-all duration-200
//                                         ${editId === task.id
//                                             ? 'bg-white border-violet-300 dark:bg-white/[0.04] dark:border-violet-500/40'
//                                             : isOverdue
//                                             ? 'bg-white border-red-200 dark:bg-white/[0.03] dark:border-red-500/20'
//                                             : 'bg-white border-gray-100 hover:border-gray-200 dark:bg-white/[0.03] dark:border-white/[0.06] dark:hover:border-white/10'
//                                         }
//                                     `}>
//                                         {editId === task.id ? (
//                                             <div>
//                                                 <input className={`${inputClass} mb-3`} value={editTitle}
//                                                     onChange={e => setEditTitle(e.target.value)} />
//                                                 <input className={`${inputClass} mb-4`} value={editDesc}
//                                                     onChange={e => setEditDesc(e.target.value)} placeholder="Description" />
//                                                 <div className="flex gap-3">
//                                                     <button onClick={() => handleSaveEdit(task.id)}
//                                                         className="flex-1 text-white rounded-xl py-3 text-sm font-bold transition-colors
//                                                             bg-[#1a1a2e] hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500">
//                                                         Save changes
//                                                     </button>
//                                                     <button onClick={() => setEditId(null)}
//                                                         className="flex-1 rounded-xl py-3 text-sm border-2 transition-all
//                                                             text-gray-400 border-gray-200 hover:border-gray-300
//                                                             dark:text-white/30 dark:border-white/10 dark:hover:border-white/20">
//                                                         Cancel
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ) : (
//                                             <div className="flex items-start gap-4">
//                                                 {/* Checkbox */}
//                                                 <button onClick={() => handleToggle(task.id)}
//                                                     className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200
//                                                         ${task.is_completed
//                                                             ? 'bg-emerald-500 border-emerald-500'
//                                                             : 'border-gray-300 hover:border-violet-400 dark:border-white/20 dark:hover:border-violet-400'
//                                                         }`}>
//                                                     {task.is_completed && (
//                                                         <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
//                                                             <path d="M2 6l3 3 5-5" />
//                                                         </svg>
//                                                     )}
//                                                 </button>

//                                                 {/* Content */}
//                                                 <div className="flex-1 min-w-0">
//                                                     <p className={`text-[15px] font-semibold mb-1 transition-colors
//                                                         ${task.is_completed
//                                                             ? 'text-gray-300 line-through dark:text-white/20'
//                                                             : 'text-gray-900 dark:text-gray-100'
//                                                         }`}>
//                                                         {task.title}
//                                                     </p>
//                                                     {task.description && (
//                                                         <p className="text-sm mb-2 text-gray-400 dark:text-white/30">
//                                                             {task.description}
//                                                         </p>
//                                                     )}
//                                                     <div className="flex flex-wrap gap-2">
//                                                         <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border
//                                                             ${dark ? pc.dark : pc.light}`}>
//                                                             <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
//                                                             {pc.label}
//                                                         </span>
//                                                         {task.due_date && (
//                                                             <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg border
//                                                                 ${isOverdue
//                                                                     ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
//                                                                     : 'bg-gray-50 text-gray-400 border-gray-200 dark:bg-white/[0.04] dark:text-white/30 dark:border-white/10'
//                                                                 }`}>
//                                                                 📅 {new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
//                                                                 {isOverdue && <strong> · overdue</strong>}
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </div>

//                                                 {/* Actions */}
//                                                 <div className="flex gap-1 flex-shrink-0">
//                                                     <button onClick={() => startEdit(task)}
//                                                         className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all
//                                                             text-gray-300 hover:text-violet-600 hover:bg-violet-50
//                                                             dark:text-white/20 dark:hover:text-violet-400 dark:hover:bg-violet-500/10">
//                                                         ✏️
//                                                     </button>
//                                                     <button onClick={() => askDelete(task)}
//                                                         className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all
//                                                             text-gray-300 hover:text-red-500 hover:bg-red-50
//                                                             dark:text-white/20 dark:hover:text-red-400 dark:hover:bg-red-500/10">
//                                                         🗑️
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 )
//                             })}
//                         </div>
//                     )}
//                 </div>
//             </main>

//             {deleteId && (
//                 <ConfirmModal
//                     message={`"${deleteTitle}" will be permanently deleted.`}
//                     onConfirm={confirmDelete}
//                     onCancel={() => setDeleteId(null)}
//                 />
//             )}
//         </div>
//     )
// }