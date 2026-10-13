import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import AIActions from '../../components/ai/AIActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import Flashcard from '../../components/flashcards/Flashcard';
import QuizManager from '../../components/quizzes/QuizManager';
import { BASE_URL } from '../../utils/apiPaths';
const DocumentDetailPage = () => {

  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Content');

  useEffect(() =>{
    const fetchDocumentDetails = async () => {
      try{
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch(error){
        toast.error('Failed to fetch document details');
        console.error(error);
      }
      finally{
        setLoading(false);
      }
    };
    fetchDocumentDetails();
  }, [id]);

  // Helper function to get the full PDF URL
  // const getPdfUrl = () => {
  //   if (!document?.data?.filePath) return null;

  //   const filePath = document.data.filePath;

  //   if(filePath.startsWith('http://') || filePath.startsWith('https://')) {
  //     return filePath;
  //   }
  //   const baseUrl=BASE_URL;

  //   return `${baseUrl}/${filePath.startsWith('/') ? '':'/'}${filePath}`;
    
  // };

  const getPdfUrl = () => {
      if (!document?.data?.filePath) return null;

      const filePath = document.data.filePath;

      if (
        filePath.startsWith("http://") ||
        filePath.startsWith("https://")
      ) {
        return filePath;
      }
      // console.log("filePath =", document?.data?.filePath);
      // console.log("BASE_URL =", BASE_URL);
      // console.log("pdfUrl =", getPdfUrl());
      return `${BASE_URL}${filePath}`;
  };
  const renderContent = () =>{
    if(loading){
      return <Spinner />;
    }
    if(!document || !document.data || !document.data.filePath){
      return <div className="text-center p-8">PDF not available</div>;
    }
    const pdfUrl = getPdfUrl();

    return (
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-gray-300">
          <span className="text-sm font-medium text-gray-700">Document Viewer</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors" 
          >
            <ExternalLink  strokeWidth={2} />
            Open in new tab
            </a>
        </div>
        <div className="bg-gray-100 p-1">
          <iframe 
            src={pdfUrl}
            className="w-full h-[70vh] bg-white rounded border border-gray-300"
            title="PDF Viewer"
            frameBorder="0"
            style={{
              colorScheme: 'light',
            }}
          />
        </div>
      </div>
    );
  };
  const renderChat = () =>{
    return <ChatInterface />
  };
  const renderAIActions = () => {
    return <AIActions />
  }
  const renderFlashcardsTab = () =>{
    return <FlashcardManager documentId={id} />
  }
  const renderQuizzesTab = () =>{
    return <QuizManager documentId={id} />
  }

  const tabs = [
    { name: 'Content', label: 'Content', content: renderContent() },
    { name: 'Chat', label: 'Chat', content: renderChat() },
    { name: 'AI Actions', label: 'AI Actions', content: renderAIActions() },
    { name: 'Flashcards', label: 'Flashcards', content: renderFlashcardsTab() },
    { name: 'Quizzes', label: 'Quizzes', content: renderQuizzesTab() },
  ]

  if(loading) {
    return <Spinner />
  }

  if(!document) {
    return <div className="text-center p-8" >Document not found</div>
  }
  return (
    <div>
      <div className="mb-4">
        <Link to= "/documents" className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
        <ArrowLeft size={16} />
        Back to Documents
        </Link>
      </div>
      <PageHeader title={document.data.title} />
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default DocumentDetailPage






// import React, { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import documentService from '../../services/documentService';
// import Spinner from '../../components/common/Spinner';
// import toast from 'react-hot-toast';
// import { ArrowLeft, ExternalLink } from 'lucide-react';

// const DocumentDetailPage = () => {
//   const { id } = useParams();

//   const [document, setDocument] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('Content');

//   useEffect(() => {
//     const fetchDocumentDetails = async () => {
//       try {
//         const data = await documentService.getDocumentById(id);
//         setDocument(data);
//       } catch (error) {
//         toast.error('Failed to fetch document details');
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDocumentDetails();
//   }, [id]);

//   // PDF URL
//   const getPdfUrl = () => {
//     if (!document?.data?.filePath) return null;

//     const filePath = document.data.filePath;

//     if (
//       filePath.startsWith('http://') ||
//       filePath.startsWith('https://')
//     ) {
//       return filePath;
//     }

//     const baseUrl =
//       process.env.REACT_APP_BASE_URL || 'http://localhost:8000';

//     return `${baseUrl}${
//       filePath.startsWith('/') ? '' : '/'
//     }${filePath}`;
//   };

//   // CONTENT TAB
//   const renderContent = () => {
//     if (loading) {
//       return <Spinner />;
//     }

//     if (!document || !document.data || !document.data.filePath) {
//       return (
//         <div className="flex items-center justify-center h-[500px] text-gray-500 text-lg">
//           PDF not available
//         </div>
//       );
//     }

//     const pdfUrl = getPdfUrl();

//     return (
//       <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-md">
        
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800">
//               Document Viewer
//             </h2>

//             <p className="text-sm text-gray-500 mt-1">
//               View your uploaded PDF document
//             </p>
//           </div>

//           <a
//             href={pdfUrl}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
//           >
//             <ExternalLink size={18} />
//             Open PDF
//           </a>
//         </div>

//         {/* PDF Viewer */}
//         <div className="w-full h-[800px] bg-gray-100">
//           <iframe
//             src={pdfUrl}
//             title="PDF Viewer"
//             className="w-full h-full"
//             frameBorder="0"
//             style={{
//               colorScheme: 'light',
//             }}
//           />
//         </div>
//       </div>
//     );
//   };

//   // OTHER TABS
//   const renderChat = () => {
//     return (
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//         Chat Section
//       </div>
//     );
//   };

//   const renderAIActions = () => {
//     return (
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//         AI Actions Section
//       </div>
//     );
//   };

//   const renderFlashcardsTab = () => {
//     return (
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//         Flashcards Section
//       </div>
//     );
//   };

//   const renderQuizzesTab = () => {
//     return (
//       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//         Quizzes Section
//       </div>
//     );
//   };

//   const tabs = [
//     {
//       name: 'Content',
//       label: 'Content',
//       content: renderContent(),
//     },
//     {
//       name: 'Chat',
//       label: 'Chat',
//       content: renderChat(),
//     },
//     {
//       name: 'AI Actions',
//       label: 'AI Actions',
//       content: renderAIActions(),
//     },
//     {
//       name: 'Flashcards',
//       label: 'Flashcards',
//       content: renderFlashcardsTab(),
//     },
//     {
//       name: 'Quizzes',
//       label: 'Quizzes',
//       content: renderQuizzesTab(),
//     },
//   ];

//   if (loading) {
//     return <Spinner />;
//   }

//   if (!document) {
//     return (
//       <div className="flex items-center justify-center h-screen text-2xl font-semibold text-gray-500">
//         Document not found
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
      
//       {/* Back Button */}
//       <div className="mb-6">
//         <Link
//           to="/documents"
//           className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition"
//         >
//           <ArrowLeft size={18} />
//           Back to Documents
//         </Link>
//       </div>

//       {/* Top Card */}
//       <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">
//           {document?.data?.title || 'Document Details'}
//         </h1>

//         <p className="text-gray-500 mt-2">
//           Manage and interact with your uploaded document
//         </p>
//       </div>

//       {/* Tabs */}
//       <div className="flex flex-wrap gap-3 mb-6">
//         {tabs.map((tab) => (
//           <button
//             key={tab.name}
//             onClick={() => setActiveTab(tab.name)}
//             className={`px-5 py-2.5 rounded-xl font-medium transition duration-200
//               ${
//                 activeTab === tab.name
//                   ? 'bg-blue-600 text-white shadow-md'
//                   : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
//               }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Active Tab Content */}
//       <div>
//         {tabs.find((tab) => tab.name === activeTab)?.content}
//       </div>
//     </div>
//   );
// };

// export default DocumentDetailPage; 