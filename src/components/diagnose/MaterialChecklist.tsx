import { CheckCircle2, Circle, AlertCircle, RefreshCw } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useEffect } from 'react';

export default function MaterialChecklist() {
  const { materialChecklist, updateMaterialCheckItem, regenerateMaterialChecklist, projects, background } = usePortfolioStore();

  useEffect(() => {
    if (materialChecklist.length === 0) {
      regenerateMaterialChecklist();
    }
  }, [materialChecklist.length, regenerateMaterialChecklist]);

  const categories = [...new Set(materialChecklist.map((m) => m.category))];

  const totalItems = materialChecklist.length;
  const completedItems = materialChecklist.filter((m) => m.completed).length;
  const requiredItems = materialChecklist.filter((m) => m.required);
  const completedRequired = requiredItems.filter((m) => m.completed).length;

  const autoCheck = () => {
    const updates: { id: string; completed: boolean }[] = [];

    materialChecklist.forEach((item) => {
      if (item.id === 'mat-9' && projects.length >= 3) {
        updates.push({ id: item.id, completed: true });
      }
      if (item.id === 'mat-10' && projects.some((p) => p.processNodes.length > 0)) {
        updates.push({ id: item.id, completed: true });
      }
      if (item.id === 'mat-2' && background.motivation) {
        updates.push({ id: item.id, completed: true });
      }
      if (item.id === 'mat-4' && background.education.length > 0) {
        updates.push({ id: item.id, completed: true });
      }
      if (item.id === 'mat-1' && background.experience.length > 0) {
        updates.push({ id: item.id, completed: true });
      }
    });

    updates.forEach((u) => updateMaterialCheckItem(u.id, { completed: u.completed }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-zinc-600 bg-zinc-50 border-zinc-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高优';
      case 'medium':
        return '中优';
      default:
        return '低优';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-zinc-900">
            素材完整性检查
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            检查申请材料是否准备齐全
          </p>
        </div>
        <button
          onClick={autoCheck}
          className="btn-secondary text-sm py-1.5 px-3"
        >
          智能检测
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
          <p className="text-sm text-zinc-500">总完成度</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1">
            {totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%
          </p>
          <div className="progress-bar mt-2">
            <div
              className="progress-fill"
              style={{
                width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
          <p className="text-sm text-primary-600">必需材料</p>
          <p className="text-2xl font-bold text-primary-900 mt-1">
            {completedRequired}/{requiredItems.length}
          </p>
          <div className="progress-bar mt-2 bg-primary-100">
            <div
              className="progress-fill bg-primary-600"
              style={{
                width: `${
                  requiredItems.length > 0
                    ? (completedRequired / requiredItems.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
        <div className="p-4 bg-accent-50 rounded-lg border border-accent-200">
          <p className="text-sm text-accent-600">项目数量</p>
          <p className="text-2xl font-bold text-accent-700 mt-1">
            {projects.length} 个
          </p>
          <p className="text-xs text-accent-600 mt-2">
            {projects.length >= 3 ? (
              <span className="text-green-600">已达到推荐数量</span>
            ) : (
              <span>建议至少 3 个项目</span>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="font-medium text-zinc-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary-600 rounded-full" />
              {category}
            </h3>
            <div className="space-y-2">
              {materialChecklist
                .filter((m) => m.category === category)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border transition-all ${
                      item.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-zinc-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() =>
                          updateMaterialCheckItem(item.id, {
                            completed: !item.completed,
                          })
                        }
                        className="mt-0.5 flex-shrink-0"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-300" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-medium ${
                              item.completed
                                ? 'text-green-700 line-through'
                                : 'text-zinc-900'
                            }`}
                          >
                            {item.item}
                          </span>
                          {item.required && (
                            <span className="tag bg-red-100 text-red-700 border border-red-200 text-xs">
                              必需
                            </span>
                          )}
                          <span
                            className={`tag border text-xs ${getPriorityColor(
                              item.priority
                            )}`}
                          >
                            {getPriorityLabel(item.priority)}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-zinc-500 mt-1">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      {!item.completed &&
                        item.required &&
                        item.priority === 'high' && (
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                    </div>
                    <div className="mt-2">
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) =>
                          updateMaterialCheckItem(item.id, {
                            notes: e.target.value,
                          })
                        }
                        placeholder="添加备注..."
                        className="w-full text-sm px-3 py-1.5 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-transparent"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
