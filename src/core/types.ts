export type NodeCategory = string;

export type NodeStatus = 'idle' | 'processing' | 'success' | 'checking' | 'error';

export interface LucyNode {
  id: string;
  name: string;
  category: NodeCategory;
  status: NodeStatus;
  lastActive: number;
  dependencies?: string[];
}

export interface SystemMessage {
  id: string;
  source: string;
  target: string | 'BROADCAST';
  type: 'request' | 'response' | 'event';
  payload: Record<string, any>;
  confidence?: number;
  trace: string[];
  timestamp: number;
}

export interface AppState {
  nodes: Record<string, LucyNode>;
  logs: SystemMessage[];
  chatHistory: { role: 'user' | 'lucy'; text: string; timestamp: number }[];
  isProcessing: boolean;
}
