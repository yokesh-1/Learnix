import React, { useState, useEffect } from 'react'
import { Plus, Upload, Trash2, FileText, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';
import DocumentCard from '../../components/documents/DocumentCard';

import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';

const DocumentListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for upload modal 
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to fetch documents');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if(file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) =>{
    e.preventDefault();
    if(!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded successfully.");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Failed to upload document.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };
  const handleDeleteRequest = (doc) =>{
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () =>{
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`'${selectedDoc.title}' deleted successfully.`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments(documents.filter((d) => d._id !== selectedDoc._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };
  const renderContent = () => {
   if(loading){
    return(
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
   }
   
   if(documents.length === 0){
    return(
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50 mb-6">
            <FileText
            className="w-10 h-10 text-slate-400"
            strokeWidth={1.5}
            />
          </div>
          <h3 className="text-xl font-medium text-slate-900 tracking-tight mb-2">
            No Documents Yet
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Get started by uploading your first PDF document to begin learning.
          </p>
          <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98] " 
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Upload Document
          </button>
        </div>
      </div>
    );
  }

  return(
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {documents?.map((doc) => (
        <DocumentCard
        key={doc._id}
        document={doc}
        onDelete={handleDeleteRequest}
        />
      ))}
    </div>
  );
};
  return (
    <div className="min-h-screen">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              My Documents
            </h1>
            <p className="text-slate-500 text-sm">
              Manage and organize your learning materials
            </p>
          </div>
          {documents.length > 0 && (
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="w-4 h-4" strokeWidth={2.5}/>
              Upload Document
            </Button>
          )}
        </div>
        {renderContent()}
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/20 p-8 ">
          {/* Close button */}
          <button 
          onClick={() => setIsUploadModalOpen(false)}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Modal Header */}
          <div className="mb-6">
            <h2 className="text-xl font-medium text-slate-900 tracking-tight">
              Upload New Document
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Add a PDF document to you library
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleUpload} className="space-y-5">
            {/* Title Input */}
            <div className="space-y-2">
              {/* <label className="block text-xs font semibold text-slate-700 uppercase tracking-wide"> */}
               <label className="block text-sm font-medium text-slate-700 mb-2">
                Document Title
              </label>
              <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              required
              // className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus-border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 text-slate-900 placeholder:text-slate-400"
              placeholder = "e.g., React Interview Prep"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-xs font semibold text-slate-700 uppercase tracking-wide">
                PDF File
              </label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200">
                <input
                id="file-upload"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
                accept=".pdf" 
                />
                <div className="flex flex-col items-center justify-center py-10 px-6">
                  <div className="w-14 h-14 rounded-xl bg-linear-to-r from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                    <Upload
                    className="w-7 h-7 text-emerald-600"
                    strokeWidth={2} 
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    {uploadFile ? (
                      <span className="text-emerald-600">
                        {uploadFile.name}
                      </span>
                    ) : (
                      <>
                      <span className="text-emerald-600">
                        Click to upload
                        </span> {" "}
                        or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">PDF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={uploading}
              className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed "
              >Cancel</button>
              <button
              type="submit"
              disabled={uploading}
              className="flex-1 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] "
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin "></div>
                    Uploading...
                  </span>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}


    {isDeleteModalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/20 p-8">
        {/* Close button */}
        <button
        onClick={() => setIsDeleteModalOpen(false)}
        className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
        >
          <X className="w-5 h-5" strokeWidth={2} />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-linear-to-r from-red-100 to-red-200 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-red-600" strokeWidth={2} />
          </div>
          <h2 className="text-xl font-medium text-slate-900 tracking-tight">
            Confirm Deletion
          </h2>
        </div>

        {/* Content */}
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to delete the document:{" "}
          <span className="font-semibold text-slate-900">
            {selectedDoc?.title}
          </span>
          ?This action cannot be undone
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
          type="button"
          onClick={() => setIsDeleteModalOpen(false)}
          disabled={deleting}
          className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed "
          >
            Cancel
          </button>
          <button
          onClick={handleConfirmDelete}
          disabled={deleting}
          className="flex-1 h-11 px-4 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] "
          >
            {deleting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>)}
  </div>
  )
}

export default DocumentListPage





















// import React, { useState, useEffect } from 'react';
// import { Plus, Upload, FileText, X } from 'lucide-react';
// import { toast } from 'react-hot-toast';

// import Button from '../../components/common/Button';
// import DocumentCard from '../../components/documents/DocumentCard';
// import Spinner from '../../components/common/Spinner';

// import documentService from '../../services/documentService';

// const DocumentListPage = () => {

//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Upload Modal State
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const [uploadFile, setUploadFile] = useState(null);
//   const [uploadTitle, setUploadTitle] = useState("");
//   const [uploading, setUploading] = useState(false);

//   // Delete Modal State
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [selectedDoc, setSelectedDoc] = useState(null);

//   const fetchDocuments = async () => {
//     try {
//       const data = await documentService.getDocuments();
//       setDocuments(data);
//     } catch (error) {
//       toast.error("Failed to fetch documents");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDocuments();
//   }, []);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];

//     if (file) {
//       setUploadFile(file);
//       setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
//     }
//   };

//   const handleUpload = async (e) => {

//     e.preventDefault();

//     if (!uploadFile || !uploadTitle) {
//       toast.error("Please provide a title and select a file.");
//       return;
//     }

//     setUploading(true);

//     const formData = new FormData();

//     formData.append("file", uploadFile);
//     formData.append("title", uploadTitle);

//     try {

//       await documentService.uploadDocument(formData);

//       toast.success("Document uploaded successfully.");

//       setIsUploadModalOpen(false);
//       setUploadFile(null);
//       setUploadTitle("");

//       setLoading(true);

//       fetchDocuments();

//     } catch (error) {

//       toast.error(error.message || "Failed to upload document.");
//       console.error(error);

//     } finally {

//       setUploading(false);

//     }
//   };

//   const handleDeleteRequest = (doc) => {
//     setSelectedDoc(doc);
//     setIsDeleteModalOpen(true);
//   };

//   const handleConfirmDelete = async () => {

//     if (!selectedDoc) return;

//     setDeleting(true);

//     try {

//       await documentService.deleteDocument(selectedDoc._id);

//       toast.success(`'${selectedDoc.title}' deleted successfully.`);

//       setIsDeleteModalOpen(false);
//       setSelectedDoc(null);

//       setDocuments(
//         documents.filter((d) => d._id !== selectedDoc._id)
//       );

//     } catch (error) {

//       toast.error(error.message || "Failed to delete document.");

//     } finally {

//       setDeleting(false);

//     }
//   };

//   const renderContent = () => {

//     if (loading) {
//       return (
//         <div className="flex items-center justify-center min-h-[400px]">
//           <Spinner />
//         </div>
//       );
//     }

//     if (documents.length === 0) {
//       return (
//         <div className="flex items-center justify-center min-h-[400px]">

//           <div className="text-center max-w-md">

//             <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50 mb-6">
//               <FileText
//                 className="w-10 h-10 text-slate-400"
//                 strokeWidth={1.5}
//               />
//             </div>

//             <h3 className="text-xl font-medium text-slate-900 tracking-tight mb-2">
//               No Documents Yet
//             </h3>

//             <p className="text-sm text-slate-500 mb-6">
//               Get started by uploading your first PDF document to begin learning.
//             </p>

//             <button
//               onClick={() => setIsUploadModalOpen(true)}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
//             >
//               <Plus className="w-4 h-4" strokeWidth={2.5} />
//               Upload Document
//             </button>

//           </div>

//         </div>
//       );
//     }

//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

//         {documents?.map((doc) => (
//           <DocumentCard
//             key={doc._id}
//             document={doc}
//             onDelete={handleDeleteRequest}
//           />
//         ))}

//       </div>
//     );
//   };

//   return (
//     <div className="relative min-h-screen p-6">

//       {/* Background Pattern */}
//       <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] opacity-30 pointer-events-none" />

//       <div className="relative max-w-7xl mx-auto">

//         {/* Header */}
//         <div className="flex items-center justify-between mb-10">

//           <div>
//             <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
//               My Documents
//             </h1>

//             <p className="text-slate-500 text-sm">
//               Manage and organize your learning materials
//             </p>
//           </div>

//           {documents.length > 0 && (
//             <Button onClick={() => setIsUploadModalOpen(true)}>
//               <Plus className="w-4 h-4" strokeWidth={2.5} />
//               Upload Document
//             </Button>
//           )}

//         </div>

//         {renderContent()}

//       </div>

//       {/* Upload Modal */}
//       {isUploadModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">

//           <div className="relative w-full max-w-lg bg-white/95 rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-200/60 overflow-hidden">

//             {/* Close Button */}
//             <button
//               onClick={() => setIsUploadModalOpen(false)}
//               className="absolute top-5 right-5 inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
//             >
//               <X className="w-5 h-5" strokeWidth={2} />
//             </button>

//             <div className="p-8">

//               {/* Modal Header */}
//               <div className="mb-8">

//                 <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
//                   Upload New Document
//                 </h2>

//                 <p className="text-sm text-slate-500">
//                   Add a PDF document to your library
//                 </p>

//               </div>

//               {/* Form */}
//               <form
//                 onSubmit={handleUpload}
//                 className="space-y-6"
//               >

//                 {/* Title Input */}
//                 <div>

//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Document Title
//                   </label>

//                   <input
//                     type="text"
//                     value={uploadTitle}
//                     onChange={(e) => setUploadTitle(e.target.value)}
//                     required
//                     className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-200 text-slate-900 placeholder:text-slate-400"
//                     placeholder="e.g., React Interview Prep"
//                   />

//                 </div>

//                 {/* File Upload */}
//                 <div>

//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     PDF File
//                   </label>

//                   <div className="relative border-2 border-dashed border-slate-200 rounded-2xl hover:border-emerald-400 transition-colors duration-200 bg-slate-50/50">

//                     <input
//                       id="file-upload"
//                       type="file"
//                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                       onChange={handleFileChange}
//                       accept=".pdf"
//                     />

//                     <div className="flex flex-col items-center justify-center px-6 py-10 text-center">

//                       <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/20 mb-4">

//                         <Upload
//                           className="w-6 h-6"
//                           strokeWidth={2}
//                         />

//                       </div>

//                       <p className="text-sm text-slate-600 mb-1">

//                         {uploadFile ? (

//                           <span className="font-medium text-slate-900">
//                             {uploadFile.name}
//                           </span>

//                         ) : (

//                           <>
//                             <span className="font-semibold text-emerald-600">
//                               Click to upload
//                             </span>{" "}
//                             or drag and drop
//                           </>

//                         )}

//                       </p>

//                       <p className="text-xs text-slate-400">
//                         PDF up to 10MB
//                       </p>

//                     </div>

//                   </div>

//                 </div>

//                 {/* Buttons */}
//                 <div className="flex items-center justify-end gap-3 pt-2">

//                   <button
//                     type="button"
//                     onClick={() => setIsUploadModalOpen(false)}
//                     disabled={uploading}
//                     className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 disabled:opacity-50"
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     type="submit"
//                     disabled={uploading}
//                     className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >

//                     {uploading ? (

//                       <span className="flex items-center gap-2">

//                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>

//                         Uploading...

//                       </span>

//                     ) : (
//                       "Upload"
//                     )}

//                   </button>

//                 </div>

//               </form>

//             </div>

//           </div>

//         </div>
//       )}

//     </div>
//   );
// };

// export default DocumentListPage;






// import React, { useState, useEffect } from 'react';
// import { Plus, Upload, Trash2, FileText, X } from 'lucide-react';
// import { toast } from 'react-hot-toast';

// import Button from '../../components/common/Button';
// import DocumentCard from '../../components/documents/DocumentCard';
// import Spinner from '../../components/common/Spinner';

// import documentService from '../../services/documentService';

// const DocumentListPage = () => {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Upload Modal State
//   const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
//   const [uploadFile, setUploadFile] = useState(null);
//   const [uploadTitle, setUploadTitle] = useState('');
//   const [uploading, setUploading] = useState(false);

//   // Delete Modal State
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [selectedDoc, setSelectedDoc] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   // Fetch Documents
//   const fetchDocuments = async () => {
//     try {
//       setLoading(true);

//       const data = await documentService.getDocuments();

//       setDocuments(data || []);
//     } catch (error) {
//       console.error(error);
//       toast.error('Failed to fetch documents');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDocuments();
//   }, []);

//   // Handle File Change
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];

//     if (!file) return;

//     setUploadFile(file);

//     const fileName = file.name.replace(/\.[^/.]+$/, '');

//     setUploadTitle(fileName);
//   };

//   // Upload Document
//   const handleUpload = async (e) => {
//     e.preventDefault();

//     if (!uploadFile || !uploadTitle.trim()) {
//       toast.error('Please provide title and select PDF file');
//       return;
//     }

//     try {
//       setUploading(true);

//       const formData = new FormData();

//       formData.append('file', uploadFile);
//       formData.append('title', uploadTitle);

//       await documentService.uploadDocument(formData);

//       toast.success('Document uploaded successfully');

//       setIsUploadModalOpen(false);
//       setUploadFile(null);
//       setUploadTitle('');

//       fetchDocuments();
//     } catch (error) {
//       console.error(error);

//       toast.error(error.message || 'Failed to upload document');
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Open Delete Modal
//   const handleDeleteRequest = (doc) => {
//     setSelectedDoc(doc);
//     setIsDeleteModalOpen(true);
//   };

//   // Confirm Delete
//   const handleConfirmDelete = async () => {
//     if (!selectedDoc) return;

//     try {
//       setDeleting(true);

//       await documentService.deleteDocument(selectedDoc._id);

//       toast.success(`"${selectedDoc.title}" deleted successfully`);

//       setDocuments((prev) =>
//         prev.filter((doc) => doc._id !== selectedDoc._id)
//       );

//       setIsDeleteModalOpen(false);
//       setSelectedDoc(null);
//     } catch (error) {
//       console.error(error);

//       toast.error(error.message || 'Failed to delete document');
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // Render Main Content
//   const renderContent = () => {
//     if (loading) {
//       return (
//         <div className="flex items-center justify-center min-h-[450px]">
//           <Spinner />
//         </div>
//       );
//     }

//     if (documents.length === 0) {
//       return (
//         <div className="flex items-center justify-center min-h-[450px]">
//           <div className="max-w-md text-center">
//             <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg mb-6">
//               <FileText
//                 className="w-11 h-11 text-slate-400"
//                 strokeWidth={1.6}
//               />
//             </div>

//             <h2 className="text-2xl font-semibold text-slate-900 mb-3">
//               No Documents Found
//             </h2>

//             <p className="text-slate-500 text-sm leading-6 mb-8">
//               Upload your first PDF document and start building your AI learning
//               library.
//             </p>

//             <button
//               onClick={() => setIsUploadModalOpen(true)}
//               className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:scale-[1.02] hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
//             >
//               <Plus className="w-4 h-4" strokeWidth={2.5} />
//               Upload Document
//             </button>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
//         {documents.map((doc) => (
//           <DocumentCard
//             key={doc._id}
//             document={doc}
//             onDelete={handleDeleteRequest}
//           />
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden">
//       {/* Background */}
//       <div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] bg-[size:18px_18px] opacity-30 pointer-events-none" />

//       <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-10">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-slate-900">
//               My Documents
//             </h1>

//             <p className="mt-2 text-slate-500 text-sm">
//               Manage and organize your uploaded study materials
//             </p>
//           </div>

//           {documents.length > 0 && (
//             <Button onClick={() => setIsUploadModalOpen(true)}>
//               <Plus className="w-4 h-4" strokeWidth={2.5} />
//               Upload Document
//             </Button>
//           )}
//         </div>

//         {renderContent()}
//       </div>

//       {/* Upload Modal */}
//       {isUploadModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
//           <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
//             {/* Close */}
//             <button
//               onClick={() => setIsUploadModalOpen(false)}
//               className="absolute top-5 right-5 flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             {/* Header */}
//             <div className="mb-7">
//               <h2 className="text-2xl font-semibold text-slate-900">
//                 Upload Document
//               </h2>

//               <p className="mt-2 text-sm text-slate-500">
//                 Upload PDF files to your AI learning assistant
//               </p>
//             </div>

//             {/* Form */}
//             <form onSubmit={handleUpload} className="space-y-6">
//               {/* Title */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Document Title
//                 </label>

//                 <input
//                   type="text"
//                   value={uploadTitle}
//                   onChange={(e) => setUploadTitle(e.target.value)}
//                   placeholder="e.g. React Interview Questions"
//                   required
//                   className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white transition-all"
//                 />
//               </div>

//               {/* File Upload */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   PDF File
//                 </label>

//                 <div className="relative border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200">
//                   <input
//                     type="file"
//                     accept=".pdf"
//                     onChange={handleFileChange}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
//                   />

//                   <div className="flex flex-col items-center justify-center px-6 py-12">
//                     <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
//                       <Upload
//                         className="w-8 h-8 text-emerald-600"
//                         strokeWidth={2}
//                       />
//                     </div>

//                     <p className="text-sm font-medium text-slate-700 mb-1 text-center">
//                       {uploadFile ? (
//                         <span className="text-emerald-600">
//                           {uploadFile.name}
//                         </span>
//                       ) : (
//                         <>
//                           <span className="text-emerald-600">
//                             Click to upload
//                           </span>{' '}
//                           or drag & drop
//                         </>
//                       )}
//                     </p>

//                     <p className="text-xs text-slate-500">
//                       PDF files up to 10MB
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Buttons */}
//               <div className="flex gap-3 pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setIsUploadModalOpen(false)}
//                   disabled={uploading}
//                   className="flex-1 py-3 rounded-2xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={uploading}
//                   className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
//                 >
//                   {uploading ? (
//                     <span className="flex items-center justify-center gap-2">
//                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                       Uploading...
//                     </span>
//                   ) : (
//                     'Upload'
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Delete Modal */}
//       {isDeleteModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
//           <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200">
//             {/* Close */}
//             <button
//               onClick={() => setIsDeleteModalOpen(false)}
//               className="absolute top-5 right-5 flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
//             >
//               <X className="w-5 h-5" />
//             </button>

//             {/* Icon */}
//             <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center mb-5">
//               <Trash2
//                 className="w-7 h-7 text-red-600"
//                 strokeWidth={2}
//               />
//             </div>

//             {/* Text */}
//             <h2 className="text-2xl font-semibold text-slate-900 mb-3">
//               Delete Document
//             </h2>

//             <p className="text-sm leading-6 text-slate-600 mb-8">
//               Are you sure you want to permanently delete{' '}
//               <span className="font-semibold text-slate-900">
//                 "{selectedDoc?.title}"
//               </span>
//               ? This action cannot be undone.
//             </p>

//             {/* Buttons */}
//             <div className="flex gap-3">
//               <button
//                 type="button"
//                 onClick={() => setIsDeleteModalOpen(false)}
//                 disabled={deleting}
//                 className="flex-1 py-3 rounded-2xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={handleConfirmDelete}
//                 disabled={deleting}
//                 className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/20 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50"
//               >
//                 {deleting ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     Deleting...
//                   </span>
//                 ) : (
//                   'Delete'
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentListPage;
























