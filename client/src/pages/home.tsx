import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Gauge, BarChart3, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Gauge className="h-8 w-8" />
            <span className="text-2xl font-bold">OEE-Dash</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Industrial Efficiency Simulator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A Digital Transformation solution for manufacturing shop floors, focusing on real-time
            downtime collection and loss analysis to optimize Overall Equipment Effectiveness
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 space-y-4 hover-elevate">
            <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Gauge className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold">Shop Floor Interface</h2>
            <p className="text-muted-foreground">
              Tablet-optimized interface for operators to report line downtime in real-time with
              simple, large touch controls
            </p>
            <Link href="/operator">
              <Button className="w-full" size="lg" data-testid="link-operator">
                Open Operator View
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Card>

          <Card className="p-8 space-y-4 hover-elevate">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Management Dashboard</h2>
            <p className="text-muted-foreground">
              Comprehensive analytics dashboard with Pareto analysis to identify and address the
              root causes of production losses
            </p>
            <Link href="/dashboard">
              <Button className="w-full" size="lg" variant="outline" data-testid="link-dashboard">
                Open Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Simulating industrial OEE tracking for loss reduction and continuous improvement
          </p>
        </div>
      </div>
    </div>
  );
}
