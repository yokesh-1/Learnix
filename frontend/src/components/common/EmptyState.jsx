import React from 'react'
import { FileText, Plus } from 'lucide-react'
const EmptyState = ({onActionClick, title, description,buttonText}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-16 text-center bg-linear-to-br from-slate-50/50 to-white border-2 border-dashed border-slate-200 rounded-3xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200/50 mb-6">
            <FileText className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 mb-8 max-w-sm leading-relaxed">{description}</p>
        {buttonText && onActionClick && (
            <button
            onClick={onActionClick}
            className="group relative inline-flex items-center gap-2 px-6 h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 overflow-hidden"
            >
                <span className="relative z-10 flex items-center gap-2">
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                    {buttonText}
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </button>
        )}
    </div>
    
  )
}

export default EmptyState;




















// import React from 'react'
// import { FileText, Plus } from 'lucide-react'

// const EmptyState = ({
//   onActionClick,
//   title,
//   description,
//   buttonText,
// }) => {
//   return (
//     <div className="relative overflow-hidden flex flex-col items-center justify-center py-20 px-8 text-center rounded-3xl border border-slate-200/70 bg-white shadow-xl shadow-slate-200/40">

//       {/* Background Glow */}
//       <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-100/30 rounded-full blur-3xl" />
//       <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-100/20 rounded-full blur-3xl" />

//       {/* Icon */}
//       <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/25 mb-7">
//         <FileText className="w-10 h-10 text-white" strokeWidth={2} />
//       </div>

//       {/* Content */}
//       <div className="relative z-10 max-w-lg">
//         <h3 className="text-3xl font-bold text-slate-900 mb-3">
//           {title}
//         </h3>

//         <p className="text-slate-500 leading-relaxed text-base mb-8">
//           {description}
//         </p>
//       </div>

//       {/* Action Button */}
//       {buttonText && onActionClick && (
//         <button
//           onClick={onActionClick}
//           className="relative z-10 group inline-flex items-center gap-3 px-7 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-semibold transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-emerald-500/30 active:scale-95 overflow-hidden"
//         >
//           <span className="relative z-10 flex items-center gap-3">
//             <Plus
//               className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
//               strokeWidth={2.5}
//             />
//             {buttonText}
//           </span>

//           {/* Shine Effect */}
//           <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
//         </button>
//       )}
//     </div>
//   )
// }

// export default EmptyState
