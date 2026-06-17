import { useState } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { schoolDatabase } from '../../utils/mockData';
import type { TargetProgram } from '../../types';

export default function ProgramSelector() {
  const { targetProgram, setTargetProgram } = usePortfolioStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  const filteredSchools = schoolDatabase.filter(
    (school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.programs.some((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleProgramSelect = (schoolId: string, programId: string) => {
    const school = schoolDatabase.find((s) => s.id === schoolId);
    const program = school?.programs.find((p) => p.id === programId);
    
    if (school && program) {
      const target: TargetProgram = {
        id: program.id,
        school: school.name,
        major: program.name,
        degree: program.degree,
        deadline: '',
        requirements: program.requirements,
      };
      setTargetProgram(target);
      setIsOpen(false);
      setSearchQuery('');
      setSelectedSchool(null);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="font-serif text-xl font-semibold text-zinc-900 mb-4">
        目标院校专业选择
      </h2>
      {targetProgram ? (
        <div className="space-y-4">
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-primary-600 font-medium">
                </p>
                <h3 className="font-serif text-lg font-semibold text-primary-900">
                  {targetProgram.school}
                </h3>
                <p className="text-primary-700">
                  {targetProgram.major} ({targetProgram.degree})
                </p>
              </div>
              <button
                onClick={() => setTargetProgram(null)}
                className="btn-secondary text-sm py-1.5 px-3"
              >
                更换
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {targetProgram.requirements.slice(0, 3).map((req) => (
                <span
                  key={req.id}
                  className="tag bg-white text-primary-700 border border-primary-200"
                >
                  {req.dimension}
                </span>
              ))}
              {targetProgram.requirements.length > 3 && (
                <span className="tag bg-white text-zinc-500 border border-zinc-200">
                +{targetProgram.requirements.length - 3} 项要求
                </span>
              )}
            </div>
          </div>
            <div>
              <label className="input-label">申请截止日期</label>
              <input
                type="date"
                value={targetProgram.deadline}
                onChange={(e) =>
                  setTargetProgram({
                    ...targetProgram,
                    deadline: e.target.value,
                  })
                }
                className="input-field"
              />
            </div>
          </div>
        ) : (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-4 border-2 border-dashed border-zinc-300 rounded-lg hover:border-primary-400 hover:bg-zinc-50 transition-colors"
          >
            <span className="text-zinc-500">选择目标院校和专业...</span>
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg z-20 max-h-96 overflow-hidden animate-fade-in">
              <div className="p-3 border-b border-zinc-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索院校或专业..."
                    className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-72 scrollbar-thin">
                {filteredSchools.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500">
                    没有找到匹配的院校或专业
                  </div>
                ) : (
                  filteredSchools.map((school) => (
                  <div key={school.id}>
                    <button
                      onClick={() =>
                        setSelectedSchool(
                          selectedSchool === school.id ? null : school.id
                        )
                      }
                      className={`w-full px-4 py-3 text-left hover:bg-zinc-50 transition-colors
                      ${selectedSchool === school.id ? 'bg-primary-50' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-900">
                        {school.name}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 transition-transform ${selectedSchool === school.id ? 'rotate-180' : ''}
                        `}
                      />
                    </div>
                    </button>
                    {selectedSchool === school.id && (
                      <div className="bg-zinc-50 border-t border-zinc-100">
                        {school.programs.map((program) => (
                          <button
                            key={program.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProgramSelect(school.id, program.id);
                            }}
                            className="w-full px-6 py-2.5 text-left hover:bg-primary-50 transition-colors flex items-center justify-between group"
                          >
                            <div>
                              <div className="font-medium text-zinc-700 group-hover:text-primary-700">
                                {program.name}
                              </div>
                              <div className="text-xs text-zinc-500">
                                {program.degree} · {program.description}
                              </div>
                            </div>
                            {targetProgram?.id === program.id && (
                              <Check className="w-4 h-4 text-primary-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
