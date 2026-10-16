import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'node:fs/promises';
import mongoose from 'mongoose';

// Upload PDF document


export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
            });
        }

        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a title',
            });
        }

        // Save PDF text and metadata in MongoDB.
        // The uploaded PDF itself is not stored permanently.
        const { extractTextFromPDF } =
            await import('../utils/pdfParser.js');

        const { text } = await extractTextFromPDF(
            new Uint8Array(req.file.buffer)
        );

        const chunks = chunkText(text, 500, 50);

        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: '',
            fileSize: req.file.size,
            extractedText: text,
            chunks,
            status: 'ready',
        });

        return res.status(201).json({
            success: true,
            data: document,
            message: 'PDF uploaded and processed successfully',
        });
    } catch (error) {
        next(error);
    }
};


// Process PDF using a dynamic import
const processPDF = async (documentId, filePath) => {
    try {
        const { extractTextFromPDF } =
            await import('../utils/pdfParser.js');

        const { text } = await extractTextFromPDF(filePath);
        const chunks = chunkText(text, 500, 50);

        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks,
            status: 'ready',
        });

        console.log(`Document ${documentId} processed successfully`);
    } catch (error) {
        console.error('PDF processing error:', error);

        await Document.findByIdAndUpdate(documentId, {
            status: 'failed',
        });
    }
};

// Get all user documents
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user._id),
                },
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets',
                },
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes',
                },
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' },
                    quizCount: { $size: '$quizzes' },
                },
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0,
                },
            },
            {
                $sort: { uploadDate: -1 },
            },
        ]);

        return res.status(200).json({
            success: true,
            count: documents.length,
            data: documents,
        });
    } catch (error) {
        next(error);
    }
};

// Get single document
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404,
            });
        }

        const flashcardCount = await Flashcard.countDocuments({
            documentId: document._id,
            userId: req.user._id,
        });

        const quizCount = await Quiz.countDocuments({
            documentId: document._id,
            userId: req.user._id,
        });

        document.lastAccessed = Date.now();
        await document.save();

        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        return res.status(200).json({
            success: true,
            data: documentData,
        });
    } catch (error) {
        next(error);
    }
};

// Delete document
export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404,
            });
        }

        await Flashcard.deleteMany({
            documentId: document._id,
            userId: req.user._id,
        });

        await Quiz.deleteMany({
            documentId: document._id,
            userId: req.user._id,
        });

        await fs.unlink(document.filePath).catch(() => {});

        await document.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Document, flashcards, and quizzes deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
