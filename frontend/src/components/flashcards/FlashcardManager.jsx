import React, { useState, useEffect } from 'react'
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    ArrowLeft,
    Sparkles,
    Brain,
} from 'lucide-react';
import toast from 'react-hot-toast';
import moment from 'moment';

import flashcardService from '../../services/flashcardService'; 
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import Flashcard from './Flashcard';
const FlashcardManager = ({documentId}) => {

    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null)

    const fetchFlashcardSets = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsForDocument(
            documentId
            );
            setFlashcardSets(response.data);
        } catch (error) {
            toast.error("Failed to fetch flashcard sets.");
            console.error(error);
        } finally {
            setLoading(false);
        }
        };

        useEffect(() => {
        if (documentId) {
            fetchFlashcardSets();
        }
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try {
            await aiService.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully!");
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || "Failed to generate flashcards.");
        } finally {
            setGenerating(false);
        }
        };

        const handleNextCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
            (prevIndex) => (prevIndex + 1) % selectedSet.cards.length
            );
        }
    };

    const handlePrevCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
            (prevIndex) =>
                (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
            );
        }
        };

        const handleReview = async (index) => {
        const currentCard = selectedSet?.cards[currentCardIndex];
        if (!currentCard) return;

        try {
            await flashcardService.reviewFlashcard(currentCard._id, index);
            toast.dismiss();
            toast.success("Flashcard reviewed!");
        } catch (error) {
            toast.error("Failed to review flashcard.");
        }
    };

    const handleToggleStar = async (cardId) => {
        try{
            await flashcardService.toggleStar(cardId);
            const updatedSets = flashcardSets.map((set) => {
                if(set._id === selectedSet._id){
                    const updatedCards = set.cards.map((card) =>
                        card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
                );
                return { ...set, cards: updatedCards };
                }
                return set;
            });
            setFlashcardSets(updatedSets);
            setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id));
            toast.dismiss();
            toast.success("Flashcard starred status updated!");
        } catch (error){
            toast.error("Failed to update starred status.");
        }
    };

    const handleDeleteRequest = (e,set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if(!setToDelete) return;
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(setToDelete._id);
            toast.success("Flashcard set deleted successfully!");
            setIsDeleteModalOpen(false);
            setSetToDelete(null);
            fetchFlashcardSets();
        } catch (error) {
            toast.error(error.message || "Failed to delete flashcard set.");
        } finally {
            setDeleting(false);
        }
    };

    const handleSelectSet = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
    };

    // const renderFlashcardViewer = () =>{
    //     const currentCard = selectedSet?.cards[currentCardIndex];

    //     return (
    //         <div className="space-y-8">
    //             {/* Back Button */}
    //             <button
    //             onClick={() => setSelectedSet(null)}
    //             className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
    //             >
    //             <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={2} />
    //             Back to Sets
    //             </button>

    //             {/* Flashcard Display */}
    //             <div className="flex flex-col items-center space-y-8">
    //                 <div className="w-full max-w-2xl">
    //                     <Flashcard
    //                     flashcard={currentCard}
    //                     onToggleStar={handleToggleStar}
    //                     />
    //                 </div>

    //                 {/* Navigation Controls */}
    //                 <div className="flex items-center gap-6">
    //                     <button
    //                     onClick={handlePrevCard}
    //                     disabled={selectedSet.cards.length<=1}
    //                     className="group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100"
    //                     >
    //                         <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" strokeWidth={2.5} />
    //                         Previous
    //                     </button>

    //                     <div className="px-4 py-2 bg-slate-50 rounded-lg border-slate-200">
    //                         <span className="text-sm font-semibold text-slate-700">
    //                             {currentCardIndex + 1}{" "}
    //                             <span className="text-slate-400 font-normal">/</span>{" "}
    //                             {selectedSet.cards.length}
    //                         </span>
    //                     </div>

    //                     <button
    //                     onClick={handleNextCard}
    //                     disabled={selectedSet.cards.length<=1}
    //                     className="group flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100"
    //                     >
    //                         Next
    //                         <ChevronRight className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" strokeWidth={2.5} />
    //                     </button>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // };

    // const renderSetList = () => {
    //     if(loading){
    //         return(
    //             <div className="flex items-center justify-center py-20">
    //                 <Spinner />
    //             </div>
    //         );
    //     }


    //    if(flashcardSets.length === 0){
    //      return (
    //         <div className="flex flex-col items-center justify-center py-16 px-6">
    //             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 mb-6">
    //                 <Brain className="w-8 h-8 text-emerald-600" strokeWidth={2} />
    //             </div>
    //             <h3 className="text-xl font-semibold text-slate-900 mb-2">
    //                 No Flashcards Yet
    //             </h3>
    //             <p className="text-sm text-slate-500 mb-8 text-center max-w-sm">
    //                 Generate flashcards from your document to start learning and 
    //                 reinforce your knowledge.
    //             </p>
    //             <button
    //                 onClick={handleGenerateFlashcards}
    //                 disabled={generating}
    //                 className="group inline-flex items-center gap-2 px-6 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    //             >
    //                 {generating ? (
    //                     <>
    //                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    //                     Generating...
    //                     </>
    //                 ) : (
    //                     <>
    //                     <Sparkles className="w-4 h-4" strokeWidth={2} />
    //                     Generate Flashcards
    //                     </>
    //                 )}

    //             </button>
    //         </div>
    //     );
    //    }

    //    return (
    //        <div className="space-y-6">
    //         {/* Header with Generate Button */}
    //         <div className="flex items-center justify-between">
    //             <div>
    //                 <h3 className="text-lg font-semibold text-slate-900">
    //                     Your Flashcard Sets
    //                 </h3>
    //                 <p className="text-sm text-slate-500 mt-1">
    //                     {flashcardSets.length}{" "}
    //                     {flashcardSets.length === 1 ? "set" : "sets"} available
    //                 </p>
    //             </div>
    //             <button
    //               onClick={handleGenerateFlashcards}
    //               disabled={generating}
    //               className="group inline-flex items-center gap-2 px-5 h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    //             >
    //                 {generating ? (
    //                     <>
    //                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    //                     Generating...
    //                     </>
    //                 ) : (
    //                     <>
    //                     <Plus className="w-4 h-4" strokeWidth={2} />
    //                     Generate New Set
    //                     </>
    //                 )}
    //             </button>
    //         </div>

    //         {/* Flashcard Sets Grid */}
    //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    //             {flashcardSets.map((set) => (
    //                 <div 
    //                 key={set._id}
    //                 onClick={() => handleSelectSet(set)}
    //                 className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10"
    //              >
    //                 {/* Delete Button */}
    //                 <button
    //                 onClick={(e) => handleDeleteRequest(e,set)}
    //                 className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
    //                 >
    //                     <Trash2 className="w-4 h-4" strokeWidth={2} />
    //                 </button>

    //                 {/* Set Content */}
    //                 <div className="space-y-4">
    //                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100">
    //                         <Brain className="w-6 h-6 text-emerald-600" strokeWidth={2} />
    //                     </div>

    //                     <div> 
    //                         <h4 className="text-base font-semibold text-slate-900 mb-1">
    //                             Flashcard Set
    //                         </h4>
    //                         <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
    //                             Created {moment(set.createdAt).format("MMM DD, YYYY")}
    //                         </p>
    //                     </div>
    //                     <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
    //                         <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
    //                             <span className="text-sm font-semibold text-emerald-700">
    //                                 {set.cards.length}{" "}
    //                                 {set.cards.length === 1 ? "card" : "cards"}
    //                             </span>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         ))}
    //         </div>
    //     </div>
    //    );
    // };

    const renderFlashcardViewer = () => {
  const currentCard = selectedSet?.cards[currentCardIndex]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedSet(null)}
          className="group inline-flex items-center gap-2 px-4 h-11 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300"
            strokeWidth={2.5}
          />
          Back to Sets
        </button>

        <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
          <span className="text-sm font-semibold tracking-wide">
            Card {currentCardIndex + 1} / {selectedSet.cards.length}
          </span>
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex justify-center">
        <div className="w-full max-w-3xl">
          <Flashcard
            flashcard={currentCard}
            onToggleStar={handleToggleStar}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-5">
        <button
          onClick={handlePrevCard}
          disabled={selectedSet.cards.length <= 1}
          className="group inline-flex items-center gap-2 px-6 h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300"
            strokeWidth={2.5}
          />
          Previous
        </button>

        <button
          onClick={handleNextCard}
          disabled={selectedSet.cards.length <= 1}
          className="group inline-flex items-center gap-2 px-6 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight
            className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
            strokeWidth={2.5}
          />
        </button>
      </div>
    </div>
  )
}

