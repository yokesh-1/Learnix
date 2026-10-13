// import { useState } from 'react'
// import { Star, RotateCcw } from 'lucide-react'

// const Flashcard = ({flashcard, onToggleStar}) => {
//     const [isFlipped, setIsFlipped] = useState(false);

//     const handleFlip = () => {
//         setIsFlipped(!isFlipped);
//     };
//   return <div className="reltive w-full h-72" style={{perspective: '1000px'}}>
//     <div
//     className={`relative w-full h-full transition-transform duration-500 transform-gpu cursor-pointer`}
//     style={{
//         transformStyle: 'preserve-3d',
//         transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
//     }}
//     onClick={handleFlip}
//     >
//         {/* Front of the card (Question) */}
//         <div
//         className="absolute inset-0 w-full h-full bg-white/80 backdrop-blur-xl border-2 border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8 flex flex-col justify-between"
//         style={{
//            backfaceVisibility: 'hidden',
//            WebkitBackfaceVisibility: 'hidden', 
//         }}
//         >
//             {/* Star Button */}
//             <div className="flex items-start justify-between">
//                 <div className="bg-slate-100 text-[10px] text-slate-600 rounded px-4 py-1 uppercase">
//                     {flashcard?.difficulty}
//                 </div>
//                <button
//                onClick={(e) =>{
//                 e.stopPropagation();
//                 onToggleStar(flashcard._id);
//                }}
//                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
//                 flashcard.isStarred
//                 ? 'bg-linear-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/25'
//                 : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-500'
//                }`}
//                >
//                 <Star
//                 className="w-4 h-4"
//                 strokeWidth={2}
//                 fill={flashcard.isStarred ? 'currentColor' : 'none'}
//                 />
//                </button>
//             </div>

//             {/* Question Content */}
//             <div className="flex-1 flex items-center justify-center px-4 py-6">
//                 <p className="text-lg font-semibold text-slate-900 text-center leading-relaxed">
//                     {flashcard.question}
//                 </p>
//             </div>

//             {/* Flip Indicator */}
//             <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
//                 <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
//                 <span>Click to reveal answer</span>
//             </div>
//         </div>

//         {/* Back of the card (Answer) */}
//         <div 
//         className="absolute inset-0 w-full h-full bg-linear-to-br from-emerald-500 to-teal-500 border-2 border-emerald-400/60 rounded-2xl shadow-xl shadow-emerald-500/30 p-8 flex flex-col justify-between"
//         style={{
//             backfaceVisibility: 'hidden',
//             WebkitBackfaceVisibility: 'hidden',
//             transform: 'rotateY(180deg)',
//         }}>
//             {/* Star Button */}
//             <div className="flex justify-end">
//                 <button
//                 onClick={(e) =>{
//                     e.stopPropagation();
//                     onToggleStar(flashcard._id);
//                 }}
//                 className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
//                     flashcard.isStarred
//                     ?  'bg-white/30 backdrop-blur-sm text-white border border-white/40'
//                     : 'bg-white/20 backdrop-blur-sm text-white/70 hover:bg-white/30 hover:text-white border border-white/20'
//                 }`}
//                 >
//                     <Star
//                     className="w-4 h-4"
//                     strokeWidth={2}
//                     fill={flashcard.isStarred ? 'currentColor' : 'none'}
//                     />
//                 </button>
//             </div>

//             {/* Answer Content */}
//             <div className="flex-1 flex items-center justify-center px-4 py-6">
//                 <p className="text-base text-white text-center leading-relaxed font-medium">
//                     {flashcard.answer}
//                 </p>
//             </div>

//             {/* Flip Indicator */}
//             <div className="flex items-center justify-center gap-2 text-xs text-white/70 font-medium">
//                 <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
//                 <span>Click to see question</span>
//             </div>
//         </div>
//     </div>
//   </div>
// }

// export default Flashcard


// import { useState } from 'react'
// import { Star, RotateCcw } from 'lucide-react'

// const Flashcard = ({ flashcard, onToggleStar }) => {
//   const [isFlipped, setIsFlipped] = useState(false);

//   const handleFlip = () => {
//     setIsFlipped(!isFlipped);
//   };

//   return (
//     <div
//       className="relative w-full h-80"
//       style={{ perspective: '1200px' }}
//     >
//       <div
//         className="relative w-full h-full duration-700 cursor-pointer"
//         style={{
//           transformStyle: 'preserve-3d',
//           transition: 'transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)',
//           transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
//         }}
//         onClick={handleFlip}
//       >
//         {/* Front Side */}
//         <div
//           className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden border border-slate-200/70 bg-white shadow-2xl shadow-slate-200/60"
//           style={{
//             backfaceVisibility: 'hidden',
//             WebkitBackfaceVisibility: 'hidden',
//           }}
//         >
//           {/* Background Glow */}
//           <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />

