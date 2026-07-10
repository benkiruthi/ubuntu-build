"use client";

import { formatKES } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface BoQItem {
  description: string;
  unit: string;
  qty: number;
  rate_kes: number;
  total_kes: number;
}

interface BoQSection {
  name: string;
  items: BoQItem[];
  subtotal_kes: number;
}

interface BoQData {
  sections: BoQSection[];
  grand_total_kes: number;
  contingency_kes: number;
  project_total_kes: number;
}

export function BoQDisplay({ data }: { data: BoQData }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Bill of Quantities</h3>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Project Total</p>
          <p className="text-xl font-bold" style={{ color: "var(--primary)" }}>
            {formatKES(data.project_total_kes)}
          </p>
        </div>
      </div>

      {data.sections.map((section) => (
        <Card key={section.name}>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide">
              {section.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: "var(--muted-foreground)" }} className="text-xs">
                    <th className="text-left pb-2 font-medium">Description</th>
                    <th className="text-right pb-2 font-medium w-12">Unit</th>
                    <th className="text-right pb-2 font-medium w-16">Qty</th>
                    <th className="text-right pb-2 font-medium w-28">Rate (KES)</th>
                    <th className="text-right pb-2 font-medium w-28">Total (KES)</th>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, i) => (
                    <tr
                      key={i}
                      className="border-t"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <td className="py-2 pr-4">{item.description}</td>
                      <td className="py-2 text-right text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {item.unit}
                      </td>
                      <td className="py-2 text-right">{item.qty.toLocaleString()}</td>
                      <td className="py-2 text-right">{item.rate_kes.toLocaleString()}</td>
                      <td className="py-2 text-right font-medium">{item.total_kes.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    className="border-t font-semibold"
                    style={{ borderColor: "var(--border)", color: "var(--primary)" }}
                  >
                    <td colSpan={4} className="pt-2">Subtotal</td>
                    <td className="pt-2 text-right">{formatKES(section.subtotal_kes)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Summary */}
      <Card>
        <CardContent className="pt-4 pb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Construction Total</span>
            <span className="font-medium">{formatKES(data.grand_total_kes)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Contingency (10%)</span>
            <span className="font-medium">{formatKES(data.contingency_kes)}</span>
          </div>
          <div
            className="flex justify-between font-bold text-base pt-2 border-t"
            style={{ borderColor: "var(--border)", color: "var(--primary)" }}
          >
            <span>Project Total</span>
            <span>{formatKES(data.project_total_kes)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
