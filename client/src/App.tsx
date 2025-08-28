import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Surprise from "@/pages/surprise";
import Success from "@/pages/success";
import NotFound from "@/pages/not-found";
import FloatingDecorations from "@/components/floating-decorations";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/surprise/:slug" component={Surprise} />
      <Route path="/success/:id" component={Success} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen overflow-x-hidden">
          <FloatingDecorations />
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
