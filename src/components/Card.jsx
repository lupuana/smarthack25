export function Card({ className = '', children }) {
return <div className={`card ${className}`}>{children}</div>
}
export function CardHeader({ className = '', children }) {
return <div className={`card-header ${className}`}>{children}</div>
}
export function CardContent({ className = '', children }) {
return <div className={`card-content ${className}`}>{children}</div>
}