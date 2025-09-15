export interface GenerateRequest {
    query: string;
    retrieval_mode: string;
    role: string;
    rerank: boolean;
    top_k: number;
}

export interface RetrievedChunk {
    id: string;
    text: string;
    role: string;
    score: number;
}

export interface GenerateResponse {
    user_input: GenerateRequest;
    retrieved_chunks: RetrievedChunk[];
    llm_output: string;
}

export interface ApiError {
    detail: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiService {
    private static async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    static async generate(request: GenerateRequest): Promise<GenerateResponse> {
        return this.makeRequest<GenerateResponse>('/generate', {
            method: 'POST',
            body: JSON.stringify(request),
        });
    }

    static async healthCheck(): Promise<{ status: string; message: string }> {
        return this.makeRequest<{ status: string; message: string }>('/health');
    }
}