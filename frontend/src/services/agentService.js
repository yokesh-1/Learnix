import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';

// Ask the Study Assistant Agent a free-form question about a document.
// The agent decides which tools to use (search / summarize / flashcards).
const ask = async (documentId, question) => {
  try {
    const response = await axiosInstance.post(API_PATHS.AGENT.ASK, { documentId, question });
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: 'Agent request failed' };
  }
};

const agentService = {
  ask,
};

export default agentService;
