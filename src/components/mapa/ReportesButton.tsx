"use client";

import { ChevronRight, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReportesButtonProps {
  total: number;
  onClick: () => void;
}

export function ReportesButton({ total, onClick }: ReportesButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      aria-label={`Ver los ${total} reportes de esta obra`}
      className="h-auto gap-1.5 border-green-800/25 bg-white px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-green-900 hover:border-green-800/50 hover:bg-green-50 hover:text-green-900"
    >
      <MessageSquareText className="h-3.5 w-3.5" />
      Ver {total} reportes
      <ChevronRight className="h-3 w-3 text-green-800/50" />
    </Button>
  );
}