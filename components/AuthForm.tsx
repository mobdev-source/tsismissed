interface AuthFormProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthForm({ title, children, footer }: AuthFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h1>
        {children}
        {footer && (
          <div className="mt-4 text-center text-sm text-gray-500">{footer}</div>
        )}
      </div>
    </div>
  );
}
