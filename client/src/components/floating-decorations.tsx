export default function FloatingDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Floating Balloons */}
      <div className="absolute text-2xl animate-float top-20 left-10">🎈</div>
      <div className="absolute text-2xl animate-float-delayed top-32 right-20">🎉</div>
      <div className="absolute text-2xl animate-float-slow top-16 left-1/3">🎂</div>
      <div className="absolute text-2xl animate-float top-28 right-1/3">🎊</div>
      <div className="absolute text-2xl animate-float-delayed top-40 left-20">💝</div>
      <div className="absolute text-2xl animate-float-slow top-24 right-16">🌟</div>
      <div className="absolute text-2xl animate-float top-36 left-1/2">🎭</div>
      <div className="absolute text-2xl animate-float-delayed top-44 right-1/4">🎪</div>
      
      {/* Mobile Balloons */}
      <div className="absolute text-2xl animate-float top-20 right-8 md:hidden">🎈</div>
      <div className="absolute text-2xl animate-float-delayed top-32 left-8 md:hidden">🎉</div>
    </div>
  );
}
