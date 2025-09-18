"use client";

import { Progress } from '@/components/ui/progress';

type StatusProgressProps = {
    data: { name: string; value: number; colorClass?: string }[];
    total: number;
};

export function StatusProgress({ data, total }: StatusProgressProps) {
    return (
        <div className="space-y-3">
            {data.map((row) => {
                const pct = total > 0 ? (row.value / total) * 100 : 0;
                return (
                    <div key={row.name} className="grid grid-cols-5 gap-3 items-center">
                        <div className="col-span-2 text-sm text-muted-foreground">{row.name}</div>
                        <div className="col-span-2">
                            <div className={`h-2 w-full overflow-hidden rounded bg-muted`}>
                                <div
                                    className={`${row.colorClass || 'bg-primary'} h-2`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                        <div className="text-right text-sm font-medium">{pct.toFixed(0)}%</div>
                    </div>
                );
            })}
        </div>
    );
}


