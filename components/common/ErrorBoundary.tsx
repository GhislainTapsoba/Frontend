"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Met à jour l’état pour afficher le fallback UI au prochain rendu
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log d’erreur (à étendre pour reporting externe si besoin)
    console.error("Erreur non capturée:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex justify-center items-center min-h-[300px] p-4">
            <Alert variant="destructive" className="max-w-md flex items-start gap-2">
              <TriangleAlert className="h-5 w-5 mt-1 text-red-400" />
              <div>
                <AlertTitle>Erreur inattendue</AlertTitle>
                <AlertDescription>
                  Une erreur s&apos;est produite. Veuillez réessayer plus tard.
                  {this.state.error && (
                    <p className="mt-2 text-sm text-red-200">
                      Détails : {this.state.error.message}
                    </p>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
