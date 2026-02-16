import { TemplateVariable } from '../../types/templates';

interface VariableFormProps {
  variables: TemplateVariable[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  errors?: Record<string, string>;
}

export function VariableForm({ variables, values, onChange, errors = {} }: VariableFormProps) {
  if (variables.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {variables.map((variable) => (
        <div key={variable.name} className="space-y-1.5">
          <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {variable.label}
            {variable.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>

          {variable.type === 'text' && (
            <input
              type="text"
              value={values[variable.name] || ''}
              onChange={(e) => onChange(variable.name, e.target.value)}
              placeholder={variable.placeholder}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
            />
          )}

          {variable.type === 'textarea' && (
            <textarea
              value={values[variable.name] || ''}
              onChange={(e) => onChange(variable.name, e.target.value)}
              placeholder={variable.placeholder}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 resize-none"
            />
          )}

          {variable.type === 'select' && variable.options && (
            <select
              value={values[variable.name] || ''}
              onChange={(e) => onChange(variable.name, e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
            >
              <option value="">{variable.placeholder}</option>
              {variable.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          {errors[variable.name] && (
            <p className="text-sm text-red-500">{errors[variable.name]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
