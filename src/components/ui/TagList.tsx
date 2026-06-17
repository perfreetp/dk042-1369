import { X, Plus } from 'lucide-react';
import { useState, type KeyboardEvent } from 'react';

interface TagListProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function TagList({ tags, onChange, placeholder = '输入后按回车添加', className = '' }: TagListProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="tag bg-primary-50 text-primary-700 border border-primary-200 gap-1"
          >
            {tag}
            <button
              onClick={() => removeTag(index)}
              className="hover:text-primary-900 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-field pr-10"
        />
        {inputValue && (
          <button
            onClick={() => {
              if (inputValue.trim() && !tags.includes(inputValue.trim())) {
                onChange([...tags, inputValue.trim()]);
              }
              setInputValue('');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded"
          >
            <Plus className="w-4 h-4 text-primary-600" />
          </button>
        )}
      </div>
    </div>
  );
}
