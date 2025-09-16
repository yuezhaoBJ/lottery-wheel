export function Button({ children, onClick, className = '', ...props }) {
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
