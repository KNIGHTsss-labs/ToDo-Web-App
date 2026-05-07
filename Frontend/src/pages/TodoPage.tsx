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
}

export default function TodoPage() {
    const navigate = useNavigate()
    const [tasks, setTasks]         = useState<Task[]>([])
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState('')
    const [newTitle, setNewTitle]   = useState('')
    const [newDesc, setNewDesc]     = useState('')
    const [adding, setAdding]       = useState(false)
    const [editId, setEditId]       = useState<number | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editDesc, setEditDesc]   = useState('')
    const [filter, setFilter]       = useState<'all' | 'active' | 'done'>('all')
    const [username, setUsername] = useState('')
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [deleteTitle, setDeleteTitle] = useState('')

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return }
        fetchTasks()
    }, [])

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

    // ← add these 2 lines:
    const payload = JSON.parse(atob(token.split('.')[1]))
    setUsername(payload.username)

    fetchTasks()
}, [])

    async function handleCreate() {
        if (!newTitle.trim()) return
        try {
            setAdding(true)
            const task = await createTaskApi(newTitle, newDesc)
            setTasks(prev => [task, ...prev])
            setNewTitle(''); setNewDesc('')
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

    async function askDelete(task: Task) {
    setDeleteId(task.id)        // remember which task
    setDeleteTitle(task.title)  // remember its name to show in modal
    }

    async function confirmDelete() {
    if (!deleteId) return
    await deleteTaskApi(deleteId)
    setTasks(prev => prev.filter(t => t.id !== deleteId))
    setDeleteId(null)  // close modal
    }

    function handleLogout() {
        localStorage.removeItem('token'); navigate('/login')
    }

    const filtered = tasks.filter(t =>
        filter === 'active' ? !t.is_completed : filter === 'done' ? t.is_completed : true
    )
    const doneCount = tasks.filter(t => t.is_completed).length

    // ── Styles ────────────────────────────────────────────────────────────
    const page: React.CSSProperties = {
        minHeight: '100vh',
        background: '#0a0a0f',
        padding: '40px 16px',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: '#d4d4f0',
    }
    const inner: React.CSSProperties = {
        maxWidth: '520px',
        margin: '0 auto',
    }
    const card: React.CSSProperties = {
        background: '#13131a',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '14px',
        padding: '16px',
    }
    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: '#0a0a0f',
        color: '#d4d4f0',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: '10px',
    }
    const btnPrimary: React.CSSProperties = {
        width: '100%',
        background: '#4f46e5',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        padding: '10px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
    }

    return (
        <div style={page}>
            <div style={inner}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                    <div>
                        <p style={{ fontSize: '12px', color: '#3a3a5a', margin: '0 0 4px' }}>
                            Welcome back,
                        </p>
                        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#f1f0ff', letterSpacing: '-0.02em', margin: 0 }}>
                            {username} 👋
                        </h1>
                        <p style={{ fontSize: '12px', color: '#3a3a5a', marginTop: '4px' }}>
                            {doneCount} / {tasks.length} completed
                        </p>
                    </div>
                    <button onClick={handleLogout} style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#4a4a6a',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        cursor: 'pointer',
                    }}>
                        Logout
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        fontSize: '12px', color: '#f87171',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: '10px', padding: '10px 14px',
                        marginBottom: '16px',
                        display: 'flex', justifyContent: 'space-between'
                    }}>
                        <span>{error}</span>
                        <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 0 }}>✕</button>
                    </div>
                )}

                {/* Add task */}
                <div style={{ ...card, marginBottom: '16px' }}>
                    <input
                        style={inputStyle}
                        type="text"
                        placeholder="Task title..."
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    />
                    <input
                        style={{ ...inputStyle, marginBottom: '12px' }}
                        type="text"
                        placeholder="Description (optional)"
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    />
                    <button
                        style={{ ...btnPrimary, opacity: adding || !newTitle.trim() ? 0.4 : 1 }}
                        onClick={handleCreate}
                        disabled={adding || !newTitle.trim()}
                    >
                        {adding ? 'Adding...' : '+ Add task'}
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {(['all', 'active', 'done'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            transition: 'all 0.15s',
                            background: filter === f ? '#4f46e5' : '#13131a',
                            color: filter === f ? '#fff' : '#4a4a6a',
                            border: filter === f ? '1px solid #4f46e5' : '1px solid rgba(255,255,255,0.06)',
                        }}>
                            {f}
                        </button>
                    ))}
                </div>

                {/* Task list */}
                {loading ? (
                    <Spinner />
                ) : filtered.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#3a3a5a', fontSize: '14px', padding: '60px 0' }}>
                        {filter === 'all' ? 'No tasks yet. Add one above!' : `No ${filter} tasks.`}
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filtered.map(task => (
                            <div key={task.id} style={{
                                ...card,
                                borderColor: editId === task.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)',
                            }}>
                                {editId === task.id ? (
                                    // Edit mode
                                    <div>
                                        <input
                                            style={inputStyle}
                                            value={editTitle}
                                            onChange={e => setEditTitle(e.target.value)}
                                        />
                                        <input
                                            style={{ ...inputStyle, marginBottom: '12px' }}
                                            value={editDesc}
                                            onChange={e => setEditDesc(e.target.value)}
                                            placeholder="Description"
                                        />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleSaveEdit(task.id)} style={{ ...btnPrimary, flex: 1 }}>
                                                Save
                                            </button>
                                            <button onClick={() => setEditId(null)} style={{
                                                flex: 1, background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                color: '#6a6a8a', borderRadius: '10px',
                                                padding: '10px', fontSize: '13px', cursor: 'pointer',
                                            }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // View mode
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>

                                        {/* Toggle circle */}
                                        <button onClick={() => handleToggle(task.id)} style={{
                                            width: '18px', height: '18px',
                                            borderRadius: '50%',
                                            border: task.is_completed ? 'none' : '1.5px solid #2a2a4a',
                                            background: task.is_completed ? '#10b981' : 'transparent',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            marginTop: '2px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s',
                                            padding: 0,
                                        }}>
                                            {task.is_completed && (
                                                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                                    <path d="M1.5 4.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                        </button>

                                        {/* Text */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                margin: 0, fontSize: '14px', fontWeight: 500,
                                                color: task.is_completed ? '#2a2a4a' : '#e8e8ff',
                                                textDecoration: task.is_completed ? 'line-through' : 'none',
                                            }}>
                                                {task.title}
                                            </p>
                                            {task.description && (
                                                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#3a3a5a' }}>
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                            <button onClick={() => startEdit(task)} style={{
                                                background: 'none', border: 'none',
                                                color: '#3a3a5a', cursor: 'pointer',
                                                padding: '4px 6px', borderRadius: '6px', fontSize: '13px',
                                            }}>✏️</button>
                                            <button onClick={() => askDelete(task)} style={{
                                                background: 'none', border: 'none',
                                                color: '#3a3a5a', cursor: 'pointer',
                                                padding: '4px 6px', borderRadius: '6px', fontSize: '13px',
                                            }}>🗑️</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Delete confirm modal */}
            {deleteId && (
                <ConfirmModal
                    message={`"${deleteTitle}" will be permanently deleted.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    )
}
