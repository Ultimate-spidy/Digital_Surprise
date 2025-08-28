interface ConfettiOverlayProps {
  show: boolean;
}

export default function ConfettiOverlay({ show }: ConfettiOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      <div className="absolute top-0 left-1/4 text-yellow-400 text-2xl animate-confetti">🎊</div>
      <div className="absolute top-0 left-1/2 text-pink-400 text-2xl animate-confetti" style={{ animationDelay: '0.5s' }}>🎉</div>
      <div className="absolute top-0 right-1/4 text-blue-400 text-2xl animate-confetti" style={{ animationDelay: '1s' }}>✨</div>
      <div className="absolute top-0 left-1/3 text-purple-400 text-2xl animate-confetti" style={{ animationDelay: '1.5s' }}>🌟</div>
      <div className="absolute top-0 right-1/3 text-green-400 text-2xl animate-confetti" style={{ animationDelay: '2s' }}>🎊</div>
      <div className="absolute top-0 left-3/4 text-orange-400 text-2xl animate-confetti" style={{ animationDelay: '2.5s' }}>🎉</div>
    </div>
  );
}
