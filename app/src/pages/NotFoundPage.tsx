import { Link } from 'react-router-dom';
import { GraduationCap, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="text-center max-w-md">
        <Link to="/" className="inline-flex items-center space-x-2 mb-8">
          <GraduationCap className="h-10 w-10 text-primary" />
          <span className="text-2xl font-bold">EduSpeak</span>
        </Link>
        
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-primary/10">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-primary">404</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button asChild>
            <Link to="/" className="flex items-center">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
