
import { PDFParse } from 'pdf-parse';

export const extractTextFromPDF = async (buffer) => {
    let parser;

    try {
        parser = new PDFParse({
            data: buffer,
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