const renderSetList = () => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-28">
        <Spinner />
      </div>
    )
  }

  if (flashcardSets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-emerald-400/20 blur-2xl rounded-full" />

          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/25">
            <Brain className="w-10 h-10 text-white" strokeWidth={2.2} />
          </div>
        </div>

        <h3 className="text-3xl font-bold text-slate-900 mb-3">
          No Flashcards Yet
        </h3>

        <p className="text-slate-500 max-w-md leading-relaxed mb-10">
          Generate AI-powered flashcards from your document and start learning
          with an interactive study experience.
        </p>

        <button
          onClick={handleGenerateFlashcards}
          disabled={generating}
          className="group inline-flex items-center gap-3 px-7 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:scale-[1.02] text-white font-semibold transition-all duration-300 shadow-xl shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating Flashcards...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" strokeWidth={2.2} />
              Generate Flashcards
            </>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">
            Flashcard Library
          </h3>

          <p className="text-slate-500 mt-1">
            {flashcardSets.length}{" "}
            {flashcardSets.length === 1 ? "set" : "sets"} available
          </p>
        </div>

        <button
          onClick={handleGenerateFlashcards}
          disabled={generating}
          className="group inline-flex items-center justify-center gap-2 px-6 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Generate New Set
            </>
          )}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {flashcardSets.map((set) => (
          <div
            key={set._id}
            onClick={() => handleSelectSet(set)}
            className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Delete */}
            <button
              onClick={(e) => handleDeleteRequest(e, set)}
              className="absolute top-5 right-5 z-20 w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4 mx-auto" strokeWidth={2} />
            </button>

            {/* Content */}
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
                <Brain className="w-8 h-8 text-white" strokeWidth={2} />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  Flashcard Set
                </h4>

                <p className="text-sm text-slate-500">
                  Created{" "}
                  {moment(set.createdAt).format("MMM DD, YYYY")}
                </p>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-sm font-bold text-emerald-700">
                    {set.cards.length}{" "}
                    {set.cards.length === 1 ? "Card" : "Cards"}
                  </span>
                </div>

                <div className="text-sm font-medium text-emerald-600 group-hover:translate-x-1 transition-transform duration-300">
                  Open →
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

  return (
    <>
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
            {selectedSet ? renderFlashcardViewer() : renderSetList()}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Flashcard Set?"
        >
            <div className="space-y-6">
                <p className="text-sm text-slate-600">
                    Are you sure you want to delete this flashcard set? This action
                    cannot be undone and all cards will be permanently removed.
                </p>
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={deleting}
                    className="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed "
                    >
                        Cancel
                    </button>
                    <button
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="px-5 h-11 bg-linear-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                        {deleting ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </span>
                        ) : (
                            "Delete Set"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    </>
  )
}

export default FlashcardManager;
