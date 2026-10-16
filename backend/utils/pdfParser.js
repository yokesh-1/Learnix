
import fs from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';

/**
 * Extract text from a PDF file.
 * @param {string} filePath
 * @returns {Promise<{text: string, numPages: number, info: object}>}
 */
export const extractTextFromPDF = async (filePath) => {
    let parser;

    try {
        const dataBuffer = await fs.readFile(filePath);

        parser = new PDFParse({
            data: new Uint8Array(dataBuffer),
        });

        const result = await parser.getText();

        return {
            text: result.text,
            numPages: result.total,
            info: result.info ?? {},
        };
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to extract text from PDF');
    } finally {
        if (parser) {
            await parser.destroy();
        }
    }
};
