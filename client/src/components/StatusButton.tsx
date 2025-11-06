import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatusButtonProps {
  status: "down" | "up";
  onClick: () => void;
  disabled?: boolean;
}

export default function StatusButton({ status, onClick, disabled }: StatusButtonProps) {
  const isDown = status === "down";
  
  return (
    <Button
      size="lg"
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-line-${status}`}
      className={`h-20 w-64 text-xl font-medium ${
        isDown
          ? "bg-destructive text-destructive-foreground hover:bg-destructive"
          : "bg-success text-success-foreground hover:bg-success"
      }`}
    >
      {isDown ? <ArrowDown className="mr-2 h-6 w-6" /> : <ArrowUp className="mr-2 h-6 w-6" />}
      LINE {status.toUpperCase()}
    </Button>
  );
}
