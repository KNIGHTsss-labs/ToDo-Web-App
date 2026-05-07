export default function Spinner() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 0',
            gap: '16px',
        }}>
            {/* The spinning circle */}
            <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.06)',
                borderTopColor: '#4f46e5',
                animation: 'spin 0.7s linear infinite',
            }} />

            <p style={{
                fontSize: '12px',
                color: '#3a3a5a',
                margin: 0,
            }}>
                Loading...
            </p>

            {/* The spin animation */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}