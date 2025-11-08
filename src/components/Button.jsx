export default function Button({ as: As = 'button', className = '', ...props }) {
const classes = `btn ${className}`
return <As className={classes} {...props} />
}