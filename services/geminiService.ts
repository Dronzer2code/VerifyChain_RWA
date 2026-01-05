
import { GoogleGenAI, Type } from "@google/genai";
import { VerificationProof } from "../types/blockchain";

const API_KEY = process.env.API_KEY;

export class GeminiVerifier {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: API_KEY });
    }
  }

  private async getAI() {
    if (!this.ai) {
      // For cases where API_KEY might be injected later or environment resets
      if (process.env.API_KEY) {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      } else {
        throw new Error("API Key not found. Please ensure environment is configured.");
      }
    }
    return this.ai;
  }

  async generateIntegrityProof(inputData: string, metadata: any): Promise<any> {
    const ai = await this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform an integrity audit on the following AI output. Check for hallucinations, internal consistency, and formatting errors. 
      Input Data: ${inputData}
      Metadata: ${JSON.stringify(metadata)}
      Return the verification result as a JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            integrityScore: { type: Type.NUMBER },
            anomaliesDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
            cryptographicAttestation: { type: Type.STRING },
            verdict: { type: Type.STRING }
          },
          required: ["integrityScore", "verdict"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  async verifyProvenance(datasetId: string, versionHash: string): Promise<any> {
    const ai = await this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Verify the provenance of a dataset with ID ${datasetId} and Version Hash ${versionHash}. 
      Cross-reference with known dataset distribution patterns and metadata integrity rules.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isAuthentic: { type: Type.BOOLEAN },
            originConfirmed: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            auditLog: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text);
  }

  async composeAuditRecord(proofs: VerificationProof[]): Promise<any> {
    const ai = await this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Review this chain of verification proofs and generate a consolidated Compliance Audit Record.
      Proofs: ${JSON.stringify(proofs)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            complianceStatus: { type: Type.STRING },
            chainIntegrity: { type: Type.BOOLEAN },
            summary: { type: Type.STRING },
            auditHash: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text);
  }
}

export const geminiVerifier = new GeminiVerifier();