//           {/* Top Decorative Blur */}
//           <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl" />

//           <div className="relative h-full flex flex-col justify-between p-7">
//             {/* Header */}
//             <div className="flex items-start justify-between">
//               <div className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider shadow-sm">
//                 {flashcard?.difficulty}
//               </div>

//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onToggleStar(flashcard._id);
//                 }}
//                 className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
//                   flashcard.isStarred
//                     ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-400/40 scale-105'
//                     : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-500'
//                 }`}
//               >
//                 <Star
//                   className="w-5 h-5"
//                   strokeWidth={2}
//                   fill={flashcard.isStarred ? 'currentColor' : 'none'}
//                 />
//               </button>
//             </div>

//             {/* Question */}
//             <div className="flex-1 flex items-center justify-center px-4">
//               <p className="text-2xl font-bold text-slate-800 text-center leading-relaxed">
//                 {flashcard.question}
//               </p>
//             </div>

//             {/* Footer */}
//             <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
//               <RotateCcw className="w-4 h-4" strokeWidth={2} />
//               <span>Tap to reveal answer</span>
//             </div>
//           </div>
//         </div>

//         {/* Back Side */}
//         <div
//           className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl"
//           style={{
//             backfaceVisibility: 'hidden',
//             WebkitBackfaceVisibility: 'hidden',
//             transform: 'rotateY(180deg)',
//           }}
//         >
//           {/* Background */}
//           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500" />

//           {/* Decorative Glow */}
//           <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-white/10 rounded-full blur-3xl" />

//           <div className="relative h-full flex flex-col justify-between p-7">
//             {/* Header */}
//             <div className="flex justify-end">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onToggleStar(flashcard._id);
//                 }}
//                 className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
//                   flashcard.isStarred
//                     ? 'bg-white/30 text-white border-white/40 shadow-lg'
//                     : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white'
//                 }`}
//               >
//                 <Star
//                   className="w-5 h-5"
//                   strokeWidth={2}
//                   fill={flashcard.isStarred ? 'currentColor' : 'none'}
//                 />
//               </button>
//             </div>

//             {/* Answer */}
//             <div className="flex-1 flex items-center justify-center px-4">
//               <p className="text-lg md:text-xl text-white text-center leading-relaxed font-semibold">
//                 {flashcard.answer}
//               </p>
//             </div>

//             {/* Footer */}
//             <div className="flex items-center justify-center gap-2 text-sm text-white/80 font-medium">
//               <RotateCcw className="w-4 h-4" strokeWidth={2} />
//               <span>Tap to view question</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Flashcard


import { useState } from 'react'
import { Star, RotateCcw } from 'lucide-react'

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  return (
    <div
      className="relative w-full h-80"
      style={{ perspective: '1500px' }}
    >
      <div
        onClick={handleFlip}
        className="relative w-full h-full cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 rounded-[32px] overflow-hidden border border-slate-200/70 bg-white shadow-[0_20px_80px_rgba(15,23,42,0.12)]"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-emerald-50" />

          {/* Glow Effects */}
          {/* <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-200/30 rounded-full blur-3xl" /> */}
          {/* <div className="absolute bottom-0 left-0 w-52 h-52 bg-cyan-100/30 rounded-full blur-3xl" /> */}

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wider shadow-sm">
                {flashcard?.difficulty}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStar(flashcard._id)
                }}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  flashcard.isStarred
                    ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-400/40 scale-105'
                    : 'bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200'
                }`}
              >
                <Star
                  className="w-5 h-5"
                  strokeWidth={2}
                  fill={flashcard.isStarred ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {/* Question */}
            <div className="flex-1 flex items-center justify-center px-3">
              <h2 className="text-3xl font-bold text-slate-900 text-center leading-snug">
                {flashcard.question}
              </h2>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
              <RotateCcw className="w-4 h-4" strokeWidth={2} />
              <span>Tap to reveal answer</span>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-[32px] overflow-hidden shadow-[0_20px_80px_rgba(16,185,129,0.25)]"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500" />

          {/* Decorative */}
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl" />

          {/* Grid Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-8">
            {/* Header */}
            <div className="flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStar(flashcard._id)
                }}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 border ${
                  flashcard.isStarred
                    ? 'bg-white/25 text-white border-white/40 backdrop-blur-md'
                    : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Star
                  className="w-5 h-5"
                  strokeWidth={2}
                  fill={flashcard.isStarred ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {/* Answer */}
            <div className="flex-1 flex items-center justify-center px-3">
              <p className="text-xl md:text-2xl font-semibold text-white text-center leading-relaxed">
                {flashcard.answer}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-2 text-sm text-white/80 font-medium">
              <RotateCcw className="w-4 h-4" strokeWidth={2} />
              <span>Tap to see question</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Flashcard