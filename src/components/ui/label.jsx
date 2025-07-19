export function Label({ children, ...props }) {
  return <label className="block mb-1 font-medium" {...props}>{children}</label>;
}
