interface Props {
    message: string
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
    return (
        // Dark overlay behind the modal
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
        }}>
            {/* Modal card */}
            <div style={{
                background: '#13131a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '28px',
                width: '100%',
                maxWidth: '340px',
            }}>
                {/* Icon */}
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    marginBottom: '16px',
                }}>
                    🗑️
                </div>

                {/* Text */}
                <p style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#f1f0ff',
                    margin: '0 0 6px',
                }}>
                    Delete task?
                </p>
                <p style={{
                    fontSize: '13px',
                    color: '#3a3a5a',
                    margin: '0 0 24px',
                }}>
                    {message}
                </p>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: '#6a6a8a',
                            borderRadius: '10px',
                            padding: '10px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            flex: 1,
                            background: 'rgba(239,68,68,0.15)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#f87171',
                            borderRadius: '10px',
                            padding: '10px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}