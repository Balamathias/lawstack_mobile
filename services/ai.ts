import { StackResponse } from '@/@types/generics';
// import { stackbase } from '../server.entry';
import axios from 'axios';

interface SearchAnalysisResponse {
  analysis: string;
  relatedTopics: string[];
  suggestedResources: string[];}

/**
 * Analyze a search query with AI to provide legal insights
 */
export async function analyzeSearchQuery(query: string): Promise<StackResponse<SearchAnalysisResponse>> {
  try {
    if (!query) {
      return {
        message: 'No query provided',
        error: null,
        data: {
          analysis: '',
          relatedTopics: [],
          suggestedResources: []
        },
        status: 400
      };
    }
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const { data } = await axios.get(`${baseUrl}/ai/generate/search-analysis`)
      console.log("Data: ", data)
      
      return {
        data: {
          analysis: data.analysis,
          relatedTopics: data.related_topics || [],
          suggestedResources: data.suggested_resources || []
        },
        message: 'Analysis generated successfully',
        error: null,
        status: 200
      };
  } catch (error: any) {
    console.error('Error analyzing search query:', error);
    return {
      message: error?.response?.data?.error || error?.response?.data?.detail || 'Error analyzing search',
      error: error?.response?.error || error.message,
      data: {
        analysis: '',
        relatedTopics: [],
        suggestedResources: []
      },
      status: error?.response?.status || 500
    };
  }
} 