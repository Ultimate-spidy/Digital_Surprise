import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import PasswordModal from "@/components/password-modal";
import ConfettiOverlay from "@/components/confetti-overlay";
import { Download, Plus, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SurpriseData = {
  id: string;
  slug: string;
  filename: string;
  originalName: string;
  mimeType: string;
  message: string;
  hasPassword: boolean;
  createdAt: string;
};

export default function Surprise() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [slug, setSlug] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    const pathSegments = path.split('/');
    const surpriseSlug = pathSegments[pathSegments.length - 1];
    if (surpriseSlug) {
      setSlug(surpriseSlug);
    }
  }, []);

  const { data: surprise, isLoading, error } = useQuery<SurpriseData>({
    queryKey: ['/api/surprises', slug],
    enabled: !!slug,
  });

  useEffect(() => {
    if (surprise && surprise.hasPassword && !isUnlocked) {
      setShowPasswordModal(true);
    } else if (surprise && (!surprise.hasPassword || isUnlocked)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [surprise, isUnlocked]);

  const handlePasswordSuccess = () => {
    setIsUnlocked(true);
    setShowPasswordModal(false);
  };

  const handleDownload = () => {
    if (surprise?.filename) {
      const link = document.createElement('a');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
      link.href = apiBaseUrl ? `${apiBaseUrl}/api/files/${surprise.filename}` : `/api/files/${surprise.filename}`;
      link.download = surprise.originalName || 'surprise-media';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCreateOwn = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce-gentle">🎁</div>
          <p className="text-lg text-muted-foreground">Loading your surprise...</p>
        </div>
      </div>
    );
  }

  if (error || !surprise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="celebration-card rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Surprise Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This surprise doesn't exist or may have been removed.
          </p>
          <Button onClick={() => setLocation('/')} data-testid="go-home-button">
            Create Your Own Surprise
          </Button>
        </div>
      </div>
    );
  }

  if (surprise.hasPassword && !isUnlocked) {
    return (
      <>
        <PasswordModal
          open={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={handlePasswordSuccess}
          slug={slug!}
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="celebration-card rounded-2xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Protected Surprise!</h2>
            <p className="text-muted-foreground">This surprise is password protected</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ConfettiOverlay show={showConfetti} />
      
      <main className="relative z-20">
        <div className="container mx-auto px-4 pb-16 pt-8">
          <div className="max-w-4xl mx-auto">
            {/* Celebration Header */}
            <div className="text-center mb-12">
              <div className="text-8xl mb-4 animate-bounce-gentle">🎂</div>
              <h1 className="text-4xl md:text-6xl font-black gradient-text mb-4">Surprise! 🎉</h1>
              <p className="text-xl text-muted-foreground">Someone special created this just for you!</p>
            </div>

            {/* Media and Message Display - Side by Side */}
            <div className="celebration-card rounded-2xl p-8 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Media Display */}
                <div className="surprise-frame rounded-xl overflow-hidden flex justify-center" data-testid="media-container">
                  {surprise.mimeType?.startsWith('image/') ? (
                    <img
                      src={import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/files/${surprise.filename}` : `/api/files/${surprise.filename}`}
                      alt="Surprise media"
                      className="max-w-full max-h-[600px] object-contain"
                      data-testid="surprise-image"
                    />
                  ) : (
                    <video
                      src={import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api/files/${surprise.filename}` : `/api/files/${surprise.filename}`}
                      className="max-w-full max-h-[600px] object-contain"
                      controls
                      data-testid="surprise-video"
                    />
                  )}
                </div>

                {/* Message Display */}
                <div className="text-center lg:text-left">
                  <div className="text-4xl mb-4">💝</div>
                  <h2 className="text-2xl font-bold gradient-text mb-4">A Special Message for You</h2>
                  <div className="bg-muted rounded-xl p-6">
                    <p className="text-lg leading-relaxed text-foreground" data-testid="surprise-message">
                      {surprise.message}
                    </p>
                    <div className="text-sm text-muted-foreground mt-4">
                      <Heart className="inline w-4 h-4 mr-1 text-secondary" />
                      Created with love
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Celebration Actions */}
            <div className="celebration-card rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold mb-6">Keep the Celebration Going! 🎊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleDownload}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4"
                  data-testid="download-button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save This Memory
                </Button>
                <Button
                  onClick={handleCreateOwn}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-4"
                  data-testid="create-own-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your Own
                </Button>
              </div>
              
              <div className="mt-6 text-sm text-muted-foreground">
                ✨ Made with Digital Surprise
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
