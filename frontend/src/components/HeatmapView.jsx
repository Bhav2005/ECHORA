import React from 'react';
import { Shield, ShieldAlert } from 'lucide-react';

const DEPARTMENTS = [
  'Human Resources',
  'Engineering & Dev',
  'Operations & Facilities',
  'Marketing & Sales',
  'Finance & Admin',
  'Student Services',
  'General'
];

const BUILDINGS = [
  'Building A',
  'Building B',
  'Building C',
  'North Hall',
  'South Hall',
  'West Complex',
  'Remote / Online'
];

export default function HeatmapView({ heatmapData = [] }) {
  // Map data to a 2D lookup object: department_building -> count
  const dataMap = {};
  heatmapData.forEach(item => {
    const key = `${item.department}_${item.building}`;
    dataMap[key] = item.count;
  });

  // Calculate cell color styling based on count value
  const getCellColor = (count) => {
    if (!count || count === 0) return 'bg-slate-900/30 text-slate-600 border-slate-800/40';
    if (count < 5) return 'bg-yellow-500/10 text-yellow-500/80 border-yellow-500/20'; // Suppressed state
    if (count < 10) return 'bg-indigo-500/30 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10 animate-pulse';
    return 'bg-indigo-600 text-white border-indigo-400 font-bold shadow-md shadow-indigo-500/35';
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-base font-bold text-slate-200">Incident Distribution Heatmap</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1 text-slate-500">
            <span className="w-3.5 h-3.5 bg-slate-900 border border-slate-800 rounded" />
            <span>0 cases</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Shield size={14} />
            <span>Suppressed (&lt;5)</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-400">
            <span className="w-3.5 h-3.5 bg-indigo-500/30 border border-indigo-500/40 rounded" />
            <span>5 - 9 cases</span>
          </div>
          <div className="flex items-center gap-1 text-white">
            <span className="w-3.5 h-3.5 bg-indigo-600 border border-indigo-400 rounded" />
            <span>10+ cases</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-brand-border rounded-xl bg-slate-900/10">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-brand-border bg-slate-900/40">
              <th className="py-3 px-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[150px]">
                Department
              </th>
              {BUILDINGS.map(b => (
                <th key={b} className="py-3 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[100px]">
                  {b}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40 text-sm">
            {DEPARTMENTS.map(dept => (
              <tr key={dept} className="hover:bg-slate-900/20 transition">
                <td className="py-3.5 px-4 text-left font-medium text-slate-300 border-r border-brand-border/40 text-xs">
                  {dept}
                </td>
                {BUILDINGS.map(bldg => {
                  const count = dataMap[`${dept}_${bldg}`] || 0;
                  const isSuppressed = count > 0 && count < 5;
                  
                  return (
                    <td
                      key={bldg}
                      className={`py-3.5 px-2 text-xs transition border-r border-brand-border/20 last:border-r-0 ${getCellColor(count)}`}
                    >
                      {isSuppressed ? (
                        <div className="flex items-center justify-center gap-1 text-yellow-500/80" title="Suppressed to preserve k-Anonymity">
                          <Shield size={14} />
                          <span className="text-[10px] font-semibold tracking-wide">SHIELD</span>
                        </div>
                      ) : count >= 5 ? (
                        <span>{count}</span>
                      ) : (
                        <span className="text-slate-700 font-light">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
